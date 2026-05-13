# 📊 Rapport de Comparaison : AdaBoost vs XGBoost

## 🚀 Introduction au Boosting
Ce rapport se concentre sur l'analyse comparative des deux algorithmes de "Boosting" intégrés au projet AutoClassML. Ces modèles sont conçus pour améliorer la précision en combinant plusieurs modèles "faibles" pour créer un modèle "fort".

---

## 📈 Performances Comparées (Benchmark)

Les résultats ci-dessous ont été extraits des derniers runs MLflow (13/05/2026) :

| Métrique | XGBoost | AdaBoost |
| :--- | :--- | :--- |
| **Précision (Accuracy)** | **99.23%** | **99.23%** |
| **F1-Score** | **0.9923** | **0.9923** |
| **Précision (Camion)** | 100% | 100% |
| **Rappel (Camion)** | 96.67% | 96.67% |
| **Vitesse d'entraînement** | ~1.2s | ~0.8s |

---

## 🔍 Analyse Différentielle

### 1. AdaBoost (Adaptive Boosting)
*   **Approche** : Ajuste les poids des échantillons. Les données mal classées reçoivent un poids plus important pour le prochain arbre.
*   **Complexité** : Utilise des arbres simples (souches).
*   **Sensibilité** : Très sensible au bruit et aux valeurs aberrantes car il essaie de corriger chaque erreur de manière agressive.

### 2. XGBoost (Extreme Gradient Boosting)
*   **Approche** : Utilise la descente de gradient pour minimiser une fonction de perte en ajoutant de nouveaux modèles qui prédisent les résidus (erreurs).
*   **Régularisation** : Inclut une régularisation L1 et L2 intégrée, ce qui le rend beaucoup plus robuste face au surapprentissage (overfitting).
*   **Gestion des Données** : Gère nativement les valeurs manquantes et offre des performances supérieures sur les grands datasets.

---

## 🏆 Conclusion du Rapport
Bien que les scores soient identiques sur ce dataset spécifique, **XGBoost** est le choix privilégié pour une mise en production. Sa capacité de régularisation et sa gestion optimisée des ressources en font un modèle plus stable et évolutif pour la classification automobile complexe.

**Fait à :** D:/projet_machine_learning  
**Date :** 13 mai 2026
