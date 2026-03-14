/**
 * MyRuta Backend - Main Entry Point
 * 
 * Responsibilities:
 * - Load environment variables
 * - Initialize configuration
 * - Start the Express server
 * - Initialize Socket.io for real-time communication
 */

import 'dotenv/config';
import server from './server.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  logger.info(`🚀 MyRuta Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
