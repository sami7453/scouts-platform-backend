// ----- File: src/services/saleService.js -----
const stripe = require('../utils/stripe');
const saleModel = require('../models/saleModel');
const payoutModel = require('../models/payoutModel');
const reportModel = require('../models/reportModel');
const db = require('../db');

async function createCheckoutSession(reportId, clubId) {
  const report = await reportModel.getReportById(reportId);
  if (!report) throw new Error('Rapport introuvable');
  const amount = report.price_cents;
  const commission = Math.floor(amount * parseFloat(process.env.COMMISSION_RATE));
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
    metadata: {
      reportId: String(reportId),
      clubId: String(clubId),
      amount_cents: String(amount),
      commission_cents: String(commission),
    },
  });
  return session;
}

async function handleWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const reportId = parseInt(session.metadata.reportId, 10);
    const clubId = parseInt(session.metadata.clubId, 10);
    const amount = parseInt(session.metadata.amount_cents || session.amount_total, 10);
    const commission = parseInt(
      session.metadata.commission_cents
        || Math.floor(amount * parseFloat(process.env.COMMISSION_RATE)),
      10,
    );

    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const sale = await saleModel.insertSale({
        report_id: reportId,
        club_id: clubId,
        amount_cents: amount,
        commission_cents: commission,
        payment_intent: session.payment_intent,
      }, client);

      const report = await reportModel.getReportById(reportId);
      const payoutAmount = amount - commission;
      await payoutModel.insertPayout({
        sale_id: sale.id,
        scout_id: report.scout_id,
        amount_cents: payoutAmount,
        payout_id: session.payment_intent,
      }, client);
      await client.query('COMMIT');
      return sale;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  if (event.type === 'charge.refunded') {
    // In a real application you would mark the sale as refunded
    // and possibly revert the payout. Not implemented here.
  }
}

async function getClubSalesHistory(clubId) {
  return saleModel.findSalesByClub(clubId);
}

async function getScoutRevenueHistory(scoutId) {
  return payoutModel.findPayoutsByScout(scoutId);
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getClubSalesHistory,
  getScoutRevenueHistory,
};
