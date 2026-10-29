import dotenv from 'dotenv';
dotenv.config();

import dns from 'node:dns';
// Fix Windows Node DNS SRV resolution issue by using reliable public DNS resolvers
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to MongoDB with custom DNS servers...');
  if (!uri) {
    console.error('No MONGODB_URI found in environment.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('SUCCESS: Connected to MongoDB Atlas!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
    process.exit(0);
  } catch (err: any) {
    console.error('FAILURE: Could not connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }
}

testConnection();
