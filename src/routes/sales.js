const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const { checkout, history } = require('../controllers/saleController');
const validate = require('../middleware/validate');

router.post(
  '/checkout',
  [body('reportId').isInt()],
  validate,
  checkout,
);
router.get('/history', history);

module.exports = router;
