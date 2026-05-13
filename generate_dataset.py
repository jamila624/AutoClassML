import pandas as pd
import numpy as np
import sys

# Corriger l'encodage sur Windows pour les emojis (✅)
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Fonction pour générer les données par type (avec chevauchements pour réalisme)
def generate_vehicles(n, type_vehicule):
    if type_vehicule == 'moto':
        poids = np.random.randint(100, 500, n)
        puissance = np.random.randint(10, 100, n)
        carburant = np.random.choice(['essence', 'electrique'], n, p=[0.9, 0.1])
        portes = np.random.choice([0, 1], n, p=[0.95, 0.05])
    elif type_vehicule == 'voiture':
        poids = np.random.randint(400, 2800, n)
        puissance = np.random.randint(45, 450, n)
        carburant = np.random.choice(['essence', 'diesel', 'electrique'], n, p=[0.5, 0.3, 0.2])
        portes = np.random.choice([2, 3, 4], n)
    elif type_vehicule == 'camion':
        poids = np.random.randint(2200, 25000, n)
        puissance = np.random.randint(150, 900, n)
        carburant = np.random.choice(['diesel', 'electrique', 'essence'], n, p=[0.8, 0.15, 0.05])
        portes = np.random.choice([2, 3], n)
    
    df_temp = pd.DataFrame({
        'poids': poids,
        'puissance': puissance,
        'carburant': carburant,
        'portes': portes,
        'type': [type_vehicule]*n
    })
    
    # Ajout de bruit : inverser certaines caractéristiques ou labels (environ 8%)
    noise_idx = df_temp.sample(frac=0.08).index
    df_temp.loc[noise_idx, 'poids'] = df_temp.loc[noise_idx, 'poids'] * np.random.uniform(0.5, 2.0)
    
    return df_temp

# Générer le dataset complet (plus volumineux pour capturer la complexité)
df = pd.concat([
    generate_vehicles(400, 'moto'),
    generate_vehicles(600, 'voiture'),
    generate_vehicles(300, 'camion')
], ignore_index=True)

# -------------------
# 🔹 Nettoyage des données
# -------------------

# 1. Supprimer doublons
df.drop_duplicates(inplace=True)

# 2. Vérifier valeurs manquantes
df.dropna(inplace=True)

# 3. Convertir types correctement
df['poids'] = df['poids'].astype(int)
df['puissance'] = df['puissance'].astype(int)
df['carburant'] = df['carburant'].astype(str)
df['portes'] = df['portes'].astype(int)
df['type'] = df['type'].astype(str)

# 4. Vérification rapide
print("Aperçu des 5 premières lignes :")
print(df.head())
print("\nRésumé du dataset :")
print(df.info())

# -------------------
# 🔹 Sauvegarder le CSV automatiquement
# -------------------
csv_filename = "vehicle_data.csv"  # Nom utilisé par le backend existant
df.to_csv(csv_filename, index=False)
print(f"\n✅ Dataset généré et nettoyé : {csv_filename}")
