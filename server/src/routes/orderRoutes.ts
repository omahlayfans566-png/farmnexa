import { Router } from 'express';
import {
  validateCart,
  createOrder,
  getOrderByReference,
  getCustomerOrders,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Cart validation
router.post('/validate-cart', optionalAuth, validateCart);

// Create order
router.post('/', optionalAuth, createOrder);

// Customer order history
router.get('/my-orders', protect, getCustomerOrders);

// Track / view single order by reference (public or customer)
router.get('/:reference', optionalAuth, getOrderByReference);

// Admin order management
router.get('/admin/all', protect, requireAdmin, getAdminOrders);
router.put('/admin/:id', protect, requireAdmin, updateOrderStatus);

export default router;
