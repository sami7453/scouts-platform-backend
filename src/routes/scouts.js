// ----- File: src/routes/scouts.js -----
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { updateProfile } = require('../controllers/scoutController');

// Mettre à jour le profil scout
router.patch('/profile', verifyToken, updateProfile);

module.exports = router;
