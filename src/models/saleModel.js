// ----- File: src/models/saleModel.js -----
const db = require('../db');

async function insertSale(sale) {
    const { report_id, club_id, amount_cents, commission_cents, payment_intent } = sale;
    const res = await db.query(
        `INSERT INTO sales(
      report_id, club_id, amount_cents, commission_cents, stripe_payment_intent
    ) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [report_id, club_id, amount_cents, commission_cents, payment_intent]
    );
    return res.rows[0];
}

async function getSalesByClub(club_id) {
    const res = await db.query(
        'SELECT * FROM sales WHERE club_id = $1 ORDER BY purchased_at DESC',
        [club_id]
    );
    return res.rows;
}

module.exports = { insertSale, getSalesByClub };