# 📘 Fonctionnement Détaillé du Frontend - ML Dashboard

## 🏗️ Architecture Technique

### Stack Technologique

```
React 19 (Bibliothèque UI)
├── Vite (Build tool & Dev Server)
├── React Router DOM (Navigation)
├── TailwindCSS (Styling)
└── Lucide React (Icônes)
```

---

## 📂 Structure du Projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── PredictForm.jsx  # Formulaire de prédiction
│   ├── services/            # Couche API
│   │   └── api.js           # Appels fetch vers le backend
│   ├── assets/              # Ressources statiques
│   ├── App.jsx              # Composant principal
│   ├── App.css              # Styles globaux
│   ├── index.css            # Reset CSS & Tailwind
│   └── main.jsx             # Point d'entrée React
├── public/
│   └── vite.svg
├── package.json             # Dépendances & scripts
├── vite.config.js           # Configuration Vite
└── index.html               # HTML template
```

---

## 🔄 Flux de Données Complet

### Étape 1 : Initialisation de l'Application

**Fichier :** `main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Ce qui se passe :**
1. Le fichier `index.html` charge `main.jsx`
2. `createRoot` crée une racine React dans la `<div id="root">`
3. Le composant `<App />` est monté avec `StrictMode` activé
4. Le CSS global (`index.css`) est appliqué

---

### Étape 2 : Gestion de l'État Global

**Fichier :** `App.jsx`

```javascript
const [predictionResult, setPredictionResult] = useState(null);
const [error, setError] = useState(null);
```

**États gérés :**
- `predictionResult` : Stocke le résultat de la prédiction reçu du backend
- `error` : Capture les erreurs (API indisponible, données invalides, etc.)

**Fonctions de callback :**
```javascript
const handlePredictionResult = (result) => {
  setPredictionResult(result);  // Met à jour l'état avec le résultat
};

const handleError = (err) => {
  setError(err);  // Met à jour l'état avec l'erreur
};
```

Ces fonctions sont passées en **props** au composant enfant `PredictForm`.

---

### Étape 3 : Formulaire de Prédiction

**Fichier :** `components/PredictForm.jsx`

#### A. Initialisation des Features

```javascript
// Créer un objet avec 18 features vides
const initialFeatures = {};
for (let i = 1; i <= 18; i++) {
    initialFeatures[`feature_${i}`] = '';
}

const [features, setFeatures] = useState(initialFeatures);
```

**Pourquoi 18 features ?**
Le dataset véhicule contient 18 caractéristiques géométriques extraites d'images 2D :
- Compactness
- Circularity
- Distance circularity
- Radius ratio
- Surface area
- Aspect ratio
- Max length asymmetry
- Scatter ratio
- Elongatedness
- Prismatic axis
- Max length rectangularity
- Scaled variance X/Y
- Scaled radius of gyration X/Y
- Skewness X/Y
- Kurtosis X/Y

#### B. Gestion des Inputs

```javascript
const handleChange = (e) => {
    const { name, value } = e.target;
    setFeatures({
        ...features,
        [name]: value  // Mise à jour immuable
    });
};
```

**Mécanisme :**
1. Chaque input a un `name` unique (`feature_1`, `feature_2`, etc.)
2. À chaque frappe, `handleChange` est appelé
3. L'état `features` est mis à jour sans mutation directe (principe React)

