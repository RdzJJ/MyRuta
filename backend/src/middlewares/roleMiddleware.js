/**
 * MyRuta Backend - Role Middleware
 * 
 * Responsibilities:
 * - Verify user has required role
 * - Reject requests from unauthorized roles
 * - Support multiple role requirements
 */

import { logger } from '../utils/logger.js';

export function roleMiddleware(...requiredRoles) {
  return (req, res, next) => {
    try {
      // Assuming authMiddleware has already set req.user
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!requiredRoles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt. Role: ${req.user.role}`);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      logger.info(`Role middleware: ${req.user.role} allowed`);
      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export default roleMiddleware;
