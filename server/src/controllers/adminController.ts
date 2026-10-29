import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * Admin: Get dashboard overview statistics derived from actual DB records
 */
export async function getDashboardStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [
      totalProducts,
      publishedProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      registeredCustomers,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Product.countDocuments({ availableQty: { $lte: 0 } }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      User.countDocuments({ role: 'customer' }),
      Order.find().sort({ createdAt: -1 }).limit(6),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        paidOrders,
        registeredCustomers,
        totalRevenue,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error('[Admin Dashboard Stats Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
}

/**
 * Admin: Get registered customers
 */
export async function getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query: any = { role: 'customer' };

    if (search && typeof search === 'string') {
      const trimmed = search.trim();
      query.$or = [
        { name: { $regex: trimmed, $options: 'i' } },
        { email: { $regex: trimmed, $options: 'i' } },
        { phone: { $regex: trimmed, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach order summary for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ customer: c._id });
        const cObj = c.toObject();
        (cObj as any).orderCount = orderCount;
        return cObj;
      })
    );

    res.json({
      success: true,
      customers: customersWithOrders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

/**
 * Secure Admin Bootstrap:
 * Only functions if NO admin exists in the database.
 */
export async function bootstrapAdmin(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      res.status(403).json({
        success: false,
        message: 'Administrative setup is locked. An administrator account is already configured.',
      });
      return;
    }

    const { name, email, password, setupKey } = req.body;

    const expectedSetupKey = process.env.JWT_SECRET || 'fnx_sec_9948_super_secure_jwt_token_key_farmnexa_market_2026';
    if (!setupKey || setupKey !== expectedSetupKey) {
      res.status(401).json({
        success: false,
        message: 'Invalid administrative setup key.',
      });
      return;
    }

    if (!name || !email || !password || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and a password of at least 8 characters are required.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const adminUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Initial administrator account created securely.',
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to bootstrap administrator.' });
  }
}
