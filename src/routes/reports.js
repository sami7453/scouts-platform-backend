const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  create, list, get, update, remove,
} = require('../controllers/reportController');

// Multer en mémoire (pas d'écriture disque)
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 Mo max
});

// Helpers R2
const { putBuffer, safeName, hashName } = require('../lib/r2-helpers');
const { R2_DOCS_BUCKET } = require('../lib/r2');

const router = express.Router();

/**
 * POST /api/reports
 * - form-data: champ "pdf" (application/pdf)
 * - autres champs requis: player_firstname, player_lastname, position, nationality, age, current_club, current_league, price_cents
 * 
 * ⚙️ Changement:
 * - on n'écrit plus dans /uploads
 * - on uploade le PDF vers R2 (bucket privé)
 * - on injecte req.body.file_key pour que le controller le stocke en BDD
 */
router.post(
  '/',
  upload.single('pdf'),
  [
    body('player_firstname').notEmpty(),
    body('player_lastname').notEmpty(),
    body('position').notEmpty(),
    body('nationality').notEmpty(),
    body('age').isInt(),
    body('current_club').notEmpty(),
    body('current_league').notEmpty(),
    body('price_cents').isInt(),
  ],
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Le fichier PDF est requis (champ "pdf").' });
      }
      const f = req.file;
      if (f.mimetype !== 'application/pdf') {
        return res.status(415).json({ error: 'Seuls les fichiers PDF sont acceptés.' });
      }

      // Clé privée et stable pour R2
      // Astuce: on espace par user si tu as req.user.id ; sinon "anon"
      const userId = req.user?.id || 'anon';
      const key = `docs/${userId}/${Date.now()}-${hashName(f.buffer)}--${safeName(f.originalname)}`;

      // Upload vers R2 (bucket privé)
      await putBuffer({
        bucket: R2_DOCS_BUCKET,
        key,
        buffer: f.buffer,
        contentType: f.mimetype,
        cacheControl: 'private, max-age=0, must-revalidate',
      });

      // On passe la clé au controller (à stocker en BDD)
      req.body.file_key = key;

      next();
    } catch (err) {
      console.error('Erreur upload PDF:', err);
      return res.status(500).json({ error: 'Échec de l’upload du PDF.' });
    }
  },
  validate,
  create,
);

router.get('/', list);
router.get('/:id', get);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
