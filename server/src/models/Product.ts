import mongoose, { Document, Schema } from 'mongoose';

export interface IPackageTier {
  label: string;
  price: number;
  usdPrice?: number;
  unitText?: string;
  stock?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  cloudinaryIds?: string[];
  price: number; // in NGN
  internationalPrice?: number; // in USD
  unit: string;
  minOrderQty: number;
  availableQty: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  originState: string;
  supplier: {
    name: string;
    coop?: string;
    rating?: number;
    verified?: boolean;
  };
  specifications: {
    moisture?: string;
    processing?: string;
    packaging?: string;
    hsCode?: string;
    certifications?: string[];
  };
  packageTiers?: IPackageTier[];
  isPublished: boolean;
  isFeatured: boolean;
  bestSeller: boolean;
  airCargoReady: boolean;
  wholesaleAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    images: {
      type: [String],
      default: [],
      validate: [(val: string[]) => val.length > 0, 'At least one product image is required'],
    },
    cloudinaryIds: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price in Nigerian Naira is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    internationalPrice: {
      type: Number,
      min: [0, 'International price cannot be negative'],
      default: null,
    },
    unit: {
      type: String,
      required: [true, 'Unit of sale is required (e.g. kg, 5kg bag, 4L, tonne)'],
      trim: true,
      default: 'kg',
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1'],
    },
    availableQty: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0,
      index: true,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
      index: true,
    },
    originState: {
      type: String,
      trim: true,
      default: 'Nigeria',
    },
    supplier: {
      name: { type: String, default: 'FarmNexa Certified Cooperative' },
      coop: { type: String, default: '' },
      rating: { type: Number, default: 4.8 },
      verified: { type: Boolean, default: true },
    },
    specifications: {
      moisture: { type: String, default: '< 10%' },
      processing: { type: String, default: 'Naturally Processed' },
      packaging: { type: String, default: 'Multi-layer Oxygen Barrier Sealed' },
      hsCode: { type: String, default: '' },
      certifications: { type: [String], default: ['Phytosanitary Cleared', 'Export Grade'] },
    },
    packageTiers: [
      {
        label: { type: String, required: true },
        price: { type: Number, required: true },
        usdPrice: { type: Number },
        unitText: { type: String },
        stock: { type: Number, default: 100 },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    airCargoReady: {
      type: Boolean,
      default: true,
    },
    wholesaleAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto compute stockStatus from availableQty if needed
ProductSchema.pre('save', function (next) {
  if (this.availableQty <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.availableQty <= 5) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', originState: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
