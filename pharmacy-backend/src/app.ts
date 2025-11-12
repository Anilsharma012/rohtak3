import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import itemRoutes from './routes/items.routes';
import { errorHandler, notFound } from './middleware/error';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ENV.CLIENT_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/items', itemRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
