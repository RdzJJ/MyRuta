/**
 * MyRuta Backend - Firebase Database Configuration
 * 
 * Responsibilities:
 * - Initialize Firebase connections
 * - Health checks for Firestore and Realtime Database
 */

import { adminDb, adminRtdb } from './firebase.js';
import { logger } from '../utils/logger.js';

export async function initializeDatabase() {
  try {
    // Test Firestore connection
    const testDoc = await adminDb.collection('_health').doc('check').get();
    logger.info('✓ Firestore connection initialized successfully');

    // Test Realtime Database connection
    const testRef = adminRtdb.ref('_health');
    await testRef.once('value');
    logger.info('✓ Realtime Database connection initialized successfully');
  } catch (error) {
    logger.error('✗ Failed to initialize Firebase:', error);
    throw error;
  }
}

export async function checkDatabaseHealth() {
  try {
    const firestoreCheck = await adminDb.collection('_health').doc('check').get();
    const realtimeCheck = await adminRtdb.ref('_health').once('value');
    
    return { 
      status: 'healthy',
      firestore: 'connected',
      realtimeDb: 'connected'
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { 
      status: 'unhealthy', 
      error: error.message,
      firestore: 'disconnected',
      realtimeDb: 'disconnected'
    };
  }
}

export default { initializeDatabase, checkDatabaseHealth };
