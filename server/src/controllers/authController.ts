import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User, IUser } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

function generateToken(user: IUser): string {
  const secret = process.env.JWT_SECRET || 'fnx_default_secret_key';
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: '7d',
  });
}

function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Register a new customer
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Initial role is ALWAYS customer. Admin must be bootstrapped securely.
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone ? phone.trim() : '',
      role: 'customer',
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[Auth Register Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred during account registration. Please try again.',
    });
  }
}

/**
 * Login customer or admin
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    // Explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[Auth Login Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred during sign in. Please try again.',
    });
  }
}

/**
 * Get Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(_req: Request, res: Response): Promise<void> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId) {
    res.status(500).json({
      success: false,
      message: 'Google OAuth is not configured on this server.',
    });
    return;
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  res.json({
    success: true,
    url: `${rootUrl}?${qs.toString()}`,
  });
}

/**
 * Handle Google OAuth callback
 */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error || !code) {
    console.warn('[Google OAuth] Callback received error or missing code:', error);
    res.redirect(`${clientUrl}/login?error=google_cancelled`);
    return;
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // 1. Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      { timeout: 10000 }
    );

    const { access_token } = tokenResponse.data;

    // 2. Fetch Google profile
    const userinfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: 10000,
    });

    const googleUser = userinfoResponse.data;
    if (!googleUser.email || !googleUser.email_verified) {
      res.redirect(`${clientUrl}/login?error=email_unverified`);
      return;
    }

    // 3. Match or create user safely
    let user = await User.findOne({
      $or: [{ googleId: googleUser.sub }, { email: googleUser.email.toLowerCase() }],
    });

    if (user) {
      // If user exists, link googleId and avatar if not already set
      if (!user.googleId) user.googleId = googleUser.sub;
      if (!user.avatar && googleUser.picture) user.avatar = googleUser.picture;
      await user.save();
    } else {
      // Create new customer account
      user = await User.create({
        name: googleUser.name || googleUser.given_name || 'FarmNexa Customer',
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.sub,
        avatar: googleUser.picture || '',
        role: 'customer',
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    // Redirect to frontend auth bridge with token
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (err: any) {
    console.error('[Google OAuth Callback Error]:', err.response?.data || err.message);
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
}

/**
 * Get current authenticated user profile
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      avatar: req.user.avatar,
      address: req.user.address,
      createdAt: req.user.createdAt,
    },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  try {
    const { name, phone, address } = req.body;

    if (name) req.user.name = name.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    if (address) {
      req.user.address = {
        ...req.user.address,
        ...address,
      };
    }

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar: req.user.avatar,
        address: req.user.address,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
}

/**
 * Logout
 */
export function logout(_req: Request, res: Response): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.json({
    success: true,
    message: 'Signed out successfully.',
  });
}
