// ----- File: src/controllers/payoutController.js -----
const saleService = require('../services/saleService');

exports.history = async (req, res) => {
    try {
        const payouts = await saleService.getScoutRevenueHistory(req.user.id);
        res.json(payouts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
