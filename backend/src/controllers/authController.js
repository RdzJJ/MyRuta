/**
 * MyRuta Backend - Auth Controller
 * 
 * Responsibilities:
 * - Handle user registration
 * - Handle user login with JWT generation
 * - Handle token refresh
 * - Handle user logout
 */

import authService from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * POST /auth/register
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, firstName, lastName'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      role
    });

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    
    // Check if it's a unique constraint error (user already exists)
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
}

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const { token, user } = await authService.loginUser(email, password);

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);

    // Return 401 for invalid credentials
    if (error.message.includes('Invalid') || error.message.includes('disabled')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account disabled'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
}

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
export async function refreshToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const newToken = await authService.refreshToken(token);

    logger.info('Token refreshed successfully');
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed'
    });
  }
}

/**
 * POST /auth/logout
 * Logout user (client-side token deletion)
 */
export async function logout(req, res) {
  try {
    // JWT logout is handled on the client-side by removing token from localStorage
    // This endpoint could be used for:
    // - Logging the logout event
    // - Token blacklisting (if implemented)
    // - Session cleanup (if sessions are used)

    logger.info('User logged out');
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
}
