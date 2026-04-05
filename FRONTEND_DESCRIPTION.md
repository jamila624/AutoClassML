# Frontend ML Dashboard - Description des Fonctionnalités

## 🎨 Vue d'ensemble

Le frontend est une **interface utilisateur web moderne** construite avec **React + Vite** qui permet aux data scientists et ingénieurs ML de gérer visuellement l'entraînement et le suivi des modèles de Machine Learning.

---

## 📱 Pages Principales

### 1️⃣ Page d'Entraînement (`/training`)

**Objectif** : Configurer, lancer et comparer l'entraînement de plusieurs modèles ML simultanément.

#### Fonctionnalités principales :

**A. Sélection des Modèles**
- Interface multi-sélection pour choisir les algorithmes (Random Forest, SVM, KNN, Régression Logistique)
- Visualisation claire des modèles actifs
- Possibilité de combiner différents types de modèles

**B. Ajustement des Hyperparamètres**
- Panneau de configuration dynamique qui s'adapte au modèle sélectionné
- Modification des paramètres en temps réel (ex: `n_estimators`, `kernel`, `C`, etc.)
- Interface intuitive avec sliders, inputs numériques et selects

**C. Aperçu du Dataset**
- Prévisualisation des données d'entraînement sous forme de tableau
- Statistiques descriptives (distribution des classes, nombre d'échantillons)
- Indicateurs de qualité des données

**D. Lancement de l'Entraînement**
- Bouton "Train" avec animation de progression
- Barre de progression visuelle montrant l'avancement en temps réel
- Simulation d'entraînement avec étapes détaillées

**E. Tableau de Bord des Métriques**
- Affichage des performances en temps réel : Accuracy, Precision, Recall, F1-Score
- Graphiques comparatifs (bar charts, radar charts)
- Matrices de confusion pour chaque modèle

**F. Tableau Comparatif**
- Comparaison côte à côte de tous les modèles entraînés
- Tri par métrique (meilleur F1-Score en premier)
- Indicateurs visuels de performance (badges colorés)

**G. Export des Résultats**
- Export PNG : Capture graphique des visualisations
- Export CSV : Données brutes des métriques pour analyse Excel
- Export JSON : Structure complète pour réutilisation programmatique

---

### 2️⃣ Page de Monitoring (`/monitoring`)

**Objectif** : Surveiller en temps réel l'exécution des jobs d'entraînement distribués sur un cluster.

#### Fonctionnalités principales :

**A. Terminal en Temps Réel**
- Console affichant les logs système avec timestamps
- Coloration syntaxique selon le type de log (info, success, warn, error)
- Défilement automatique vers le bas
- Messages détaillés : allocation GPU, chargement dataset, preprocessing, training epochs

**B. Carteurs de Progression**
- **Pipeline Progress** : Pourcentage d'avancement global du job
- **Elapsed Time** : Chronomètre montrant le temps écoulé depuis le début
- **Healthy Nodes** : Nombre de nœuds actifs dans le cluster (ex: 4/4)

**C. Simulation de Job Distribué**
- Bouton "Simulate Distributed Job" pour démarrer une démo
- Scénario réaliste montrant :
  - Allocation de ressources GPU (RTX 4090)
  - Chargement et preprocessing des données
  - Entraînement parallèle sur plusieurs nœuds
  - Logs détaillés par modèle (RF, SVM)
  - Validation croisée et génération des métriques
  - Sauvegarde des modèles

**D. Architecture Multi-Nœuds**
- Visualisation d'un cluster avec plusieurs machines
- Surveillance de la santé de chaque nœud
- Détection implicite des pannes (nodes healthy/unhealthy)

---

## 🧩 Composants Réutilisables

### `ModelSelector`
Sélection visuelle des modèles avec cartes interactives

### `HyperparameterPanel`
Formulaire dynamique qui change selon le modèle sélectionné

### `DatasetPreview`
Tableau d'aperçu des données avec pagination

### `MetricsDashboard`
Graphiques et indicateurs de performance (charts, gauges, progress bars)

### `ComparisonTable`
Tableau comparatif avec tri et filtres

### `TrainingProgress`
Barre de progression animée avec étapes détaillées

### `Layout`
Structure commune avec navigation et header

---

## 🎯 Expérience Utilisateur (UX)

### Points forts :
- **Interface moderne** : Design épuré avec TailwindCSS
- **Dark mode ready** : Classes prêtes pour le mode sombre
- **Responsive** : S'adapte aux différentes tailles d'écran
- **Animations fluides** : Transitions douces, hover effects, loading states
- **Feedback visuel** : Toast notifications, spinners, barres de progression
- **Accessibilité** : Focus states, contrastes élevés, sémantique HTML

### Interactions :
- Clics avec feedback immédiat (active:scale-95)
- Tooltips et hints pour guider l'utilisateur
- États de disabled clairs pour les actions indisponibles
- Notifications toast pour les succès/erreurs

---

## 🔄 Flux de Travail Typique

1. **Configuration** → L'utilisateur sélectionne 2-3 modèles et ajuste leurs hyperparamètres
2. **Vérification** → Aperçu du dataset pour valider les données
3. **Entraînement** → Clic sur "Train" et suivi de la progression en temps réel
4. **Analyse** → Consultation des métriques et comparaison des performances
5. **Export** → Téléchargement des résultats pour rapport ou utilisation future
6. **Monitoring** → Surveillance des jobs en production via le terminal

---

## 🛠️ Technologies Utilisées

- **React 19** : Bibliothèque UI principale
- **Vite** : Build tool ultra-rapide avec HMR (Hot Module Replacement)
- **React Router DOM** : Navigation entre pages
- **TailwindCSS** : Framework CSS utilitaire
- **Lucide React** : Bibliothèque d'icônes modernes
- **ESLint** : Linting pour code quality

---

## 📊 État Actuel vs Backend

### Frontend (UI) :
- ✅ Interface complète et fonctionnelle
- ✅ Simulations intégrées (fausses données)
- ✅ Animations et transitions
- ❌ **Ne se connecte pas encore au backend Python**

### Backend (Python) :
- ✅ Scripts d'entraînement réels (`train.py`)
- ✅ Tracking MLflow des expériences
- ✅ Évaluation des modèles (`evaluate.py`)
- ❌ **Pas encore d'API pour exposer les données au frontend**

### Prochaine étape :
Créer une **API REST (FastAPI/Flask)** pour connecter le frontend React aux scripts Python et afficher les **vraies données d'entraînement**.
