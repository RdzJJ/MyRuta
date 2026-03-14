/**
 * MyRuta Backend - Connection Handler
 * 
 * Responsibilities:
 * - Handle client connection events
 * - Set up client identification
 * - Initialize user-specific rooms
 */

import { logger } from '../../utils/logger.js';

export function connectionHandler(socket, io) {
  // Join user-specific room for direct messages
  socket.on('user:join', (userData) => {
    socket.join(`user:${userData.userId}`);
    socket.join(`role:${userData.role}`);
    
    if (userData.routeId) {
      socket.join(`route:${userData.routeId}`);
    }
    
    logger.info(`User ${userData.userId} joined with role ${userData.role}`);
  });

  // Handle user status updates
  socket.on('user:status', (status) => {
    socket.emit('user:status:ack', { received: true });
  });
}
