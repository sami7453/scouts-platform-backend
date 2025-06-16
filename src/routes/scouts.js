// ----- File: src/routes/scouts.js -----
const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, fullProfile } = require('../controllers/scoutController');
const validate = require('../middleware/validate');

// Mettre à jour le profil scout
router.patch(
  '/profile',
  verifyToken,
  [
    body('photo_url').optional().isURL(),
    body('bio').optional().isString(),
  ],
  validate,
  updateProfile,
);
router.get('/profile/full', verifyToken, fullProfile);

module.exports = router;
