// ----- File: src/models/saleModel.js -----
const db = require('../db');

async function insertSale(sale, client = db) {
  const {
    report_id, club_id, amount_cents, commission_cents, payment_intent,
  } = sale;
  const res = await client.query(
    `INSERT INTO sales(
      report_id, club_id, amount_cents, commission_cents, stripe_payment_intent
    ) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [report_id, club_id, amount_cents, commission_cents, payment_intent],
  );
  return res.rows[0];
}

async function findSalesByClub(club_id) {
  const res = await db.query(
    'SELECT * FROM sales WHERE club_id = $1 ORDER BY purchased_at DESC',
    [club_id],
  );
  return res.rows;
}

async function findSalesByScout(scout_id) {
  const res = await db.query(
    `SELECT s.*
       FROM sales s
       JOIN reports r ON r.id = s.report_id
      WHERE r.scout_id = $1
   ORDER BY s.purchased_at DESC`,
    [scout_id],
  );
  return res.rows;
}

module.exports = { insertSale, findSalesByClub, findSalesByScout };
