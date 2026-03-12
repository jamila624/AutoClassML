import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA

def preprocess_data(X, y, models_dir='../models', apply_pca=False, n_components=2):
    """
    Sépare les données, encode les labels textuels, standardise les features
    et (optionnellement) applique la PCA.
    Sauvegarde le scaler et l'encodeur pour la phase d'inférence (app.py).
    """
    os.makedirs(models_dir, exist_ok=True)
    
    # Encodage des labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    joblib.dump(le, os.path.join(models_dir, 'label_encoder.pkl'))
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Standardisation
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
    
    if apply_pca:
        pca = PCA(n_components=n_components)
        X_train_scaled = pca.fit_transform(X_train_scaled)
        X_test_scaled = pca.transform(X_test_scaled)
        joblib.dump(pca, os.path.join(models_dir, 'pca.pkl'))
        print(f"PCA appliquée ({n_components} composantes).")
        
    return X_train_scaled, X_test_scaled, y_train, y_test

def get_preprocessors(models_dir='../models', use_pca=False):
    """
    Charge les préprocesseurs pour l'inférence.
    """
    scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
    le = joblib.load(os.path.join(models_dir, 'label_encoder.pkl'))
    
    pca = None
    if use_pca:
        pca_path = os.path.join(models_dir, 'pca.pkl')
        if os.path.exists(pca_path):
            pca = joblib.load(pca_path)
            
    return scaler, le, pca
