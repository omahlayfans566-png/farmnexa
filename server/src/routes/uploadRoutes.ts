import { Router } from 'express';
import { uploadMiddleware, uploadImage } from '../controllers/uploadController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin only: secure product & category image upload
router.post('/image', protect, requireAdmin, uploadMiddleware.single('image'), uploadImage);

export default router;
