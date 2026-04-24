/**
 * MyRuta Backend - Auth Service
 * 
 * Responsibilities:
 * - Register users with password hashing
 * - Authenticate users and generate JWT
 * - Validate and refresh tokens
 * - Password verification
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../models/prismaClient.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

export class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User data (email, password, firstName, lastName, role)
   * @returns {Object} User object without password
   */
  async registerUser(userData) {
    try {
      const { email, password, firstName, lastName, role = 'CLIENTE' } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        }
      });

      logger.info(`User registered: ${email}`);
      return user;
    } catch (error) {
      logger.error(`Register error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Authenticate user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} { token, user }
   */
  async loginUser(email, password) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.active) {
        throw new Error('User account is disabled');
      }

      // Verify password
      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      // Return token and user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      
      logger.info(`User logged in: ${email}`);
      return {
        token,
        user: userWithoutPassword
      };
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error(`Token validation error: ${error.message}`);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {string} New JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = this.validateToken(token);
      
      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          active: true
        }
      });

      if (!user || !user.active) {
        throw new Error('User not found or inactive');
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      logger.info(`Token refreshed for user: ${user.email}`);
      return newToken;
    } catch (error) {
      logger.error(`Token refresh error: ${error.message}`);
      throw error;
    }
  }
}

export default new AuthService();
