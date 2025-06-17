// ----- File: src/controllers/saleController.js -----
const saleService = require('../services/saleService');

exports.checkout = async (req, res) => {
  // 1) Diagnostic : log du body
  console.log('💬 checkout payload:', req.body);

  // 2) Validation & parsing de reportId
  const rawId = req.body.reportId;
  const reportId = parseInt(rawId, 10);
  if (isNaN(reportId)) {
    return res.status(400).json({ error: 'reportId doit être un entier valide' });
  }

  // 3) Création de la session Stripe Checkout
  try {
    const session = await saleService.createCheckoutSession(
      reportId,      // on passe l'entier
      req.user.id    // ID du club depuis le token
    );
    console.log('✅ Session Checkout URL:', session.url);
    return res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Erreur checkout:', err);
    return res.status(400).json({ error: err.message });
  }
};


exports.historyForClub = async (req, res) => {
  try {
    const history = await saleService.getClubSalesHistory(req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
