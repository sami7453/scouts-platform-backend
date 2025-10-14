// ----- File: src/controllers/clubController.js -----
const clubService = require('../services/clubService');

/**
 * Update club profile
 */
exports.updateProfile = async (req, res) => {
  try {
    // Tous les champs textuels (dont éventuellement photo_url déjà présent)
    const fields = { ...req.body };

    // ⚠️ Plus besoin de gérer req.file ici. 
    // La route d’upload se charge déjà d’injecter `photo_url` si un avatar a été envoyé.

    const updated = await clubService.updateProfile(req.user.id, fields);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Get full club profile
 */
exports.fullProfile = async (req, res) => {
  try {
    const profile = await clubService.getProfile(req.user.id);
    return res.json(profile);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};
