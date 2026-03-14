"""
MyRuta Predictor - Predictions Routes

API endpoints for delay predictions on transit routes.

Responsibilities:
- Handle single route delay predictions
- Handle batch delay predictions
- Interface with prediction service
- Validate input data
- Return prediction results with confidence scores
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, HTTPException, Request, status

from app.models.schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from app.services.prediction_service import PredictionService
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

# TODO: Initialize prediction service with loaded model
prediction_service = PredictionService()


@router.post("/predict", response_model=PredictionResponse)
async def predict_delay(request: PredictionRequest):
    """
    Predict delay for a single route.
    
    Args:
        request: PredictionRequest with route and location data
        
    Returns:
        PredictionResponse: Predicted delay and confidence
        
    Raises:
        HTTPException: If prediction fails
    """
    try:
        logger.info(f"Predicting delay for route: {request.route_id}")

        # Get prediction from service
        prediction = await prediction_service.predict_delay(request)

        if prediction is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate prediction",
            )

        logger.info(
            f"Prediction for route {request.route_id}: "
            f"{prediction.predicted_delay_minutes} minutes delay "
            f"(confidence: {prediction.confidence})"
        )

        return prediction

    except ValueError as e:
        logger.warning(f"Validation error in prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during prediction",
        )


@router.post("/batch", response_model=BatchPredictionResponse)
async def batch_predict_delays(request: BatchPredictionRequest):
    """
    Predict delays for multiple routes in batch.
    
    Args:
        request: BatchPredictionRequest with list of prediction requests
        
    Returns:
        BatchPredictionResponse: List of predictions for all routes
        
    Raises:
        HTTPException: If batch processing fails
    """
    try:
        logger.info(f"Processing batch prediction for {len(request.predictions)} routes")

        predictions: List[PredictionResponse] = []

        for pred_request in request.predictions:
            try:
                prediction = await prediction_service.predict_delay(pred_request)
                if prediction:
                    predictions.append(prediction)
                else:
                    logger.warning(
                        f"Failed to predict for route {pred_request.route_id}"
                    )
            except Exception as e:
                logger.warning(
                    f"Error predicting route {pred_request.route_id}: {str(e)}"
                )
                # Continue with next prediction on error

        logger.info(f"Batch prediction completed: {len(predictions)} predictions")

        return BatchPredictionResponse(
            predictions=predictions,
            total_count=len(predictions),
            processed_at=datetime.utcnow(),
        )

    except Exception as e:
        logger.error(f"Error in batch predictions: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during batch prediction",
        )


@router.get("/explanation/{route_id}")
async def get_prediction_explanation(route_id: str):
    """
    Get explanation for the last prediction of a route.
    
    Uses SHAP or LIME to explain model decisions.
    
    Args:
        route_id: Route identifier
        
    Returns:
        dict: Explanation features and their importances
    """
    try:
        logger.info(f"Getting explanation for route: {route_id}")

        # TODO: Implement prediction explanation using SHAP/LIME
        explanation = await prediction_service.get_prediction_explanation(route_id)

        return {
            "route_id": route_id,
            "explanation": explanation,
            "timestamp": datetime.utcnow(),
        }

    except Exception as e:
        logger.error(f"Error getting explanation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate explanation",
        )


@router.post("/validate-historical")
async def validate_with_historical_data(route_id: str, hours: int = 24):
    """
    Validate predictions against historical data.
    
    Compares predicted values with actual values from past trips.
    Useful for model monitoring and quality checks.
    
    Args:
        route_id: Route identifier
        hours: Number of hours of historical data to analyze
        
    Returns:
        dict: Validation metrics and accuracy measures
    """
    try:
        logger.info(f"Validating predictions for route {route_id} (last {hours}h)")

        # TODO: Implement historical validation
        validation_result = await prediction_service.validate_with_history(
            route_id, hours
        )

        return {
            "route_id": route_id,
            "period_hours": hours,
            "validation": validation_result,
            "timestamp": datetime.utcnow(),
        }

    except Exception as e:
        logger.error(f"Error validating predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate predictions",
        )
