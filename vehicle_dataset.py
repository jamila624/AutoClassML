import pandas as pd
import glob

# Récupérer tous les fichiers x*.dat
files = glob.glob("x*.dat")

# Lire et concaténer tous les fichiers en un seul DataFrame
# Utiliser une raw string r'\s+' pour le séparateur regex
df = pd.concat([pd.read_csv(f, header=None, sep=r'\s+') for f in files], ignore_index=True)

# Vérifier le dataset
print("Shape du dataset :", df.shape)
print(df.head())

# Sauvegarder en CSV pour un usage futur
df.to_csv("vehicle_dataset.csv", index=False, header=False)
