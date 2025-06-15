const db = require('../db');

async function createUser(email, passwordHash, role) {
  const result = await db.query(
    'INSERT INTO users(email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
    [email, passwordHash, role]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  return result.rows[0];
}

async function findUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id=$1', [id]);
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserById };
