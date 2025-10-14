const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, fullProfile } = require('../controllers/clubController');
const validate = require('../middleware/validate');

// Multer en mémoire (pas de FS local)
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

// Helpers Cloudflare R2
const { putBuffer, safeName, hashName, publicUrlFor } = require('../lib/r2-helpers');
const { R2_AVATARS_BUCKET } = require('../lib/r2');

const router = express.Router();

/**
 * PATCH /api/clubs/profile
 * - form-data: champ "photo" (image)
 * - champs textuels: name, info, bio (optionnels)
 * 
 * Changement:
 * - upload direct vers R2 (bucket public avatars)
 * - on pose req.body.photo_url pour que le controller le persiste
 */
router.patch(
  '/profile',
  verifyToken,
  upload.single('photo'),
  [
    body('name').optional().isString(),
    body('info').optional().isString(),
    body('bio').optional().isString()
  ],
  async (req, res, next) => {
    try {
      if (!req.file) return next();

      const f = req.file;
      if (!/^image\//i.test(f.mimetype)) {
        return res.status(415).json({ error: 'Seules les images sont acceptées.' });
      }

      const key = `avatars/clubs/${req.user.id}/${Date.now()}-${hashName(f.buffer)}--${safeName(f.originalname)}`;

      await putBuffer({
        bucket: R2_AVATARS_BUCKET,
        key,
        buffer: f.buffer,
        contentType: f.mimetype,
        cacheControl: 'public, max-age=31536000, immutable'
      });

      const publicUrl = publicUrlFor({ key });
      req.body.photo_url = publicUrl;

      next();
    } catch (err) {
      console.error('Erreur upload avatar club:', err);
      return res.status(500).json({ error: 'Échec de l’upload de la photo.' });
    }
  },
  validate,
  updateProfile
);

// GET /api/clubs/profile/full
router.get(
  '/profile/full',
  verifyToken,
  fullProfile
);

module.exports = router;
