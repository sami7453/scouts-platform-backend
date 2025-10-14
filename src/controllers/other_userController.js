// ---- File: src/controllers/other_userController.js ----
const otherUserService = require('../services/other_userService');

/**
 * Update other_user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        // Tous les champs textuels dans fields
        const fields = { ...req.body };
        const updated = await otherUserService.updateProfile(req.user.id, fields);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Get full other_user profile
 */
exports.fullProfile = async (req, res) => {
    try {
        const profile = await otherUserService.getProfile(req.user.id);
        res.json(profile);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};