// ----- File: src/models/otherUserModel.js -----
const db = require('../db');

async function createOtherUserProfile(userId) {
  const res = await db.query(
    `INSERT INTO other_users(user_id, firstname, lastname)
     VALUES ($1, NULL, NULL)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

// transactionnelle
async function createOtherUserProfileTx(userId, client = db) {
  const res = await client.query(
    `INSERT INTO other_users(user_id, firstname, lastname)
     VALUES ($1, NULL, NULL)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
}

async function findOtherUserByUserId(userId) {
  const res = await db.query(
    'SELECT * FROM other_users WHERE user_id = $1',
    [userId]
  );
  return res.rows[0];
}

module.exports = {
  createOtherUserProfile,
  createOtherUserProfileTx,
  findOtherUserByUserId,
};
