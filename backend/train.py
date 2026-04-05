import os
import sys
import mlflow
import mlflow.sklearn
import joblib
import json
import numpy as np

# Correction encodage Windows
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from data_loader import load_data
from preprocessing import preprocess_data


# ─────────────────────────────────────────────
# Entraînement d'un modèle + logging MLflow
# ─────────────────────────────────────────────
def train_and_log_model(model_name, model, params, X_train, X_test,
                        y_train, y_test, label_names,
                        best_score, best_model_info):
    """
    Entraîne un modèle, calcule les métriques et les logue dans MLflow.
    
    Retourne : (best_score, result_dict)
    """
    with mlflow.start_run(run_name=model_name):

        # ── Enregistrement des hyperparamètres ──────────────────────────
        loggable_params = {k: str(v) for k, v in params.items()}
        mlflow.log_params(loggable_params)

        # ── Entraînement ─────────────────────────────────────────────────
        print(f"\n  Entraînement : {model_name}")
        print(f"  Paramètres   : {params}")
        model.fit(X_train, y_train)

        # ── Prédiction ───────────────────────────────────────────────────
        y_pred = model.predict(X_test)

        # ── Métriques globales ───────────────────────────────────────────
        accuracy  = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall    = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1        = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        # ── Métriques par classe ─────────────────────────────────────────
        report_dict = classification_report(
            y_test, y_pred,
            target_names=label_names,
            output_dict=True,
            zero_division=0
        )

        # ── Matrice de confusion ─────────────────────────────────────────
        cm = confusion_matrix(y_test, y_pred).tolist()

        # ── Log MLflow ───────────────────────────────────────────────────
        mlflow.log_metrics({
            "accuracy":  round(accuracy,  4),
            "precision": round(precision, 4),
            "recall":    round(recall,    4),
            "f1_score":  round(f1,        4)
        })
        mlflow.sklearn.log_model(model, artifact_path="model")

        # ── Affichage console ────────────────────────────────────────────
        print(f"  {'─'*44}")
        print(f"  Accuracy  : {accuracy:.4f}")
        print(f"  Precision : {precision:.4f}")
        print(f"  Recall    : {recall:.4f}")
        print(f"  F1-score  : {f1:.4f}")
        print(f"  {'─'*44}")
        print(f"\n{classification_report(y_test, y_pred, target_names=label_names, zero_division=0)}")

        # ── Sélection du meilleur modèle ─────────────────────────────────
        if f1 > best_score:
            best_model_info['name']  = model_name
            best_model_info['model'] = model
            best_score               = f1

        run_result = {
            "model":             model_name,
            "params":            params,
            "accuracy":          round(accuracy,  4),
            "precision":         round(precision, 4),
            "recall":            round(recall,    4),
            "f1_score":          round(f1,        4),
            "per_class_metrics": report_dict,
            "confusion_matrix":  cm,
            "classes":           list(label_names)
        }

    return best_score, run_result


