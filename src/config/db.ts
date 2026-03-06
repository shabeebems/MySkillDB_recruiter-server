import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { ensureNoUniqueIndexOnFlipCards } from '../models/flipCard.model';
import { createChildLogger } from '../utils/logger';

const log = createChildLogger('DatabaseConfig');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let isConnected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    log.info('MongoDB connected');
    isConnected = true;
    
    // Ensure flipcards collection doesn't have unique index on skillId + jobId
    // This allows multiple flip cards per skill/job combination
    await ensureNoUniqueIndexOnFlipCards();
  } catch (error) {
    log.error({ err: error }, 'MongoDB connection error');
    log.warn('Server will continue without database - some features may not work');
    // Don't exit - allow server to run for routes that don't need DB (like AI routes)
  }
};

export const isDBConnected = () => isConnected;

export default connectDB;
