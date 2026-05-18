/**
 * MyRuta Backend - Logger Utility
 * 
 * Responsibilities:
 * - Centralized logging
 * - Log level management
 * - Consistent log formatting
 */

import { config } from '../config/env.js';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const COLORS = {
  debug: '\x1b[36m',    // cyan
  info: '\x1b[32m',     // green
  warn: '\x1b[33m',     // yellow
  error: '\x1b[31m',    // red
  reset: '\x1b[0m'
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[config.logLevel] || LOG_LEVELS.info;
  }

  log(logLevel, message, data = {}) {
    if (LOG_LEVELS[logLevel] >= this.level) {
      const timestamp = new Date().toISOString();
      const color = COLORS[logLevel];
      const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';

      console.log(
        `${color}[${timestamp}] [${logLevel.toUpperCase()}]${COLORS.reset} ${message} ${dataStr}`
      );
    }
  }

  debug(message, data) { this.log('debug', message, data); }
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
}

export const logger = new Logger();
export default logger;
