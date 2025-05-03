import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user with a simple hash for now
    const adminPassword = createHash('sha256').update('admin123').digest('hex');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    logger.info('Database initialized successfully');
    logger.info('Admin user created:', { email: admin.email });
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 