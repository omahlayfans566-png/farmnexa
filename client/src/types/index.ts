export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  createdAt?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  cloudinaryId?: string;
  isActive: boolean;
  displayOrder: number;
  hsCode?: string;
  itemCount?: number;
}

export interface IPackageTier {
  label: string;
  price: number;
  usdPrice?: number;
  unitText?: string;
  stock?: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: ICategory | string;
  images: string[];
  price: number;
  internationalPrice?: number;
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
  createdAt?: string;
}

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  tierLabel?: string;
  slug: string;
}

export interface IOrder {
  _id: string;
  orderReference: string;
  customer?: string | IUser;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  items: Array<{
    product: string | IProduct;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    image: string;
    tierLabel?: string;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  paymentProvider: string;
  paymentReference?: string;
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
  createdAt: string;
}
