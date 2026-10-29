import dns from 'node:dns';
import mongoose from 'mongoose';

// Ensure reliable SRV query resolution for MongoDB Atlas across environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // If setServers fails in a restricted container, proceed with system DNS
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime error:', err.message);
  });
}
