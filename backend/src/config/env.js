/**
 * MyRuta Backend - Environment Configuration
 * 
 * Responsibilities:
 * - Load and validate environment variables
 * - Provide centralized config access
 * - Default values for development
 */

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  socketPort: parseInt(process.env.SOCKET_PORT || '3000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // External APIs
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  predictorServiceUrl: process.env.PREDICTOR_SERVICE_URL || 'http://localhost:8000',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Frontend URLs for CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
