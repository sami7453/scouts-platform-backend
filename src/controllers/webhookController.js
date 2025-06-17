// src/controllers/webhookController.js

// Import de Stripe en début de fichier
const stripe = require('../utils/stripe');

exports.handle = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    // Vérification de la signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook validé :', event.type);
  } catch (err) {
    console.error('❌ Erreur webhook stripe signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter l'événement si nécessaire
  try {
    await require('../services/saleService').handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('❌ Erreur lors du traitement du webhook :', err);
    res.status(500).json({ error: err.message });
  }
};