#### C. Soumission du Formulaire

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();  // Empêche le rechargement page
    setLoading(true);
    onError(null);
    onPredictionResult(null);

    try {
        // 1. Conversion en nombres
        const numericFeatures = {};
        for (const key in features) {
            numericFeatures[key] = parseFloat(features[key]);
            if (isNaN(numericFeatures[key])) {
                throw new Error(`La valeur pour ${key} doit être un nombre valide.`);
            }
        }

        // 2. Appel API
        const result = await predictVehicle(numericFeatures);
        onPredictionResult(result);  // Transmet le résultat à App.jsx
        
    } catch (err) {
        onError(err.message);  // Transmet l'erreur à App.jsx
    } finally {
        setLoading(false);
    }
};
```

**Séquençage :**
1. `e.preventDefault()` empêche le comportement par défaut du formulaire
2. Validation : toutes les valeurs doivent être des nombres valides
3. Appel à la fonction `predictVehicle` du service API
4. Le résultat ou l'erreur est propagé au parent via les callbacks

---

### Étape 4 : Appel API vers le Backend

**Fichier :** `services/api.js`

```javascript
export const predictVehicle = async (features) => {
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(features),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la prédiction');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

**Détails techniques :**

1. **Endpoint cible :** `http://localhost:8000/predict` (backend FastAPI)
2. **Méthode HTTP :** POST
3. **Headers :** `Content-Type: application/json` indique qu'on envoie du JSON
4. **Body :** Les 18 features sérialisées en JSON
   ```json
   {
     "feature_1": 12.5,
     "feature_2": 8.3,
     "feature_3": 45.2,
     ...
   }
   ```

5. **Gestion d'erreurs :**
   - Si `response.ok === false` → le backend a retourné une erreur (4xx, 5xx)
   - On parse `response.json()` pour extraire le message d'erreur (`detail`)
   - L'erreur est propagée au `catch` du formulaire

6. **Succès :**
   - Le backend retourne un JSON comme :
     ```json
     {
       "prediction_class": "van",
       "prediction_id": 0
     }
     ```
   - Ce résultat est retourné à `PredictForm.jsx`

---

### Étape 5 : Affichage du Résultat

**Fichier :** `App.jsx`

```javascript
{predictionResult && !error && (
  <div className="result-panel">
    <h3>Résultat de la Classification</h3>
    <div
      className="prediction-badge"
      style={{ backgroundColor: getClassColor(predictionResult.prediction_class) }}
    >
      {predictionResult.prediction_class.toUpperCase()}
    </div>

    <div className="details-card">
      <h4>Détails</h4>
      <p><strong>ID Classe :</strong> {predictionResult.prediction_id}</p>
      <p><strong>Modèle actif :</strong> Le meilleur modèle MLflow (ex: Random Forest, SVM...)</p>
    </div>
  </div>
)}
```

**Rendu conditionnel :**
- Si `predictionResult` existe ET pas d'erreur → afficher le résultat
- La classe prédite reçoit une couleur dynamique via `getClassColor()`

**Fonction de coloration :**
```javascript
const getClassColor = (predClass) => {
  const colors = {
    'van': '#3498db',    // Bleu
    'saab': '#e74c3c',   // Rouge
    'bus': '#2ecc71',    // Vert
    'opel': '#f39c12'    // Orange
  };
  return colors[predClass.toLowerCase()] || '#95a5a6';  // Gris par défaut
};
```

---

### Étape 6 : Gestion des Erreurs

**Affichage UI :**
```javascript
{error && (
  <div className="error-panel">
    <h3>Erreur</h3>
    <p>{error}</p>
    <small>Assurez-vous que le backend FastAPI (localhost:8000) fonctionne.</small>
  </div>
)}
```

**Cas d'erreurs gérés :**
1. **Backend inaccessible** → `fetch` échoue (network error)
2. **Données invalides** → NaN lors de la conversion `parseFloat()`
3. **Erreur backend** → Response HTTP non-ok (400, 500, etc.)
4. **Timeout** → Si le backend met trop longtemps à répondre

---

## ⚙️ Mécanismes React Avancés

### 1. Props Drilling

Le flux de données descendante :
```
App.jsx (parent)
  ↓ onPredictionResult (callback prop)
  ↓ onError (callback prop)
PredictForm.jsx (enfant)
  ↓ appelle ces callbacks après appel API
```

### 2. State Immutability

**Mauvaise pratique (mutation directe) :**
```javascript
features['feature_1'] = '10';  // ❌ Ne pas faire
setFeatures(features);
```

**Bonne pratique (copie immuable) :**
```javascript
setFeatures({
    ...features,           // Copie de l'existant
    ['feature_1']: '10'    // Override de la clé
});  // ✅ Correct
```

### 3. Async/Await Pattern

```javascript
const handleSubmit = async (e) => {
    // Code synchrone
    setLoading(true);
    
    try {
        // Attente asynchrone (non-bloquant)
        const result = await predictVehicle(numericFeatures);
        
        // Repris après résolution de la Promise
        onPredictionResult(result);
    } finally {
        // Toujours exécuté
        setLoading(false);
    }
};
```

### 4. Conditional Rendering

```javascript
// État 1 : En attente
{!error && !predictionResult && <EmptyState />}

// État 2 : Erreur
{error && <ErrorPanel error={error} />}

// État 3 : Succès
{predictionResult && !error && <ResultPanel result={predictionResult} />}
```

---

## 🎨 Interface Utilisateur

### Grille de 18 Inputs

```jsx
<div className="features-grid">
  {featureKeys.map((key, index) => (
    <div className="input-group" key={key}>
      <label htmlFor={key}>Feature {index + 1}</label>
      <input
        type="number"
        step="any"
        value={features[key]}
        onChange={handleChange}
        required
      />
    </div>
  ))}
</div>
```

**Responsive design :**
- CSS Grid avec `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- S'adapte automatiquement à la taille de l'écran
- Mobile : 1 colonne | Desktop : 3+ colonnes

### États de Loading

```jsx
<button disabled={loading}>
  {loading ? 'Analyse en cours...' : 'Prédire la classe'}
</button>
```

**Pendant le loading :**
- Bouton désactivé (empêche double soumission)
- Curseur change (not-allowed)
- Opacité réduite (feedback visuel)

---

## 🔗 Intégration avec le Backend Python

### Schéma d'Architecture

```
┌─────────────┐         HTTP POST          ┌──────────────┐
│   React UI  │ ─────────────────────────> │  FastAPI     │
│  (Port ~5173)│    JSON: {feature_1: x}    │  (Port 8000) │
└─────────────┘                            └──────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │  MLflow Model│
                                         │  (best_model)│
                                         └──────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │  Prediction  │
                                         │  {class, id} │
                                         └──────────────┘
```

### Communication Client-Serveur

**Requête Frontend :**
```javascript
fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    feature_1: 12.5,
    feature_2: 8.3,
    // ... 16 autres features
  })
})
```

**Réponse Backend (FastAPI) :**
```python
@app.post("/predict")
async def predict(features: dict):
    # Charger le meilleur modèle depuis MLflow
    model = load_best_model()
    
    # Convertir dict → array numpy
    X = np.array(list(features.values())).reshape(1, -1)
    
    # Prédire
    prediction = model.predict(X)[0]
    
    # Retourner JSON
    return {
        "prediction_class": prediction,  # "van", "saab", etc.
        "prediction_id": class_to_id[prediction]
    }
