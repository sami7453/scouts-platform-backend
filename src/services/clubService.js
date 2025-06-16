// ----- File: src/services/clubService.js -----
const { findClubByUserId, updateClubProfile } = require('../models/clubModel');

async function updateProfile(userId, fields) {
    const club = await findClubByUserId(userId);
    if (!club) throw new Error('Profil club introuvable');
    return updateClubProfile(userId, fields);
}

module.exports = { updateProfile };
