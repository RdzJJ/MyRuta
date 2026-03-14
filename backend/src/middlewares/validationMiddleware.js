/**
 * MyRuta Backend - Validation Middleware
 * 
 * Responsibilities:
 * - Validate request data
 * - Sanitize input
 * - Return validation errors
 * Note: Can be extended with packages like 'joi' or 'zod'
 */

import { logger } from '../utils/logger.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Placeholder for validation logic
      // TODO: Implement with joi/zod validation
      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(400).json({ error: 'Validation failed', details: error.message });
    }
  };
}

export function validateLoginData(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  next();
}

export default { validateRequest, validateLoginData };