```

---

## 🛠️ Points Clés du Fonctionnement

### 1. Unidirectional Data Flow

```
User Input → Event Handler → State Update → Re-render → UI Update
```

**Exemple concret :**
1. User tape "12.5" dans Feature 1
2. `handleChange` est déclenché
3. `setFeatures` met à jour l'état
4. React détecte le changement de state
5. Le composant se re-rend avec la nouvelle valeur
6. L'input affiche "12.5"

### 2. Controlled Components

Chaque input est **contrôlé** par React :
```jsx
<input
  value={features[key]}      // La valeur vient du state React
  onChange={handleChange}    // Les modifications passent par React
/>
```

**Avantage :** React a toujours le contrôle total sur les valeurs du formulaire.

### 3. Error Boundaries (Implicite)

Le try/catch dans `handleSubmit` agit comme une frontière d'erreur locale :
```javascript
try {
  // Code risqué (appel API)
} catch (err) {
  // Gestion gracieuse de l'erreur
  onError(err.message);
}
```

### 4. Side Effects via API Calls

L'appel API est un **side effect** déclenché par l'action utilisateur :
```javascript
const result = await predictVehicle(numericFeatures);
// ↑ Effet secondaire : communication réseau externe
```

---

## 📊 Cycle de Vie d'une Prédiction

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur remplit les 18 features                     │
│    State: features = {feature_1: "12.5", ...}               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Clic sur "Prédire" → handleSubmit(e)                     │
│    - e.preventDefault()                                     │
│    - setLoading(true)                                       │
│    - Validation parseFloat()                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Appel API → predictVehicle(features)                     │
│    - POST http://localhost:8000/predict                     │
│    - Body: JSON.stringify(features)                         │
│    - Wait response...                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend FastAPI traite la requête                        │
│    - Charge best_model.pkl                                  │
│    - model.predict(X) → "van"                               │
│    - Return {prediction_class: "van", prediction_id: 0}     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend reçoit la réponse                               │
│    - response.json() → result object                        │
│    - onPredictionResult(result)                             │
│    - setLoading(false)                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Affichage du résultat                                    │
│    - State update: predictionResult = {...}                 │
│    - Re-render du composant App                             │
│    - Badge coloré "VAN" apparaît                            │
│    - Détails affichés (ID classe, modèle utilisé)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Optimisations et Bonnes Pratiques

### 1. Nettoyage du Code

**Utilisation de spread operator :**
```javascript
setFeatures({
    ...features,
    [name]: value
});
```

**Au lieu de :**
```javascript
const newFeatures = Object.assign({}, features);
newFeatures[name] = value;
setFeatures(newFeatures);
```

### 2. Validation des Données

```javascript
if (isNaN(numericFeatures[key])) {
    throw new Error(`La valeur pour ${key} doit être un nombre valide.`);
}
```

**Pourquoi ?**
- Évite d'envoyer des données invalides au backend
- Feedback immédiat à l'utilisateur
- Réduit les erreurs côté serveur

### 3. UX Loading States

```javascript
disabled={loading}
```

**Importance :**
- Empêche les soumissions multiples
- Indique visuellement que l'action est en cours
- Améliore la perception de performance

### 4. Separation of Concerns

```
src/
├── components/    # UI pure (présentation)
├── services/      # Logique métier (API calls)
└── App.jsx        # Orchestration (state management)
```

Chaque couche a une responsabilité unique.

---

## 🎯 Résumé Exécutif

### Ce que fait le frontend :

✅ **Interface de saisie** : 18 inputs pour les features géométriques  
✅ **Validation client** : Vérifie que les valeurs sont numériques  
✅ **Communication API** : Envoie les données au backend FastAPI  
✅ **Affichage résultats** : Montre la classe prédite avec code couleur  
✅ **Gestion erreurs** : Messages clairs si backend HS ou données invalides  
✅ **Loading states** : Feedback visuel pendant l'attente  

### Ce que le frontend NE fait PAS :

❌ **Entraînement des modèles** → Géré par `train.py`  
❌ **Tracking MLflow** → Géré par le backend Python  
❌ **Logique de prédiction** → Dans `best_model.pkl`  
❌ **Base de données** → Aucune persistance locale  

---

## 📈 Évolutions Possibles

### Court terme :
- [ ] Ajouter des tooltips expliquant chaque feature
- [ ] Implementer la validation en temps réel (avant soumission)
- [ ] Ajouter un historique des prédictions locales (localStorage)

### Moyen terme :
- [ ] Connecter aux vrais endpoints MLflow pour afficher tous les runs
- [ ] Graphiques comparatifs des modèles (bar charts, radar charts)
- [ ] Upload de fichier CSV pour prédiction en batch

### Long terme :
- [ ] Dashboard complet avec métriques en temps réel
- [ ] WebSocket pour streaming des logs d'entraînement
- [ ] Export PDF des rapports de prédiction

---

## 🔍 Conclusion

Le frontend React agit comme une **couche de présentation élégante** au-dessus de la logique métier Python. Il suit les principes modernes du développement web :

- **Composants modulaires** (réutilisables et testables)
- **Flux de données unidirectionnel** (prévisible et debuggable)
- **Séparation des préoccupations** (UI vs logique vs API)
- **Expérience utilisateur soignée** (loading states, erreurs, responsive)

C'est une **Single Page Application (SPA)** qui communique avec une API REST backend, suivant l'architecture standard des applications web modernes.
