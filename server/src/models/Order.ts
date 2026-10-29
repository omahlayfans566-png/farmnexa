import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  tierLabel?: string;
  lineTotal: number;
}

export interface IOrder extends Document {
  orderReference: string;
  customer?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  paymentProvider: 'paystack' | 'bank_transfer' | 'manual';
  paymentReference: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'abandoned' | 'refunded';
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'ready_for_dispatch'
    | 'dispatched'
    | 'delivered'
    | 'cancelled';
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  inventoryDeducted: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    tierLabel: { type: String, default: '' },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    customerWhatsApp: {
      type: String,
      required: [true, 'Customer WhatsApp number is required for order coordination'],
      trim: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, 'Order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    paymentProvider: {
      type: String,
      enum: ['paystack', 'bank_transfer', 'manual'],
      default: 'paystack',
    },
    paymentReference: {
      type: String,
      sparse: true,
      index: true,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'abandoned', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'ready_for_dispatch',
        'dispatched',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'Nigeria' },
    },
    inventoryDeducted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
