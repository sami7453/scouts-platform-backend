// ----- File: src/services/scoutService.js -----
const { findScoutByUserId, updateScoutProfile } = require('../models/scoutModel');
const userModel = require('../models/userModel');

async function updateProfile(userId, fields) {
  // Vérifier que le scout existe
  const scout = await findScoutByUserId(userId);
  if (!scout) throw new Error('Profil scout introuvable');
  // Mettre à jour et renvoyer le profil
  return updateScoutProfile(userId, fields);
}

/**
 * Retrieve full scout profile merging user and scout tables
 * @param {number} userId
 */
async function getProfile(userId) {
  const user = await userModel.findUserById(userId);
  const scout = await findScoutByUserId(userId);
  if (!user || !scout) throw new Error('Profil scout introuvable');
  return { user, scout };
}

module.exports = {
  // ... createReport, listReports, etc.
  updateProfile,
  getProfile,
};
