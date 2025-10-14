const express = require('express');
const { body, query } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/availabilityController');

const router = express.Router();

router.put(
    '/rules',
    verifyToken,
    [body('rules').isArray()],
    validate,
    ctrl.putRules
);

router.get(
    '/rules',
    verifyToken,
    [query('scout_id').optional().isInt()],
    validate,
    ctrl.getRules
);

module.exports = router;
