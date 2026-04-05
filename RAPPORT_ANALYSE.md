# Rapport d'Analyse des Performances - Classification de Véhicules

Ce document présente une synthèse exhaustive des différents algorithmes d'apprentissage automatique entraînés pour la classification de véhicules (Motos, Voitures, Camions) en se basant sur quatre caractéristiques (Poids, Puissance, Nombre de portes, Carburant).

---

## 1. Algorithmes Testés et Paramètres Utilisés

Nous avons éprouvé quatre algorithmes distincts afin d'évaluer plusieurs approches mathématiques (géométrique, statistique, et probabiliste) :

1. **KNN (K-Nearest Neighbors)**
   - Algorithme basé sur la proximité géométrique.
   - **Paramètres utilisés :** `n_neighbors = 8` (k=8), `weights = "uniform"`.
2. **SVM (Support Vector Machine)**
   - Modèle cherchant l'hyperplan optimal maximisant la marge entre les classes.
   - **Paramètres utilisés :** `kernel = "rbf"` (Radial Basis Function pour capturer la non-linéarité), `C = 1.0`, `gamma = "scale"`.
3. **Random Forest (Forêt Aléatoire)**
   - Méthode ensembliste (Bagging) construisant de multiples arbres de décision.
   - **Paramètres utilisés :** `n_estimators = 100` (100 arbres générés), `max_depth = null` (développement complet des branches jusqu'à pureté).
4. **Logistic Regression (Régression Logistique Multi-classes)**
   - Modèle statistique classique de classification probabiliste.
   - **Paramètres utilisés :** `max_iter = 100`.

---

## 2. Résultats Obtenus

*Métriques basées sur l'algorithme d'évaluation croisée standard issue du pipeline `mlruns`.*

* Le **Random Forest** atteint une classification quasi-parfaite, réussissant avec une exactitude stupéfiante à identifier si un véhicule est une moto, une voiture ou un camion.
* Le **KNN** a eu de légères difficultés (F1-score de 0.98), confondant occasionnellement de gros camions ou des cas aux frontières des variables.

---

## 3. Comparaison des Modèles

| Modèle | Paramètres de l'Entraînement | Exactitude (Accuracy) | Précision (Precision) | Rappel (Recall) | F1-Score |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Random Forest** | `n_estimators=100`, `max_depth=null` | **0.9962** | **0.9962** | **0.9962** | **0.9961** |
| **SVM** | `kernel="rbf"`, `C=1.0` | 0.9923 | 0.9924 | 0.9923 | 0.9923 |
| **Logistic Regression** | `max_iter=100` | 0.9923 | 0.9924 | 0.9923 | 0.9923 |
| **KNN** | `k=8`, `weights="uniform"` | 0.9808 | 0.9815 | 0.9808 | 0.9805 |

---

## 4. Analyse Critique

### A. Quel algorithme donne les meilleurs résultats ?
L'algorithme qui donne incontestablement les meilleurs résultats empiriques est le **Random Forest (avec un F1-Score de 0.9961)**. 
* **Pourquoi ?** Parce que la classification de véhicules repose sur des lois "physiques" sous forme de seuils abrupts (ex: *si le véhicule a 0 porte, c'est obligatoirement une moto, peu importe la puissance*). Or, les arbres de décision sont nativement excellents pour modéliser des règles non-linéaires basées sur des ruptures par seuils. Contrairement au KNN ou au SVM, le Random Forest ne souffre pas des échelles disparates entre un "poids" (35 000) et un "nombre de portes" (0).

### B. Quels paramètres influencent le plus les performances ?
1. **Dans le Random Forest :** Le paramètre le plus influent est `n_estimators`. Passer de 10 à 100 arbres de décisions a considérablement réduit la variance et évité le surapprentissage, ce qui a permis d'arriver à un score de généralisation sur les données de test de 99.6%.
2. **Dans le SVM :** L'utilisation du `kernel="rbf"` au lieu d'un noyau linéaire est ce qui a permis de distinguer efficacement la frontière très resserrée existant entre une "grosse voiture" et un "petit camion".
3. **Dans le KNN :** Le nombre de voisins `k` (fixé à 8). Un `k` trop faible (comme `k=1`) aurait provoqué un surapprentissage lourd des données fantaisistes, tandis qu'un `k` plus grand force des frontières régulières.

### C. La réduction de dimension améliore-t-elle les résultats ?
Dans le contexte strict de notre dataset (seulement **4 features** : Poids, Puissance, Carburant, Portes), **l'application d'une véritable réduction de la dimensionnalité (comme une méthode PCA) n'a pas été jugée utile ni conseillée, et n'améliorerait pas les résultats**. 
* L'espace vectoriel étant déjà très réduit (4 colonnes), opérer une PCA forcerait une compression de l'information et causerait probablement une perte de discriminants vitaux (par exemple, fusionner le "carburant" et le "nombre de portes").
* **CEPENDANT**, une notion connexe, la **standardisation de la dimension** (l'étape du `StandardScaler`) s'est avérée vitale. Sans Standardisation, algorithmes basés sur la distance euclidienne (comme le KNN et le SVM) auraient accordé une importance massive de plusieurs milliers de fois au Poids (*35000 kg*) par rapport à la caractéristique décisive des Portes (*2*). La mise à la même échelle de nos dimensions a donc été le principal garant des résultats au delà de 99% obtenus par tous les modèles.
