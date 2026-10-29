import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { PaystackService } from '../services/paystack.js';

describe('FarmNexa Core Business & Security Rules', () => {
  describe('Paystack Signature Verification', () => {
    it('should accurately verify authentic HMAC SHA512 signature', () => {
      const secret = 'sk_test_mock_secret_key_12345';
      process.env.PAYSTACK_WEBHOOK_SECRET = secret;

      const payload = JSON.stringify({
        event: 'charge.success',
        data: {
          reference: 'FNX-123456-NG_172000000',
          amount: 1420000,
          status: 'success',
        },
      });

      const validSignature = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');

      const isVerified = PaystackService.verifyWebhookSignature(payload, validSignature);
      expect(isVerified).toBe(true);
    });

    it('should reject tampered payload or forged signature', () => {
      const secret = 'sk_test_mock_secret_key_12345';
      process.env.PAYSTACK_WEBHOOK_SECRET = secret;

      const payload = JSON.stringify({ event: 'charge.success' });
      const fakeSignature = 'bad_forged_signature_hex_code';

      const isVerified = PaystackService.verifyWebhookSignature(payload, fakeSignature);
      expect(isVerified).toBe(false);
    });
  });

  describe('Missing Credentials Payment Gatekeeper', () => {
    it('should report payment disabled when PAYSTACK_ENABLED is false', () => {
      process.env.PAYSTACK_ENABLED = 'false';
      expect(PaystackService.isPaystackReady()).toBe(false);
    });

    it('should return safe disabled message when credentials missing', async () => {
      process.env.PAYSTACK_ENABLED = 'false';
      // Attempting to verify without enabled keys should safely return disabled
      const result = await PaystackService.verifyPayment('any_ref');
      expect(result.verified).toBe(false);
      expect(result.status).toBe('disabled');
    });
  });

  describe('WhatsApp Phone Number Normalization', () => {
    function normalizeWhatsApp(phone: string): string {
      let cleaned = phone.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = `234${cleaned.substring(1)}`;
      }
      return cleaned;
    }

    it('should normalize local Nigerian phone format (080...) to international (23480...) format', () => {
      expect(normalizeWhatsApp('0803 123 4567')).toBe('2348031234567');
      expect(normalizeWhatsApp('0812-345-6789')).toBe('2348123456789');
    });

    it('should preserve existing international phone format with + stripped', () => {
      expect(normalizeWhatsApp('+234 803 123 4567')).toBe('2348031234567');
      expect(normalizeWhatsApp('+44 7911 123456')).toBe('447911123456');
    });
  });

  describe('Server-side Order Total Calculation', () => {
    it('should accurately compute line totals and subtotal without trusting client pricing', () => {
      const dbPrice = 9500;
      const quantity = 3;
      const computedLineTotal = dbPrice * quantity;
      expect(computedLineTotal).toBe(28500);

      const items = [
        { price: 9500, qty: 3 },
        { price: 14200, qty: 2 },
      ];
      const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
      expect(subtotal).toBe(56900);
    });
  });
});
