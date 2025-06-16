// ----- File: src/models/userModel.js -----
const db = require('../db');

async function createUser(email, passwordHash, role) {
  const res = await db.query(
    'INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3) RETURNING id, email, role',
    [email, passwordHash, role],
  );
  return res.rows[0];
}

async function findUserByEmail(email) {
  const res = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return res.rows[0];
}

async function findUserById(id) {
  const res = await db.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [id],
  );
  return res.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserById };
