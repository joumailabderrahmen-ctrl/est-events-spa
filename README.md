# EST Events — Plateforme de Gestion d'Événements

[![GitHub](https://img.shields.io/badge/GitHub-est--events--spa-1a237e?style=flat&logo=github)](https://github.com/joumailabderrahmen-ctrl/est-events-spa)

Application Web Full-Stack développée dans le cadre du module **Développement Web Avancé** à l'École Supérieure de Technologie de Dakhla.

> **Dépôt** : https://github.com/joumailabderrahmen-ctrl/est-events-spa

---

## Fonctionnalités

- **Catalogue d'événements** — liste, filtres par catégorie/prix, recherche textuelle, détail avec places restantes
- **Réservation Drag & Drop** — panier multi-événements avec l'API HTML5 native, formulaire réactif Angular
- **Authentification JWT** — inscription, connexion, rôles admin/étudiant, guards et intercepteurs Angular
- **Interface Admin** — CRUD événements avec upload d'image, gestion des réservations (confirmer/annuler)
- **Dashboard analytique** — graphiques Chart.js (donut catégories + barres par mois), KPI temps réel
- **Chat temps réel** — WebSocket bidirectionnel, historique des messages, compteur d'utilisateurs actifs
- **APIs HTML5 avancées** — Géolocalisation + Leaflet, WebRTC webcam, Canvas API, localStorage
- **Sécurité** — Helmet, CORS, Rate-limiting, bcrypt, validation express-validator
- **Tests unitaires** — 69 tests Jest (backend) + Jasmine/Karma (frontend), 100% passing

---

## Stack Technique

| Couche | Technologies |
|---|---|
| **Frontend** | Angular 17, Bootstrap 5, Bootstrap Icons, Chart.js |
| **Backend** | Node.js, Express 5, Mongoose 9, Multer, ws |
| **Base de données** | MongoDB 8 |
| **Sécurité** | JWT, bcryptjs, Helmet, express-rate-limit, CORS |
| **Tests** | Jest, Jasmine, Karma |

---

## Prérequis

- [Node.js](https://nodejs.org) v18 ou v20 LTS
- [MongoDB Community](https://www.mongodb.com/try/download/community) v8.x
- Angular CLI : `npm install -g @angular/cli`

---

## Lancement rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/joumailabderrahmen-ctrl/est-events-spa.git
cd Platform_GRE_EST
```

### 2. Démarrer MongoDB

```powershell
# Si mongod n'est pas dans le PATH, ajouter MongoDB (adapter la version) :
$mongoPath = "C:\Program Files\MongoDB\Server\8.2\bin"
$env:Path += ";$mongoPath"
mongod --dbpath "C:\data\db"
```

### 3. Backend

```bash
cd PROJET_SPA_EST_EVENTS/backend-node
npm install
npm run seed       # Peuple la BDD (événements + utilisateurs + réservations)
npm run dev        # Lance le serveur sur http://localhost:3000
```

> Le fichier `.env` est déjà inclus dans le dépôt — aucune configuration manuelle requise.

### 4. Frontend

```bash
cd ../frontend-angular
npm install
ng serve           # Lance l'app sur http://localhost:4200
```

Ouvrir **http://localhost:4200** dans le navigateur.

---

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| **Administrateur** | admin@est-dakhla.ac.ma | admin123 |
| **Étudiant** | ahmed@est.ma | password123 |

---

## Structure du projet

```
est-events-spa/
├── README.md
└── PROJET_SPA_EST_EVENTS/
    ├── backend-node/
    │   ├── config/
    │   │   └── db.js                    # Connexion MongoDB
    │   ├── controllers/
    │   │   ├── authController.js        # Login / Register
    │   │   ├── eventController.js       # CRUD événements + upload image
    │   │   └── reservationController.js # Réservations
    │   ├── middleware/
    │   │   ├── authenticate.js          # Vérification JWT
    │   │   ├── requireAdmin.js          # Contrôle rôle admin
    │   │   └── upload.js                # Multer (upload images)
    │   ├── models/
    │   │   ├── Event.js
    │   │   ├── Reservation.js
    │   │   └── User.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── events.js
    │   │   └── reservations.js
    │   ├── tests/                       # 69 tests Jest
    │   ├── uploads/                     # Images des événements
    │   ├── websocket/
    │   │   └── chatServer.js            # Chat temps réel (ws)
    │   ├── .env                         # Variables d'environnement
    │   ├── seed.js                      # Données de démo
    │   └── server.js                    # Point d'entrée Express
    └── frontend-angular/
        └── src/
            ├── assets/
            │   ├── audio/               # Musique d'ambiance
            │   ├── images/              # Images statiques + logo
            │   └── videos/              # Vidéo hero page d'accueil
            └── app/
                ├── admin/               # Panel administrateur
                ├── apis-avancees/       # WebSocket · WebRTC · Geolocation · Canvas
                ├── apropos/             # Page à propos du projet
                ├── auth/
                │   ├── login/
                │   └── register/
                ├── contact/
                ├── dashboard/           # Statistiques Chart.js
                ├── events/
                │   └── event-detail/
                ├── home/                # Page d'accueil + hero vidéo
                ├── not-found/           # Page 404
                ├── profil/              # Profil + WebRTC/Canvas
                ├── reservation/         # Panier Drag & Drop
                ├── weblab/              # Chat WebSocket + carte Leaflet
                └── shared/
                    ├── animations/      # Animations de routes Angular
                    ├── components/
                    │   ├── navbar/
                    │   └── footer/
                    ├── guards/          # AuthGuard · AdminGuard
                    ├── interceptors/    # AuthInterceptor (JWT)
                    ├── models/          # Interfaces TypeScript
                    └── services/        # EventService · AuthService · ...
```

---

## Tests

```bash
# Backend (Jest)
cd PROJET_SPA_EST_EVENTS/backend-node
npm test

# Frontend (Jasmine / Karma)
cd PROJET_SPA_EST_EVENTS/frontend-angular
ng test --watch=false
```

---

## Auteur

**JOUMAIL Abderrahmane**  
1ère année — Conception et Développement de Logiciel (CDL)  
École Supérieure de Technologie de Dakhla · Année universitaire 2025–2026  
[joumailabderrahmen@gmail.com](mailto:joumailabderrahmen@gmail.com)
