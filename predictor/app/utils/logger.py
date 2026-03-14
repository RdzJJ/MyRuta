"""
MyRuta Predictor - Logger Utility

This module provides centralized logging configuration and utilities.
Supports console and file logging with structured log formatting.

Responsibilities:
- Configure logging for console and file output
- Provide logger instances for different modules
- Format logs with timestamps and log levels
- Support different log levels (DEBUG, INFO, WARNING, ERROR)
"""

import logging
import logging.config
import logging.handlers
import os
import sys
from typing import Optional

# ANSI color codes for terminal output
class Colors:
    """ANSI color codes for colored terminal output"""
    DEBUG = '\033[36m'      # Cyan
    INFO = '\033[32m'       # Green
    WARNING = '\033[33m'    # Yellow
    ERROR = '\033[31m'      # Red
    CRITICAL = '\033[41m'   # Red background
    RESET = '\033[0m'       # Reset


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colored output for console"""

    LEVEL_COLORS = {
        'DEBUG': Colors.DEBUG,
        'INFO': Colors.INFO,
        'WARNING': Colors.WARNING,
        'ERROR': Colors.ERROR,
        'CRITICAL': Colors.CRITICAL,
    }

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors"""
        levelname = record.levelname
        if levelname in self.LEVEL_COLORS:
            record.levelname = f"{self.LEVEL_COLORS[levelname]}{levelname}{Colors.RESET}"
        
        # Add emoji based on level
        emoji_map = {
            'DEBUG': '🐛',
            'INFO': 'ℹ️',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'CRITICAL': '🔴',
        }
        emoji = emoji_map.get(record.levelname.split(Colors.RESET)[-1], '•')
        record.emoji = emoji
        
        return super().format(record)


def setup_logging(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    log_format: Optional[str] = None,
) -> None:
    """
    Configure logging for the application.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (if None, only console logging)
        log_format: Custom log format string
    """
    if log_format is None:
        log_format = (
            "%(asctime)s - %(emoji)s [%(levelname)s] - %(name)s - %(message)s"
        )

    # Get logging level
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_formatter = ColoredFormatter(log_format)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File handler (if log file specified)
    if log_file:
        # Create log directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)

        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
        )
        file_handler.setLevel(numeric_level)
        file_formatter = logging.Formatter(
            "%(asctime)s - [%(levelname)s] - %(name)s - %(funcName)s:%(lineno)d - %(message)s"
        )
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)

    # Suppress some verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Module name (typically __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


# Logging convenience functions
def log_debug(message: str, *args, **kwargs) -> None:
    """Log debug message"""
    logging.debug(message, *args, **kwargs)


def log_info(message: str, *args, **kwargs) -> None:
    """Log info message"""
    logging.info(message, *args, **kwargs)


def log_warning(message: str, *args, **kwargs) -> None:
    """Log warning message"""
    logging.warning(message, *args, **kwargs)


def log_error(message: str, *args, **kwargs) -> None:
    """Log error message"""
    logging.error(message, *args, **kwargs)


def log_critical(message: str, *args, **kwargs) -> None:
    """Log critical message"""
    logging.critical(message, *args, **kwargs)
