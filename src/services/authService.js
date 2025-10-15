// ----- File: src/services/authService.js -----
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const db = require('../db');

const { createScoutProfileTx } = require('../models/scoutModel');
const { createClubProfileTx } = require('../models/clubModel');
const { createOtherUserProfileTx } = require('../models/otherUserModel');
require('dotenv').config();

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

/**
 * Enregistrement d'un nouvel utilisateur + profil lié dans une transaction.
 * NOTE: firstname/lastname peuvent être undefined → on passe null (option B).
 */
async function register({ email, password, role, firstname, lastname }) {
  console.log('[REGISTER] start', { email, role });
  console.log('[REGISTER] function presence', {
    createUserTx: !!userModel.createUserTx,
    scoutTx: !!require('../models/scoutModel').createScoutProfileTx,
    clubTx: !!require('../models/clubModel').createClubProfileTx,
    otherTx: !!require('../models/otherUserModel').createOtherUserProfileTx,
  });

  if (!['scout', 'club', 'other_user', 'admin'].includes(role)) {
    throw new Error('Rôle invalide');
  }

  const existing = await userModel.findUserByEmail(email);
  if (existing) throw new Error('Email déjà utilisé');

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const password_hash = await bcrypt.hash(password, 10);
    const user = await userModel.createUserTx({ email, password_hash, role }, client);

    if (role === 'scout') {
      await createScoutProfileTx(user.id, client);
      console.log('[REGISTER] created profiles for role', role, 'userId', user.id);
    } else if (role === 'club') {
      await createClubProfileTx(user.id, client);
      console.log('[REGISTER] created profiles for role', role, 'userId', user.id);
    } else if (role === 'other_user') {
      // ✅ bonne signature: on passe un objet + on laisse null si absent
      await createOtherUserProfileTx(user.id, client);
      console.log('[REGISTER] created profiles for role', role, 'userId', user.id);
    }
    // admin → pas de profil

    await client.query('COMMIT');
    return { id: user.id, email: user.email, role: user.role };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[REGISTER] error', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  register,
  // garde login/getProfile/updateProfile tels que déjà définis dans ton fichier
  // login,
  // getProfile,
  // updateProfile,
};




async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  if (!user) throw new Error('Identifiants invalides');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Identifiants invalides');
  const token = sign(user);
  return { token };
}

async function getProfile(id) {
  const user = await userModel.findUserById(id);
  if (!user) throw new Error('Utilisateur non trouvé');
  return user;
}

async function updateProfile(id, data) {
  const fields = {};
  if (data.email) {
    const existing = await userModel.findUserByEmail(data.email);
    if (existing && existing.id !== id) throw new Error('Cet email est déjà utilisé');
    fields.email = data.email;
  }
  if (data.password) fields.password_hash = await bcrypt.hash(data.password, 10);
  return userModel.updateUser(id, fields);
}

module.exports = {
  register, login, getProfile, updateProfile,
};
