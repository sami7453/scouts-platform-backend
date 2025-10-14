// ----- File: src/models/payoutModel.js -----
/**
 * Modèle pour la table payouts.
 */
const db = require('../db');

/**
 * Insère un payout (idempotent par sale_id).
 * - Si l'insert passe, on retourne la ligne insérée.
 * - Si conflit (déjà inséré pour ce sale_id), on retourne la ligne existante.
 * NOTE: on continue de stocker stripe_payout_id (souvent = payment_intent chez toi).
 */
async function insertPayout(payout, client = db) {
  const { sale_id, scout_id, amount_cents, payout_id } = payout;

  const q = `
    INSERT INTO payouts(
      sale_id, scout_id, amount_cents, stripe_payout_id, paid_at
    ) VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (sale_id)
    DO NOTHING
    RETURNING *;
  `;
  const args = [sale_id, scout_id, amount_cents, payout_id];

  const res = await client.query(q, args);
  if (res.rowCount > 0) return res.rows[0];

  // Conflit => existe déjà, on retourne la ligne existante
  const res2 = await client.query(
    `SELECT * FROM payouts WHERE sale_id = $1 LIMIT 1`,
    [sale_id]
  );
  return res2.rows[0];
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
