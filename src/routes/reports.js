const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const reportController = require('../controllers/reportController');

const upload = multer();
const router = express.Router();

router.get('/', reportController.list);
router.post('/',
  upload.single('pdf'),
  body('playerFirstname').notEmpty(),
  body('playerLastname').notEmpty(),
  body('priceCents').isInt({ min: 0 }),
  validate,
  reportController.create
);
router.get('/:id', reportController.get);
router.put('/:id', reportController.update);
router.delete('/:id', reportController.remove);

module.exports = router;
