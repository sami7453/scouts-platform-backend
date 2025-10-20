// src/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

/* ===================== CORS ===================== */
const isProd = process.env.NODE_ENV === 'production';

// Liste des origines autorisées (whitelist)
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Pour le développement local de votre front
  process.env.FRONT_URL,   // L'URL de production de votre front
  process.env.FRONT_URL_ALT, // Une URL alternative si besoin
].filter(Boolean); // Retire les entrées vides si les variables d'env ne sont pas définies

const corsOptions = {
  origin(origin, cb) {
    // Autoriser les requêtes sans 'origin' (ex: Postman, apps mobiles, curl)
    if (!origin) {
      return cb(null, true);
    }
    
    // Vérifier si l'origine de la requête est dans notre liste blanche
    if (ALLOWED_ORIGINS.includes(origin)) {
      cb(null, true);
    } else {
      // Si non, rejeter la requête avec une erreur
      cb(new Error(`L'origine ${origin} n'est pas autorisée par notre politique CORS.`));
    }
  },
  credentials: true, // Autorise l'envoi de cookies et d'en-têtes d'authentification
};

// Appliquer le middleware CORS UNE SEULE FOIS, avant toutes les autres routes.
// Il gérera automatiquement les requêtes preflight (OPTIONS).
app.use(cors(corsOptions));
/* ================================================ */


/** Option recommandé derrière un proxy (Railway/Vercel) */
app.set('trust proxy', 1);

/* ===================== Webhook Stripe ===================== */
/**
 * IMPORTANT : le webhook Stripe doit lire le RAW BODY et donc
 * doit être monté AVANT express.json().
 */
const webhookRouter = require('./routes/webhook');
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);
/* ========================================================= */

/* ===================== Body parsers ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* ======================================================= */

/* ===================== Imports de routes ===================== */
const { verifyToken } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const scoutRoutes = require('./routes/scouts');
const scoutsDownloadRoutes = require('./routes/scouts-download');
const clubRoutes = require('./routes/clubs');
const reportRoutes = require('./routes/reports');
const reportsDownloadRoutes = require('./routes/reports-download');
const saleRoutes = require('./routes/sales');
const payoutRoutes = require('./routes/payouts');
const stripeRoutes = require('./routes/stripe');
const availabilityRoutes = require('./routes/availability');
const reservationRoutes = require('./routes/reservations');
const otherUserRoutes = require('./routes/otherUser');
/* =========================================================== */

/* ===================== Routes publiques ===================== */
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// callbacks simples (facultatif)
app.get('/complete', (req, res) => {
  res.json({ message: 'Onboarding Stripe complété avec succès.' });
});
app.get('/success', (req, res) => {
  res.json({ message: 'Paiement réussi ! Merci.' });
});
app.get('/cancel', (req, res) => {
  res.json({ message: 'Paiement annulé.' });
});
/* =========================================================== */

/* ===================== Routes protégées (JWT) ===================== */
app.use('/api/scouts', verifyToken, scoutRoutes);
app.use('/api/scouts', verifyToken, scoutsDownloadRoutes);

app.use('/api/clubs', verifyToken, clubRoutes);

app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/reports', verifyToken, reportsDownloadRoutes);

app.use('/api/sales', verifyToken, saleRoutes);
app.use('/api/payouts', verifyToken, payoutRoutes);

app.use('/api/other_user', verifyToken, otherUserRoutes);

app.use('/api/availability', verifyToken, availabilityRoutes);
app.use('/api/reservations', verifyToken, reservationRoutes);
/* ================================================================ */

/* ===================== Healthcheck ===================== */
app.get('/health', (req, res) => res.json({ ok: true }));
/* ====================================================== */

/* ===================== Lancement ===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});
/* ===================================================== */