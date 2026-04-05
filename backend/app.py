from fastapi import FastAPI, HTTPException
from enum import Enum
import sys
import io

# Corriger l'encodage sur Windows pour les emojis (✅)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator, model_validator
import numpy as np
import joblib
import os
from typing import List, Dict, Any, Optional
import mlflow
from mlflow.tracking import MlflowClient

import subprocess
import threading
import json
from datetime import datetime

# Configure MLflow
mlflow.set_tracking_uri("file:../mlruns")

HISTORY_FILE = '../history.json'

def save_to_history(data):
    try:
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
                history = json.load(f)
        
        # Add timestamp and ID
        data['id'] = len(history) + 1
        data['date'] = datetime.now().strftime("%Y-%m-%d %H:%M")
        history.append(data)
        
        # Keep only last 50
        with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history[-50:], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving history: {e}")

MODELS_DIR = '../models'

# Chargement globale au démarrage
try:
    model = joblib.load(os.path.join(MODELS_DIR, 'model_v1.pkl'))
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler_v1.pkl'))
    le_type = joblib.load(os.path.join(MODELS_DIR, 'label_encoder_v1.pkl'))
    le_carb = joblib.load(os.path.join(MODELS_DIR, 'fuel_encoder_v1.pkl'))
except FileNotFoundError as e:
    print(f"WARNING: Models non trouvés. Exécutez l'entraînement d'abord. Erreur: {e}")
    model = scaler = le_type = le_carb = None

