import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentTransaction extends Document {
  orderId: mongoose.Types.ObjectId;
  orderReference: string;
  provider: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'initialized' | 'success' | 'failed' | 'abandoned';
  customerEmail: string;
  verifiedAt?: Date;
  rawResponse?: any;
  webhookEvents?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderReference: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'paystack',
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    status: {
      type: String,
      enum: ['initialized', 'success', 'failed', 'abandoned'],
      default: 'initialized',
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
    rawResponse: {
      type: Schema.Types.Mixed,
    },
    webhookEvents: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  'PaymentTransaction',
  PaymentTransactionSchema
);
