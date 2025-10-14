const availabilityService = require('../services/availabilityService');

exports.putRules = async (req, res) => {
    try {
        const inserted = await availabilityService.setWeekTemplate(req.user, req.body.rules || []);
        res.json(inserted);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

exports.getRules = async (req, res) => {
    try {
        const rules = await availabilityService.getWeekTemplate(req.user, req.query.scout_id);
        res.json(rules);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};
