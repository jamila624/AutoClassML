import requests
import sys
import os
import io

# Corriger l'encodage sur Windows pour les emojis (✅, ❌, 🔍, etc.)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuration
API_URL = "http://127.0.0.1:8000"

def run_diagnostics():
    print(f"🔍 DIAGNOSTIC DE CONNEXION : {API_URL}\n")
    
    # 1. Test de base (Accessibilité)
    try:
        print("1️⃣ Test d'accessibilité (GET /)...", end=" ", flush=True)
        response = requests.get(f"{API_URL}/", timeout=5)
        response.raise_for_status()
        print("✅ OK")
        print(f"   Réponse : {response.json().get('message')}")
    except Exception as e:
        print(f"❌ ÉCHEC : {e}")
        print("   → Vérifiez que le backend FastAPI est lancé (uvicorn).")
        return

    # 2. Test de la route de prédiction (POST /predict)
    try:
        print("\n2️⃣ Test de la route de prédiction (POST /predict)...", end=" ", flush=True)
        
        # Données de test conformes au schéma attendu par app.py
        payload = {
            "poids": 1200.0,
            "puissance": 100.0,
            "carburant": "essence",
            "portes": 4
        }
        
        response = requests.post(f"{API_URL}/predict", json=payload, timeout=5)
        response.raise_for_status()
        
        result = response.json()
        print("✅ REUSSI")
        print(f"   Prédiction : {result.get('prediction_class').upper()}")
        print(f"   ID Classe : {result.get('prediction_id')}")
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 500:
            print("❌ ERREUR 500")
            print("   → Les modèles ML ne sont probablement pas entraînés.")
            print("   → Allez sur le Dashboard et cliquez sur 'Lancer l'Apprentissage'.")
        else:
            print(f"❌ ERREUR HTTP {e.response.status_code} : {e}")
    except Exception as e:
        print(f"❌ ÉCHEC : {e}")

    # 3. Vérification CORS (Simulation simplifiée)
    print("\n3️⃣ Vérification CORS (Théorique)...", end=" ", flush=True)
    app_path = "backend/app.py" if os.path.exists("backend/app.py") else "app.py"
    if os.path.exists(app_path) and "CORSMiddleware" in open(app_path).read():
        print("✅ CONFIGURÉ (Middleware détecté)")
    else:
        print("⚠️ NON DÉTECTÉ (Vérifiez app.py)")

    print("\n🚀 Diagnostic terminé.")

if __name__ == "__main__":
    run_diagnostics()
