"""
MyRuta Predictor - Pydantic Models/Schemas

This module defines request and response schemas for API endpoints.
Uses Pydantic for data validation and serialization.

Responsibilities:
- Define request/response schemas
- Validate input data
- Serialize response data
- Document API contracts
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, validator


class LocationModel(BaseModel):
    """GPS location coordinates"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 40.7128,
                "longitude": -74.0060,
            }
        }


class RouteHistoryItem(BaseModel):
    """Historical route data for training/prediction context"""
    route_id: str
    date: datetime
    scheduled_time: int  # minutes
    actual_time: int  # minutes
    distance: float  # kilometers
    stops_count: int
    conductor_id: str
    weather_condition: Optional[str] = None
    traffic_level: Optional[str] = None  # low, medium, high
    incidents: int = 0

    class Config:
        json_schema_extra = {
            "example": {
                "route_id": "R001",
                "date": "2024-01-15T14:30:00",
                "scheduled_time": 45,
                "actual_time": 52,
                "distance": 12.5,
                "stops_count": 8,
                "conductor_id": "C001",
                "weather_condition": "sunny",
                "traffic_level": "medium",
                "incidents": 0,
            }
        }


class PredictionRequest(BaseModel):
    """Request schema for delay prediction"""
    route_id: str = Field(..., description="Route identifier")
    scheduled_departure: datetime = Field(..., description="Scheduled departure time")
    current_location: LocationModel
    destination: LocationModel
    stops_remaining: int = Field(..., ge=0, description="Number of stops remaining")
    weather_condition: Optional[str] = None
    traffic_level: Optional[str] = None
    conductor_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    history: Optional[List[RouteHistoryItem]] = Field(
        None, description="Historical route data for context"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "route_id": "R001",
                "scheduled_departure": "2024-01-15T14:30:00",
                "current_location": {
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "destination": {
                    "latitude": 40.7489,
                    "longitude": -73.9680
                },
                "stops_remaining": 5,
                "weather_condition": "sunny",
                "traffic_level": "medium",
                "conductor_id": "C001",
                "vehicle_id": "V001",
            }
        }


class PredictionResponse(BaseModel):
    """Response schema for delay prediction"""
    route_id: str
    predicted_delay_minutes: int = Field(
        ..., description="Predicted delay in minutes (negative = early)"
    )
    predicted_arrival: datetime = Field(..., description="Predicted arrival time")
    confidence: float = Field(
        ..., ge=0, le=1, description="Model confidence (0-1)"
    )
    is_delayed: bool = Field(
        ..., description="True if predicted delay > 5 minutes"
    )
    model_version: str = Field(..., description="Version of the prediction model")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "route_id": "R001",
                "predicted_delay_minutes": 12,
                "predicted_arrival": "2024-01-15T14:45:30",
                "confidence": 0.87,
                "is_delayed": True,
                "model_version": "1.0.0",
                "generated_at": "2024-01-15T14:30:00",
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request schema for batch predictions"""
    predictions: List[PredictionRequest] = Field(
        ..., min_items=1, max_items=100, description="List of prediction requests"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "route_id": "R001",
                        "scheduled_departure": "2024-01-15T14:30:00",
                        "current_location": {"latitude": 40.7128, "longitude": -74.0060},
                        "destination": {"latitude": 40.7489, "longitude": -73.9680},
                        "stops_remaining": 5,
                    }
                ]
            }
        }


class BatchPredictionResponse(BaseModel):
    """Response schema for batch predictions"""
    predictions: List[PredictionResponse]
    total_count: int
    processed_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "route_id": "R001",
                        "predicted_delay_minutes": 12,
                        "predicted_arrival": "2024-01-15T14:45:30",
                        "confidence": 0.87,
                        "is_delayed": True,
                        "model_version": "1.0.0",
                    }
                ],
                "total_count": 1,
                "processed_at": "2024-01-15T14:30:00",
            }
        }


class HealthCheckResponse(BaseModel):
    """Response schema for health check endpoint"""
    status: str = Field(..., description="Service status (healthy/unhealthy)")
    database: bool = Field(..., description="Database connection status")
    model_loaded: bool = Field(..., description="ML model loaded status")
    uptime_seconds: float = Field(..., description="Service uptime in seconds")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "database": True,
                "model_loaded": True,
                "uptime_seconds": 3600.5,
                "version": "1.0.0",
                "timestamp": "2024-01-15T14:30:00",
            }
        }


class ModelMetricsResponse(BaseModel):
    """Response schema for model metrics/analytics"""
    model_version: str
    training_date: datetime
    accuracy: float = Field(..., ge=0, le=1)
    precision: float = Field(..., ge=0, le=1)
    recall: float = Field(..., ge=0, le=1)
    f1_score: float = Field(..., ge=0, le=1)
    total_predictions: int
    average_prediction_time_ms: float

    class Config:
        json_schema_extra = {
            "example": {
                "model_version": "1.0.0",
                "training_date": "2024-01-01T00:00:00",
                "accuracy": 0.92,
                "precision": 0.89,
                "recall": 0.90,
                "f1_score": 0.895,
                "total_predictions": 10000,
                "average_prediction_time_ms": 45.3,
            }
        }


class ErrorResponse(BaseModel):
    """Response schema for error responses"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = None
    code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Invalid input",
                "detail": "Latitude must be between -90 and 90",
                "code": "VALIDATION_ERROR",
                "timestamp": "2024-01-15T14:30:00",
            }
        }
