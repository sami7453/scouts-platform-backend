// ----- File: src/routes/payouts.js -----
const express = require('express');
const payoutCtrl = require('../controllers/payoutController');

const router = express.Router();

// Historique des gains (scout)
router.get('/history', payoutCtrl.history);

module.exports = router;
