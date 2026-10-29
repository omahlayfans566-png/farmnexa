import { Router } from 'express';
import {
  getPaymentConfig,
  initializePayment,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public config check
router.get('/config', getPaymentConfig);

// Initialize payment transaction
router.post('/initialize', optionalAuth, initializePayment);

// Verify payment
router.get('/verify/:reference', optionalAuth, verifyPayment);

// Paystack Webhook
router.post('/webhook', handleWebhook);

export default router;
