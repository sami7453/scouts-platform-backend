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
 * Pour role=other_user, on attend aussi firstname/lastname.
 */
async function register({ email, password, role }) {
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
    } else if (role === 'club') {
      await createClubProfileTx(user.id, client);
    } else if (role === 'other_user') {
      // ⬇️ on laisse NULL possible (option B)
      await createOtherUserProfileTx(user.id, client);
    }
    // admin => pas de profil lié

    await client.query('COMMIT');
    return { id: user.id, email: user.email, role: user.role };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


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

module.exports = { register, login, getProfile, updateProfile,
};
