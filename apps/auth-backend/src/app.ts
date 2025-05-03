import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import { authRoutes } from './routes/auth';
import { config } from './config';

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  // Register CORS
  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Register JWT
  await app.register(jwt, {
    secret: config.jwt.secret,
  });

  // Register sensible for HTTP response helpers
  await app.register(sensible);

  // Register routes
  await app.register(authRoutes, { prefix: '/api' });

  return app;
} 