const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  create, list, get, update, remove,
} = require('../controllers/reportController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = express.Router();

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
  validate,
  create,
);
router.get('/', list);
router.get('/:id', get);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
