// src/routes/stripe.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const stripeCtrl = require('../controllers/stripeController');

// POST /api/stripe/onboard
router.post('/onboard', verifyToken, stripeCtrl.onboard);

module.exports = router;
