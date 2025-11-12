import { createServer } from 'http';
import { createApp } from './app';
import { connectDB } from './db/connect';
import { ENV } from './config/env';

const start = async () => {
  try {
    await connectDB();
    const app = createApp();
    const server = createServer(app);
    server.listen(ENV.PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${ENV.PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();
