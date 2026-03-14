/**
 * MyRuta Backend - Prisma Client
 * 
 * Responsibilities:
 * - Export Prisma client instance
 * - Ensure single instance across app
 * - Handle connection lifecycle
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
});

// Optional: Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`[QUERY] ${e.query} [${e.duration}ms]`);
  });
}

// Handle connection events
prisma.$connect()
  .then(() => logger.info('✓ Database connected'))
  .catch((err) => {
    logger.error('✗ Database connection failed:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
  process.exit(0);
});

export default prisma;
