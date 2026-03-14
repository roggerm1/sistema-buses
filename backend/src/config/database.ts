import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGO_URI);
      console.log('MongoDB connected successfully');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error);

      if (attempt === MAX_RETRIES) {
        console.error('Could not connect to MongoDB after maximum retries');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
