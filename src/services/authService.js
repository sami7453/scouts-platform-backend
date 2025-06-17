// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

/**
 * Enregistrement d'un nouvel utilisateur.
 */
async function register({ email, password, role }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) throw new Error('Email déjà utilisé');
  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(email, hash, role);
  return user;
}

/**
 * Authentification / login.
 */
async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  if (!user) throw new Error('Identifiants invalides');
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Identifiants invalides');
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  return { token };
}

/**
 * Récupère le profil (public) d'un utilisateur.
 */
async function getProfile(id) {
  const user = await userModel.findUserById(id);
  if (!user) throw new Error('Utilisateur non trouvé');
  return user;
}

/**
 * Met à jour email et/ou mot de passe d'un utilisateur.
 * data = { email?, password? }
 */
async function updateProfile(id, data) {
  const fields = {};
  if (data.email) {
    // Vérifier unicité
    const existing = await userModel.findUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new Error('Cet email est déjà utilisé');
    }
    fields.email = data.email;
  }
  if (data.password) {
    fields.password_hash = await bcrypt.hash(data.password, 10);
  }
  const updated = await userModel.updateUser(id, fields);
  return updated;
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
