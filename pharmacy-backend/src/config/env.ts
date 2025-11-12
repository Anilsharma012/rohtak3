// src/config/env.ts
import 'dotenv/config';

const required = (key: string, fallback?: string): string => {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === null || v === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return v;
};

const toInt = (s: string | undefined, def: number): number => {
  const n = s ? parseInt(s, 10) : NaN;
  return Number.isFinite(n) ? n : def;
};

const toBool = (s: string | undefined, def = false): boolean =>
  s === undefined ? def : /^(1|true|yes|on)$/i.test(s);

const toList = (s: string | undefined, def: string[] = []): string[] =>
  !s ? def : s.split(',').map(x => x.trim()).filter(Boolean);

export const ENV = {
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'test' | 'production',

  // Server
  PORT: toInt(process.env.PORT, 5000),

  // MongoDB
  MONGO_URI: required('MONGO_URI'),
  // Keep DB name explicit (cleaner than baking it in the URI)
  MONGO_DB_NAME: process.env.MONGO_DB_NAME ?? 'rohtak_pharmacy',

  // Auth / Security
  JWT_SECRET: required('JWT_SECRET'),
  BCRYPT_ROUNDS: toInt(process.env.BCRYPT_ROUNDS, 10),

  // CORS
  CLIENT_ORIGINS: toList(process.env.CLIENT_ORIGINS, [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',

  ]),
  CORS_CREDENTIALS: toBool(process.env.CORS_CREDENTIALS, true),

  // Rate limiting (optional, if you add it)
  RATE_LIMIT_WINDOW_MS: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  RATE_LIMIT_MAX: toInt(process.env.RATE_LIMIT_MAX, 100),
} as const;
