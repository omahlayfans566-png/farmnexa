import cloudinary from '../config/cloudinary.js';
import streamifier from 'node:stream';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export class CloudinaryService {
  /**
   * Upload an image buffer directly to Cloudinary
   */
  public static async uploadBuffer(
    buffer: Buffer,
    folder: string = 'farmnexa/products'
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error.message);
            return reject(new Error(`Image upload failed: ${error.message}`));
          }
          if (!result) {
            return reject(new Error('Cloudinary returned empty result.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      // Stream the buffer to Cloudinary
      const readable = new streamifier.Readable();
      readable._read = () => {};
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary
   */
  public static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (err: any) {
      console.warn(`[Cloudinary] Failed to delete image ${publicId}:`, err.message);
      return false;
    }
  }
}
