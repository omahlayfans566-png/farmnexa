import { Request, Response } from 'express';
import { PaystackService } from '../services/paystack.js';
import { Order } from '../models/Order.js';

/**
 * Get public payment configuration
 */
export function getPaymentConfig(_req: Request, res: Response): void {
  const isReady = PaystackService.isPaystackReady();
  const publicKey = isReady ? process.env.PAYSTACK_PUBLIC_KEY || '' : '';

  res.json({
    success: true,
    enabled: isReady,
    publicKey,
    message: isReady
      ? 'Payment gateway is active.'
      : 'Online Paystack checkout is currently inactive pending live credentials. WhatsApp order coordination is active.',
  });
}

/**
 * Initialize payment for an order
 */
export async function initializePayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderReference, customerEmail } = req.body;

    if (!orderReference || !customerEmail) {
      res.status(400).json({
        success: false,
        message: 'Order reference and customer email are required to initialize payment.',
      });
      return;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const callbackUrl = `${clientUrl}/order/confirmation/${orderReference}`;

    const result = await PaystackService.initializePayment(
      orderReference,
      customerEmail,
      callbackUrl
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Payment Init Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment initialization failed.',
    });
  }
}

/**
 * Verify payment
 */
export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const rawRef = req.params.reference;
    const reference = Array.isArray(rawRef) ? rawRef[0] : rawRef;

    if (!reference) {
      res.status(400).json({ success: false, message: 'Transaction reference is required.' });
      return;
    }

    const result = await PaystackService.verifyPayment(reference);

    res.json({
      success: result.verified,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment with gateway.',
    });
  }
}

/**
 * Paystack Webhook handler
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (!signature || !PaystackService.verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Paystack Webhook] Invalid signature rejected.');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;
    await PaystackService.processWebhookEvent(event);

    res.status(200).send('Webhook processed');
  } catch (error: any) {
    console.error('[Paystack Webhook Handler Error]:', error.message);
    res.status(500).send('Webhook processing error');
  }
}
