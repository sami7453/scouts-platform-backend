// ----- File: src/models/scoutModel.js -----
const db = require('../db');

/**
 * Crée un profil minimal pour un scout (autopopulé à l'inscription).
 */
async function createScoutProfile(userId) {
  const res = await db.query(
    `INSERT INTO scouts(
       user_id, photo_url, bio, vision_qa, test_report_url
     ) VALUES($1, NULL, NULL, NULL, NULL)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

/**
 * Récupère le profil scout (incluant stripe_account_id pour Connect).
 */
async function findScoutByUserId(userId) {
  const res = await db.query(
    `SELECT * FROM scouts
     WHERE user_id = $1`,
    [userId]
  );
  return res.rows[0];
}

/**
 * Met à jour les champs du profil scout.
 */
async function updateScoutProfile(userId, fields) {
  const keys = Object.keys(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => fields[k]);
  values.push(userId);

  const res = await db.query(
    `UPDATE scouts
       SET ${sets.join(', ')}
     WHERE user_id = $${keys.length + 1}
     RETURNING *`,
    values
  );
  return res.rows[0];
}

async function setStripeAccountId(userId, stripeAccountId) {
  const res = await db.query(
    `UPDATE scouts
       SET stripe_account_id = $1
     WHERE user_id = $2
     RETURNING *`,
    [stripeAccountId, userId]
  );
  return res.rows[0];
}

module.exports = {
  createScoutProfile,
  findScoutByUserId,
  updateScoutProfile,
  setStripeAccountId
};
