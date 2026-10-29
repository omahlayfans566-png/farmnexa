import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  bootstrapAdmin,
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Secure initial bootstrap (allowed only if 0 admins exist)
router.post('/bootstrap', bootstrapAdmin);

// Protected admin endpoints
router.get('/stats', protect, requireAdmin, getDashboardStats);
router.get('/customers', protect, requireAdmin, getCustomers);

export default router;
