import { z } from 'zod';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  
  // Server
  PORT: z.string().transform(Number),
  HOST: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
});

const env = envSchema.parse(process.env);

export const config = {
  port: env.PORT,
  host: env.HOST,
  nodeEnv: env.NODE_ENV,
  
  database: {
    url: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/auth',
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET || 'your-secret-key',
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
} as const; 