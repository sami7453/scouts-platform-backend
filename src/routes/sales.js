// ----- File: src/routes/sales.js -----
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const saleCtrl = require('../controllers/saleController');

const router = express.Router();

// Créer une session Stripe Checkout
router.post(
  '/checkout',
  [body('reportId').isInt().withMessage('reportId doit être un entier')],
  validate,
  saleCtrl.checkout
);

// Historique des achats (club)
router.get('/history', saleCtrl.historyForClub);

module.exports = router;
