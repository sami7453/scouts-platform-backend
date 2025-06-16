const express = require('express');
const router = express.Router();
const { handle } = require('../controllers/webhookController');

router.post('/', express.raw({ type: 'application/json' }), handle);

module.exports = router;