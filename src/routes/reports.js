const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  create, list, get, update, remove
} = require('../controllers/reportController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();
router.post('/', upload.single('pdf'), create);
router.get('/', list);
router.get('/:id', get);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;