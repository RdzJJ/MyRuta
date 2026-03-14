/**
 * MyRuta Backend - Routes Index
 * 
 * Responsibilities:
 * - Aggregate all routes
 * - Central routing configuration
 */

import express from 'express';
import authRoutes from './authRoutes.js';
import conductorRoutes from './conductorRoutes.js';
import adminRoutes from './adminRoutes.js';
import clienteRoutes from './clienteRoutes.js';
import rutaRoutes from './rutaRoutes.js';

const router = express.Router();

// Mount route groups
router.use('/auth', authRoutes);
router.use('/conductores', conductorRoutes);
router.use('/admin', adminRoutes);
router.use('/clientes', clienteRoutes);
router.use('/rutas', rutaRoutes);

export default router;
