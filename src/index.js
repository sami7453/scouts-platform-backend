// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const scoutRoutes = require('./routes/scouts');
const scoutsDownloadRoutes = require('./routes/scouts-download');
const reportsDownloadRoutes = require('./routes/reports-download');
const clubRoutes = require('./routes/clubs');
const reportRoutes = require('./routes/reports');
const saleRoutes = require('./routes/sales');
const payoutRoutes = require('./routes/payouts');
const webhookRouter = require('./routes/webhook');
const stripeRoutes = require('./routes/stripe');
const availabilityRoutes = require('./routes/availability');
const reservationRoutes = require('./routes/reservations');
const otherUserRoutes = require('./routes/otherUser');
const { verifyToken } = require('./middleware/auth');

const app = express();

// (optionnel mais recommandé sur Railway/Proxies)
app.set('trust proxy', 1);

// 1) Webhook Stripe (raw body) — doit être AVANT express.json()
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// 2) Middlewares globaux
app.use(cors({
  origin: [process.env.FRONT_URL || 'http://localhost:5173'],
  methods: 'GET,POST,PATCH,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ⛔️ plus de static local: on ne sert plus /uploads
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3) Routes publiques
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// 4) Callback après onboarding Stripe Connect
app.get('/complete', (req, res) => {
  res.json({ message: 'Onboarding Stripe complété avec succès.' });
});

// 5) Redirects après paiement Stripe Checkout
app.get('/success', (req, res) => {
  res.json({ message: 'Paiement réussi ! Merci.' });
});
app.get('/cancel', (req, res) => {
  res.json({ message: 'Paiement annulé.' });
});

// 6) Routes protégées (JWT)
app.use('/api/scouts', verifyToken, scoutRoutes);
app.use('/api/scouts', verifyToken, scoutsDownloadRoutes); // ⬅️ ajout (vision_qa signed URL)
app.use('/api/clubs', verifyToken, clubRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/sales', verifyToken, saleRoutes);
app.use('/api/payouts', verifyToken, payoutRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/reports', verifyToken, reportsDownloadRoutes);

// 7) Autres routes (selon ton design, publique ici)
app.use('/api/otherUser', otherUserRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);

// (optionnel) Ping/health
app.get('/health', (req, res) => res.json({ ok: true }));

// 8) Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
