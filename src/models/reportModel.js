// ----- File: src/models/reportModel.js -----
const db = require('../db');

async function insertReport(report) {
  const {
    scout_id, player_firstname, player_lastname,
    position, nationality, age, current_club,
    current_league, content_text, pdf_url, price_cents,
  } = report;
  const res = await db.query(
    `INSERT INTO reports(
       scout_id, player_firstname, player_lastname,
       position, nationality, age, current_club,
       current_league, content_text, pdf_url, price_cents
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [scout_id, player_firstname, player_lastname,
      position, nationality, age, current_club,
      current_league, content_text, pdf_url, price_cents],
  );
  return res.rows[0];
}

async function getAllReports(filters) {
  // filters: { position, nationality, age, current_league }
  let base = 'SELECT * FROM reports';
  const where = [];
  const values = [];
  let idx = 1;
  // eslint-disable-next-line no-restricted-syntax
  for (const key of ['position', 'nationality', 'age', 'current_league']) {
    if (filters[key]) {
      where.push(`${key} = $${idx}`);
      values.push(filters[key]);
      // eslint-disable-next-line no-plusplus
      idx++;
    }
  }
  if (where.length) base += ` WHERE ${where.join(' AND ')}`;
  const res = await db.query(base, values);
  return res.rows;
}

async function getReportById(id) {
  const res = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
  return res.rows[0];
}

async function updateReportById(id, fields) {
  const keys = Object.keys(fields);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const values = keys.map((k) => fields[k]);
  values.push(id);
  const res = await db.query(
    `UPDATE reports SET ${sets.join(', ')} WHERE id = $${keys.length + 1} RETURNING *`,
    values,
  );
  return res.rows[0];
}

async function deleteReportById(id) {
  await db.query('DELETE FROM reports WHERE id = $1', [id]);
}

module.exports = {
  insertReport, getAllReports, getReportById, updateReportById, deleteReportById,
};
