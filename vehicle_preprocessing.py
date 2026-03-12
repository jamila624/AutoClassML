import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

# Charger le dataset nettoyé
df = pd.read_csv("vehicle_dataset_clean.csv", header=None)

# Séparer les features (colonnes 0 à 17) et la target (colonne 18)
X = df.iloc[:, :-1].values  # features
y = df.iloc[:, -1].values   # labels

# Encoder les labels textuels en valeurs numériques
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print("Classes encodées :", dict(zip(label_encoder.classes_, range(len(label_encoder.classes_)))))

# Standardiser les features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Séparer en train / test
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print("\nTaille des ensembles :")
print("X_train :", X_train.shape, "y_train :", y_train.shape)
print("X_test  :", X_test.shape, "y_test  :", y_test.shape)

# Sauvegarde du scaler et de l'encodeur si nécessaire (pour MLflow ou production)
import joblib
joblib.dump(scaler, "scaler.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")
print("\nScaler et LabelEncoder sauvegardés pour usage futur.")