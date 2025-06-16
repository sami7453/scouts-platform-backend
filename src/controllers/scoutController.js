// ----- File: src/controllers/scoutController.js -----
const scoutService = require('../services/scoutService');

exports.updateProfile = async (req, res) => {
    try {
        // On accepte photo_url, bio, vision_qa (JSON), test_report_url
        const fields = req.body;
        const updated = await scoutService.updateProfile(req.user.id, fields);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
