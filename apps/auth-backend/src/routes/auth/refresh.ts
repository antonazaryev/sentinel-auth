import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function refreshRoute(fastify: FastifyInstance) {
  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = refreshSchema.parse(request.body);

      // Verify refresh token
      const decoded = await request.jwtVerify<{ userId: string }>();
      const userId = decoded.userId;

      // Check if token exists and is valid
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        return reply.unauthorized('Invalid refresh token');
      }

      // Mark token as used
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { used: true },
      });

      // Generate new tokens
      const newAccessToken = await reply.jwtSign(
        { userId },
        { expiresIn: config.jwt.accessExpiresIn }
      );

      const newRefreshToken = await reply.jwtSign(
        { userId },
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error(error);
      return reply.internalServerError('An error occurred during token refresh');
    }
  });
} 