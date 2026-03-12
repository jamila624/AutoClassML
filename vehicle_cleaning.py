import pandas as pd

# Charger le dataset CSV déjà créé
df = pd.read_csv("vehicle_dataset.csv", header=None)

# Vérifier les valeurs manquantes
missing = df.isnull().sum()
print("Valeurs manquantes par colonne :\n", missing)

# Supprimer les doublons si présents
duplicates = df.duplicated().sum()
print("\nNombre de doublons :", duplicates)
if duplicates > 0:
    df = df.drop_duplicates()
    print("Doublons supprimés. Nouvelle taille :", df.shape)

# Vérifier les types de colonnes
print("\nTypes de colonnes :")
print(df.dtypes)

# Vérifier un aperçu du dataset
print("\nAperçu des données :")
print(df.head())

# Sauvegarder le dataset nettoyé
df.to_csv("vehicle_dataset_clean.csv", index=False, header=False)
print("\nDataset nettoyé sauvegardé sous 'vehicle_dataset_clean.csv'")