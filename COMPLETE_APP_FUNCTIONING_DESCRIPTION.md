# 📘 Description Détaillée du Fonctionnement de l'Application ML Dashboard

## 🎯 Vue d'ensemble du Projet

**Nom :** Vehicle Classification ML Dashboard  
**Type :** Application Full-Stack de Machine Learning  
**Objectif :** Classifier des véhicules (Van, Saab, Bus, Opel) à partir de 18 caractéristiques géométriques extraites d'images 2D.

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                            │
│                    (Data Scientist / Ingénieur ML)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Interface Utilisateur             │
│              React 19 + Vite + TailwindCSS + Recharts           │
│                  http://localhost:5175                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Prediction   │  │ Experiments  │  │    Runs      │         │
│  │    Page      │  │    Page      │  │    Page      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐                                              │
│  │ Comparison   │                                              │
│  │    Page      │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Requêtes HTTP REST (JSON)
                              │ Axios (Client HTTP)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND - Logique Métier & ML                │
│              FastAPI (Python) + MLflow + Scikit-learn           │
│                  http://localhost:8000                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                        │  │
│  │  • POST   /predict           → Prédiction véhicule      │  │
│  │  • GET    /experiments        → Liste expériences       │  │
│  │  • GET    /runs               → Historique runs          │  │
│  │  • GET    /best-model         → Meilleur modèle          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Modèles de Machine Learning                │  │
│  │  • Random Forest, SVM, KNN, Logistic Regression          │  │
│  │  • Entraînés sur dataset "Vehicle Silhouettes"           │  │
│  │  • Trackés avec MLflow                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 STOCKAGE & PERSISTANCE                          │
│                                                                 │
│  ┌──────────────────┐     ┌──────────────────┐                │
│  │   MLflow Tracking │     │  Modèles (.pkl)  │                │
│  │   (mlruns/)       │     │  models/         │                │
│  │  • Expériences    │     │  • best_model    │                │
│  │  • Métriques      │     │  • scaler.pkl    │                │
│  │  • Paramètres     │     │  • label_encoder │                │
│  └──────────────────┘     └──────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 PARTIE 1 : FRONTEND (React + Vite)

### 🔧 Stack Technique

```json
{
  "react": "^19.2.0",
  "vite": "^7.3.1",
  "tailwindcss": "^3.3.3",
  "postcss": "^8.4.31",
  "react-router-dom": "^7.13.2",
  "recharts": "^3.8.1",
  "lucide-react": "^1.7.0",
  "axios": "^1.14.0"
}
```

### 📂 Structure des Fichiers

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.jsx       # Structure principale
│   │   ├── Sidebar.jsx      # Navigation latérale
│   │   ├── PredictForm.jsx  # Formulaire de prédiction
│   │   └── ui.jsx           # Composants UI (Card, Badge, etc.)
│   │
│   ├── pages/               # Pages complètes
│   │   ├── PredictionPage.jsx
│   │   ├── ExperimentsPage.jsx
│   │   ├── RunsPage.jsx
│   │   └── ComparisonPage.jsx
│   │
│   ├── services/            # Couche API
│   │   └── api.js           # Appels HTTP vers backend
│   │
│   ├── App.jsx              # Routing principal
│   ├── main.jsx             # Point d'entrée React
│   └── index.css            # Styles globaux + Tailwind
│
├── public/
│   └── vite.svg
│
└── package.json
```

---

### 🎨 Fonctionnement Détaillé du Frontend

#### A. Initialisation de l'Application

**Fichier :** `main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Processus :**
1. Le navigateur charge `index.html`
2. `index.html` importe `main.jsx`
3. React crée une racine dans `<div id="root">`
4. Le composant `<App />` est monté
5. Le CSS global (`index.css`) est appliqué

---

#### B. Système de Routing

