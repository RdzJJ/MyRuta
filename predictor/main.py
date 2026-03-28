#!/usr/bin/env python3
"""
MyRuta Predictor - Main Application Entry Point

This module initializes and runs the FastAPI application for delay prediction.
It sets up the server, configures middleware, and registers routes.

Responsibilities:
- Initialize FastAPI application
- Configure CORS and middleware
- Load environment configuration
- Register API routes
- Handle startup/shutdown events
- Expose Uvicorn server for running on specified port
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import health, predictions, analytics
from app.config.settings import Settings
from app.utils.logger import setup_logging, get_logger

# Initialize settings from environment
settings = Settings()

# Setup logging
setup_logging(settings.LOG_LEVEL, settings.LOG_FILE)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle events.
    
    Startup: Log server start, initialize connections
    Shutdown: Clean up resources, close connections
    """
    # Startup
    logger.info(">>> MyRuta Predictor Service Starting...")
    logger.info(f"Environment: {settings.ENV}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    
    try:
        # TODO: Initialize database connection pool
        # TODO: Load ML model from disk
        # TODO: Warm up model with test predictions
        logger.info("[OK] Application initialized successfully")
    except Exception as e:
        logger.error(f"[FAIL] Failed to initialize application: {str(e)}")
        sys.exit(1)
    
    yield
    
    # Shutdown
    logger.info(">>> MyRuta Predictor Service Shutting Down...")
    try:
        # TODO: Close database connections
        # TODO: Clean up resources
        # TODO: Save model cache if needed
        logger.info("[OK] Application shutdown completed")
    except Exception as e:
        logger.error(f"[FAIL] Error during shutdown: {str(e)}")


# Create FastAPI application with custom lifespan handler
app = FastAPI(
    title="MyRuta Predictor API",
    description="Machine Learning service for delay prediction in public transport routes",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Add custom exception handlers
# @app.exception_handler(Exception)
# async def global_exception_handler(request, exc):
#     return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# Include API route modules
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """
    Root endpoint - welcome message
    """
    return {
        "message": "MyRuta Predictor API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }


if __name__ == "__main__":
    # Run with: python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
    import uvicorn
    
    # For direct execution without reload in development
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.PORT,
        reload=False,  # Set to False when running directly
        log_level=settings.LOG_LEVEL.lower(),
    )
