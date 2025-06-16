// ----- File: src/models/clubModel.js -----
const db = require('../db');

// ... createClubProfile, findClubByUserId déjà présents

/**
 * Met à jour le profil club selon les champs fournis
 */
async function updateClubProfile(userId, fields) {
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`);
    const values = keys.map(k => fields[k]);
    values.push(userId);

    const res = await db.query(
        `UPDATE clubs
       SET ${sets.join(', ')}
     WHERE user_id = $${keys.length + 1}
     RETURNING *`,
        values
    );
    return res.rows[0];
}

module.exports = {
    updateClubProfile
};
