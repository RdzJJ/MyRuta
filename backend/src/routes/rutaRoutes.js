/**
 * MyRuta Backend - Ruta (Route) Routes
 * 
 * Endpoints:
 * GET /api/rutas - List all routes
 * GET /api/rutas/:id - Get route details
 * GET /api/rutas/:id/stops - Get stops for a route
 * GET /api/rutas/:id/current-location - Get current vehicle location
 * GET /api/rutas/:id/estimated-time - Get estimated arrival time to a stop
 */

import express from 'express';

const router = express.Router();

// TODO: Import rutaController
// import { listRoutes, getRoute, getStops, getCurrentLocation, getEstimatedTime } from '../controllers/rutaController.js';

// GET /api/rutas
router.get('/', async (req, res) => {
  // List all routes - public endpoint
  res.status(501).json({ message: 'List routes endpoint not yet implemented' });
});

// GET /api/rutas/:id
router.get('/:id', async (req, res) => {
  // Get route details
  res.status(501).json({ message: 'Get route endpoint not yet implemented' });
});

// GET /api/rutas/:id/stops
router.get('/:id/stops', async (req, res) => {
  // Get stops for a route
  res.status(501).json({ message: 'Get stops endpoint not yet implemented' });
});

// GET /api/rutas/:id/current-location
router.get('/:id/current-location', async (req, res) => {
  // Get current vehicle location (WebSockets preferred)
  res.status(501).json({ message: 'Get current location endpoint not yet implemented' });
});

// GET /api/rutas/:id/estimated-time
router.get('/:id/estimated-time', async (req, res) => {
  // Get estimated arrival time
  res.status(501).json({ message: 'Get estimated time endpoint not yet implemented' });
});

export default router;
