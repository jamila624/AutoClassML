from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, create_model
import numpy as np
import joblib
import os
from typing import List

# Chargement du modèle et préprocesseurs au démarrage
MODELS_DIR = '../models'

# Charger le modèle, le scaler et l'encoder
try:
    model = joblib.load(os.path.join(MODELS_DIR, 'best_model.pkl'))
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
    label_encoder = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
except FileNotFoundError as e:
    print(f"WARNING: Initialisation ratée. Vous devez entraîner les modèles d'abord. Erreur: {e}")
    model = None
    scaler = None
    label_encoder = None

app = FastAPI(title="Vehicle Classification API")

# Configuration CORS pour le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permettre toutes les origines (modifier en prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer un schéma basique dynamique pour 18 features (Feature_1 a Feature_18)
fields = {f"feature_{i}": (float, ...) for i in range(1, 19)}
VehicleFeatures = create_model("VehicleFeatures", **fields)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "L'API de classification de véhicules est active."}

@app.post("/predict")
def predict_vehicle(features: VehicleFeatures):
    if model is None or scaler is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="Models non configurés. Exécutez le script d'entrainement d'abord.")
        
    # Extraire les features dans l'ordre de 1 a 18
    feature_keys = [f"feature_{i}" for i in range(1, 19)]
    input_list = [getattr(features, key) for key in feature_keys]
    
    # Convertir en tableau 2D (1 échantillon, 18 features)
    input_array = np.array(input_list).reshape(1, -1)
    
    # Prétraitement (Standardisation)
    input_scaled = scaler.transform(input_array)
    
    # Inférer
    prediction_num = model.predict(input_scaled)[0]
    
    # Décoder le label numérique en chaîne textuel (ex: "van")
    prediction_label = label_encoder.inverse_transform([prediction_num])[0]
    
    return {
        "prediction_class": prediction_label, 
        "prediction_id": int(prediction_num),
        "input_features": input_list
    }
