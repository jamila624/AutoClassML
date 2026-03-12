import mlflow

def evaluate_models():
    """
    Script pour interroger MLflow et afficher les performances de tous les runs d'entraînement.
    Utile pour comparer SVM vs KNN vs Random Forest vs LogReg
    """
    
    # Pointer MLflow vers notre répertoire local
    mlflow.set_tracking_uri("file:../mlruns")
    
    experiment = mlflow.get_experiment_by_name("vehicle_classification")
    if not experiment:
        print("Veuillez lancer 'train.py' d'abord. Aucune expérience 'vehicle_classification' trouvée.")
        return

    # Chercher tous les runs
    runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
    
    if runs.empty:
        print("Aucun run trouvé dans l'expérience.")
        return
        
    print("\n========= RÉSULTATS D'ÉVALUATION =========\n")
    
    # Les colonnes de DataFrame contiennent "metrics.xxxx"
    cols_to_print = ['tags.mlflow.runName', 'metrics.accuracy', 'metrics.precision', 'metrics.recall', 'metrics.f1_score']
    
    try:
        results = runs[cols_to_print].copy()
        results.columns = ['Modèle', 'Accuracy', 'Precision', 'Recall', 'F1-Score']
        
        results = results.sort_values(by="F1-Score", ascending=False)
        
        # Format the numbers nicely
        for col in ['Accuracy', 'Precision', 'Recall', 'F1-Score']:
            results[col] = results[col].apply(lambda x: f"{x:.4f}")
            
        print(results.to_string(index=False))
        print("\n==========================================\n")
        
        # Get best model
        best_run = runs.iloc[runs['metrics.f1_score'].idxmax()]
        print(f"🏆 Le meilleur modèle est {best_run['tags.mlflow.runName']} avec F1-score: {best_run['metrics.f1_score']:.4f}")
        
    except KeyError as e:
        print(f"Erreur en lisant les métriques : {e}. Assurez-vous d'avoir complété un run d'entraînement.")

if __name__ == "__main__":
    evaluate_models()
