const saleService = require('../services/saleService');

/**
 * Create a Stripe checkout session
 */
exports.checkout = async (req, res) => {
  try {
    const session = await saleService.createCheckoutSession(
      req.body.reportId,
      req.user.id,
    );
    res.json({ url: session.url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Retrieve purchases history for a club
 */
exports.historyForClub = async (req, res) => {
  const history = await saleService.getClubSalesHistory(req.user.id);
  res.json(history);
};

exports.historyForScout = async (req, res) => {
  const payouts = await saleService.getScoutRevenueHistory(req.user.id);
  res.json(payouts);
};
