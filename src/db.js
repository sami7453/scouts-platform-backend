require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Pour exécuter des transactions manuelles (BEGIN/COMMIT/ROLLBACK).
 */
async function getClient() {
  return pool.connect();
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient,
};
