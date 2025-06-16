const stripe = require('../utils/stripe');
const saleService = require('../services/saleService');

exports.handle = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        await saleService.handleWebhook(event);
        res.json({ received: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};