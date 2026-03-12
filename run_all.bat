@echo off
echo ==============================================
echo Vehicle Classification - Démarrage Complet
echo ==============================================

echo [1/3] Lancement de l'API FastAPI...
start cmd /k "cd d:\projet_machine_learning\project_nomProjet\backend && uvicorn app:app --reload --host 0.0.0.0 --port 8000"

echo [2/3] Lancement de l'interface MLflow...
start cmd /k "cd d:\projet_machine_learning\project_nomProjet\backend && mlflow ui --backend-store-uri file:../mlruns"

echo [3/3] Lancement de l'interface React...
start cmd /k "cd d:\projet_machine_learning\project_nomProjet\frontend && npm run dev"

echo.
echo Tous les services sont en cours de démarrage dans de nouvelles fenêtres.
echo FastAPI   : http://localhost:8000/docs
echo MLflow    : http://localhost:5000
echo Frontend  : http://localhost:5173
echo ==============================================
pause
