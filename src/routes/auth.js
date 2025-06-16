const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const { register, login, profile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['scout', 'club']),
  ],
  validate,
  register,
);
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login,
);
router.get('/profile', verifyToken, profile);

module.exports = router;
