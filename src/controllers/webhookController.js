// src/controllers/webhookController.js
const stripe = require('../utils/stripe');

// /webhook est monté avec express.raw({ type: 'application/json' }) dans index.js

exports.handle = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    return res.status(400).send('Missing stripe-signature');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // RAW body (pas JSON.parse !)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook validé :', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verify failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // On ne traite que checkout.session.completed ici
  if (event.type !== 'checkout.session.completed') {
    console.log('ℹ️ Webhook ignoré:', event.type);
    return res.json({ received: true, ignored: event.type });
  }

  try {
    // petite deadline pour ne pas bloquer Stripe trop longtemps
    const deadline = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('Webhook handler timeout')), 15_000)
    );
    const handler = require('../services/saleService').handleWebhook(event);
    await Promise.race([handler, deadline]);

    return res.json({ received: true });
  } catch (err) {
    // On veut que Stripe retente si erreur transitoire
    console.error('❌ WEBHOOK HANDLER ERROR', {
      type: event?.type,
      msg: err?.message,
      code: err?.code,
      detail: err?.detail,
      schema: err?.schema,
      table: err?.table,
      constraint: err?.constraint,
      stack: err?.stack,
      metadata: event?.data?.object?.metadata || null,
    });
    return res.status(500).send('Webhook handler error');
  }
};
