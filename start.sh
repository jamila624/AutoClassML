#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   CORRECTION ET LANCEMENT : ML DASHBOARD (POSIX)${NC}"
echo -e "${BLUE}======================================================${NC}"

# Fonction pour tuer tous les processus fils en quittant
cleanup() {
    echo -e "\n${RED}==============================================${NC}"
    echo -e "${RED}Fermeture de tous les services...${NC}"
    echo -e "${RED}==============================================${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Verification des outils
echo -e "${YELLOW}[1/5] Verification des outils...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERREUR] Python 3 n'est pas installe.${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERREUR] Node.js (npm) n'est pas installe.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Outils systeme detectes.${NC}"

# 2. Verification des ports
echo -e "\n${YELLOW}[2/5] Verification des ports (8000, 5000, 5173)...${NC}"
for port in 8000 5000 5173; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
        echo -e "${RED}[ALERTE] Le port $port est DEJA UTILISE par le processus $pid.${NC}"
        read -p "Voulez-vous tuer ce processus ? (o/n) : " choice
        if [ "$choice" == "o" ]; then
            kill -9 $pid
            echo -e "${GREEN}[OK] Port $port libere.${NC}"
        fi
    fi
done

# 3. Preparation Backend
echo -e "\n${YELLOW}[3/5] Configuration Backend (FastAPI)...${NC}"
cd backend || exit
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}[OK] Backend pret.${NC}"

# Lancement Backend & MLflow en arriere-plan
echo -e "${BLUE}--- Lancement des services Backend ---${NC}"
uvicorn app:app --reload --host 0.0.0.0 --port 8000 &
sleep 3
mlflow ui --backend-store-uri file:../mlruns --host 0.0.0.0 --port 5000 &
sleep 3

cd ..

# 4. Preparation Frontend
echo -e "\n${YELLOW}[4/5] Configuration Frontend (React/Vite)...${NC}"
cd frontend || exit
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi
echo -e "${GREEN}[OK] Frontend pret.${NC}"

# Lancement Frontend en arriere-plan
echo -e "${BLUE}--- Lancement du service Frontend ---${NC}"
npm run dev -- --port 5173 &

# 5. Finalisation
echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   LE DASHBOARD EST MAINTENANT OPERATIONNEL !${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "\n${YELLOW}Accedez aux services :${NC}"
echo -e "- Backend API   : http://localhost:8000/docs"
echo -e "- MLflow Board  : http://localhost:5000"
echo -e "- Interface UI  : http://localhost:5173"
echo -e "\n${BLUE}Pressez CTRL+C pour arreter tous les services.${NC}"

# Attendre infiniment
wait
