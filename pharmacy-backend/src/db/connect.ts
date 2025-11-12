import mongoose from 'mongoose';
import { ENV } from '../config/env';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);

  const uri = ENV.MONGO_URI;
  const dbName = ENV.MONGO_DB_NAME || 'rohtak_pharmacy';

  await mongoose.connect(uri, { dbName });

  console.log(`✅ MongoDB connected (db: ${mongoose.connection.name})`);
};
