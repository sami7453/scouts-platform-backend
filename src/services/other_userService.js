const { findOtherUserByUserId, updateOtherUserProfile } = require('../models/other_userModel');
const userModel = require('../models/userModel');

/**
 * Update other user profile
 * @param {number} userId
 * @param {object} fields
 */
async function updateProfile(userId, fields) {
    const otherUser = await findOtherUserByUserId(userId);
    if (!otherUser) throw new Error('Profil utilisateur introuvable');
    return updateOtherUserProfile(userId, fields);
}

/**
 * Retrieve full other user profile
 * @param {number} userId
 */
async function getProfile(userId) {
    const user = await userModel.findUserById(userId);
    const otherUser = await findOtherUserByUserId(userId);
    if (!user || !otherUser) throw new Error('Profil utilisateur introuvable');
    return { user, otherUser };
}

module.exports = { updateProfile, getProfile };