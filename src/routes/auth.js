const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['scout','club','admin']),
  validate,
  authController.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  validate,
  authController.login
);

router.get('/profile', authController.profile);

module.exports = router;
