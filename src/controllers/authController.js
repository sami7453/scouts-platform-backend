// src/controllers/authController.js
const authService = require('../services/authService');

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { token } = await authService.login(req.body);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

/**
 * GET /api/auth/profile
 */
exports.profile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * PATCH /api/auth/profile
 * Met à jour email et/ou mot de passe
 */
exports.updateProfile = async (req, res) => {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
