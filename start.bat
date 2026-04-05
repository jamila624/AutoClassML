@echo off
setlocal enabledelayedexpansion

:: Couleurs (si possible)
set "ESC="
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "RESET=%ESC%[0m"

echo %BLUE%======================================================%RESET%
echo %BLUE%   CORRECTION ET LANCEMENT : ML DASHBOARD%RESET%
echo %BLUE%======================================================%RESET%

:: 1. Verification des prerequis
echo %YELLOW%[1/5] Verification des outils...%RESET%
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERREUR] Python n'est pas installe ou pas dans le PATH.%RESET%
    pause
    exit /b
)
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%[ERREUR] Node.js (npm) n'est pas installe ou pas dans le PATH.%RESET%
    pause
    exit /b
)
echo %GREEN%[OK] Outils systeme detectes.%RESET%

:: 2. Verification des ports
echo.
echo %YELLOW%[2/5] Verification des ports (8000, 5000, 5173)...%RESET%
set "ports=8000 5000 5173"
set "conflict=0"

for %%p in (%ports%) do (
    netstat -ano | findstr :%%p | findstr LISTENING >nul
    if !errorlevel! equ 0 (
        echo %RED%[ALERTE] Le port %%p est DEJA UTILISE.%RESET%
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do set "pid=%%a"
        echo         Process ID : !pid!
        set "conflict=1"
        
        set /p "choice=Voulez-vous tenter de liberer le port %%p ? (o/n) : "
        if /i "!choice!"=="o" (
            echo %YELLOW%Tentative d'arret du processus !pid!...%RESET%
            taskkill /F /PID !pid! >nul 2>&1
            if !errorlevel! equ 0 (
                echo %GREEN%[OK] Port %%p libere.%RESET%
            ) else (
                echo %RED%[ERREUR] Impossible de liberer le port %%p.%RESET%
            )
        ) else (
            echo %YELLOW%Poursuite avec risque de conflit...%RESET%
        )
    )
)

:: 3. Preparation Backend
echo.
echo %YELLOW%[3/5] Configuration Backend (FastAPI)...%RESET%
cd /d "%~dp0backend"
if not exist "venv\" (
    echo [INFO] Creation de l'environnement virtuel...
    python -m venv venv
)
echo [INFO] Installation des dependances (requierements.txt)...
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1
echo %GREEN%[OK] Backend pret.%RESET%

:: Lancement Backend & MLflow
echo %BLUE%--- Lancement des services Backend ---%RESET%
start "FastAPI Server" cmd /k "echo STARTING FASTAPI... && cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

start "MLflow UI" cmd /k "echo STARTING MLFLOW UI... && cd /d %~dp0backend && call venv\Scripts\activate.bat && mlflow ui --backend-store-uri file:../mlruns --host 0.0.0.0 --port 5000"
timeout /t 3 /nobreak >nul

:: 4. Preparation Frontend
echo.
echo %YELLOW%[4/5] Configuration Frontend (React/Vite)...%RESET%
cd /d "%~dp0frontend"
if not exist "node_modules\" (
    echo [INFO] Installation des composants npm (axios, lucide, recharts)...
    call npm install >nul 2>&1
)
echo %GREEN%[OK] Frontend pret.%RESET%

:: Lancement Frontend
echo %BLUE%--- Lancement du service Frontend ---%RESET%
start "React Frontend" cmd /k "echo STARTING FRONTEND... && cd /d %~dp0frontend && npm run dev -- --port 5173"

:: 5. Finalisation
echo.
echo %GREEN%======================================================%RESET%
echo %GREEN%   LE DASHBOARD EST MAINTENANT OPERATIONNEL !%RESET%
echo %GREEN%======================================================%RESET%
echo.
echo %YELLOW%Accedez aux services :%RESET%
echo - Backend API   : http://localhost:8000/docs
echo - MLflow Board  : http://localhost:5000
echo - Interface UI  : http://localhost:5173
echo.
echo %BLUE%Appuyez sur une touche pour fermer cet installateur.%RESET%
pause >nul
