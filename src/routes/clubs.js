// ----- File: src/routes/clubs.js -----
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { updateProfile } = require('../controllers/clubController');

// Mettre à jour le profil club
router.patch('/profile', verifyToken, updateProfile);

module.exports = router;
