// ----- File: src/controllers/clubController.js -----
const clubService = require('../services/clubService');

exports.updateProfile = async (req, res) => {
    try {
        // On accepte photo_url et bio
        const fields = req.body;
        const updated = await clubService.updateProfile(req.user.id, fields);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
