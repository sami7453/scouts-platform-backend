// ----- File: src/models/clubModel.js -----
const db = require('../db');


async function createClubProfile(userId) {
  const res = await db.query(
    `INSERT INTO clubs(user_id, name, info, photo_url, bio)
     VALUES($1, NULL, NULL, NULL, NULL)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

// ⬇️ transactionnel
async function createClubProfileTx(userId, client = db) {
  const res = await client.query(
    `INSERT INTO clubs(user_id, name, info, photo_url, bio)
     VALUES($1, NULL, NULL, NULL, NULL)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

/**
 * Retrieve club profile using the related user id
 * @param {number} userId
 */
async function findClubByUserId(userId) {
  const res = await db.query('SELECT * FROM clubs WHERE user_id = $1', [userId]);
  return res.rows[0];
}

/**
 * Met à jour le profil club selon les champs fournis
 */
async function updateClubProfile(userId, fields) {
  const keys = Object.keys(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map((k) => fields[k]);
  values.push(userId);

  const res = await db.query(
    `UPDATE clubs
       SET ${sets.join(', ')}
     WHERE user_id = $${keys.length + 1}
     RETURNING *`,
    values,
  );
  return res.rows[0];
}

module.exports = {
  createClubProfile,
  findClubByUserId,
  createClubProfileTx,
  updateClubProfile,
};
