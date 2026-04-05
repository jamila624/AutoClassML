# Vehicle Classification ML Project

Projet complet de machine learning (Backend, Frontend) pour classer des véhicules (opel, saab, bus, van) à partir de 18 caractéristiques géométriques.

## Structure Fonctionnelle

1. **FastAPI (Backend)** : 
   - Expose l'API de prédiction sur `http://localhost:8000/predict`.
   - Charge le meilleur modèle entraîné, l'encodeur de label, et le scaler.
2. **MLflow** : 
   - Enregistre les métriques d'entraînement (Accuracy, Precision, Recall, F1-Score) et les hyperparamètres de 4 modèles : KNN, SVM, Random Forest, Logistic Regression.
3. **React (Frontend)** : 
   - Interface utilisateur moderne connectée au backend.
   - Formulaire dynamique de 18 champs avec rendu du résultat immédiat.
4. **Visualisation (PCA)** :
   - Contient un script pour sauvegarder une projection 2D des features via l'Analyse en Composantes Principales (PCA/t-SNE).
5. **Tests API Automatises** :
   - Intégration de `pytest` pour valider l'inférence.

## 🚀 Installation & Lancement

Vous pouvez lancer l'intégralité du projet automatiquement grâce aux scripts fournis :

**Sous Windows** :
Double-cliquez sur `start.bat` ou exécutez dans un terminal :
```bat
start.bat
```

**Sous macOS/Linux** :
```bash
chmod +x start.sh
./start.sh
```
Ces scripts se chargent de créer l'environnement virtuel, installer les dépendances (Python et Node.js), et lancer FastAPI (Backend), MLflow, et React (Frontend) en parallèle.

### 1. Prérequis & Setup Backend (Python)

Il est fortement recommandé d'utiliser un environnement virtuel Python pour éviter les conflits de dépendances :

```bash
cd backend

# Créer l'environnement virtuel (avec Python 3)
python -m venv venv

# Activer l'environnement virtuel sous Windows :
venv\Scripts\activate
# (Si MacOS/Linux : source venv/bin/activate)

# Installation des paquets
pip install -r requirements.txt
```

### 2. Entraîner les Modèles & MLflow

Avant de lancer l'API complète, vous devez générer les modèles (Standard Scaler, Label Encoder) et enregistrer les runs MLflow.

```bash
cd backend
python train.py
```
Cela génère le dossier `models/` avec les objets `joblib` et `mlruns/` avec les logs d'expériences.

### 3. Tests et Visualisation (Optionnel)

Pour évaluer et voir les résultats dans la console :
```bash
python evaluate.py
```

Pour visualiser la réduction de dimension PCA (génère `pca_visualization.png`) :
```bash
python visualize.py
```

Pour lancer les tests unitaires de l'API (assurez-vous d'avoir entraîné les modèles d'abord):
```bash
pytest test_app.py
```

Pour explorer l'interface web MLflow :
```bash
mlflow ui --backend-store-uri file:../mlruns
```
*Ouvrez `http://127.0.0.1:5000`*

### 4. Lancer l'API FastAPI

Ouvrez un nouveau terminal (n'oubliez pas d'activer l'environnement virtuel `venv\Scripts\activate`):
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
*Swagger UI disponible sur : `http://localhost:8000/docs`*

### 5. Lancer le Frontend React

Ouvrez un autre terminal :
```bash
cd frontend
npm install
npm run dev
```
*Application web disponible sur `http://localhost:5173`.*

## Modèles Utilisés
- K-Nearest Neighbors (KNN)
- Support Vector Machine (SVM)
- Random Forest
- Logistic Regression
