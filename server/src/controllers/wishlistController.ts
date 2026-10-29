import { Response } from 'express';
import { Wishlist } from '../models/Wishlist.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export async function getWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({
      success: true,
      products: wishlist.products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const pId = new mongoose.Types.ObjectId(productId);
    const index = wishlist.products.findIndex((id) => id.toString() === productId);

    let isAdded = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.products.push(pId);
      isAdded = true;
    }

    await wishlist.save();

    res.json({
      success: true,
      isAdded,
      message: isAdded ? 'Added to wishlist.' : 'Removed from wishlist.',
      count: wishlist.products.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
}