# ─────────────────────────────────────────────
# Script principal
# ─────────────────────────────────────────────
if __name__ == "__main__":

    mlflow.set_tracking_uri("file:../mlruns")
    mlflow.set_experiment("vehicle_classification")

    # ── Chargement des paramètres depuis params.json ──────────────────
    params_file  = 'params.json'
    selected_ids = ['knn', 'svm', 'rf', 'lr']
    hparams      = {}

    if os.path.exists(params_file):
        try:
            with open(params_file, 'r', encoding='utf-8') as f:
                data         = json.load(f)
                selected_ids = data.get('selected_models', selected_ids)
                hparams      = data.get('params', {})
                print(f"\n[CONFIG] Paramètres chargés depuis params.json")
                print(f"         Modèles sélectionnés : {selected_ids}")
                print(f"         Hyperparamètres      : {json.dumps(hparams, indent=2)}")
        except Exception as e:
            print(f"[WARN] Impossible de charger params.json : {e} — utilisation des défauts.")

    # ── Étape 1 : Chargement et nettoyage ────────────────────────────
    print("\n" + "="*52)
    print(" ETAPE 1 : CHARGEMENT ET NETTOYAGE DES DONNEES")
    print("="*52)
    X, y = load_data()
    if X is None:
        print("[ERREUR] Dataset non trouvé. Arrêt.")
        sys.exit(1)

    # ── Étape 2 : Encodage et prétraitement ──────────────────────────
    print("\n" + "="*52)
    print(" ETAPE 2 : ENCODAGE ET PREPROCESSING")
    print("="*52)
    X_train, X_test, y_train, y_test = preprocess_data(X, y)

    # Récupérer les noms de classes pour les rapports
    from sklearn.preprocessing import LabelEncoder
    le_type = joblib.load('../models/label_encoder_v1.pkl')
    label_names = le_type.classes_

    # ── Étape 3 : Configuration des modèles ──────────────────────────
    print("\n" + "="*52)
    print(" ETAPE 3 : ENTRAINEMENT DES MODELES")
    print("="*52)

    # Gestion propre de max_depth pour Random Forest
    _rf_max_depth = hparams.get('rf', {}).get('max_depth', None)
    if _rf_max_depth in ['', None, 0, 'None']:
        _rf_max_depth = None
    else:
        try:
            _rf_max_depth = int(_rf_max_depth)
        except (ValueError, TypeError):
            _rf_max_depth = None

    id_map = {
        "knn": "KNN",
        "svm": "SVM",
        "rf":  "Random_Forest",
        "lr":  "Logistic_Regression"
    }

    models_config = {
        "KNN": {
            "cls": KNeighborsClassifier,
            "params": {
                "n_neighbors": int(hparams.get('knn', {}).get('k', 5)),
                "weights":     str(hparams.get('knn', {}).get('weights', 'distance'))
            }
        },
        "SVM": {
            "cls": SVC,
            "params": {
                "kernel": str(hparams.get('svm', {}).get('kernel', 'rbf')),
                "C":      float(hparams.get('svm', {}).get('C', 1.0)),
                "gamma":  str(hparams.get('svm', {}).get('gamma', 'scale'))
            }
        },
        "Random_Forest": {
            "cls": RandomForestClassifier,
            "params": {
                "n_estimators": int(hparams.get('rf', {}).get('n_estimators', 100)),
                "max_depth":    _rf_max_depth,
                "random_state": 42
            }
        },
        "Logistic_Regression": {
            "cls": LogisticRegression,
            "params": {
                "max_iter":     int(hparams.get('lr', {}).get('max_iter', 1000)),
                "random_state": 42
            }
        }
    }

    # ── Boucle d'entraînement ─────────────────────────────────────────
    best_score      = 0
    best_model_info = {'name': None, 'model': None}
    all_results     = []

    for model_id in selected_ids:
        name = id_map.get(model_id)
        if not name or name not in models_config:
            print(f"  [SKIP] Modèle inconnu : {model_id}")
            continue

        config          = models_config[name]
        model_instance  = config["cls"](**config["params"])

        best_score, result = train_and_log_model(
            name, model_instance, config["params"],
            X_train, X_test, y_train, y_test,
            label_names,
            best_score, best_model_info
        )
        all_results.append(result)

    # ── Étape 4 : Résultats finaux et sauvegarde ─────────────────────
    print("\n" + "="*52)
    print(" ETAPE 4 : SAUVEGARDE ET RESULTATS FINAUX")
    print("="*52)

    if best_model_info['name']:
        # Sauvegarde du meilleur modèle
        os.makedirs('../models', exist_ok=True)
        best_model_path = '../models/model_v1.pkl'
        joblib.dump(best_model_info['model'], best_model_path)
        print(f"\n  Meilleur modèle : {best_model_info['name']}")
        print(f"  F1-score        : {best_score:.4f}")
        print(f"  Sauvegardé sous : {best_model_path}")

        # Sauvegarde du fichier metrics.json (lu par l'API)
        metrics_output = {
            "best_model":  best_model_info['name'],
            "best_f1":     round(best_score, 4),
            "models":      all_results
        }
        metrics_path = 'metrics.json'
        with open(metrics_path, 'w', encoding='utf-8') as f:
            json.dump(metrics_output, f, ensure_ascii=False, indent=2)
        print(f"  Rapport JSON    : {metrics_path}")

        # Résumé comparatif
        print(f"\n  {'─'*48}")
        print(f"  {'Modèle':<22} {'Accuracy':>10} {'F1-Score':>10}")
        print(f"  {'─'*48}")
        for r in all_results:
            print(f"  {r['model']:<22} {r['accuracy']:>10.4f} {r['f1_score']:>10.4f}")
        print(f"  {'─'*48}")
    else:
        print("\n  [WARN] Aucun modèle n'a été entraîné.")
