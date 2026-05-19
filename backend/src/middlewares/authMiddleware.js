/**
 * MyRuta Backend - Auth Middleware
 * 
 * Responsibilities:
 * - Verify JWT token validity
 * - Extract user information from token
 * - Reject requests without valid token
 */

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;

    logger.info(`Auth middleware: token verified for user ${decoded.email}`);
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default authMiddleware;
