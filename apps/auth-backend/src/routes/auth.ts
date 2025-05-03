import { FastifyInstance } from 'fastify';
import { loginRoute } from './auth/login';
import { refreshRoute } from './auth/refresh';
import { registerRoute } from './auth/register';

export async function authRoutes(fastify: FastifyInstance) {
  await registerRoute(fastify);
  await loginRoute(fastify);
  await refreshRoute(fastify);
} 