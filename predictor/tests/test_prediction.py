"""
MyRuta Predictor - Test Suite

Unit and integration tests for the prediction service.

Test Coverage:
- Prediction service accuracy
- Feature engineering
- API endpoint behavior
- Health checks
- Error handling
"""

import pytest
import sys
import os
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# TestClient setup
client = TestClient(app)


class TestHealthEndpoints:
    """Test health check endpoints"""

    def test_health_check(self):
        """Test basic health check endpoint"""
        response = client.get("/api/health/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        assert "database" in data
        assert "model_loaded" in data
        assert "uptime_seconds" in data
        assert "version" in data
        assert "timestamp" in data

    def test_readiness_check(self):
        """Test readiness probe"""
        response = client.get("/api/health/ready")
        assert response.status_code in [200, 503]
        data = response.json()
        assert "ready" in data
        assert isinstance(data["ready"], bool)

    def test_liveness_check(self):
        """Test liveness probe"""
        response = client.get("/api/health/live")
        assert response.status_code == 200
        data = response.json()
        assert "alive" in data
        assert data["alive"] is True
        assert "timestamp" in data


class TestPredictionEndpoints:
    """Test prediction API endpoints"""

    def test_single_prediction(self):
        """Test single route prediction"""
        request_data = {
            "route_id": "R001",
            "scheduled_departure": datetime.utcnow().isoformat(),
            "current_location": {"latitude": 40.7128, "longitude": -74.0060},
            "destination": {"latitude": 40.7489, "longitude": -73.9680},
            "stops_remaining": 5,
            "weather_condition": "sunny",
            "traffic_level": "medium",
        }
        response = client.post("/api/predictions/predict", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "predicted_delay_minutes" in data
        assert "route_id" in data
        assert "confidence" in data
        assert 0 <= data["confidence"] <= 1
        assert "predicted_arrival" in data
        assert "is_delayed" in data
        assert isinstance(data["is_delayed"], bool)

    def test_batch_predictions(self):
        """Test batch predictions"""
        request_data = {
            "predictions": [
                {
                    "route_id": "R001",
                    "scheduled_departure": datetime.utcnow().isoformat(),
                    "current_location": {"latitude": 40.7128, "longitude": -74.0060},
                    "destination": {"latitude": 40.7489, "longitude": -73.9680},
                    "stops_remaining": 5,
                },
                {
                    "route_id": "R002",
                    "scheduled_departure": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                    "current_location": {"latitude": 40.7100, "longitude": -74.0070},
                    "destination": {"latitude": 40.7500, "longitude": -73.9700},
                    "stops_remaining": 3,
                },
            ]
        }
        response = client.post("/api/predictions/batch", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert len(data["predictions"]) == 2
        assert "processing_time_ms" in data

    def test_invalid_prediction_request(self):
        """Test prediction with invalid data"""
        response = client.post("/api/predictions/predict", json={})
        assert response.status_code == 422  # Validation error


class TestAnalyticsEndpoints:
    """Test analytics API endpoints"""

    def test_get_model_metrics(self):
        """Test model metrics endpoint"""
        response = client.get("/api/analytics/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "accuracy" in data
        assert "precision" in data
        assert "recall" in data
        assert "f1_score" in data
        assert "model_version" in data
        assert 0 <= data["accuracy"] <= 1
        assert 0 <= data["precision"] <= 1

    def test_get_prediction_statistics(self):
        """Test prediction statistics endpoint"""
        response = client.get("/api/analytics/prediction-stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_predictions" in data
        assert "average_prediction_time_ms" in data
        assert "high_confidence_rate" in data
        assert isinstance(data["total_predictions"], int)

    def test_get_route_performance(self):
        """Test route performance endpoint"""
        response = client.get("/api/analytics/route-performance?route_id=R001")
        assert response.status_code == 200
        data = response.json()
        assert data["route_id"] == "R001"
        assert "mean_absolute_error_minutes" in data
        assert "accuracy_within_5min" in data


class TestPredictionService:
    """Test prediction service logic"""

    def test_feature_extraction(self):
        """Test feature engineering"""
        from app.services.prediction_service import PredictionService
        from app.models.schemas import PredictionRequest, LocationModel
        
        service = PredictionService()
        request = PredictionRequest(
            route_id="R001",
            scheduled_departure=datetime.utcnow(),
            current_location=LocationModel(latitude=40.7128, longitude=-74.0060),
            destination=LocationModel(latitude=40.7489, longitude=-73.9680),
            stops_remaining=5,
        )
        
        features = service._extract_features(request)
        assert features is not None
        assert isinstance(features, (list, tuple))
        assert len(features) > 0

    def test_feature_validation(self):
        """Test feature validation"""
        from app.services.prediction_service import PredictionService
        
        service = PredictionService()
        
        # Valid features should pass
        valid_features = [40.7128, -74.0060, 5, 10, 0, 0]
        assert service._validate_features(valid_features) is True
        
        # Invalid features should fail
        invalid_features = [100.0, -74.0060, 5, 10, 0, 0]  # Invalid latitude
        assert service._validate_features(invalid_features) is False

    def test_weather_encoding(self):
        """Test weather condition encoding"""
        from app.services.prediction_service import PredictionService
        
        service = PredictionService()
        weather_conditions = ["sunny", "rainy", "cloudy", "snowy"]
        
        for condition in weather_conditions:
            encoded = service._encode_weather(condition)
            assert isinstance(encoded, (int, float))

    def test_traffic_encoding(self):
        """Test traffic level encoding"""
        from app.services.prediction_service import PredictionService
        
        service = PredictionService()
        traffic_levels = ["low", "medium", "high"]
        
        for level in traffic_levels:
            encoded = service._encode_traffic(level)
            assert isinstance(encoded, (int, float))

    @pytest.mark.asyncio
    async def test_prediction_accuracy(self):
        """Test prediction accuracy with sample data"""
        from app.services.prediction_service import PredictionService
        from app.models.schemas import PredictionRequest, LocationModel
        
        service = PredictionService()
        request = PredictionRequest(
            route_id="R001",
            scheduled_departure=datetime.utcnow(),
            current_location=LocationModel(latitude=40.7128, longitude=-74.0060),
            destination=LocationModel(latitude=40.7489, longitude=-73.9680),
            stops_remaining=5,
            weather_condition="sunny",
            traffic_level="medium",
        )
        
        result = await service.predict_delay(request)
        assert result is not None
        assert result.predicted_delay_minutes is not None
        assert 0 <= result.confidence <= 1


class TestErrorHandling:
    """Test error handling and edge cases"""

    def test_invalid_coordinates(self):
        """Test with invalid GPS coordinates"""
        request_data = {
            "route_id": "R001",
            "scheduled_departure": datetime.utcnow().isoformat(),
            "current_location": {"latitude": 100.0, "longitude": -74.0060},  # Invalid latitude
            "destination": {"latitude": 40.7489, "longitude": -73.9680},
            "stops_remaining": 5,
        }
        response = client.post("/api/predictions/predict", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_missing_fields(self):
        """Test with missing required fields"""
        request_data = {
            "route_id": "R001",
            "scheduled_departure": datetime.utcnow().isoformat(),
            # Missing current_location and destination
            "stops_remaining": 5,
        }
        response = client.post("/api/predictions/predict", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_negative_stops_remaining(self):
        """Test with negative stops remaining"""
        request_data = {
            "route_id": "R001",
            "scheduled_departure": datetime.utcnow().isoformat(),
            "current_location": {"latitude": 40.7128, "longitude": -74.0060},
            "destination": {"latitude": 40.7489, "longitude": -73.9680},
            "stops_remaining": -1,  # Invalid
        }
        response = client.post("/api/predictions/predict", json=request_data)
        assert response.status_code == 422  # Validation error


class TestIntegration:
    """Integration tests across components"""

    def test_full_prediction_pipeline(self):
        """Test complete prediction pipeline"""
        # Step 1: Check health first
        health_response = client.get("/api/health/")
        assert health_response.status_code == 200
        
        # Step 2: Make a prediction
        request_data = {
            "route_id": "R001",
            "scheduled_departure": datetime.utcnow().isoformat(),
            "current_location": {"latitude": 40.7128, "longitude": -74.0060},
            "destination": {"latitude": 40.7489, "longitude": -73.9680},
            "stops_remaining": 5,
            "weather_condition": "sunny",
            "traffic_level": "medium",
        }
        prediction_response = client.post("/api/predictions/predict", json=request_data)
        assert prediction_response.status_code == 200
        
        # Step 3: Check metrics
        metrics_response = client.get("/api/analytics/metrics")
        assert metrics_response.status_code == 200

    def test_batch_processing_performance(self):
        """Test batch processing performance"""
        import time
        
        request_data = {
            "predictions": [
                {
                    "route_id": f"R{i:03d}",
                    "scheduled_departure": (datetime.utcnow() + timedelta(hours=i)).isoformat(),
                    "current_location": {"latitude": 40.7128 + (i * 0.001), "longitude": -74.0060},
                    "destination": {"latitude": 40.7489, "longitude": -73.9680},
                    "stops_remaining": 5 - (i % 5),
                }
                for i in range(5)
            ]
        }
        
        start_time = time.time()
        response = client.post("/api/predictions/batch", json=request_data)
        elapsed_time = (time.time() - start_time) * 1000
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["predictions"]) == 5
        # Batch should complete reasonably fast
        assert elapsed_time < 10000  # Less than 10 seconds


# Test fixtures
@pytest.fixture
def sample_prediction_request():
    """Fixture for sample prediction request"""
    return {
        "route_id": "R001",
        "scheduled_departure": datetime.utcnow().isoformat(),
        "current_location": {"latitude": 40.7128, "longitude": -74.0060},
        "destination": {"latitude": 40.7489, "longitude": -73.9680},
        "stops_remaining": 5,
        "weather_condition": "sunny",
        "traffic_level": "medium",
    }


@pytest.fixture
def sample_batch_request():
    """Fixture for sample batch request"""
    return {
        "predictions": [
            {
                "route_id": "R001",
                "scheduled_departure": datetime.utcnow().isoformat(),
                "current_location": {"latitude": 40.7128, "longitude": -74.0060},
                "destination": {"latitude": 40.7489, "longitude": -73.9680},
                "stops_remaining": 5,
            },
            {
                "route_id": "R002",
                "scheduled_departure": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                "current_location": {"latitude": 40.7100, "longitude": -74.0070},
                "destination": {"latitude": 40.7500, "longitude": -73.9700},
                "stops_remaining": 3,
            },
        ]
    }


if __name__ == "__main__":
    # Run tests with: pytest tests/test_prediction.py -v
    pytest.main([__file__, "-v"])
