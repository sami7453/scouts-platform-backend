const db = require('../db');

async function insertPayout({ sale_id, scout_id, amount_cents, payout_id }, client = db) {
  const res = await client.query(
    `INSERT INTO payouts(sale_id, scout_id, amount_cents, stripe_payout_id)
     VALUES($1,$2,$3,$4) RETURNING *`,
    [sale_id, scout_id, amount_cents, payout_id],
  );
  return res.rows[0];
}

async function findPayoutsByScout(scout_id) {
  const res = await db.query(
    'SELECT * FROM payouts WHERE scout_id = $1 ORDER BY paid_at DESC',
    [scout_id],
  );
  return res.rows;
}

module.exports = { insertPayout, findPayoutsByScout };
