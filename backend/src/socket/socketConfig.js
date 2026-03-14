/**
 * MyRuta Backend - Socket.io Configuration
 * 
 * Responsibilities:
 * - Set up Socket.io event handlers
 * - Manage real-time connections
 * - Coordinate location updates and broadcasts
 * - Handle client/server authentication via WebSockets
 */

import { locationHandler } from './handlers/locationHandler.js';
import { connectionHandler } from './handlers/connectionHandler.js';
import { logger } from '../utils/logger.js';

export function configureSocket(io) {
  // Middleware for socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      logger.warn('Socket connection attempted without token');
      // For development, allow; in production, verify JWT
      return next();
    }
    
    // TODO: Verify JWT token here
    next();
  });

  // Connection event
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    
    // Initialize connection handlers
    connectionHandler(socket, io);
    
    // Location update events
    socket.on('location:update', (data) => {
      locationHandler(socket, io, data);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });
}
