import { Request, Response } from 'express';
import multer from 'multer';
import { CloudinaryService } from '../services/cloudinary.js';

// Configure multer to store in memory
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
    }
  },
});

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded.' });
      return;
    }

    const folder = (req.body.folder as string) || 'farmnexa/products';
    const result = await CloudinaryService.uploadBuffer(req.file.buffer, folder);

    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error: any) {
    console.error('[Upload Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Image upload failed.' });
  }
}
