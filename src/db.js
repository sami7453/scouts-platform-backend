const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Basic query helper and helper to obtain a client for transactions.
 */
module.exports = {
  query: (text, params) => pool.query(text, params),
  /** Return a dedicated client for transaction usage */
  getClient: () => pool.connect(),
};
