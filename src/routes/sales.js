const express = require('express');
const router = express.Router();
const { checkout, history } = require('../controllers/saleController');

router.post('/checkout', checkout);
router.get('/history', history);

module.exports = router;