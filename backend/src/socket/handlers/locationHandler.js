/**
 * MyRuta Backend - Location Handler
 * 
 * Responsibilities:
 * - Process incoming GPS location updates from conductors
 * - Broadcast location to relevant clients subscribed to that route
 * - Validate location data
 * - Save location to database for analysis
 */

import { logger } from '../../utils/logger.js';

export async function locationHandler(socket, io, data) {
  const { latitude, longitude, accuracy, routeId, conductorId, timestamp } = data;

  // Validate location data
  if (!latitude || !longitude || !routeId || !conductorId) {
    logger.warn('Invalid location data received', { conductorId, routeId });
    socket.emit('location:error', { message: 'Invalid location data' });
    return;
  }

  try {
    // TODO: Save location to database via LocationService
    // const savedLocation = await locationService.saveLocation({...});

    // Broadcast to all clients watching this route
    io.to(`route:${routeId}`).emit('location:update', {
      routeId,
      conductorId,
      latitude,
      longitude,
      accuracy,
      timestamp: timestamp || new Date()
    });

    // Send acknowledgment to sender
    socket.emit('location:update:ack', { success: true });

    logger.debug(`Location update broadcast for route ${routeId}`);
  } catch (error) {
    logger.error('Error processing location update:', error);
    socket.emit('location:error', { message: 'Failed to process location' });
  }
}
