// src/routes/scouts.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, fullProfile } = require('../controllers/scoutController');
const validate = require('../middleware/validate');

const router = express.Router();

// Configuration Multer pour l’upload de la photo
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

// PATCH /api/scouts/profile
// - form-data: champ "photo" pour le fichier
// - champs textuels: bio (optionnel)
router.patch(
  '/profile',
  verifyToken,
  upload.single('photo'),
  body('bio').optional().isString(),
  validate,
  updateProfile
);

// GET /api/scouts/profile/full
router.get(
  '/profile/full',
  verifyToken,
  fullProfile
);

module.exports = router;
