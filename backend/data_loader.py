import pandas as pd
import numpy as np
import os

# Valeurs autorisées pour la colonne 'carburant'
VALID_CARBURANTS = {'essence', 'diesel', 'electrique'}
VALID_TYPES = {'moto', 'voiture', 'camion'}

def load_data(filepath='../vehicle_data.csv', clean=True):
    """
    Charge, nettoie et valide le dataset des véhicules.
    
    Étapes de nettoyage :
    1. Suppression des doublons
    2. Suppression des valeurs manquantes (NaN)
    3. Validation des types de données
    4. Filtrage des valeurs aberrantes (outliers)
    5. Validation des catégories connues
    
    Retourne (X, y) : features et cible
    """
    # Résolution du chemin
    if not os.path.exists(filepath):
        filepath = 'vehicle_data.csv'

    if not os.path.exists(filepath):
        print("[ERREUR] Fichier dataset introuvable.")
        return None, None

    df = pd.read_csv(filepath)
    initial_count = len(df)
    report = {}

    if clean:
        print(f"\n{'='*50}")
        print(f"  NETTOYAGE DU DATASET ({initial_count} lignes initiales)")
        print(f"{'='*50}")

        # 1. Suppression des doublons
        before = len(df)
        df = df.drop_duplicates()
        report['doublons'] = before - len(df)
        print(f"[1] Doublons supprimés      : {report['doublons']}")

        # 2. Suppression des lignes avec valeurs manquantes
        before = len(df)
        df = df.dropna()
        report['nan'] = before - len(df)
        print(f"[2] Lignes NaN supprimées   : {report['nan']}")

        # 3. Forçage des types de données
        try:
            df['poids']    = pd.to_numeric(df['poids'],    errors='coerce')
            df['puissance'] = pd.to_numeric(df['puissance'], errors='coerce')
            df['portes']   = pd.to_numeric(df['portes'],   errors='coerce')
            before = len(df)
            df = df.dropna(subset=['poids', 'puissance', 'portes'])
            report['type_invalide'] = before - len(df)
            print(f"[3] Types invalides         : {report['type_invalide']}")
        except Exception as e:
            print(f"[WARN] Erreur de typage : {e}")

        # Conversion finale
        df['poids']    = df['poids'].astype(float)
        df['puissance'] = df['puissance'].astype(float)
        df['portes']   = df['portes'].astype(int)

        # 4. Filtrage des valeurs aberrantes (outliers physiquement impossibles)
        before = len(df)
        df = df[
            (df['poids']     >= 40)    & (df['poids']     <= 35000) &
            (df['puissance'] >= 1)     & (df['puissance'] <= 1200)  &
            (df['portes']    >= 0)     & (df['portes']    <= 4)
        ]
        # Suppression explicite de la classe '5 portes' demandée par l'utilisateur
        df = df[df['portes'] != 5]

        report['outliers'] = before - len(df)
        print(f"[4] Outliers physiques       : {report['outliers']}")

        # 5. Validation des catégories (carburant et type)
        before = len(df)
        df['carburant'] = df['carburant'].astype(str).str.strip().str.lower()
        df['type']      = df['type'].astype(str).str.strip().str.lower()
        df = df[df['carburant'].isin(VALID_CARBURANTS)]
        df = df[df['type'].isin(VALID_TYPES)]
        report['categorie_invalide'] = before - len(df)
        print(f"[5] Catégories invalides     : {report['categorie_invalide']}")

        # Rapport final
        final_count = len(df)
        total_removed = initial_count - final_count
        print(f"{'='*50}")
        print(f"  RESULTAT : {final_count} lignes valides / {initial_count} initiales")
        print(f"  Total supprimé : {total_removed} lignes ({100*total_removed/max(initial_count,1):.1f}%)")
        print(f"{'='*50}\n")

        # Sauvegarde du dataset nettoyé
        clean_path = filepath.replace('.csv', '_clean.csv')
        df.to_csv(clean_path, index=False)
        print(f"[SAVED] Dataset nettoyé sauvegardé : {clean_path}")

    # Distribution des classes
    print(f"\nDistribution des classes :")
    print(df['type'].value_counts().to_string())

    # Séparation features / cible
    X = df.drop('type', axis=1)
    y = df['type']

    return X, y


if __name__ == "__main__":
    X, y = load_data()
    if X is not None and y is not None:
        print("\nFeatures preview :\n", X.head())
        print("\nClasses :\n", y.value_counts())
    else:
        print("[ERREUR] Dataset introuvable.")
