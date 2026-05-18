/**
 * MyRuta Backend - JWT Utility
 * 
 * Responsibilities:
 * - Generate JWT tokens
 * - Verify JWT tokens
 * - Extract payload from tokens
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from './logger.js';

export function generateToken(payload, expiresIn = config.jwtExpiresIn) {
  try {
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn });
    return token;
  } catch (error) {
    logger.error('Error generating token:', error);
    throw error;
  }
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    logger.error('Error verifying token:', error.message);
    throw error;
  }
}

export function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Error decoding token:', error);
    throw error;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

export default { generateToken, verifyToken, decodeToken, isTokenExpired };
