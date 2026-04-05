import sys
import os
sys.path.append(os.path.abspath('backend'))
from fastapi.testclient import TestClient
from backend.app import app
import json

client = TestClient(app)

def run_tests():
    print("=== Début des Tests Automatisés ===")
    
    # 1. Valeurs valides (Sans warnings)
    print("\n1. Test valeurs valides (attendu : success, pas de warnings)")
    res = client.post("/predict", json={
        "poids": 1500,
        "puissance": 120,
        "carburant": "essence",
        "portes": 4
    })
    assert res.status_code == 200, f"Erreur inattendue : {res.text}"
    warnings = res.json().get("warnings", [])
    assert len(warnings) == 0, f"Warnings inattendus : {warnings}"
    print("✅ OK - Pas de warnings.")

    # 2. Valeurs invalides au niveau Pydantic (Erreur 422)
    print("\n2. Test valeurs invalides (attendu : Erreur 422)")
    res = client.post("/predict", json={
        "poids": 10, # Trop léger
        "puissance": 100,
        "carburant": "essence",
        "portes": 4
    })
    assert res.status_code == 400 or res.status_code == 422, f"Statut inattendu : {res.status_code}"
    print(f"✅ OK - Erreur gérée. Statut: {res.status_code}")

    # 3. Combinaisons incohérentes (Avertissements mais statut 200) - Option B
    print("\n3. Test combinaison incohérente (Moto lourde) (attendu : success, avec warnings)")
    res = client.post("/predict", json={
        "poids": 4000,
        "puissance": 150,
        "carburant": "essence",
        "portes": 0 # Moto
    })
    assert res.status_code == 200, "Option B non respectée, la requête a été bloquée !"
    warnings = res.json().get("warnings", [])
    assert len(warnings) > 0, "Aucun warning retourné pour cette combinaison incohérente !"
    print(f"✅ OK - Avertissements générés ({len(warnings)}). La prédiction est bien passée (Option B).")
    for w in warnings:
        print(f"   ⚠️ {w}")

    print("\n=== Tous les tests sont validés avec succès ! ===")

if __name__ == "__main__":
    run_tests()
