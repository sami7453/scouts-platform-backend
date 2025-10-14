// ----- File: src/services/reportService.js -----
const reportModel = require('../models/reportModel');
const db = require('../db');

/**
 * createReport(data, fileKey, scoutId)
 * fileKey = clé privée R2 (ex: "docs/<userId>/<ts>-<hash>--<name>.pdf")
 */
async function createReport(data, fileKey, scoutId) {
  if (!fileKey) {
    throw new Error('file_key requis (upload PDF manquant).');
  }

  const report = await reportModel.insertReport({
    scout_id: scoutId,
    player_firstname: data.player_firstname,
    player_lastname: data.player_lastname,
    position: data.position,
    nationality: data.nationality,
    age: parseInt(data.age, 10),
    current_club: data.current_club,
    current_league: data.current_league,
    content_text: data.content_text || null,
    file_key: fileKey,               // ⬅️ remplace l’ancien pdf_url
    price_cents: parseInt(data.price_cents, 10),
  });
  return report;
}

async function listReports(filters) {
  let base = 'SELECT * FROM reports';
  const where = [];
  const values = [];
  const mapping = {
    firstname: 'player_firstname',
    lastname: 'player_lastname',
    club: 'current_club',
    league: 'current_league',
    nationality: 'nationality',
    position: 'position',
    age: 'age',
  };

  Object.entries(mapping)
    .filter(([param]) => filters[param])
    .forEach(([param, column], index) => {
      if (param === 'age') {
        where.push(`${column} = $${index + 1}`);
        values.push(filters[param]);
      } else {
        where.push(`${column} ILIKE $${index + 1}`);
        values.push(`%${filters[param]}%`);
      }
    });

  if (where.length) base += ` WHERE ${where.join(' AND ')}`;
  const res = await db.query(base, values);
  return res.rows;
}

async function getReport(id) {
  const rep = await reportModel.getReportById(id);
  if (!rep) throw new Error('Rapport non trouvé');
  return rep;
}

async function updateReport(id, fields) {
  // si un jour tu acceptes de remplacer le PDF, fais passer file_key ici
  return reportModel.updateReportById(id, fields);
}

async function deleteReport(id) {
  // (optionnel) ici tu peux aussi supprimer l’objet R2 si tu stockes file_key
  return reportModel.deleteReportById(id);
}

// Vérifie si l'utilisateur peut accéder au report (proprio ou acheteur)
async function userCanAccessReport(userId, reportId) {
  // 1) Propriétaire (scout qui a créé le report) ?
  const rep = await reportModel.getReportById(reportId);
  if (!rep) return false;
  if (rep.scout_id === userId) return true;

  // 2) Acheteur (club) : une vente existe ?
  const q = await db.query(
    `SELECT 1
       FROM sales
      WHERE club_id = $1
        AND report_id = $2
      LIMIT 1`,
    [userId, reportId]
  );
  return q.rowCount > 0;
}

module.exports = {
  createReport, listReports, getReport, updateReport, deleteReport, userCanAccessReport,
};