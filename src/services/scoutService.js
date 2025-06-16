// ----- File: src/services/scoutService.js -----
const { findScoutByUserId, updateScoutProfile } = require('../models/scoutModel');

async function updateProfile(userId, fields) {
    // Vérifier que le scout existe
    const scout = await findScoutByUserId(userId);
    if (!scout) throw new Error('Profil scout introuvable');
    // Mettre à jour et renvoyer le profil
    return updateScoutProfile(userId, fields);
}

module.exports = {
    // ... createReport, listReports, etc.
    updateProfile
};
