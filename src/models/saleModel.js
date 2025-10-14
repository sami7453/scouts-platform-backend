// ----- File: src/models/saleModel.js -----
/**
 * Modèle pour la table sales.
 */
const db = require('../db');

/**
 * Insère une vente dans sales (idempotent par stripe_payment_intent).
 * - Si l'insert passe: on retourne la ligne insérée.
 * - Si conflit (retry Stripe): on retourne la ligne existante.
 * @param {Object} sale
 * @param {PGClient|Pool} client  - transaction courante ou pool (par défaut)
 */
async function insertSale(sale, client = db) {
  const {
    report_id,
    club_id,
    amount_cents,
    commission_cents,
    payment_intent,
  } = sale;

  const q = `
    INSERT INTO sales (
      report_id, club_id, amount_cents, commission_cents, stripe_payment_intent
    ) VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (stripe_payment_intent)
    DO NOTHING
    RETURNING *;`;

  const args = [report_id, club_id, amount_cents, commission_cents, payment_intent];

  const res = await client.query(q, args);
  if (res.rowCount > 0) return res.rows[0];

  // Conflit → on récupère la vente existante (idempotence)
  const res2 = await client.query(
    `SELECT * FROM sales WHERE stripe_payment_intent = $1 LIMIT 1`,
    [payment_intent]
  );
  return res2.rows[0];
}

/**
 * Récupère l'historique des ventes pour un club donné.
 */
async function findSalesByClub(club_id) {
  const res = await db.query(
    `SELECT * FROM sales
     WHERE club_id = $1
     ORDER BY purchased_at DESC`,
    [club_id]
  );
  return res.rows;
}

module.exports = { insertSale, findSalesByClub };
