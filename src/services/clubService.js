// ----- File: src/services/clubService.js -----
const { findClubByUserId, updateClubProfile } = require('../models/clubModel');
const userModel = require('../models/userModel');

async function updateProfile(userId, fields) {
  const club = await findClubByUserId(userId);
  if (!club) throw new Error('Profil club introuvable');
  return updateClubProfile(userId, fields);
}

/**
 * Retrieve full club profile
 * @param {number} userId
 */
async function getProfile(userId) {
  const user = await userModel.findUserById(userId);
  const club = await findClubByUserId(userId);
  if (!user || !club) throw new Error('Profil club introuvable');
  return { user, club };
}

module.exports = { updateProfile, getProfile };