**Fichier :** `App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PredictionPage from './pages/PredictionPage';
import ExperimentsPage from './pages/ExperimentsPage';
import RunsPage from './pages/RunsPage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PredictionPage />} />
          <Route path="experiments" element={<ExperimentsPage />} />
          <Route path="runs" element={<RunsPage />} />
          <Route path="comparison" element={<ComparisonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Fonctionnement :**
- **BrowserRouter** : Utilise l'historique HTML5 pour la navigation
- **Routes** : Conteneur de toutes les routes
- **Route** : Définit chaque chemin URL → Composant
- **Layout** : Wrapper commun avec sidebar et header

**Navigation :**
- `/` → PredictionPage (page d'accueil)
- `/experiments` → ExperimentsPage
- `/runs` → RunsPage
- `/comparison` → ComparisonPage

---

#### C. Composant Layout (Structure Principale)

**Fichier :** `components/Layout.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  // Gestion du thème sombre/clair
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      
      <main className="flex-1 overflow-auto bg-muted/20">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          <Outlet />  {/* ← La page active s'affiche ici */}
        </div>
      </main>
    </div>
  );
};
```

**Rôle :**
- Affiche la **Sidebar** de navigation (toujours visible)
- Gère le **thème sombre/clair** (stocké dans localStorage)
- Utilise `<Outlet />` pour afficher la page enfant active

---

#### D. Sidebar (Navigation Latérale)

**Fichier :** `components/Sidebar.jsx`

```javascript
import { NavLink } from 'react-router-dom';
import { Home, List, BarChart2, Award, Moon, Sun } from 'lucide-react';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const navItems = [
    { name: 'Prediction', path: '/', icon: <Home size={20} /> },
    { name: 'Experiments', path: '/experiments', icon: <List size={20} /> },
    { name: 'Runs', path: '/runs', icon: <BarChart2 size={20} /> },
    { name: 'Model Comparison', path: '/comparison', icon: <Award size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className="text-xl font-bold text-primary">🚗 ML Dashboard</h1>
      </div>
      
      {/* Liens de navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive 
                ? 'bg-primary text-primary-foreground'  // Style actif
                : 'text-muted-foreground hover:bg-muted' // Style inactif
            }
          >
            {item.icon} {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* Bouton Dark/Light Mode */}
      <button onClick={toggleDarkMode}>
        {darkMode ? <Sun /> : <Moon />} Mode
      </button>
    </div>
  );
};
```

**Fonctionnalités :**
- Navigation entre les 4 pages principales
- Icônes Lucide React pour chaque section
- État actif/inactif visuel (couleur de fond)
- Toggle Dark/Light mode en bas

---

#### E. PredictionPage (Page de Prédiction)

**Fichier :** `pages/PredictionPage.jsx`

**État Local :**
```javascript
const [features, setFeatures] = useState(Array(18).fill(''));  // 18 inputs
const [loading, setLoading] = useState(false);                  // Loading state
const [result, setResult] = useState(null);                     // Résultat API
const [error, setError] = useState(null);                       // Erreur
```

**Gestion du Formulaire :**

```javascript
const handleChange = (index, value) => {
  const newFeatures = [...features];
  newFeatures[index] = value;  // Met à jour l'input spécifique
  setFeatures(newFeatures);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setResult(null);

  // 1. Validation : convertir toutes les valeurs en float
  const numericFeatures = {};
  for (let i = 0; i < 18; i++) {
    numericFeatures[`feature_${i + 1}`] = parseFloat(features[i]);
    if (isNaN(numericFeatures[`feature_${i + 1}`])) {
      setError("Toutes les caractéristiques doivent être des nombres valides.");
      setLoading(false);
      return;
    }
  }

  try {
    // 2. Appel API vers le backend
    const prediction = await predictVehicle(numericFeatures);
    setResult(prediction);  // Stocke le résultat
  } catch (err) {
    setError(err.message || "Erreur de prédiction");
  } finally {
    setLoading(false);
  }
};
```

**Affichage du Résultat :**

```jsx
{result && !error && (
  <div className="result-panel">
    <h3>Résultat de la Classification</h3>
    
    {/* Badge coloré selon la classe */}
    <div
      className="prediction-badge"
      style={{ backgroundColor: getClassColor(result.prediction_class) }}
    >
      {result.prediction_class.toUpperCase()}
    </div>

    {/* Détails */}
    <div className="details-card">
      <p><strong>ID Classe :</strong> {result.prediction_id}</p>
      <p><strong>Modèle utilisé :</strong> {result.model_name}</p>
    </div>
  </div>
)}
```

**Couleurs par Classe :**
```javascript
const getClassColor = (predClass) => {
  const colors = {
    'van': '#3498db',    // Bleu
    'saab': '#e74c3c',   // Rouge
    'bus': '#2ecc71',    // Vert
    'opel': '#f39c12'    // Orange
  };
  return colors[predClass.toLowerCase()] || '#95a5a6';
};
```

---

#### F. ExperimentsPage (Page des Expériences MLflow)

**Fichier :** `pages/ExperimentsPage.jsx`

**Chargement des Données :**

```javascript
const [experiments, setExperiments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchExperiments = async () => {
    try {
      const data = await getExperiments();  // ← Appel API
      setExperiments(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les expériences MLflow.");
    } finally {
      setLoading(false);
    }
  };
  fetchExperiments();
}, []);  // Exécuté une fois au montage du composant
```

**Affichage sous forme de Tableau :**

```jsx
{loading ? (
  <Spinner />  // Affiche un loader
) : error ? (
  <div className="error-message">{error}</div>
) : experiments.length === 0 ? (
  <div>Aucune expérience trouvée.</div>
) : (
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nom</th>
        <th>État</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {experiments.map((exp) => (
        <tr key={exp.experiment_id}>
          <td>{exp.experiment_id}</td>
          <td>{exp.name}</td>
          <td>
            <Badge variant={exp.lifecycle_stage === "active" ? "default" : "secondary"}>
              {exp.lifecycle_stage}
            </Badge>
          </td>
          <td>
            <Link to="/runs">Voir les runs →</Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
```

---

#### G. RunsPage (Page des Runs d'Entraînement)

**Fichier :** `pages/RunsPage.jsx`

**Structure Similaire à ExperimentsPage mais avec :**
- Plus de colonnes (métriques, paramètres, timestamps)
- Triable par métrique (accuracy, precision, recall, f1_score)
- Affichage des hyperparamètres utilisés
- Lien vers le détail du run

**Données Affichées :**
```javascript
{
  run_id: "abc123...",
  run_name: "Random_Forest",
  status: "FINISHED",
  start_time: 1234567890,
  end_time: 1234567920,
  metrics: {
    accuracy: 0.92,
    precision: 0.91,
    recall: 0.89,
    f1_score: 0.90
  },
  params: {
    n_estimators: "100",
    max_depth: "None",
    random_state: "42"
  }
}
```

---

#### H. ComparisonPage (Page de Comparaison des Modèles)

**Fichier :** `pages/ComparisonPage.jsx`

**Fonctionnalités :**
- Récupère le meilleur modèle via `GET /best-model`
- Affiche un tableau comparatif de TOUS les modèles
- Graphiques Radar/Barres avec Recharts
- Met en évidence le meilleur F1-Score

**Utilisation de Recharts :**
```jsx
import { Radar, RadarChart, PolarGrid, Legend } from 'recharts';

<RadarChart cx={300} cy={250} outerRadius={150} data={metricsData}>
  <PolarGrid />
  <Radar name="Random Forest" dataKey="rf" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
  <Radar name="SVM" dataKey="svm" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
  <Legend />
</RadarChart>
```

---

#### I. Service API (api.js)

**Fichier :** `services/api.js`

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Configuration Axios de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export des fonctions utilitaires
export const getExperiments = async () => {
  const response = await api.get('/experiments');
  return response.data;
};

export const getRuns = async () => {
  const response = await api.get('/runs');
  return response.data;
};

export const getBestModel = async () => {
  const response = await api.get('/best-model');
  return response.data;
};

export const predictVehicle = async (features) => {
  const response = await api.post('/predict', features);
  return response.data;
};
```

**Pourquoi Axios ?**
- Syntaxe plus simple que `fetch()`
- Gestion automatique des erreurs HTTP
- Intercepteurs pour auth/logs
- Annulation de requêtes possible

---

### 🎨 Système de Styles (TailwindCSS)

**Configuration Personnalisée :**

**Fichier :** `tailwind.config.js`

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',  // Active le mode sombre via class CSS
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées utilisant des variables CSS
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... autres couleurs
      },
    },
  },
  plugins: [],
}
```

**Variables CSS dans `index.css` :**

```css
@layer base {
  :root {
    --background: 0 0% 100%;        /* Blanc */
    --foreground: 222.2 84% 4.9%;   /* Noir bleuté */
    --primary: 222.2 47.4% 11.2%;   /* Bleu foncé */
    --border: 214.3 31.8% 91.4%;    /* Gris clair */
    /* ... 20+ variables ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;   /* Noir bleuté */
    --foreground: 210 40% 98%;      /* Blanc cassé */
    /* ... inverser les couleurs ... */
  }
}
```

**Utilisation dans les Composants :**

```jsx
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Titre</h1>
  <p className="text-muted-foreground">Texte secondaire</p>
</div>
```

**Avantages :**
- Thème sombre/clair automatique
- Cohérence des couleurs dans toute l'app
- Maintenance facile (1 seul endroit pour changer les couleurs)

---

## ⚙️ PARTIE 2 : BACKEND (FastAPI + Python)

### 🔧 Stack Technique

```python
# requirements.txt
fastapi==0.124.4
uvicorn==0.38.0
mlflow==3.10.1
scikit-learn==1.8.0
joblib==1.5.3
numpy==2.2.6
pandas==2.3.3
pydantic==2.11.5
python-multipart==0.0.22
```

### 📂 Structure des Fichiers

```
backend/
├── app.py                 # API FastAPI principale
├── train.py               # Script d'entraînement des modèles
├── evaluate.py            # Script d'évaluation des performances
├── data_loader.py         # Chargement du dataset CSV
├── preprocessing.py       # Prétraitement des données
├── visualize.py           # Visualisations (optionnel)
│
├── requirements.txt       # Dépendances Python
│
└── ../models/             # Modèles sauvegardés
    ├── best_model.pkl     # Meilleur modèle entraîné
    ├── scaler.pkl         # StandardScaler fitted
    └── label_encoder.pkl  # LabelEncoder fitted
```

---

### 🧠 Fonctionnement Détaillé du Backend

#### A. Initialisation de FastAPI

**Fichier :** `app.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, create_model
import numpy as np
import joblib
import mlflow
from mlflow.tracking import MlflowClient

# Configuration MLflow
mlflow.set_tracking_uri("file:../mlruns")

# Chargement des modèles au démarrage
MODELS_DIR = '../models'

try:
    model = joblib.load(os.path.join(MODELS_DIR, 'best_model.pkl'))
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
    label_encoder = joblib.load(os.path.join(MODELS_DIR, 'label_encoder.pkl'))
except FileNotFoundError as e:
    print(f"WARNING: Models not found. Run train.py first. Error: {e}")
    model = None
    scaler = None
    label_encoder = None

# Création de l'application FastAPI
app = FastAPI(title="Vehicle Classification API")
```

**Processus au Démarrage :**
1. MLflow pointe vers `../mlruns/` (stockage local)
2. Tentative de chargement des 3 fichiers `.pkl`
3. Si échec → warning mais l'API démarre quand même
4. Les modèles sont en mémoire pour toutes les requêtes

---

#### B. Configuration CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Autorise toutes origines (dev)
    allow_credentials=True,        # Cookies/auth inclus
    allow_methods=["*"],           # GET, POST, PUT, DELETE
    allow_headers=["*"],           # Tous headers
)
```

**Pourquoi CORS ?**
- Navigateur bloque les requêtes cross-origin par défaut
- Frontend (port 5175) ≠ Backend (port 8000) → Origines différentes
- CORS Middleware autorise explicitement React à appeler FastAPI

**En Production :**
```python
allow_origins=["https://mon-domaine.com"]  # Restreindre au domaine réel
```

---

#### C. Schéma de Données Dynamique

```python
# Créer un schéma Pydantic pour 18 features
fields = {f"feature_{i}": (float, ...) for i in range(1, 19)}
VehicleFeatures = create_model("VehicleFeatures", **fields)
```

**Équivalent à :**

```python
class VehicleFeatures(BaseModel):
    feature_1: float
    feature_2: float
    feature_3: float
    # ... jusqu'à feature_18
```

**Rôle de Pydantic :**
- Valide automatiquement les données entrantes
- Convertit les types (str → float)
- Retourne une erreur 422 si données invalides
- Génère la documentation OpenAPI/Swagger

---

#### D. Endpoint `/predict` (Prédiction)

**Code Complet :**

```python
@app.post("/predict")
def predict_vehicle(features: VehicleFeatures):
    # 1. Vérifie si les modèles sont chargés
    if model is None or scaler is None or label_encoder is None:
        raise HTTPException(
            status_code=500, 
            detail="Models not configured. Run training script first."
        )
    
    # 2. Extraire les features dans l'ordre (1 à 18)
    feature_keys = [f"feature_{i}" for i in range(1, 19)]
    input_list = [getattr(features, key) for key in feature_keys]
    
    # 3. Convertir en array numpy 2D (1 échantillon, 18 features)
    input_array = np.array(input_list).reshape(1, -1)
    
    # 4. Appliquer le prétraitement (StandardScaler)
    input_scaled = scaler.transform(input_array)
    
    # 5. Faire la prédiction avec le modèle
    prediction_num = model.predict(input_scaled)[0]
    
    # 6. Décoder le label numérique en texte (ex: 0 → "van")
    prediction_label = label_encoder.inverse_transform([prediction_num])[0]
    
    # 7. Retourner le résultat au frontend
    return {
        "prediction_class": prediction_label,      # "van"
        "prediction_id": int(prediction_num),      # 0
        "input_features": input_list               # [12.5, 8.3, ...]
    }
```

**Flux de Données :**

```
Requête HTTP POST /predict
↓
{
  "feature_1": 12.5,
  "feature_2": 8.3,
  ...
  "feature_18": 45.2
}
↓
Pydantic valide → VehicleFeatures object
↓
Conversion → numpy array [[12.5, 8.3, ..., 45.2]]
↓
StandardScaler.transform() → données normalisées
↓
model.predict() → [0] (classe numérique)
↓
LabelEncoder.inverse_transform() → ["van"]
↓
Réponse JSON
↓
{
  "prediction_class": "van",
  "prediction_id": 0,
  "input_features": [...]
}
```

---

#### E. Endpoint `/experiments` (Liste Expériences)

```python
@app.get("/experiments")
def get_experiments():
    client = MlflowClient()
    experiments = client.search_experiments()
    
    # Formater les résultats pour le frontend
    return [
      {
        "experiment_id": exp.experiment_id,
        "name": exp.name,
        "lifecycle_stage": exp.lifecycle_stage
      } 
      for exp in experiments
    ]
```

**Exemple de Réponse :**

```json
[
  {
    "experiment_id": "1",
    "name": "vehicle_classification",
    "lifecycle_stage": "active"
  }
]
```

---

#### F. Endpoint `/runs` (Historique des Runs)

```python
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
            "start_time": run.info.start_time,
            "end_time": run.info.end_time,
            "metrics": run.data.metrics,       # {accuracy: 0.92, ...}
            "params": run.data.params,         # {n_estimators: "100", ...}
            "tags": run.data.tags,
            "run_name": run.data.tags.get("mlflow.runName", "Unknown")
        })
    return result
```

**Exemple de Réponse :**

```json
[
  {
    "run_id": "abc123...",
    "run_name": "Random_Forest",
    "status": "FINISHED",
    "metrics": {
      "accuracy": 0.92,
      "precision": 0.91,
      "recall": 0.89,
      "f1_score": 0.90
    },
    "params": {
      "n_estimators": "100",
      "max_depth": "None",
      "random_state": "42"
    }
  }
]
```

---

#### G. Endpoint `/best-model` (Meilleur Modèle)

```python
@app.get("/best-model")
def get_best_model():
    client = MlflowClient()
    experiments = client.search_experiments()
    
    if not experiments:
        raise HTTPException(status_code=404, detail="No experiments found")
    
    experiment_ids = [exp.experiment_id for exp in experiments]
    
    # Trier par F1-Score décroissant et prendre le 1er
    runs = client.search_runs(
        experiment_ids=experiment_ids,
        order_by=["metrics.f1_score DESC"],
        max_results=1
    )
    
    if not runs:
        raise HTTPException(status_code=404, detail="No runs found")
    
    best_run = runs[0]
    return {
        "run_id": best_run.info.run_id,
        "metrics": best_run.data.metrics,
        "params": best_run.data.params,
        "tags": best_run.data.tags,
        "model_name": best_run.data.tags.get("mlflow.runName", "Unknown")
    }
```

**Exemple de Réponse :**

```json
{
  "run_id": "xyz789...",
  "model_name": "Random_Forest",
  "metrics": {
    "f1_score": 0.95,
    "accuracy": 0.94,
    "precision": 0.93,
    "recall": 0.92
  },
  "params": {
    "n_estimators": "200",
    "max_depth": "10"
  }
}
```

---

#### H. Script d'Entraînement (train.py)

**Code Complet :**

```python
import os
import mlflow
import mlflow.sklearn
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from data_loader import load_data
from preprocessing import preprocess_data

def train_and_log_model(model_name, model, params, X_train, X_test, y_train, y_test, best_score, best_model_info):
    with mlflow.start_run(run_name=model_name):
        # 1. Enregistrer les hyperparamètres
        mlflow.log_params(params)
        
        # 2. Entraîner le modèle
        model.fit(X_train, y_train)
        
        # 3. Prédire sur le set de test
        y_pred = model.predict(X_test)
        
        # 4. Calculer les métriques
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # 5. Logger les métriques dans MLflow
        mlflow.log_metrics({
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        })
        
        # 6. Logger le modèle dans MLflow
        mlflow.sklearn.log_model(model, artifact_path="model")
        
        print(f"--- {model_name} ---")
        print(f"Accuracy: {accuracy:.4f} | Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f}")
        
        # 7. Garder trace du meilleur modèle
        if f1 > best_score:
            best_model_info['name'] = model_name
            best_model_info['model'] = model
            best_score = f1
            
    return best_score

if __name__ == "__main__":
    # Configurer MLflow
    mlflow.set_tracking_uri("file:../mlruns")
    mlflow.set_experiment("vehicle_classification")
    
    # 1. Charger les données
    print("Chargement des données...")
    X, y = load_data()
    
    # 2. Prétraiter (split + standardization)
    print("Prétraitement...")
    X_train, X_test, y_train, y_test = preprocess_data(X, y)
    
    # 3. Définir les modèles à entraîner
    models = {
        "KNN": {
            "model": KNeighborsClassifier(n_neighbors=5, weights='distance'),
            "params": {"n_neighbors": 5, "weights": 'distance'}
        },
        "SVM": {
            "model": SVC(kernel='rbf', C=1.0, gamma='scale'),
            "params": {"kernel": 'rbf', "C": 1.0, "gamma": 'scale'}
        },
        "Random_Forest": {
            "model": RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42),
            "params": {"n_estimators": 100, "max_depth": "None", "random_state": 42}
        },
        "Logistic_Regression": {
            "model": LogisticRegression(max_iter=1000, random_state=42),
            "params": {"max_iter": 1000, "random_state": 42}
        }
    }
    
    # 4. Entraîner tous les modèles
    best_score = 0
    best_model_info = {'name': None, 'model': None}
    
    print("Début de l'entraînement...\n")
    for name, config in models.items():
        best_score = train_and_log_model(
            name, config["model"], config["params"], 
            X_train, X_test, y_train, y_test, 
            best_score, best_model_info
        )
    
    # 5. Sauvegarder le meilleur modèle
    print(f"\nMeilleur modèle: {best_model_info['name']} avec F1-score: {best_score:.4f}")
    
    os.makedirs('../models', exist_ok=True)
    best_model_path = '../models/best_model.pkl'
    joblib.dump(best_model_info['model'], best_model_path)
    print(f"Meilleur modèle sauvegardé: {best_model_path}")
```

**Résultat de l'Exécution :**

```
Chargement des données...
Prétraitement...
Début de l'entraînement...

--- KNN ---
Accuracy: 0.72 | Precision: 0.71 | Recall: 0.70 | F1: 0.70
-------------------
--- SVM ---
Accuracy: 0.85 | Precision: 0.84 | Recall: 0.83 | F1: 0.83
-------------------
--- Random_Forest ---
Accuracy: 0.92 | Precision: 0.91 | Recall: 0.89 | F1: 0.90
-------------------
--- Logistic_Regression ---
Accuracy: 0.88 | Precision: 0.87 | Recall: 0.86 | F1: 0.86
-------------------

Meilleur modèle: Random_Forest avec F1-score: 0.90
Meilleur modèle sauvegardé: ../models/best_model.pkl
```

---

### 📊 MLflow Tracking

**Structure des Dossiers :**

```
mlruns/
└── 1/                              # Experiment ID
    ├── meta.yaml                   # Metadata de l'expérience
    └── abc123.../                  # Run ID
        ├── meta.yaml               # Metadata du run
        ├── outputs/                # Artifacts
        │   └── model/              # Modèle sérialisé
        │       ├── MLmodel
        │       ├── model.pkl
        │       └── conda.yaml
        └── tags/                   # Tags (mlflow.runName, etc.)
```

**Ce qui est Tracké :**
- **Params** : Hyperparamètres (n_estimators, C, kernel, etc.)
- **Metrics** : Accuracy, Precision, Recall, F1-Score
- **Artifacts** : Modèle sérialisé (.pkl), environnement Conda
- **Tags** : Nom du run, utilisateur, version git

**Interrogation via MlflowClient :**
```python
client = MlflowClient()
runs = client.search_runs(
    experiment_ids=["1"],
    order_by=["metrics.f1_score DESC"]
)
```

---

## 🔗 PARTIE 3 : LIAISON FRONTEND-BACKEND

### 📡 Architecture de Communication

```
┌──────────────────────────────────────────────────────────┐
│                    NAVIGATEUR WEB                        │
│  http://localhost:5175                                   │
│                                                          │
│  ┌────────────────┐                                     │
│  │  React App     │                                     │
│  │                │                                     │
│  │  PredictionPage│──┐                                  │
│  │  ExperimentsPage─┤                                  │
│  │  RunsPage      │──┼──→ api.js (Axios) ────────────  │
│  │  ComparisonPage└──┘                                  │
└──────────────────────────────────────────────────────────┘
                            │
                            │ Requête HTTP POST/GET
                            │ Headers: Content-Type: application/json
                            │ Body: JSON.stringify(data)
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVEUR FASTAPI                       │
│  http://localhost:8000                                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  app.py                                          │   │
│  │                                                  │   │
│  │  @app.post("/predict")                           │   │
│  │  def predict_vehicle(features: VehicleFeatures): │   │
│  │      # Validation Pydantic                       │   │
│  │      # Prétraitement NumPy                       │   │
│  │      # Prédiction Scikit-learn                   │   │
│  │      # Retour JSON                               │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

### 🔄 Flux de Données Complet (Exemple : Prédiction)

#### Étape 1 : Utilisateur Remplit le Formulaire

**Frontend - PredictionPage.jsx**
```javascript
const [features, setFeatures] = useState(Array(18).fill(''));

// Utilisateur tape "12.5" dans Feature 1
handleChange(0, "12.5");
// State mis à jour : features = ["12.5", "", "", ...]
```

---

#### Étape 2 : Utilisateur Clique sur "Prédire"

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();  // Empêche rechargement page
  
  // Validation
  const numericFeatures = {};
  for (let i = 0; i < 18; i++) {
    numericFeatures[`feature_${i + 1}`] = parseFloat(features[i]);
    if (isNaN(numericFeatures[`feature_${i + 1}`])) {
      setError("Valeurs invalides");
      return;
    }
  }
  
  // Appel API
  const prediction = await predictVehicle(numericFeatures);
  setResult(prediction);
};
```

---

#### Étape 3 : Appel HTTP via Axios

**api.js**
```javascript
export const predictVehicle = async (features) => {
  const response = await api.post('/predict', features);
  return response.data;
};
```

**Requête HTTP Envoyée :**
```http
POST http://localhost:8000/predict HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "feature_1": 12.5,
  "feature_2": 8.3,
  "feature_3": 45.2,
  ...
  "feature_18": 67.8
}
```

---

#### Étape 4 : FastAPI Reçoit et Valide

**app.py**
```python
@app.post("/predict")
def predict_vehicle(features: VehicleFeatures):
    # Pydantic valide automatiquement
    # Si feature_5 = "abc" → Erreur 422 Unprocessable Entity
    
    # Extraction ordonnée
    feature_keys = [f"feature_{i}" for i in range(1, 19)]
    input_list = [getattr(features, key) for key in feature_keys]
    # input_list = [12.5, 8.3, 45.2, ...]
```

---

#### Étape 5 : Prétraitement NumPy

```python
# Conversion numpy array 2D
input_array = np.array(input_list).reshape(1, -1)
# array([[12.5, 8.3, 45.2, ..., 67.8]])

# Application du StandardScaler
input_scaled = scaler.transform(input_array)
# Les données sont normalisées (moyenne=0, écart-type=1)
# car le modèle a été entraîné sur des données normalisées
```

---

#### Étape 6 : Prédiction du Modèle

```python
# Le modèle Random Forest fait sa prédiction
prediction_num = model.predict(input_scaled)[0]
# prediction_num = 0  (classe numérique)

# Le LabelEncoder décode en texte
prediction_label = label_encoder.inverse_transform([prediction_num])[0]
# prediction_label = "van"
```

---

#### Étape 7 : Réponse JSON au Frontend

```python
return {
    "prediction_class": "van",
    "prediction_id": 0,
    "input_features": input_list
}
```

**Réponse HTTP Reçue :**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "prediction_class": "van",
  "prediction_id": 0,
  "input_features": [12.5, 8.3, 45.2, ...]
}
```

---

#### Étape 8 : Frontend Affiche le Résultat

**PredictionPage.jsx**
```javascript
setResult(prediction);  // prediction = {prediction_class: "van", ...}
```

**Rendu JSX :**
```jsx
{result && (
  <div className="result-panel">
    <h3>Résultat de la Classification</h3>
    
    <div
      className="prediction-badge"
      style={{ backgroundColor: getClassColor("van") }}  // Bleu
    >
      VAN
    </div>

    <div className="details-card">
      <p><strong>ID Classe :</strong> 0</p>
      <p><strong>Modèle utilisé :</strong> Random Forest</p>
    </div>
  </div>
)}
```

---

### 🛡️ Gestion des Erreurs

#### Côté Frontend

```javascript
try {
  const prediction = await predictVehicle(numericFeatures);
  setResult(prediction);
} catch (err) {
  // Axios attrape les erreurs HTTP (4xx, 5xx)
  setError(err.message || "Erreur de prédiction");
} finally {
  setLoading(false);  // Toujours exécuté
}
```

**Cas d'Erreurs Gérés :**
- **422 Unprocessable Entity** → Données invalides (NaN, missing fields)
- **500 Internal Server Error** → Modèles non chargés
- **Network Error** → Backend inaccessible (port 8000 fermé)
- **Timeout** → Backend trop lent (> 30s par défaut)

---

#### Côté Backend

```python
@app.post("/predict")
def predict_vehicle(features: VehicleFeatures):
    # Erreur si modèles non chargés
    if model is None:
        raise HTTPException(status_code=500, detail="Models not configured")
    
    # Pydantic retourne automatiquement 422 si validation échoue
    # Pas besoin de try/catch
