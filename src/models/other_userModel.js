// File: src/models/other_userModel.js
const db = require('../db');

/**
 * Create an empty other_user profile for a newly registered user
 * @param {number} userId
 */
async function createOtherUserProfile(userId) {
    const res = await db.query(
        `INSERT INTO other_user(user_id, photo_url, bio)
         VALUES($1, NULL, NULL)
         RETURNING *`,
        [userId],
    );
    return res.rows[0];
}

/** Retrieve other_user profile using the related user id
 * @param {number} userId
 */
async function findOtherUserByUserId(userId) {
    const res = await db.query('SELECT * FROM other_user WHERE user_id = $1', [userId]);
    return res.rows[0];
}

/**
 * Met à jour le profil other_user selon les champs fournis
 */
async function updateOtherUserProfile(userId, fields) {
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const values = keys.map((k) => fields[k]);
    values.push(userId);

    const res = await db.query(
        `UPDATE other_user
       SET ${sets.join(', ')}
     WHERE user_id = $${keys.length + 1}
     RETURNING *`,
        values,
    );
    return res.rows[0];
}

module.exports = {
    createOtherUserProfile,
    findOtherUserByUserId,
    updateOtherUserProfile,
};