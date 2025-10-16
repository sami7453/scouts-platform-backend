// ----- File: src/services/saleService.js -----
const stripe = require('../utils/stripe');
const reportModel = require('../models/reportModel');
const scoutModel = require('../models/scoutModel');
const clubModel = require('../models/clubModel');
const db = require('../db');

// R2 + filigrane
const { getBuffer, putBuffer, safeName, hashName } = require('../lib/r2-helpers');
const { R2_DOCS_BUCKET } = require('../lib/r2');
const { addWatermark } = require('../lib/pdf-watermark');

/**
 * Crée une session Stripe Checkout en mode Connect (destination charges).
 */
async function createCheckoutSession(reportId, clubUserId) {
  // Vérif report
  const report = await reportModel.getReportById(reportId);
  if (!report) throw new Error('Rapport introuvable');

  // Vérif acheteur = club existant (évite FK qui pète au webhook)
  const club = await clubModel.findClubByUserId(clubUserId);
  if (!club) throw new Error('Acheteur invalide: club introuvable');

  // Montants
  const amount = report.price_cents;
  const commissionRate = parseFloat(process.env.COMMISSION_RATE || '0');
  const commission = Math.floor(amount * commissionRate);

  // Compte Stripe du scout
  const scout = await scoutModel.findScoutByUserId(report.scout_id);
  if (!scout || !scout.stripe_account_id) {
    throw new Error('Compte Stripe du scout introuvable');
  }

  const successUrl = `${process.env.FRONT_URL}/success?reportId=${reportId}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${process.env.FRONT_URL}/cancel`;

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
    cancel_url: cancelUrl,
    metadata: {
      reportId: String(reportId),
      clubId: String(clubUserId),
      amount_cents: String(amount),
      commission_cents: String(commission),
    },
    payment_intent_data: {
      transfer_data: { destination: scout.stripe_account_id },
      application_fee_amount: commission,
    },
  });

  console.log('💬 checkout payload:', { reportId });
  console.log('✅ Session Checkout URL:', session?.url);
  return session;
}

/**
 * Génére et attache une copie filigranée au record de vente donné.
 * - Filigrane inclut: vendeur (scout), acheteur (club), sale_id, date d'achat.
 * - Met à jour sales.watermarked_key
 */
async function generateAndAttachWatermarkedCopy(saleId) {
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

  const original = await getBuffer({ bucket: R2_DOCS_BUCKET, key: row.file_key });

  const dateStr = new Date(row.purchased_at || Date.now()).toISOString().slice(0, 10);
  const sellerName = [row.seller_firstname, row.seller_lastname].filter(Boolean).join(' ').trim() || `Scout#${row.scout_id}`;
  const buyerName = (row.buyer_name || `Club#${row.club_id}`).trim();
  const stamp = `Seller: ${sellerName} • Buyer: ${buyerName} • Sale#${row.id} • ${dateStr}`;

  const watermarked = await addWatermark(original, stamp);

  const key = `sales/${row.id}/${Date.now()}-${hashName(watermarked)}--${safeName(`report_${row.report_id}.pdf`)}`;
  await putBuffer({
    bucket: R2_DOCS_BUCKET,
    key,
    buffer: watermarked,
    contentType: 'application/pdf',
    cacheControl: 'private, max-age=0, must-revalidate',
  });

  await db.query(`UPDATE sales SET watermarked_key = $1 WHERE id = $2`, [key, saleId]);
  console.log('✅ Watermark généré et uploadé:', key);
  return key;
}

/**
 * Handle Stripe webhook (idempotent).
 * - Traite uniquement checkout.session.completed
 * - UPSERT dans sales par stripe_payment_intent
 * - UPSERT dans payouts par stripe_payout_id
 */
async function handleWebhook(event) {
  console.log('[WEBHOOK] incoming type =', event.type);
  if (event.type !== 'checkout.session.completed') return;

  const session = event.data.object;
  console.log('[WEBHOOK] session.metadata =', session?.metadata);

  // Sanity checks metadata
  if (!session?.metadata?.reportId || !session?.metadata?.clubId) {
    throw new Error('Metadata manquante (reportId/clubId)');
  }

  const reportId   = parseInt(session.metadata.reportId, 10);
  const clubId     = parseInt(session.metadata.clubId, 10);
  const amount     = parseInt(session.metadata.amount_cents, 10);
  const commission = parseInt(session.metadata.commission_cents, 10);
  const paymentIntent = session.payment_intent; // string

  // (Optionnel) vérifier que le club existe encore
  const clubRow = await db.query('SELECT 1 FROM clubs WHERE user_id = $1', [clubId]);
  if (clubRow.rowCount === 0) {
    throw Object.assign(new Error(`club_id ${clubId} not found in clubs`), { code: 'FK_CLUB_MISSING' });
  }

  const client = await db.getClient();
  let sale;
  try {
    await client.query('BEGIN');

    // 1) UPSERT sale par stripe_payment_intent (idempotent)
    const saleRes = await client.query(
      `INSERT INTO sales(
         report_id, club_id, amount_cents, commission_cents, stripe_payment_intent
       ) VALUES($1,$2,$3,$4,$5)
       ON CONFLICT (stripe_payment_intent) DO UPDATE
         SET amount_cents = EXCLUDED.amount_cents,
             commission_cents = EXCLUDED.commission_cents
       RETURNING *`,
      [reportId, clubId, amount, commission, paymentIntent]
    );
    sale = saleRes.rows[0];

    // 2) payout (idempotent via stripe_payout_id)
    const report = await reportModel.getReportById(reportId);
    const payoutAmount = amount - commission;

    await client.query(
      `INSERT INTO payouts(
         sale_id, scout_id, amount_cents, stripe_payout_id, paid_at
       ) VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (stripe_payout_id) DO UPDATE
         SET amount_cents = EXCLUDED.amount_cents,
             paid_at = NOW()
       RETURNING *`,
      [sale.id, report.scout_id, payoutAmount, paymentIntent]
    );

    await client.query('COMMIT');
    console.log('✅ Sale & payout upsert OK', { sale_id: sale.id, report_id: reportId, club_id: clubId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ DB error in webhook:', {
      msg: err?.message,
      code: err?.code,
      detail: err?.detail,
      schema: err?.schema,
      table: err?.table,
      constraint: err?.constraint,
      stack: err?.stack,
    });
    throw err;
  } finally {
    client.release();
  }

  // 3) Générer la copie filigranée (hors transaction)
  try {
    await generateAndAttachWatermarkedCopy(sale.id);
  } catch (e) {
    console.error('⚠️ Filigrane: génération/upload échouée pour sale', sale?.id, e?.message);
  }
}

/**
 * Historique des ventes pour un club.
 */
async function getClubSalesHistory(clubId) {
  const res = await db.query(
    `SELECT * FROM sales WHERE club_id = $1 ORDER BY purchased_at DESC`,
    [clubId]
  );
  return res.rows;
}

/**
 * Historique des gains pour un scout.
 */
async function getScoutRevenueHistory(scoutId) {
  const res = await db.query(
    `SELECT * FROM payouts WHERE scout_id = $1 ORDER BY paid_at DESC`,
    [scoutId]
  );
  return res.rows;
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getClubSalesHistory,
  getScoutRevenueHistory,
  generateAndAttachWatermarkedCopy,
};
