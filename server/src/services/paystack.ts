import crypto from 'node:crypto';
import axios from 'axios';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export interface PaystackInitResponse {
  enabled: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  message?: string;
}

export class PaystackService {
  private static get secretKey(): string {
    return process.env.PAYSTACK_SECRET_KEY || '';
  }

  private static get isEnabled(): boolean {
    const enabled = process.env.PAYSTACK_ENABLED === 'true';
    const hasKey = Boolean(this.secretKey && this.secretKey.startsWith('sk_'));
    return enabled && hasKey;
  }

  /**
   * Check if Paystack payments are configured and active
   */
  public static isPaystackReady(): boolean {
    return this.isEnabled;
  }

  /**
   * Initialize a Paystack transaction for an order
   */
  public static async initializePayment(
    orderReference: string,
    customerEmail: string,
    callbackUrl: string
  ): Promise<PaystackInitResponse> {
    const order = await Order.findOne({ orderReference });
    if (!order) {
      throw new Error(`Order ${orderReference} not found`);
    }

    if (!this.isEnabled) {
      return {
        enabled: false,
        reference: orderReference,
        message:
          'Online payment via Paystack is currently pending gateway activation. Please select alternative checkout coordination or contact FarmNexa trade logistics.',
      };
    }

    // Amount in kobo (NGN * 100)
    const amountInKobo = Math.round(order.totalAmount * 100);
    const reference = `${orderReference}_${Date.now()}`;

    // Record initialized transaction for idempotency & audit
    await PaymentTransaction.create({
      orderId: order._id,
      orderReference: order.orderReference,
      provider: 'paystack',
      reference,
      amount: order.totalAmount,
      currency: order.currency,
      status: 'initialized',
      customerEmail,
    });

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: customerEmail,
          amount: amountInKobo,
          reference,
          callback_url: callbackUrl,
          metadata: {
            orderReference: order.orderReference,
            orderId: order._id.toString(),
            customerWhatsApp: order.customerWhatsApp,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const data = response.data?.data;
      if (!data?.authorization_url) {
        throw new Error('Invalid response from Paystack transaction initialize');
      }

      order.paymentReference = reference;
      await order.save();

      return {
        enabled: true,
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
        reference: data.reference,
      };
    } catch (error: any) {
      console.error('[Paystack] Initialize transaction error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 'Failed to initialize payment gateway transaction'
      );
    }
  }

  /**
   * Verify a transaction with Paystack backend API
   */
  public static async verifyPayment(reference: string): Promise<{
    verified: boolean;
    orderReference?: string;
    amount?: number;
    status: string;
    message: string;
  }> {
    if (!this.isEnabled) {
      return {
        verified: false,
        status: 'disabled',
        message: 'Payment gateway is not currently active.',
      };
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
          timeout: 10000,
        }
      );

      const data = response.data?.data;
      if (!data) {
        return {
          verified: false,
          status: 'failed',
          message: 'Unable to retrieve transaction status from Paystack.',
        };
      }

      const orderRef = data.metadata?.orderReference;
      const amountPaid = data.amount / 100; // convert kobo to NGN
      const isSuccess = data.status === 'success';

      // Update transaction record
      const txn = await PaymentTransaction.findOne({ reference });
      if (txn) {
        txn.status = isSuccess ? 'success' : 'failed';
        txn.verifiedAt = new Date();
        txn.rawResponse = data;
        await txn.save();
      }

      if (isSuccess && orderRef) {
        await this.handleSuccessfulOrderPayment(orderRef, reference, amountPaid);
      }

      return {
        verified: isSuccess,
        orderReference: orderRef,
        amount: amountPaid,
        status: data.status,
        message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed',
      };
    } catch (error: any) {
      console.error('[Paystack] Verify payment error:', error.response?.data || error.message);
      return {
        verified: false,
        status: 'error',
        message: error.response?.data?.message || 'Error occurred while verifying transaction with Paystack',
      };
    }
  }

  /**
   * Validate Paystack Webhook Signature using HMAC SHA512
   */
  public static verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || this.secretKey;
    if (!webhookSecret || !signature) return false;

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Handle Webhook Event idempotently
   */
  public static async processWebhookEvent(event: any): Promise<void> {
    if (!event || !event.event) return;

    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;
      const orderRef = data.metadata?.orderReference;
      const amountPaid = data.amount / 100;

      // Check transaction idempotency
      const txn = await PaymentTransaction.findOne({ reference });
      if (txn) {
        if (txn.status === 'success') {
          console.log(`[Paystack Webhook] Reference ${reference} already processed. Skipping duplicate.`);
          return;
        }
        txn.status = 'success';
        txn.verifiedAt = new Date();
        txn.webhookEvents?.push(event);
        await txn.save();
      }

      if (orderRef) {
        await this.handleSuccessfulOrderPayment(orderRef, reference, amountPaid);
      }
    }
  }

  /**
   * Atomic and idempotent handling of successful payment and inventory deduction
   */
  private static async handleSuccessfulOrderPayment(
    orderReference: string,
    paymentRef: string,
    amountPaid: number
  ): Promise<void> {
    const order = await Order.findOne({ orderReference });
    if (!order) {
      console.warn(`[Paystack] Order ${orderReference} not found during payment confirmation.`);
      return;
    }

    // Verify amount matches
    if (Math.abs(order.totalAmount - amountPaid) > 1) {
      console.error(
        `[Paystack] Amount mismatch for order ${orderReference}: expected ${order.totalAmount}, got ${amountPaid}`
      );
      // Mark as pending investigation
      return;
    }

    // If already paid, do not deduct inventory again
    if (order.paymentStatus === 'paid' && order.inventoryDeducted) {
      console.log(`[Paystack] Order ${orderReference} is already marked as paid.`);
      return;
    }

    order.paymentStatus = 'paid';
    order.paymentReference = paymentRef;
    order.orderStatus = 'confirmed';

    // Safely deduct inventory exactly once
    if (!order.inventoryDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { availableQty: -item.quantity },
        });
      }
      order.inventoryDeducted = true;
    }

    await order.save();
    console.log(`[Paystack] Order ${orderReference} successfully marked as PAID. Inventory deducted.`);
  }
}
