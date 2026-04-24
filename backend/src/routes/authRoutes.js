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
import { register, login, refreshToken, logout } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
