import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Mapping carburant → numérique fixe (ordre alphabétique garanti)
# Utilisé pour cohérence entre entraînement et inférence
CARBURANT_ORDER = ['diesel', 'electrique', 'essence']

def preprocess_data(X, y, models_dir='../models'):
    """
    Pipeline complet de prétraitement :
    1. Encodage automatique des variables catégorielles (carburant)
    2. Encodage de la cible (type de véhicule)
    3. Split train / test stratifié
    4. Standardisation des features numériques (StandardScaler)
    5. Sauvegarde des encodeurs pour l'inférence
    
    Retourne : X_train, X_test, y_train, y_test (arrays numpy)
    """
    print("\n--- Encodage des variables catégorielles ---")

    # Répertoire de sauvegarde des artefacts
    os.makedirs(models_dir, exist_ok=True)

    # 1. Encodage de 'carburant' (feature catégorielle)
    le_carb = LabelEncoder()
    le_carb.fit(CARBURANT_ORDER)

    # Remplacer les valeurs inconnues par 'essence' (valeur par défaut)
    X = X.copy()
    carburant_values = X['carburant'].astype(str).str.strip().str.lower()
    mask_invalide = ~carburant_values.isin(CARBURANT_ORDER)
    if mask_invalide.sum() > 0:
        print(f"  [WARN] {mask_invalide.sum()} valeurs de carburant inconnues → remplacées par 'essence'")
    carburant_values = carburant_values.where(~mask_invalide, 'essence')
    X['carburant'] = le_carb.transform(carburant_values)
    
    print(f"  [OK] 'carburant' encodé : {dict(zip(list(le_carb.classes_), list(le_carb.transform(le_carb.classes_))))}")
    joblib.dump(le_carb, os.path.join(models_dir, 'fuel_encoder_v1.pkl'))

    # 2. Encodage de la cible 'type' (variable de sortie)
    le_type = LabelEncoder()
    y_encoded = le_type.fit_transform(y)
    print(f"  [OK] 'type' encodé : {dict(zip(list(le_type.classes_), list(le_type.transform(le_type.classes_))))}")
    joblib.dump(le_type, os.path.join(models_dir, 'label_encoder_v1.pkl'))

    # 3. Vérification et conversion des types numériques
    numeric_cols = ['poids', 'puissance', 'portes', 'carburant']
    X = X[numeric_cols].apply(pd.to_numeric, errors='coerce').fillna(0)

    # 4. Split train / test stratifié (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded
    )
    print(f"\n--- Split train/test ---")
    print(f"  Train : {len(X_train)} échantillons")
    print(f"  Test  : {len(X_test)} échantillons")

    # Standardisation (fit sur train, transform sur test)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    joblib.dump(scaler, os.path.join(models_dir, 'scaler_v1.pkl'))
    joblib.dump(le_type, os.path.join(models_dir, 'label_encoder_v1.pkl'))
    joblib.dump(le_carb, os.path.join(models_dir, 'fuel_encoder_v1.pkl'))
    print(f"[PREPROCESSING] Modèles de transformation (_v1) sauvegardés dans {models_dir}")

    return X_train_scaled, X_test_scaled, y_train, y_test


def get_preprocessors(models_dir='../models'):
    """Charge les préprocesseurs sauvegardés pour l'inférence."""
    scaler    = joblib.load(os.path.join(models_dir, 'scaler_v1.pkl'))
    le_type   = joblib.load(os.path.join(models_dir, 'label_encoder_v1.pkl'))
    le_carb   = joblib.load(os.path.join(models_dir, 'fuel_encoder_v1.pkl'))
    return scaler, le_type, le_carb
