// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const scoutRoutes = require('./routes/scouts');
const clubRoutes = require('./routes/clubs');
const reportRoutes = require('./routes/reports');
const saleRoutes = require('./routes/sales');
const payoutRoutes = require('./routes/payouts');
const webhookRouter = require('./routes/webhook');
const stripeRoutes = require('./routes/stripe');
const { verifyToken } = require('./middleware/auth');

const app = express();

// 1) Webhook Stripe (raw body)
app.use(
  '/webhook',
  express.raw({ type: 'application/json' }),
  webhookRouter
);

// 2) Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3) Routes publiques
app.use('/api/auth', authRoutes);
app.use('/api/stripe', stripeRoutes);

// 4) Callback après onboarding Stripe Connect
app.get('/complete', (req, res) => {
  res.json({ message: 'Onboarding Stripe complété avec succès.' });
});

// 5) Redirects après paiement Stripe Checkout
app.get('/success', (req, res) => {
  res.json({ message: 'Paiement réussi ! Merci.' });
});
app.get('/cancel', (req, res) => {
  res.json({ message: 'Paiement annulé.' });
});

// 6) Routes protégées (JWT)
app.use('/api/scouts', verifyToken, scoutRoutes);
app.use('/api/clubs', verifyToken, clubRoutes);
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/sales', verifyToken, saleRoutes);
app.use('/api/payouts', verifyToken, payoutRoutes);

// 7) Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
