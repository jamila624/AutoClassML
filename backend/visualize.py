import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from data_loader import load_data
from preprocessing import preprocess_data

def visualize_pca():
    print("Chargement des données pour la PCA...")
    X, y = load_data()
    
    print("Application de la PCA (2 composantes)...")
    # Utilisons preprocess_data pour appliquer la standardisation et la PCA
    X_train_pca, _, y_train, _ = preprocess_data(X, y, apply_pca=True, n_components=2)
    
    print("Création du graphique...")
    
    # Création d'un DataFrame pour faciliter Seaborn
    df_pca = pd.DataFrame(data=X_train_pca, columns=['Principal Component 1', 'Principal Component 2'])
    
    # Inverse transform labels for better visualization legend
    from sklearn.preprocessing import LabelEncoder
    import joblib
    import os
    le = joblib.load(os.path.join('../models', 'label_encoder.pkl'))
    df_pca['Class'] = le.inverse_transform(y_train)

    plt.figure(figsize=(10, 8))
    sns.scatterplot(
        x='Principal Component 1', 
        y='Principal Component 2', 
        hue='Class', 
        palette='viridis', 
        data=df_pca,
        alpha=0.7
    )
    
    plt.title('Vehicle Dataset - PCA Visualization (2D)')
    plt.xlabel('Principal Component 1')
    plt.ylabel('Principal Component 2')
    plt.legend(title='Vehicle Type')
    plt.grid(True)
    
    output_path = "pca_visualization.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Graphique sauvegardé avec succès sous '{output_path}'")
    
    # Optionally display if supported by the environment, but saving is safer
    # plt.show()

if __name__ == "__main__":
    visualize_pca()
