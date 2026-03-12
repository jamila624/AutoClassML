import pandas as pd
import os

def load_data(filepath='../vehicle_dataset.csv'):
    """
    Charge le dataset des véhicules.
    Le fichier n'a pas d'en-tête, on nomme les 18 features + la cible.
    """
    # Si le chemin relatif ne marche pas depuis le dossier backend, on essaie depuis la racine
    if not os.path.exists(filepath):
        filepath = 'vehicle_dataset.csv'
        
    column_names = [f'feature_{i}' for i in range(1, 19)] + ['target']
    df = pd.read_csv(filepath, names=column_names, header=None)
    
    X = df.drop('target', axis=1)
    y = df['target']
    
    return X, y

if __name__ == "__main__":
    X, y = load_data()
    print("Features shape:", X.shape)
    print("Classes distribution:\n", y.value_counts())
