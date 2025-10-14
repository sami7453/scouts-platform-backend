// ----- File: src/controllers/scoutController.js -----
const scoutService = require('../services/scoutService');

// Update scout profile
exports.updateProfile = async (req, res) => {
  try {
    // Tous les champs textuels (dont éventuellement photo_url déjà injecté par la route)
    const fields = { ...req.body };

    // ⚠️ On ne touche plus à req.file, l'upload est déjà géré en amont (R2).
    // Si la route d'upload a mis photo_url dans req.body, il sera persisté tel quel.

    const updated = await scoutService.updateProfile(req.user.id, fields);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Get full scout profile (user + scout)
exports.fullProfile = async (req, res) => {
  try {
    const profile = await scoutService.getProfile(req.user.id);
    return res.json(profile);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};
