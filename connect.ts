import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (uri) {
      await mongoose.connect(uri);
      console.log('[MongoDB] Connected successfully to MONGODB_URI:', uri);
    } else {
      console.log('[MongoDB] No MONGODB_URI found. Initializing MongoDB Memory Server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('[MongoDB] Connected successfully to In-Memory MongoDB:', mongoUri);
    }
  } catch (error) {
    console.warn('[MongoDB] Connection error, falling back to MongoMemoryServer:', error);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
        const mongoUri = mongoMemoryServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('[MongoDB] Fallback In-Memory MongoDB connected:', mongoUri);
      }
    } catch (memError) {
      console.error('[MongoDB] Memory server initialization failed:', memError);
    }
  }
};

export const closeDatabase = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
