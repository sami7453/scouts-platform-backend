// ----- File: src/services/saleService.js -----
const stripe = require('../utils/stripe');
const saleModel = require('../models/saleModel');
const payoutModel = require('../models/payoutModel');
const reportModel = require('../models/reportModel');
const scoutModel = require('../models/scoutModel');
const db = require('../db');

// ⬇️ imports pour R2 + filigrane
const { getBuffer, putBuffer, safeName, hashName } = require('../lib/r2-helpers');
const { R2_DOCS_BUCKET } = require('../lib/r2');
const { addWatermark } = require('../lib/pdf-watermark');

/**
 * Crée une session Stripe Checkout en mode Connect (destination charges).
 */
async function createCheckoutSession(reportId, clubUserId) {
  const report = await reportModel.getReportById(reportId);
  if (!report) throw new Error('Rapport introuvable');

  const amount = report.price_cents;
  const commission = Math.floor(amount * parseFloat(process.env.COMMISSION_RATE));

  const scout = await scoutModel.findScoutByUserId(report.scout_id);
  if (!scout || !scout.stripe_account_id) {
    throw new Error('Compte Stripe du scout introuvable');
  }

  const successUrl = `${process.env.FRONT_URL}/success?reportId=${reportId}&session_id={CHECKOUT_SESSION_ID}`;

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
    success_url: successUrl,
    cancel_url: `${process.env.FRONT_URL}/cancel`,
    metadata: {
      reportId: String(reportId),
      clubId: String(clubUserId),
      amount_cents: String(amount),
      commission_cents: String(commission),
    },
    payment_intent_data: {
      transfer_data: { destination: scout.stripe_account_id },
      application_fee_amount: commission
    }
  });

  return session;
}

/**
 * Génére et attache une copie filigranée au record de vente donné.
 * - Filigrane inclut: vendeur (scout), acheteur (club), sale_id, date d'achat.
 * - Met à jour sales.watermarked_key
 */
async function generateAndAttachWatermarkedCopy(saleId) {
  // 1) Récupérer les infos nécessaires (sale + report + identités)
  const q = await db.query(
    `SELECT s.id, s.report_id, s.club_id, s.purchased_at,
            r.file_key, r.scout_id,
            sc.firstname AS seller_firstname, sc.lastname AS seller_lastname,
            c.name       AS buyer_name
       FROM sales s
       JOIN reports r ON r.id = s.report_id
  LEFT JOIN scouts  sc ON sc.user_id = r.scout_id
  LEFT JOIN clubs   c  ON c.user_id = s.club_id
      WHERE s.id = $1`,
    [saleId]
  );
  if (q.rowCount === 0) throw new Error('Sale introuvable');
  const row = q.rows[0];
  if (!row.file_key) throw new Error('Report sans file_key');

  // 2) Télécharger l’original privé depuis R2
  const original = await getBuffer({ bucket: R2_DOCS_BUCKET, key: row.file_key });

  // 3) Construire le texte du filigrane
  const dateStr = new Date(row.purchased_at || Date.now()).toISOString().slice(0, 10);
  const sellerName = [row.seller_firstname, row.seller_lastname].filter(Boolean).join(' ').trim() || `Scout#${row.scout_id}`;
  const buyerName = (row.buyer_name || `Club#${row.club_id}`).trim();
  const stamp = `Seller: ${sellerName} • Buyer: ${buyerName} • Sale#${row.id} • ${dateStr}`;

  // 4) Appliquer le filigrane
  const watermarked = await addWatermark(original, stamp);

  // 5) Uploader la copie filigranée (privé) sur R2
  const key = `sales/${row.id}/${Date.now()}-${hashName(watermarked)}--${safeName(`report_${row.report_id}.pdf`)}`;
  await putBuffer({
    bucket: R2_DOCS_BUCKET,
    key,
    buffer: watermarked,
    contentType: 'application/pdf',
    cacheControl: 'private, max-age=0, must-revalidate',
  });

  // 6) Persister la clé
  await db.query(`UPDATE sales SET watermarked_key = $1 WHERE id = $2`, [key, saleId]);

  return key;
}

/**
 * Gère les webhooks Stripe. Traite au moins checkout.session.completed.
 */
async function handleWebhook(event) {
  if (event.type !== 'checkout.session.completed') return;
  const session = event.data.object;

  const reportId = parseInt(session.metadata.reportId, 10);
  const clubId = parseInt(session.metadata.clubId, 10);
  const amount = parseInt(session.metadata.amount_cents, 10);
  const commission = parseInt(session.metadata.commission_cents, 10);

  const client = await db.getClient();
  let sale;
  try {
    await client.query('BEGIN');

    // 1) Enregistrer la vente
    sale = await saleModel.insertSale({
      report_id: reportId,
      club_id: clubId,
      amount_cents: amount,
      commission_cents: commission,
      payment_intent: session.payment_intent
    }, client);

    // 2) Payout (reversement scout)
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

  // 3) Générer la copie filigranée (hors transaction — on ne bloque pas le paiement si ça rate)
  try {
    await generateAndAttachWatermarkedCopy(sale.id);
  } catch (e) {
    // on log l’erreur mais on ne jette pas : le paiement est déjà traité
    console.error('Filigrane: échec de génération/upload pour sale', sale?.id, e);
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
  getScoutRevenueHistory,
  // (facultatif) expose pour tests manuels:
  generateAndAttachWatermarkedCopy,
};
