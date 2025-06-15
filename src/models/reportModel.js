const db = require('../db');

async function createReport(data) {
  const {
    scoutId,
    playerFirstname,
    playerLastname,
    position,
    nationality,
    age,
    currentClub,
    currentLeague,
    contentText,
    pdfUrl,
    priceCents
  } = data;
  const result = await db.query(
    `INSERT INTO reports (scout_id, player_firstname, player_lastname, position, nationality, age, current_club, current_league, content_text, pdf_url, price_cents)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [scoutId, playerFirstname, playerLastname, position, nationality, age, currentClub, currentLeague, contentText, pdfUrl, priceCents]
  );
  return result.rows[0];
}

async function listReports() {
  const result = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
  return result.rows;
}

async function findReportById(id) {
  const result = await db.query('SELECT * FROM reports WHERE id=$1', [id]);
  return result.rows[0];
}

async function updateReport(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key}=$${idx}`);
    values.push(value);
    idx++;
  }
  values.push(id);
  const result = await db.query(
    `UPDATE reports SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function deleteReport(id) {
  await db.query('DELETE FROM reports WHERE id=$1', [id]);
}

module.exports = { createReport, listReports, findReportById, updateReport, deleteReport };
