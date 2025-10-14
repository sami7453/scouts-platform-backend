const express = require('express');
const path = require('path');
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { updateProfile, fullProfile } = require('../controllers/other_userController');
const validate = require('../middleware/validate');

const router = express.Router();

// PATCH /api/other_user/profile
// Champs textuels: firtname, lastname.
router.patch(
    '/profile',
    verifyToken,
    [
        body('firstname').optional().isString(),
        body('lastname').optional().isString()
    ],
    validate,
    updateProfile
);

// GET /api/other_user/profile/full
router.get(
    '/profile/full',
    verifyToken,
    fullProfile
);

module.exports = router;