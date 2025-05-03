import { FastifyInstance } from 'fastify';
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { loginSchema } from '@sentinel/shared-schemas';

const prisma = new PrismaClient();

export async function loginRoute(fastify: FastifyInstance) {
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.unauthorized('Invalid credentials');
      }

      const hashedPassword = createHash('sha256').update(password).digest('hex');
      if (hashedPassword !== user.passwordHash) {
        return reply.unauthorized('Invalid credentials');
      }

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
      return reply.internalServerError('An error occurred during login');
    }
  });
} 