app = FastAPI(title="Vehicle Classification API (Lite)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constantes de validation ──────────────────────────────────────
VALID_PORTES = [0, 1, 2, 3, 4, 5]
VALID_CARBURANTS_LIST = ['essence', 'diesel', 'electrique']

VALIDATION_RULES = {
    "poids": {"min": 100, "max": 35000, "unit": "kg", "description": "Poids du véhicule"},
    "puissance": {"min": 10, "max": 1000, "unit": "ch", "description": "Puissance moteur"},
    "portes": {"allowed": VALID_PORTES, "description": "Nombre de portes"},
    "carburant": {"allowed": VALID_CARBURANTS_LIST, "description": "Type de carburant"}
}

def validate_coherence(poids: float, puissance: float, portes: int, carburant: str) -> List[str]:
    """Règles de cohérence croisée — retourne des avertissements (ne bloque pas)."""
    warnings = []
    
    # Moto logique : si 0 portes, le poids doit rester raisonnable
    if portes == 0 and poids > 800:
        warnings.append(
            f"⚠️ Un véhicule sans porte (moto) pèse rarement plus de 800 kg. "
            f"Vous avez saisi {poids} kg. La prédiction pourrait être moins fiable."
        )
    
    # Voiture logique : si 3-5 portes, le poids doit être >= 400 kg
    if portes >= 3 and poids < 400:
        warnings.append(
            f"⚠️ Un véhicule à {portes} portes pèse généralement plus de 400 kg. "
            f"Vous avez saisi {poids} kg. Vérifiez votre saisie."
        )
    
    # Camion logique : si très lourd, pas plus de 3 portes
    if poids > 3500 and portes > 3:
        warnings.append(
            f"⚠️ Un véhicule de {poids} kg (camion) a rarement plus de 3 portes. "
            f"Vous avez saisi {portes} portes."
        )
    
    # Ratio puissance/poids suspect
    if poids > 0:
        ratio = puissance / poids
        if ratio > 2.0:
            warnings.append(
                f"⚠️ Le ratio puissance/poids ({ratio:.2f} ch/kg) est extrêmement élevé. "
                f"Un ratio normal est entre 0.03 et 0.5. Vérifiez vos valeurs."
            )
    
    # Puissance trop faible pour un poids élevé
    if poids > 5000 and puissance < 100:
        warnings.append(
            f"⚠️ Un véhicule de {poids} kg avec seulement {puissance} ch est peu réaliste. "
            f"Les camions ont typiquement > 150 ch."
        )
    
    # Électrique + diesel incohérent (future-proof)
    if portes == 0 and carburant == 'diesel':
        warnings.append(
            "⚠️ Les motos (0 portes) ne sont généralement pas diesel. "
            "Vérifiez le type de carburant."
        )
    
    return warnings

class VehicleFeatures(BaseModel):
    poids: float
    puissance: float
    carburant: str
    portes: int

    @field_validator('poids')
    @classmethod
    def validate_poids(cls, v):
        if v < 100 or v > 35000:
            raise ValueError(f"Le poids doit être entre 100 et 35 000 kg. Reçu : {v} kg.")
        return v

    @field_validator('puissance')
    @classmethod
    def validate_puissance(cls, v):
        if v < 10 or v > 1000:
            raise ValueError(f"La puissance doit être entre 10 et 1 000 ch. Reçu : {v} ch.")
        return v

    @field_validator('portes')
    @classmethod
    def validate_portes(cls, v):
        if v not in VALID_PORTES:
            raise ValueError(
                f"Le nombre de portes doit être parmi {VALID_PORTES}. Reçu : {v}. "
                f"0-1 = moto, 2-3 = berline/camion, 4-5 = familiale."
            )
        return v

    @field_validator('carburant')
    @classmethod
    def validate_carburant(cls, v):
        v_clean = v.strip().lower()
        if v_clean not in VALID_CARBURANTS_LIST:
            raise ValueError(
                f"Carburant invalide : '{v}'. Valeurs acceptées : {VALID_CARBURANTS_LIST}."
            )
        return v_clean

class TrainRequest(BaseModel):
    selected_models: List[str]
    params: Dict[str, Any]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API de classification simplifiée active."}

@app.get("/validate")
def get_validation_rules():
    """Retourne les règles de validation pour synchroniser le frontend."""
    return {
        "rules": VALIDATION_RULES,
        "coherence_info": [
            "Moto (0 portes) : poids < 800 kg attendu",
            "Voiture (3-5 portes) : poids >= 400 kg attendu",
            "Camion (poids > 3500 kg) : max 3 portes attendu",
            "Ratio puissance/poids : doit être < 2.0",
            "Camion (poids > 5000 kg) : puissance > 100 ch attendue",
            "Moto (0 portes) : carburant diesel peu probable"
        ]
    }

@app.post("/predict")
def predict_vehicle(features: VehicleFeatures):
    if not all([model, scaler, le_type, le_carb]):
        raise HTTPException(status_code=500, detail="Modèles non initialisés sur le serveur.")
        
    try:
        # Vérification de cohérence (avertissements, ne bloque pas)
        coherence_warnings = validate_coherence(
            features.poids, features.puissance, features.portes, features.carburant
        )
        
        # 1. Encodage categoriel de 'carburant'
        fuel_encoded = le_carb.transform([features.carburant])[0]
        
        # 2. Preparation du vecteur d'entree (Doit matcher ['poids', 'puissance', 'portes', 'carburant'])
        input_list = [features.poids, features.puissance, features.portes, fuel_encoded]
        input_array = np.array(input_list).reshape(1, -1)
        
        # 3. Standardisation
        input_scaled = scaler.transform(input_array)
        
        # 4. Inférence
        prediction_num = model.predict(input_scaled)[0]
        prediction_label = le_type.inverse_transform([prediction_num])[0]
        
        # Estimation de la fiabilité basée sur les warnings
        confidence = "haute" if len(coherence_warnings) == 0 else (
            "moyenne" if len(coherence_warnings) <= 1 else "faible"
        )
        
        result = {
            "prediction_class": prediction_label, 
            "prediction_id": int(prediction_num),
            "input_features": {
                "poids": features.poids,
                "puissance": features.puissance,
                "carburant": features.carburant,
                "portes": features.portes
            },
            "warnings": coherence_warnings,
            "confidence": confidence
        }
        
        # Sauvegarde en historique
        save_to_history({
            "poids": features.poids, 
            "puissance": features.puissance, 
            "carburant": features.carburant, 
            "portes": features.portes, 
            "prediction": prediction_label,
            "confidence": confidence,
            "warnings_count": len(coherence_warnings)
        })
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Valeur non supportée : {str(e)}")

@app.get("/history")
def get_history():
    """Récupérer l'historique des prédictions."""
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

@app.get("/experiments")
def get_experiments():
    client = MlflowClient()
    experiments = client.search_experiments()
    return [{"experiment_id": exp.experiment_id, "name": exp.name, "lifecycle_stage": exp.lifecycle_stage} for exp in experiments]

@app.post("/train")
def train_models(request: TrainRequest):
    """Lancer le cycle complet : Génération du dataset + Entraînement avec paramètres spécifiques."""
    def run_training():
        try:
            # Sauvegarder les paramètres dans un fichier JSON pour train.py
            params_file = '../backend/params.json'
            with open(params_file, 'w', encoding='utf-8') as f:
                json.dump(request.dict(), f, indent=4)
                
            # 1. Générer le dataset
            subprocess.run([sys.executable, "../generate_dataset.py"], check=True)
            # 2. Entraîner les modèles
            subprocess.run([sys.executable, "train.py"], check=True)
            print("Entraînement terminé avec succès.")
        except Exception as e:
            print(f"Erreur d'entraînement: {e}")

    # Lancer l'entraînement en arrière-plan pour ne pas bloquer l'API
    thread = threading.Thread(target=run_training)
    thread.start()
    return {"status": "started", "message": "Génération et entraînement lancés en arrière-plan."}

@app.get("/metrics")
def get_last_metrics():
    """Retourne les métriques du dernier entraînement depuis metrics.json."""
    metrics_path = 'metrics.json'
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"error": "Aucun entraînement trouvé. Lancez un entraînement depuis le Dashboard."}

