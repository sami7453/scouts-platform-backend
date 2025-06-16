const saleService = require('../services/saleService');

exports.checkout = async (req, res) => {
    try {
        const session = await saleService.createCheckoutSession(req.body.reportId, req.user.id);
        res.json({ url: session.url });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.history = async (req, res) => {
    const history = await saleService.getPurchasesHistory(req.user.id);
    res.json(history);
};