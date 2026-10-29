import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true,
  });

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log(`[Cloudinary] Configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } else {
    console.warn('[Cloudinary] Cloudinary credentials are not fully configured.');
  }
}

export default cloudinary;
