/**
 * MyRuta Backend - Database Configuration
 * 
 * Responsibilities:
 * - Database connection string management
 * - Initialize Prisma migrations
 * - Database health checks
 */

import prisma from '../models/prismaClient.js';
import { logger } from '../utils/logger.js';

export async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Database initialized successfully');
  } catch (error) {
    logger.error('✗ Failed to initialize database:', error);
    throw error;
  }
}

export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy' };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

export default { initializeDatabase, checkDatabaseHealth };
