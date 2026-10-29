# FarmNexa Paystack Integration & Activation Guide

This document outlines how the Paystack payment gateway is structured in FarmNexa and provides instructions on how to activate live payments once Paystack API credentials are ready.

---

## Current Gateway Architecture

In accordance with strict production safety principles:
- **No Mock Payments in Production Code**: The backend rejects fabricated payment confirmations.
- **Graceful Disabled State**: While `PAYSTACK_ENABLED=false` or keys are empty, checkout orders are placed securely with status `pending`, generating an official FarmNexa order reference (`FNX-...`).
- **Direct WhatsApp Order Desk**: The buyer is directed to finalize payment and consignment logistics via the official WhatsApp coordination channel with their order reference pre-populated.
- **Idempotency & HMAC Security**: All webhook events are validated using cryptographic `crypto.createHmac('sha512', secret)` verification. Duplicate webhook deliveries are ignored safely.

---

## Step-by-Step Activation Instructions

### 1. Obtain Your Paystack Credentials
1. Sign in to your [Paystack Dashboard](https://dashboard.paystack.com).
2. Navigate to **Settings** > **API Keys & Webhooks**.
3. Copy your:
   - **Public Key** (`pk_live_...` or `pk_test_...`)
   - **Secret Key** (`sk_live_...` or `sk_test_...`)

### 2. Configure Environment Variables
Open `server/.env` and update the following values:

```env
# Paystack Payment Gateway
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_public_key
PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key
PAYSTACK_WEBHOOK_SECRET=sk_live_your_actual_secret_key
PAYSTACK_ENABLED=true
```

Restart the backend server for changes to take effect:
```bash
npm run dev:server
```

### 3. Configure Webhook URL in Paystack Dashboard
1. In your Paystack Dashboard, go to **Settings** > **API Keys & Webhooks**.
2. Set the **Live Webhook URL** to:
   ```
   https://api.yourdomain.com/api/payments/webhook
   ```
   *(For local testing with tools like ngrok, use `https://<ngrok-id>.ngrok-free.app/api/payments/webhook`)*
3. Save changes.

---

## Webhook Verification Details

The backend webhook endpoint is implemented in `server/src/routes/paymentRoutes.ts` and `server/src/controllers/paymentController.ts`.

It utilizes raw request body capture (`req.rawBody`) before JSON parsing to calculate the exact SHA512 signature:

```typescript
const hash = crypto
  .createHmac('sha512', webhookSecret)
  .update(req.rawBody)
  .digest('hex');

if (hash !== req.headers['x-paystack-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

Upon receiving a `charge.success` event:
1. Verifies order exists by reference.
2. Updates `Order.paymentStatus = 'paid'` and sets fulfillment to `'confirmed'`.
3. Stores transaction metadata in `PaymentTransaction` collection for audit records.
