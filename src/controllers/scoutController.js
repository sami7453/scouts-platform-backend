// ----- File: src/controllers/scoutController.js -----
const scoutService = require('../services/scoutService');


// Update scout profile

exports.updateProfile = async (req, res) => {
  try {
    // On récupère tous les champs textuels
    const fields = { ...req.body };
    // Si un fichier a été uploadé, on construit l'URL
    if (req.file) {
      fields.photo_url = `/uploads/${req.file.filename}`;
    }
    const updated = await scoutService.updateProfile(req.user.id, fields);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get full scout profile (user + scout)

exports.fullProfile = async (req, res) => {
  try {
    const profile = await scoutService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
