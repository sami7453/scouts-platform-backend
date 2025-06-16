// ----- File: src/services/saleService.js -----
const stripe = require('../utils/stripe');
const saleModel = require('../models/saleModel');
const reportModel = require('../models/reportModel');

async function createCheckoutSession(reportId, clubId) {
  const report = await reportModel.getReportById(reportId);
  if (!report) throw new Error('Rapport introuvable');
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: report.price_cents,
        product_data: { name: `Rapport ${report.id}` },
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONT_URL}/success`,
    cancel_url: `${process.env.FRONT_URL}/cancel`,
    metadata: { reportId: String(reportId), clubId: String(clubId) },
  });
  return session;
}

async function handleWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reportId = parseInt(session.metadata.reportId, 10);
    const clubId = parseInt(session.metadata.clubId, 10);
    const amount = session.amount_total;
    const commission = Math.floor(amount * parseFloat(process.env.COMMISSION_RATE));
    const sale = await saleModel.insertSale({
      report_id: reportId,
      club_id: clubId,
      amount_cents: amount,
      commission_cents: commission,
      payment_intent: session.payment_intent,
    });
    return sale;
  }
}

async function getPurchasesHistory(clubId) {
  return saleModel.getSalesByClub(clubId);
}

module.exports = { createCheckoutSession, handleWebhook, getPurchasesHistory };
