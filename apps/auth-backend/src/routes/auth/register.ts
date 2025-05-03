import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { registerSchema } from '@sentinel/shared-schemas';

const prisma = new PrismaClient();

export async function registerRoute(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(request.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.conflict('User with this email already exists');
      }

      // Hash password
      const hashedPassword = createHash('sha256').update(password).digest('hex');

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
        },
      });

      // Generate tokens
      const accessToken = await reply.jwtSign(
        { userId: user.id },
        { expiresIn: config.jwt.accessExpiresIn }
      );

      const refreshToken = await reply.jwtSign(
        { userId: user.id },
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      logger.error(error);
      if (error instanceof z.ZodError) {
        return reply.badRequest('Invalid input data');
      }
      return reply.internalServerError('An error occurred during registration');
    }
  });
} 