// ----- File: src/controllers/clubController.js -----
const clubService = require('../services/clubService');

/**
 * Update club profile
 */
exports.updateProfile = async (req, res) => {
  try {
    // Tous les champs textuels dans fields
    const fields = { ...req.body };
    if (req.file) {
      fields.photo_url = `/uploads/${req.file.filename}`;
    }
    const updated = await clubService.updateProfile(req.user.id, fields);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get full club profile
 */
exports.fullProfile = async (req, res) => {
  try {
    const profile = await clubService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
