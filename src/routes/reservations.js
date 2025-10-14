const express = require('express');
const { body, query, param } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/reservationController');

const router = express.Router();

// Liste de disponibilités concrètes (slots non réservés)
router.get(
    '/available',
    verifyToken,
    [
        query('scout_id').isInt(),
        query('from').isISO8601(),
        query('to').isISO8601()
    ],
    validate,
    ctrl.available
);

// Réserver un créneau
router.post(
    '/',
    verifyToken,
    [
        body('scout_id').isInt(),
        body('starts_at').isISO8601(), // ex: "2025-09-15T10:00:00+02:00"
        body('purpose').optional().isString()
    ],
    validate,
    ctrl.book
);

// Annuler ma réservation (ou le scout)
router.post(
    '/:id/cancel',
    verifyToken,
    [param('id').isInt()],
    validate,
    ctrl.cancel
);

// Mes réservations
router.get(
    '/mine',
    verifyToken,
    [query('from').isISO8601(), query('to').isISO8601()],
    validate,
    ctrl.mine
);

// Réservations d’un scout (utile pour le dashboard du scout)
router.get(
    '/scout/:scoutId',
    verifyToken,
    [
        param('scoutId').isInt(),
        query('from').isISO8601(),
        query('to').isISO8601()
    ],
    validate,
    ctrl.forScout
);

module.exports = router;
