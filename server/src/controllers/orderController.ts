import { Response } from 'express';
import { Order, IOrderItem } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Helper to generate unique order reference: FNX-[Random 6 Digits]-NG
function generateOrderReference(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `FNX-${randomDigits}-NG`;
}

// Helper to normalize WhatsApp phone number
function normalizeWhatsApp(phone: string): string {
  // Remove non-digit chars except leading plus
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // If Nigerian format starting with 0 (e.g. 08012345678), replace leading 0 with 234
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = `234${cleaned.substring(1)}`;
  }
  return cleaned;
}

/**
 * Validate and calculate cart items against database
 */
export async function validateCart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { items } = req.body; // Array of { productId, quantity, tierLabel }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items must be a non-empty array.' });
      return;
    }

    const validatedItems: IOrderItem[] = [];
    let subtotal = 0;
    const errors: string[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished) {
        errors.push(`Item is no longer available.`);
        continue;
      }

      const qty = Math.max(1, Number(item.quantity) || 1);

      if (product.availableQty < qty) {
        errors.push(
          `Insufficient stock for "${product.name}". Only ${product.availableQty} available.`
        );
      }

      // Check if item has a packageTier price
      let unitPrice = product.price;
      let unitLabel = product.unit;

      if (item.tierLabel && product.packageTiers && product.packageTiers.length > 0) {
        const tier = product.packageTiers.find((t) => t.label === item.tierLabel);
        if (tier) {
          unitPrice = tier.price;
          unitLabel = tier.label;
        }
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        unit: unitLabel,
        quantity: qty,
        image: product.images[0] || '',
        tierLabel: item.tierLabel || '',
        lineTotal,
      });
    }

    res.json({
      success: errors.length === 0,
      errors,
      validatedItems,
      subtotal,
      shippingFee: 0,
      totalAmount: subtotal,
      currency: 'NGN',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to validate cart.' });
  }
}

/**
 * Create a new order
 */
export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { customerName, customerEmail, customerWhatsApp, items, deliveryAddress, notes } =
      req.body;

    if (!customerWhatsApp) {
      res.status(400).json({
        success: false,
        message: 'A WhatsApp phone number is required to coordinate dispatch & transportation.',
      });
      return;
    }

    const cleanWhatsApp = normalizeWhatsApp(customerWhatsApp);
    if (cleanWhatsApp.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid international or Nigerian WhatsApp phone number.',
      });
      return;
    }

    // Determine customer info (use authenticated user if present)
    const finalName = req.user?.name || customerName?.trim();
    const finalEmail = req.user?.email || customerEmail?.trim()?.toLowerCase();

    if (!finalName || !finalEmail) {
      res.status(400).json({
        success: false,
        message: 'Customer name and email are required to receive your order confirmation.',
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order items are required.',
      });
      return;
    }

    // Server-side recalculation and stock validation
    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isPublished) {
        res.status(400).json({
          success: false,
          message: `Item is no longer available in the catalogue.`,
        });
        return;
      }

      const qty = Math.max(1, Number(item.quantity) || 1);

      if (product.availableQty < qty) {
        res.status(400).json({
          success: false,
          message: `Product "${product.name}" only has ${product.availableQty} units available. Please adjust your order.`,
        });
        return;
      }

      let unitPrice = product.price;
      let unitLabel = product.unit;

      if (item.tierLabel && product.packageTiers && product.packageTiers.length > 0) {
        const tier = product.packageTiers.find((t) => t.label === item.tierLabel);
        if (tier) {
          unitPrice = tier.price;
          unitLabel = tier.label;
        }
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        unit: unitLabel,
        quantity: qty,
        image: product.images[0] || '',
        tierLabel: item.tierLabel || '',
        lineTotal,
      });
    }

    const shippingFee = 0; // Transparent: transportation coordinated via WhatsApp
    const totalAmount = subtotal + shippingFee;

    let orderReference = generateOrderReference();
    // Ensure unique reference
    while (await Order.findOne({ orderReference })) {
      orderReference = generateOrderReference();
    }

    const order = await Order.create({
      orderReference,
      customer: req.user?._id,
      customerName: finalName,
      customerEmail: finalEmail,
      customerWhatsApp: cleanWhatsApp,
      items: orderItems,
      subtotal,
      shippingFee,
      totalAmount,
      currency: 'NGN',
      paymentProvider: 'paystack',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      deliveryAddress: deliveryAddress || {},
      notes: notes || '',
      inventoryDeducted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      orderReference: order.orderReference,
      order,
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
}

/**
 * Public/Customer: Get order details by reference
 */
export async function getOrderByReference(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rawRef = req.params.reference;
    const reference = Array.isArray(rawRef) ? rawRef[0] : rawRef;

    const order = await Order.findOne({ orderReference: reference.toUpperCase() }).populate(
      'customer',
      'name email phone'
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // IDOR protection: If order belongs to an authenticated user and requester is not that user or an admin, deny
    if (order.customer && req.user) {
      const isOwner = order.customer.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, message: 'Unauthorized access to this order.' });
        return;
      }
    }

    // Only generate transportation discussion WhatsApp link if payment genuinely succeeded
    let whatsappUrl = '';
    const isPaid = order.paymentStatus === 'paid';
    const businessPhone = process.env.FARMNEXA_WHATSAPP_NUMBER || '2348000000000';

    if (isPaid) {
      const messageText = `Hello FarmNexa, I have successfully paid for Order #${order.orderReference} and would like to discuss transportation and delivery arrangements.`;
      whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(messageText)}`;
    }

    res.json({
      success: true,
      order,
      isPaid,
      whatsappUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving order.' });
  }
}

/**
 * Customer: Get order history for current logged in user
 */
export async function getCustomerOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order history.' });
  }
}

/**
 * Admin: Get all orders with search and pagination
 */
export async function getAdminOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search && typeof search === 'string') {
      const trimmed = search.trim();
      query.$or = [
        { orderReference: { $regex: trimmed, $options: 'i' } },
        { customerName: { $regex: trimmed, $options: 'i' } },
        { customerEmail: { $regex: trimmed, $options: 'i' } },
        { customerWhatsApp: { $regex: trimmed, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin orders.' });
  }
}

/**
 * Admin: Update order fulfillment status (without tracking)
 */
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = [
      'pending',
      'confirmed',
      'processing',
      'ready_for_dispatch',
      'dispatched',
      'delivered',
      'cancelled',
    ];

    if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: 'Invalid or missing order fulfillment status.' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}
