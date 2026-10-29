import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  getGoogleAuthUrl,
  googleCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/google/url', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', logout);

export default router;
