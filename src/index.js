// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ---------- CORS ---------- */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.FRONT_URL,
  process.env.FRONT_URL_ALT,
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    // Autorise Postman/cURL (origin = undefined) + origines listées
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
/* ------------------------- */

// (recommandé derrière un proxy type Railway/Vercel)
app.set('trust proxy', 1);

// Stripe webhook — le *raw body* doit être AVANT express.json()
const webhookRouter = require('./routes/webhook');
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Routes import ===
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

// ⚠️ Vérifie bien le nom du fichier: c'était `other_user.js` dans ton projet.
// Si ton fichier s’appelle `routes/other_user.js`, garde cette ligne :
const otherUserRoutes = require('./routes/otherUser');
// Si tu as renommé le fichier en `otherUser.js`, remplace la ligne ci-dessus par:
// const otherUserRoutes = require('./routes/otherUser');

// === Routes publiques ===
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// Callbacks simples (facultatif)
app.get('/complete', (req, res) => {
  res.json({ message: 'Onboarding Stripe complété avec succès.' });
});
app.get('/success', (req, res) => {
  res.json({ message: 'Paiement réussi ! Merci.' });
});
app.get('/cancel', (req, res) => {
  res.json({ message: 'Paiement annulé.' });
});

// === Routes protégées (JWT) ===
app.use('/api/scouts', verifyToken, scoutRoutes);
app.use('/api/scouts', verifyToken, scoutsDownloadRoutes);

app.use('/api/clubs', verifyToken, clubRoutes);

app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/reports', verifyToken, reportsDownloadRoutes);

app.use('/api/sales', verifyToken, saleRoutes);
app.use('/api/payouts', verifyToken, payoutRoutes);

app.use('/api/other_user', otherUserRoutes);

app.use('/api/availability', verifyToken, availabilityRoutes);
app.use('/api/reservations', verifyToken, reservationRoutes);

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// Lancement
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
