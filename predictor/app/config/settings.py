"""
MyRuta Predictor - Configuration Settings

This module manages all application configuration through environment variables.
Uses Pydantic for validation and type safety.

Responsibilities:
- Load environment variables from .env file
- Validate configuration values
- Provide type-safe access to settings
- Define configuration defaults
"""

import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        PORT: Server port (default: 8001)
        ENV: Environment type (development/production)
        DEBUG: Enable debug mode
        BACKEND_URL: Backend API base URL
        BACKEND_API_KEY: API key for backend authentication
        DATABASE_URL: PostgreSQL connection string
        REDIS_URL: Redis connection string
        JWT_SECRET: JWT secret for token verification
        MLB_MODEL_PATH: Path to trained ML model file
        LOG_LEVEL: Logging level
        LOG_FILE: Log file path
        ALLOWED_ORIGINS: CORS allowed origins
    """

    # Server Configuration
    PORT: int = 8001
    ENV: str = "development"
    DEBUG: bool = True

    # Backend Communication
    BACKEND_URL: str = "http://localhost:3000"
    BACKEND_API_KEY: str = "your_api_key_here"

    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/myruta_db"
    REDIS_URL: str = "redis://localhost:6379"

    # Authentication
    JWT_SECRET: str = "your_jwt_secret_here"
    JWT_ALGORITHM: str = "HS256"

    # Machine Learning
    ML_MODEL_PATH: str = "./models/delay_predictor_model.pkl"
    ML_SCALER_PATH: str = "./models/scaler.pkl"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = "logs/predictor.log"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Prediction Model Configuration
    MODEL_CONFIDENCE_THRESHOLD: float = 0.7
    MAX_PREDICTION_DELAY_MINUTES: int = 120

    # API Configuration
    API_TITLE: str = "MyRuta Predictor API"
    API_VERSION: str = "1.0.0"
    API_TIMEOUT: int = 30  # seconds

    # Retry Configuration
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 1  # seconds

    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENV == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENV == "development"

    @property
    def database_async_url(self) -> str:
        """Get async database URL for SQLAlchemy"""
        # Convert postgresql:// to postgresql+asyncpg://
        return self.DATABASE_URL.replace(
            "postgresql://", "postgresql+asyncpg://"
        )

    def get_cors_origins(self) -> list[str]:
        """Get list of CORS allowed origins"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    def __init__(self, **data):
        super().__init__(**data)
        # Ensure log directory exists
        if self.LOG_FILE:
            log_dir = os.path.dirname(self.LOG_FILE)
            if log_dir:
                os.makedirs(log_dir, exist_ok=True)