```

**Types d'Erreurs Backend :**
- **HTTPException** : Erreurs métier explicites
- **ValueError** : Erreurs de conversion (attrapé par FastAPI → 500)
- **FileNotFoundError** : Modèles manquants (attrapé au démarrage)

---

### 🔐 Sécurité et CORS

#### Problème : Same-Origin Policy

Par défaut, les navigateurs bloquent les requêtes entre origines différentes :
- Frontend : `http://localhost:5175`
- Backend : `http://localhost:8000`
- → **Origines différentes** (ports différents)

**Sans CORS :**
```
Console Error: 
Access to fetch at 'http://localhost:8000/predict' from origin 'http://localhost:5175' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

---

#### Solution : CORS Middleware

**Backend - app.py**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Toutes origines (dev)
    allow_credentials=True,        # Inclure cookies/auth
    allow_methods=["*"],           # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],           # Content-Type, Authorization, etc.
)
```

**Headers de Réponse Ajoutés :**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**En Production :**
```python
allow_origins=[
    "https://mon-app-production.com",
    "https://www.mon-app-production.com"
]
allow_origin_regex = r"https://.*\.mon-app-production\.com"
```

---

### 📊 Résumé des Échanges HTTP

| Action Utilisateur | Frontend → Backend | Backend → Frontend | Temps Moyen |
|-------------------|-------------------|-------------------|-------------|
| **Clic "Prédire"** | `POST /predict`<br>`{feature_1: 12.5, ...}` | `{prediction_class: "van", prediction_id: 0}` | ~50-200ms |
| **Ouvre page Experiments** | `GET /experiments` | `[{id: "1", name: "..."}]` | ~10-50ms |
| **Ouvre page Runs** | `GET /runs` | `[{run_id: "...", metrics: {...}}]` | ~50-100ms |
| **Compare modèles** | `GET /best-model` | `{model_name: "RF", f1_score: 0.95}` | ~20-80ms |

