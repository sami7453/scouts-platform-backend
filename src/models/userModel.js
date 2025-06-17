// src/models/userModel.js
const db = require('../db');

/**
 * Crée un nouvel utilisateur.
 */
async function createUser(email, passwordHash, role) {
  const res = await db.query(
    `INSERT INTO users(email, password_hash, role)
     VALUES($1,$2,$3)
     RETURNING id, email, role`,
    [email, passwordHash, role]
  );
  return res.rows[0];
}

/**
 * Cherche un utilisateur par email.
 */
async function findUserByEmail(email) {
  const res = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return res.rows[0];
}

/**
 * Cherche un utilisateur par ID.
 */
async function findUserById(id) {
  const res = await db.query(
    `SELECT id, email, role FROM users WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

/**
 * Met à jour l'email et/ou le mot de passe hashé d'un utilisateur.
 * fields = { email?, password_hash? }
 */
async function updateUser(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findUserById(id);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => fields[k]);
  values.push(id);
  const res = await db.query(
    `UPDATE users
       SET ${sets.join(', ')}
     WHERE id = $${keys.length + 1}
     RETURNING id, email, role`,
    values
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser
};
