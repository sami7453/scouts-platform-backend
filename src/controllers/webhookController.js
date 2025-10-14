// src/controllers/webhookController.js
const stripe = require('../utils/stripe');

// IMPORTANT: /webhook est monté avec express.raw({ type: 'application/json' }) dans index.js
// pour que req.body soit bien le "raw body" attendu par stripe.webhooks.constructEvent.

exports.handle = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).send('Missing stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // On ne traite que ce qui nous intéresse
  if (event.type !== 'checkout.session.completed') {
    // Toujours ACK 200 pour éviter les retries inutiles
    console.log('ℹ️ Webhook ignoré:', event.type);
    return res.json({ received: true, ignored: event.type });
  }

  // Traiter l’événement (idempotent côté saleModel)
  try {
    // petite deadline interne pour éviter de bloquer le webhook trop longtemps
    const deadline = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('Webhook handler timeout')), 15_000)
    );
    const handler = require('../services/saleService').handleWebhook(event);

    await Promise.race([handler, deadline]);

    return res.json({ received: true });
  } catch (err) {
    // Répondre 200 quand même ? Non: ici on préfère 500 pour que Stripe réessaie (momentané)
    console.error('❌ Webhook handler failed:', err);
    return res.status(500).send('Webhook handler error');
  }
};
