// src/routes/scouts.js
const express = require('express');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, fullProfile } = require('../controllers/scoutController');
const validate = require('../middleware/validate');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max pour le PDF
});

// Helpers Cloudflare R2
const { putBuffer, safeName, hashName, publicUrlFor } = require('../lib/r2-helpers');
const { R2_AVATARS_BUCKET, R2_DOCS_BUCKET } = require('../lib/r2');

const router = express.Router();

// Autoriser 2 champs "file": photo (image) et vision_qa (PDF)
const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'vision_qa', maxCount: 1 },
]);

router.patch(
  '/profile',
  verifyToken,
  uploadFields,
  // validations champs texte
  body('bio').optional().isString(),
  async (req, res, next) => {
    try {
      // empêche l'override par le client
      delete req.body.photo_url;
      delete req.body.test_report_url;

      const userId = Number(req.user.id);

      // 1) PHOTO (publique)
      const photo = req.files?.photo?.[0];
      if (photo) {
        // whitelist images
        const ok = /^image\/(png|jpe?g|webp|gif|avif)$/i.test(photo.mimetype);
        if (!ok) return res.status(415).json({ error: 'Seules les images (png, jpg, webp, gif, avif) sont acceptées pour "photo".' });

        const key = `avatars/${userId}/${Date.now()}-${hashName(photo.buffer)}--${safeName(photo.originalname)}`;
        await putBuffer({
          bucket: R2_AVATARS_BUCKET,
          key,
          buffer: photo.buffer,
          contentType: photo.mimetype,
          cacheControl: 'public, max-age=31536000, immutable'
        });
        req.body.photo_url = publicUrlFor({ key }); // URL publique prête à stocker
      }

      // 2) VISION_QA (PDF privé)
      const pdf = req.files?.vision_qa?.[0];
      if (pdf) {
        if (pdf.mimetype !== 'application/pdf') {
          return res.status(415).json({ error: 'Le champ "vision_qa" doit être un PDF.' });
        }
        const key = `scouts/${userId}/vision_qa/${Date.now()}-${hashName(pdf.buffer)}--${safeName(pdf.originalname)}`;
        await putBuffer({
          bucket: R2_DOCS_BUCKET,
          key,
          buffer: pdf.buffer,
          contentType: pdf.mimetype,
          cacheControl: 'private, max-age=0, must-revalidate'
        });
        // on stocke la CLÉ R2 dans "test_report_url"
        req.body.test_report_url = key;
      }

      return next();
    } catch (e) {
      console.error('Erreur upload profil scout:', e);
      return res.status(500).json({ error: 'Échec du traitement du profil' });
    }
  },
  validate,
  updateProfile
);

// Profil complet existant
router.get('/profile/full', verifyToken, fullProfile);

module.exports = router;
