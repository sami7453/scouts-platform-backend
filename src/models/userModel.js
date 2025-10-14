// ----- File: src/models/userModel.js -----
const db = require('../db');

async function createUser(email, passwordHash, role) {
  const res = await db.query(
    `INSERT INTO users(email, password_hash, role)
     VALUES($1,$2,$3)
     RETURNING id, email, role`,
    [email, passwordHash, role]
  );
  return res.rows[0];
}

// ⬇️ nouvelle version qui utilise un client transactionnel
async function createUserTx({ email, password_hash, role }, client = db) {
  const res = await client.query(
    `INSERT INTO users(email, password_hash, role)
     VALUES($1,$2,$3)
     RETURNING id, email, role`,
    [email, password_hash, role]
  );
  return res.rows[0];
}

async function findUserByEmail(email) {
  const res = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0];
}

async function findUserById(id) {
  const res = await db.query(`SELECT id, email, role FROM users WHERE id = $1`, [id]);
  return res.rows[0];
}

async function updateUser(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findUserById(id);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map(k => fields[k]);
  values.push(id);
  const res = await db.query(
    `UPDATE users SET ${sets.join(', ')}
     WHERE id = $${keys.length + 1}
     RETURNING id, email, role`,
    values
  );
  return res.rows[0];
}

module.exports = {
  createUser,
  createUserTx,     // ⬅️ export
  findUserByEmail,
  findUserById,
  updateUser
};
