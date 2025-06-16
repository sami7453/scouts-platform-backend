// ----- File: src/models/scoutModel.js -----
const db = require('../db');

/**
 * Create a minimal scout profile after user registration
 * with only user_id set; other fields null for now.
 */
async function createScoutProfile(userId) {
    const res = await db.query(
        `INSERT INTO scouts(user_id, photo_url, bio, vision_qa, test_report_url)
     VALUES($1, NULL, NULL, NULL, NULL)
     RETURNING *`,
        [userId]
    );
    return res.rows[0];
}

/**
 * Find existing scout profile by user ID
 */
async function findScoutByUserId(userId) {
    const res = await db.query(
        'SELECT * FROM scouts WHERE user_id = $1',
        [userId]
    );
    return res.rows[0];
}
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

module.exports = {
    createScoutProfile,
    findScoutByUserId,
    updateScoutProfile
};