// ----- File: src/models/payoutModel.js -----
/**
 * Modèle pour la table payouts.
 */
const db = require('../db');

/**
 * Insère un payout dans payouts, et fixe paid_at à l’horodatage courant.
 * Supporte transaction via `client`.
 */
async function insertPayout(payout, client = db) {
  const { sale_id, scout_id, amount_cents, payout_id } = payout;
  const res = await client.query(
    `INSERT INTO payouts(
       sale_id,
       scout_id,
       amount_cents,
       stripe_payout_id,
       paid_at
     ) VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [sale_id, scout_id, amount_cents, payout_id]
  );
  return res.rows[0];
}

/**
 * Récupère l'historique des payouts pour un scout donné.
 */
async function findPayoutsByScout(scout_id) {
  const res = await db.query(
    `SELECT *
       FROM payouts
      WHERE scout_id = $1
      ORDER BY paid_at DESC`,
    [scout_id]
  );
  return res.rows;
}

module.exports = { insertPayout, findPayoutsByScout };
