import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "ok"

def test_predict_vehicle_valid():
    # Exemple de données valides (18 features floats)
    payload = {f"feature_{i}": 50.0 for i in range(1, 19)}
    response = client.post("/predict", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction_class" in data
    assert "prediction_id" in data
    assert "input_features" in data
    assert len(data["input_features"]) == 18

def test_predict_vehicle_invalid():
    # Données incomplètes (manque feature_18)
    payload = {f"feature_{i}": 50.0 for i in range(1, 18)}
    response = client.post("/predict", json=payload)
    
    # Validation error from Pydantic expected
    assert response.status_code == 422
