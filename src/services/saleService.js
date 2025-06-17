// ----- File: src/services/saleService.js -----
const stripe = require('../utils/stripe');
const saleModel = require('../models/saleModel');
const payoutModel = require('../models/payoutModel');
const reportModel = require('../models/reportModel');
const scoutModel = require('../models/scoutModel');
const db = require('../db');

/**
 * Crée une session Stripe Checkout en mode Connect (destination charges).
 */
async function createCheckoutSession(reportId, clubUserId) {
  // 1) Récupérer le rapport
  const report = await reportModel.getReportById(reportId);
  if (!report) throw new Error('Rapport introuvable');

  // 2) Calculer montants
  const amount = report.price_cents;
  const commission = Math.floor(amount * parseFloat(process.env.COMMISSION_RATE));

  // 3) Récupérer le compte Stripe du scout
  const scout = await scoutModel.findScoutByUserId(report.scout_id);
  if (!scout || !scout.stripe_account_id) {
    throw new Error('Compte Stripe du scout introuvable');
  }

  // 4) Créer la session Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: amount,
        product_data: { name: `Rapport #${report.id}` },
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONT_URL}/success`,
    cancel_url: `${process.env.FRONT_URL}/cancel`,
    metadata: {
      reportId: String(reportId),
      clubId: String(clubUserId),
      amount_cents: String(amount),
      commission_cents: String(commission),
    },
    payment_intent_data: {
      transfer_data: {
        destination: scout.stripe_account_id
      },
      application_fee_amount: commission
    }
  });

  return session;
}

/**
 * Gère les webhooks Stripe. Traite au moins checkout.session.completed.
 */
async function handleWebhook(event) {
  if (event.type !== 'checkout.session.completed') return;
  const session = event.data.object;

  // Récupérer métadonnées
  const reportId = parseInt(session.metadata.reportId, 10);
  const clubId = parseInt(session.metadata.clubId, 10);
  const amount = parseInt(session.metadata.amount_cents, 10);
  const commission = parseInt(session.metadata.commission_cents, 10);

  // Transaction SQL pour vente + payout
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    // 1) Enregistrer la vente
    const sale = await saleModel.insertSale({
      report_id: reportId,
      club_id: clubId,
      amount_cents: amount,
      commission_cents: commission,
      payment_intent: session.payment_intent
    }, client);

    // 2) Calcul du net et insertion du payout
    const report = await reportModel.getReportById(reportId);
    const payoutAmount = amount - commission;
    await payoutModel.insertPayout({
      sale_id: sale.id,
      scout_id: report.scout_id,
      amount_cents: payoutAmount,
      payout_id: session.payment_intent
    }, client);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Historique des ventes pour un club.
 */
async function getClubSalesHistory(clubId) {
  return saleModel.findSalesByClub(clubId);
}

/**
 * Historique des gains pour un scout.
 */
async function getScoutRevenueHistory(scoutId) {
  return payoutModel.findPayoutsByScout(scoutId);
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getClubSalesHistory,
  getScoutRevenueHistory
};