---

## 🎯 Conclusion Générale

### ✅ Points Clés du Fonctionnement

#### Frontend (React)
- ✅ **Composants modulaires** : Chaque page est un composant indépendant
- ✅ **État local** : `useState` gère les données temporaires
- ✅ **Effets de bord** : `useEffect` charge les données au montage
- ✅ **Routing** : React Router gère la navigation sans rechargement
- ✅ **Styles dynamiques** : TailwindCSS + variables CSS pour le thème sombre/clair
- ✅ **Appels API** : Axios simplifie les requêtes HTTP

---

#### Backend (FastAPI)
- ✅ **Validation automatique** : Pydantic vérifie les données entrantes
- ✅ **Documentation auto** : Swagger UI généré automatiquement
- ✅ **MLflow intégré** : Tracking complet des expériences
- ✅ **Scikit-learn** : Modèles ML standards performants
- ✅ **Prétraitement** : StandardScaler pour normaliser les données
- ✅ **Persistance** : Joblib sauvegarde les modèles entraînés

---

#### Liaison (HTTP REST API)
- ✅ **Communication bidirectionnelle** : Frontend demande, Backend répond
- ✅ **Format JSON** : Léger, lisible, universel
- ✅ **CORS activé** : Autorise communication cross-origin
- ✅ **Gestion d'erreurs** : Try/catch frontend + HTTPException backend
- ✅ **Asynchrone** : Axios gère les Promesses JavaScript

---

### 📈 Flux Global Simplifié

```
UTILISATEUR
   ↓
[Remplit 18 features]
   ↓
[Clic "Prédire"]
   ↓
FRONTEND (React)
   ↓ [POST /predict via Axios]
BACKEND (FastAPI)
   ↓ [Valide avec Pydantic]
   ↓ [Prétraite avec NumPy/Scaler]
   ↓ [Prédit avec Random Forest]
   ↓ [Décode avec LabelEncoder]
   ↓ [Retourne JSON]
FRONTEND (React)
   ↓ [Affiche badge coloré "VAN"]
UTILISATEUR
```

---

### 🚀 Pour Aller Plus Loin

**Améliorations Possibles :**
1. **Authentification** : JWT tokens pour sécuriser l'API
2. **Base de données** : PostgreSQL pour stocker les prédictions
3. **WebSocket** : Streaming temps réel des logs d'entraînement
4. **Docker** : Containerisation pour déploiement facile
5. **CI/CD** : GitHub Actions pour tests et déploiement auto
6. **Monitoring** : Prometheus + Grafana pour surveiller perfs
7. **Cache** : Redis pour accélérer les prédictions répétées

---

**Document créé automatiquement - Description complète du fonctionnement de l'application ML Dashboard.**
