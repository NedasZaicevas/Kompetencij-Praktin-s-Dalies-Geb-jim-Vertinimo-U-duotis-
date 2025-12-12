# Renginiai (praktinė užduotis)

Trumpai: renginių platforma su registracija/login, rolėmis (USER/ADMIN), kategorijomis ir renginiais.

## Reikalavimai
- Docker + Docker Compose (rekomenduojama)
- (be Docker) Node 18+ ir MySQL DB

## 1 Serverio paleidimas (API + DB) su Docker
Iš projekto šaknies (kur yra `docker-compose.yml`):

```bash
docker compose up -d --build


#  Frontendo paleidimas (React + Vite)
cd client
npm install
npm run dev

# Demo prisijungimai

ADMIN

email: test@t.lt

password: test123

USER

email: nedas@gmail.com

password: nedas

API adresas

Backend: http://localhost:4000
Frontend: http://localhost:5173 