/**
 * MyRuta Backend - Auth Routes
 * 
 * Endpoints:
 * POST /api/auth/register - User registration
 * POST /api/auth/login - User login
 * POST /api/auth/refresh - Refresh JWT token
 * POST /api/auth/logout - User logout
 */

import express from 'express';

const router = express.Router();

// TODO: Import authController
// import { register, login, refreshToken, logout } from '../controllers/authController.js';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  // Placeholder
  res.status(501).json({ message: 'Register endpoint not yet implemented' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Placeholder
  res.status(501).json({ message: 'Login endpoint not yet implemented' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  // Placeholder
  res.status(501).json({ message: 'Refresh endpoint not yet implemented' });
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  // Placeholder
  res.status(501).json({ message: 'Logout endpoint not yet implemented' });
});

export default router;
