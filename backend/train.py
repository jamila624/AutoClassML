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
        # Enregistrer les hyperparamètres
        mlflow.log_params(params)
        
        # Entraînement
        model.fit(X_train, y_train)
        
        # Prédiction
        y_pred = model.predict(X_test)
        
        # Métriques (avec average='weighted' pour de la classification multiclasse)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Log métriques
        mlflow.log_metrics({
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        })
        
        # Log Modèle dans MLflow
        mlflow.sklearn.log_model(model, artifact_path="model")
        
        print(f"--- {model_name} ---")
        print(f"Accuracy: {accuracy:.4f} | Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f}")
        print("-------------------")
        
        # Garder une trace du meilleur modèle selon le F1 score
        if f1 > best_score:
            best_model_info['name'] = model_name
            best_model_info['model'] = model
            best_score = f1
            
    return best_score

if __name__ == "__main__":
    mlflow.set_tracking_uri("file:../mlruns")
    mlflow.set_experiment("vehicle_classification")
    
    # 1. Chargement et prétraitement
    print("Chargement des données...")
    X, y = load_data()
    print("Prétraitement des données...")
    X_train, X_test, y_train, y_test = preprocess_data(X, y)
    
    # Dictionnaire pour enregistrer les paramètres
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
    
    best_score = 0
    best_model_info = {'name': None, 'model': None}
    
    print("Début de l'entraînement et du logging MLflow...\n")
    for name, config in models.items():
        best_score = train_and_log_model(
            name, config["model"], config["params"], 
            X_train, X_test, y_train, y_test, 
            best_score, best_model_info
        )
        
    print(f"\nMeilleur modèle: {best_model_info['name']} avec un F1-score de {best_score:.4f}")
    
    # Sauvegarder le meilleur modèle pour un accès rapide par l'application
    os.makedirs('../models', exist_ok=True)
    best_model_path = '../models/best_model.pkl'
    joblib.dump(best_model_info['model'], best_model_path)
    print(f"Meilleur modèle sauvegardé: {best_model_path}")
