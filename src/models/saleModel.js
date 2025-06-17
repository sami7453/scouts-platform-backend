// ----- File: src/models/saleModel.js -----
/**
 * Modèle pour la table sales.
 */
const db = require('../db');

/**
 * Insère une vente dans sales. Si un client PG est passé,
 * il est utilisé (transaction), sinon on utilise pool.query.
 */
async function insertSale(sale, client = db) {
  const { report_id, club_id, amount_cents, commission_cents, payment_intent } = sale;
  const res = await client.query(
    `INSERT INTO sales(
       report_id, club_id, amount_cents, commission_cents, stripe_payment_intent
     ) VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [report_id, club_id, amount_cents, commission_cents, payment_intent]
  );
  return res.rows[0];
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
