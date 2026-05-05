# EST Events — Plateforme de Gestion d'Événements

Application web full-stack SPA développée dans le cadre du module **Développement Web Avancé**.  
**Auteur :** JOUMAIL Abderrahmane — CDL 1ère année — EST Dakhla 2025-2026

---

## Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | Angular 17 (SPA, Routing, Guards, Interceptors, Reactive Forms, Animations) |
| Backend | Node.js + Express 5 (API REST + WebSocket) |
| Base de données | MongoDB 8 + Mongoose 9 |
| Sécurité | JWT, bcrypt, Helmet, CORS, Rate-limiting |
| APIs HTML5 | WebSocket, WebRTC, Geolocation, Canvas, Drag & Drop |
| Tests | Jest (69 tests backend) + Jasmine/Karma (frontend) |

---

## Prérequis

- **Node.js** v18 ou v20 LTS — https://nodejs.org
- **MongoDB** v8 Community — https://www.mongodb.com/try/download/community
- **Angular CLI** v17 — `npm install -g @angular/cli@17`

---

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/joumailabderrahmen-ctrl/est-events-spa.git
cd est-events-spa/PROJET_SPA_EST_EVENTS
```

### 2. Démarrer MongoDB

**Windows (PowerShell en tant qu'Administrateur) :**
```powershell
# Adapter 8.2 à la version installée
$p = "C:\Program Files\MongoDB\Server\8.2\bin"
[Environment]::SetEnvironmentVariable("Path",
  [Environment]::GetEnvironmentVariable("Path","Machine") + ";$p", "Machine")
mongod --dbpath "C:\data\db"
```

Laisser ce terminal ouvert.

### 3. Configurer le backend

```bash
cd backend-node
npm install
```

Créer le fichier `.env` à la racine de `backend-node/` :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/est_events
CLIENT_URL=http://localhost:4200
JWT_SECRET=est_events_secret_key_2025_dakhla
```

### 4. Peupler la base de données (seed)

```bash
npm run seed
```

Cette commande insère automatiquement :
- **8 événements** avec leurs images (Hackathon, Soirée Culturelle, Football, etc.)
- **4 utilisateurs** (1 admin + 3 étudiants)
- **3 réservations** de démonstration

Comptes créés :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@est-dakhla.ac.ma | admin123 |
| Étudiant | ahmed@est.ma | password123 |
| Étudiant | fatima@est.ma | password123 |

### 5. Démarrer le backend

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

### 6. Démarrer le frontend

Ouvrir un nouveau terminal :

```bash
cd ../frontend-angular
npm install
ng serve
```

L'application est accessible sur **http://localhost:4200**

---

## Fonctionnalités principales

- **Accueil** — Liste des événements avec filtres par catégorie et prix
- **Réservation** — Panier Drag & Drop HTML5 natif (`/reservation`)
- **Dashboard** — Statistiques Chart.js (donut + barres) (`/dashboard`)
- **Authentification** — JWT (login/register) avec Reactive Forms
- **Profil** — Capture photo WebRTC/Canvas (`/profil`)
- **WebLab** — Chat WebSocket temps réel + carte Leaflet/OpenStreetMap (`/apis`)
- **Admin** — Gestion complète des événements + upload image Multer (`/admin`)

---

## Tests

```bash
# Backend (Jest — 69 tests)
cd backend-node
npm test

# Frontend (Jasmine/Karma)
cd frontend-angular
ng test
```

---

## Structure du projet

```
PROJET_SPA_EST_EVENTS/
├── backend-node/
│   ├── config/          # Connexion MongoDB
│   ├── controllers/     # Logique métier
│   ├── middleware/      # JWT, requireAdmin, Multer
│   ├── models/          # Schémas Mongoose
│   ├── routes/          # Endpoints API REST
│   ├── tests/           # Tests Jest
│   ├── uploads/         # Images événements
│   ├── websocket/       # Serveur chat
│   ├── seed.js          # Données de démo
│   └── server.js        # Point d'entrée
└── frontend-angular/
    └── src/app/
        ├── core/        # Guards, Interceptors, Services
        ├── shared/      # Navbar, Footer
        └── [composants] # home, events, dashboard, profil...
```
