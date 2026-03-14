/**
 * MyRuta Backend - Error Handler Middleware
 * 
 * Responsibilities:
 * - Centralized error handling
 * - Consistent error response format
 * - Error logging
 * - Must be registered last
 */

import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    status: err.status || 500,
    stack: err.stack
  });

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

export default errorHandler;
