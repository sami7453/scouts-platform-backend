# Scouts Platform Backend

Ce projet est le backend d’une plateforme de mise en relation entre **scouts** (éditant des rapports payants sur des joueurs) et **clubs** (achetant ces rapports). Il est écrit en **Node.js/Express** avec **PostgreSQL**, intègre **Stripe Connect Express** pour la gestion des paiements et permet :

* Authentification JWT (scouts, clubs, admin)
* Profil métiers (scouts et clubs) avec upload de photo via Multer
* CRUD des rapports de joueurs
* Paiement Stripe Checkout + redistribution automatique des fonds (commission + versement au scout)
* Webhook Stripe pour insertion atomique des ventes et payouts
* Endpoints d’historique pour clubs (achats) et scouts (gains)
* Mise à jour sécurisée de l’email et du mot de passe utilisateur

---

## Table des matières

1. [Installation & configuration](#installation--configuration)
2. [Structure du projet](#structure-du-projet)
3. [Base de données](#base-de-données)
4. [Variables d’environnement](#variables-denvironnement)
5. [Middlewares clés](#middlewares-clés)
6. [Routes & Endpoints](#routes--endpoints)
7. [Flux Stripe Connect](#flux-stripe-connect)
8. [Exemples d’utilisation Postman](#exemples-dutilisation-postman)
9. [Conseils front-end](#conseils-front-end)

---

## Installation & configuration

```bash
git clone https://github.com/ton-org/scouts-platform-backend.git
cd scouts-platform-backend
npm install
```

1. Crée ta base PostgreSQL et exécute le fichier de schéma (`schema.sql`) fourni.
2. Copie `.env.example → .env` et configure tes clés (voir section Variables).
3. Démarre le serveur :

   ```bash
   npm run dev
   ```

---

## Structure du projet

```
├── src
│   ├── index.js            
│   ├── db.js               
│   ├── utils/stripe.js     
│   ├── middleware/         
│   │   ├── auth.js        
│   │   └── validate.js    
│   ├── models/            
│   │   ├── userModel.js   
│   │   ├── scoutModel.js  
│   │   ├── clubModel.js   
│   │   ├── reportModel.js
│   │   ├── saleModel.js   
│   │   └── payoutModel.js
│   ├── services/          
│   │   ├── authService.js
│   │   ├── scoutService.js
│   │   ├── clubService.js
│   │   ├── reportService.js
│   │   ├── saleService.js  
│   │   └── stripeService.js
│   ├── controllers/       
│   │   ├── authController.js
│   │   ├── scoutController.js
│   │   ├── clubController.js
│   │   ├── reportController.js
│   │   ├── saleController.js
│   │   ├── payoutController.js
│   │   └── webhookController.js
│   └── routes/            
│       ├── auth.js        
│       ├── scouts.js      
│       ├── clubs.js       
│       ├── reports.js     
│       ├── sales.js       
│       ├── payouts.js     
│       ├── webhook.js     
│       └── stripe.js      
└── uploads/              
```

---

## Base de données

### Tables principales

* **users** `(id, email, password_hash, role)`
* **scouts** `(id, user_id → users.id, photo_url, bio, vision_qa, test_report_url, stripe_account_id)`
* **clubs** `(id, user_id → users.id, name, info, photo_url, bio)`
* **reports** `(id, scout_id → scouts.id, player_firstname, player_lastname, position, nationality, age, current_club, current_league, price_cents, pdf_url, created_at)`
* **sales** `(id, report_id → reports.id, club_id → users.id, amount_cents, commission_cents, stripe_payment_intent, purchased_at DEFAULT NOW())`
* **payouts** `(id, sale_id → sales.id, scout_id → scouts.id, amount_cents, stripe_payout_id, paid_at DEFAULT NOW())`

### Index recommandés

```sql
CREATE INDEX ON reports(player_lastname, player_firstname);
CREATE INDEX ON reports(current_club, current_league);
CREATE INDEX ON sales(club_id);
CREATE INDEX ON payouts(scout_id);
```

---

## Variables d’environnement

```dotenv
DATABASE_URL=postgres://user:pass@localhost:5432/scouts
JWT_SECRET=tonSecretUltraSeul
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
COMMISSION_RATE=0.20
FRONT_URL=http://localhost:3000
```

---

## Middlewares clés

* **`verifyToken`** (JWT) : protège les routes `api/...`
* **`validate`** (express-validator) : gère la validation des inputs
* **Multer** : upload des images (`upload.single('photo')`)

---

## Routes & Endpoints

### Auth

| Méthode | URL                  | Body                        | Auth | Description                 |
| ------- | -------------------- | --------------------------- | ---- | --------------------------- |
| POST    | `/api/auth/register` | `{ email, password, role }` | ❌    | Créer un utilisateur        |
| POST    | `/api/auth/login`    | `{ email, password }`       | ❌    | Recevoir un JWT             |
| GET     | `/api/auth/profile`  | —                           | ✅    | Récupérer email + role      |
| PATCH   | `/api/auth/profile`  | `{ email?, password? }`     | ✅    | Modifier email/mot de passe |

### Scout Profile

| Méthode | URL                        | Body (form-data)      | Auth | Description               |
| ------- | -------------------------- | --------------------- | ---- | ------------------------- |
| PATCH   | `/api/scouts/profile`      | `photo` (File), `bio` | ✅    | Mettre à jour photo & bio |
| GET     | `/api/scouts/profile/full` | —                     | ✅    | Récupérer profil complet  |

### Club Profile

| Méthode | URL                       | Body (form-data)                  | Auth | Description                    |
| ------- | ------------------------- | --------------------------------- | ---- | ------------------------------ |
| PATCH   | `/api/clubs/profile`      | `photo`, `name?`, `info?`, `bio?` | ✅    | Mettre à jour photo, nom, etc. |
| GET     | `/api/clubs/profile/full` | —                                 | ✅    | Récupérer profil complet       |

### Reports

| Méthode | URL                | Body (form-data)              | Auth | Description          |
| ------- | ------------------ | ----------------------------- | ---- | -------------------- |
| POST    | `/api/reports`     | player\_\*, price\_cents, pdf | ✅    | Créer un rapport     |
| GET     | `/api/reports`     | ?firstname=&...               | ✅    | Lister / rechercher  |
| GET     | `/api/reports/:id` | —                             | ✅    | Lire un rapport      |
| PUT     | `/api/reports/:id` | `{ price_cents }`             | ✅    | Mettre à jour prix   |
| DELETE  | `/api/reports/:id` | —                             | ✅    | Supprimer un rapport |

### Paiements & Historique

| Méthode | URL                    | Body              | Auth | Description                              |
| ------- | ---------------------- | ----------------- | ---- | ---------------------------------------- |
| POST    | `/api/stripe/onboard`  | —                 | ✅    | Générer lien onboarding Stripe           |
| GET     | `/complete`            | —                 | ❌    | Callback fin onboarding                  |
| POST    | `/api/sales/checkout`  | `{ reportId }`    | ✅    | Créer session Stripe Checkout            |
| GET     | `/api/sales/history`   | —                 | ✅    | Historique d’achats club                 |
| GET     | `/api/payouts/history` | —                 | ✅    | Historique de gains scout                |
| POST    | `/webhook`             | (raw JSON Stripe) | ❌    | Webhook Stripe (insert sales+payouts)    |
| GET     | `/success`             | —                 | ❌    | Redirect front après paiement réussi     |
| GET     | `/cancel`              | —                 | ❌    | Redirect front après annulation paiement |

---

## Flux Stripe Connect

1. **Onboarding Scout**

   * Back : `POST /api/stripe/onboard` → renvoie URL Express
   * Front : redirige vers Stripe, remplit IBAN, revient sur `/complete`

2. **Paiement Club**

   * Front : `POST /api/sales/checkout`
   * Stripe Checkout avec `transfer_data.destination` vers scout
   * Redirection front sur `/success`

3. **Webhook Confirmation**

   * Stripe → `POST /webhook`
   * Backend vérifie signature, insert `sales` + `payouts` en transaction

---

## Exemples d’utilisation Postman

1. Inscription & login
2. Onboarding Stripe
3. PATCH `/api/scouts/profile` (form-data + photo)
4. POST `/api/reports` (form-data + PDF)
5. POST `/api/sales/checkout` → simulate payment via Stripe CLI
6. Stripe CLI envoie webhook → vérifie tables
7. GET `/api/sales/history` / `/api/payouts/history`

---

## Conseils front-end

* Utiliser `Authorization: Bearer <token>` pour toutes les routes JWT.
* `FormData()` pour les PATCH de profiles.
* Redirect via `window.location.href` sur les URLs Stripe.
* Gérer 400/401 pour UX claire.

