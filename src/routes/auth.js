// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

const router = express.Router();

// Inscription
router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['scout', 'club', 'admin'])
  ],
  validate,
  authController.register
);

// Connexion
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  validate,
  authController.login
);

// Profil public
router.get('/profile', verifyToken, authController.profile);

// Mise à jour email/password
router.patch(
  '/profile',
  verifyToken,
  [
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 })
  ],
  validate,
  authController.updateProfile
);

module.exports = router;