@app.get("/runs")
def get_runs():
    client = MlflowClient()
    experiments = client.search_experiments()
    if not experiments:
        return []
    
    experiment_ids = [exp.experiment_id for exp in experiments]
    runs = client.search_runs(experiment_ids)
    
    result = []
    for run in runs:
        result.append({
            "run_id": run.info.run_id,
            "experiment_id": run.info.experiment_id,
            "status": run.info.status,
            "metrics": run.data.metrics,
            "params": run.data.params,
            "tags": run.data.tags,
            "run_name": run.data.tags.get("mlflow.runName", "Unknown")
        })
    return result

@app.get("/load-dataset")
def load_dataset():
    """Vérifier l'existence du dataset, le nettoyer et retourner des métadonnées."""
    csv_path = "../vehicle_data.csv"
    
    # 1. Vérifier si le dataset existe, sinon le générer
    if not os.path.exists(csv_path):
        try:
            subprocess.run([sys.executable, "../generate_dataset.py"], check=True)
            if not os.path.exists(csv_path):
                raise HTTPException(status_code=500, detail="Échec de la génération du dataset.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la génération : {str(e)}")
    
    # 2. Charger via data_loader pour appliquer le nettoyage
    try:
        from data_loader import load_data
        # On charge les dataframes pour obtenir les stats de nettoyage
        import pandas as pd
        raw_df = pd.read_csv(csv_path)
        initial_count = len(raw_df)
        
        X, y = load_data(csv_path, clean=True)
        # On reconstruit un DF temporaire pour l'aperçu propre
        df_clean = pd.concat([X, y], axis=1)
        final_count = len(df_clean)
        
        # Aperçu pour le frontend (10 lignes)
        preview_data = df_clean.head(10).to_dict(orient='records')
        
        info = {
            "total_rows_raw": initial_count,
            "total_rows_clean": final_count,
            "removed_anomalies": initial_count - final_count,
            "columns": list(df_clean.columns),
            "preview": preview_data,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return {
            "status": "success", 
            "message": f"Dataset nettoyé avec succès ✅ ({initial_count - final_count} anomalies supprimées)", 
            "data": info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement du dataset : {str(e)}")
