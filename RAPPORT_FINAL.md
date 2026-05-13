# 📋 Rapport de Fin de Projet : AutoClassML Industrialisé

## 🚀 Vue d'Ensemble
Ce projet a consisté à industrialiser une solution de classification de véhicules (Camion, Voiture, Moto) à l'aide de techniques avancées de Machine Learning et d'une architecture moderne Full-Stack.

### Objectifs Atteints :
1.  **Enrichissement du modèle** : Passage de 4 à 6 modèles de classification (Ajout de AdaBoost et XGBoost).
2.  **Architecture robuste** : Backend FastAPI avec gestion d'environnement virtuel (`venv`).
3.  **Traçabilité** : Intégration complète de **MLflow** pour le suivi des expériences et des métriques.
4.  **Interface Interactive** : Dashboard React permettant de configurer les hyperparamètres et de visualiser les résultats en temps réel.
5.  **Nettoyage & Optimisation** : Suppression des fichiers redondants et optimisation de la structure du projet.

---

## 🏗️ Architecture Technique

### Backend (Python / FastAPI)
*   **API** : Fournit les endpoints pour la prédiction, l'entraînement et la récupération des métriques.
*   **Tracking** : Utilise MLflow pour enregistrer chaque run (paramètres, métriques, artefacts).
*   **Automatisation** : Le script `start.bat` gère l'installation des dépendances et le lancement des 3 serveurs simultanément.

### Frontend (React / Tailwind)
*   **Dashboard** : Permet une sélection granulaire des modèles à entraîner.
*   **Visualisation** : Graphiques comparatifs basés sur Recharts, connectés dynamiquement aux métriques MLflow via le backend.

---

## 📈 Résultats des Modèles (Benchmark Final)

Résultats obtenus lors du dernier entraînement global (13/05/2026) :

| Modèle | Accuracy | F1-Score | Status |
| :--- | :--- | :--- | :--- |
| **Random Forest** | **99.23%** | **0.9923** | 🏆 Meilleur Modèle |
| **XGBoost** | 99.23% | 0.9923 | Excellent |
| **AdaBoost** | 99.23% | 0.9923 | Excellent |
| **SVM** | 98.46% | 0.9845 | Très bon |
| **KNN** | 98.46% | 0.9845 | Très bon |
| **Logistic Regression** | 98.08% | 0.9806 | Bon |

---

## 🧹 Nettoyage et Livrables
Le projet a été nettoyé pour ne contenir que les fichiers essentiels :
*   `backend/` : Code source et venv.
*   `frontend/` : Application React.
*   `mlruns/` : Historique complet des expériences.
*   `models/` : Meilleurs modèles sauvegardés en `.pkl`.
*   `start.bat` : Script de lancement "One-Click".

---

## 🛠️ Maintenance et Évolution
1.  **Nouveaux Modèles** : Ajoutez-les dans `train.py` et mettez à jour `ModelSelector.jsx`.
2.  **Données** : Modifiez `generate_dataset.py` pour simuler des cas plus complexes ou importez un vrai CSV.
3.  **Production** : Le backend est prêt à être déployé derrière un serveur de production (Gunicorn/Uvicorn).

**Projet finalisé avec succès le 13 mai 2026.**
