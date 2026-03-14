/**
 * MyRuta Backend - Auth Middleware
 * 
 * Responsibilities:
 * - Verify JWT token validity
 * - Extract user information from token
 * - Reject requests without valid token
 */

import { logger } from '../utils/logger.js';

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // TODO: Verify JWT using jwt.verify()
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;

    logger.info('Auth middleware: token verified');
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default authMiddleware;
