// ----- File: src/services/reportService.js -----
const reportModel = require('../models/reportModel');

async function createReport(data, fileUrl, scoutId) {
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
    pdf_url: fileUrl,
    price_cents: parseInt(data.price_cents, 10)
  });
  return report;
}

async function listReports(filters) {
  let base = 'SELECT * FROM reports';
  const where = [];
  const values = [];
  let idx = 1;

  // Mappage des champs de recherche
  const mapping = {
    firstname: 'player_firstname',
    lastname: 'player_lastname',
    club: 'current_club',
    league: 'current_league',
    nationality: 'nationality',
    position: 'position',
    age: 'age'
  };

  for (const [param, column] of Object.entries(mapping)) {
    if (filters[param]) {
      if (param === 'age') {
        where.push(`${column} = $${idx}`);
        values.push(filters[param]);
      } else {
        where.push(`${column} ILIKE $${idx}`);
        values.push(`%${filters[param]}%`);
      }
      idx++;
    }
  }

  if (where.length) base += ' WHERE ' + where.join(' AND ');
  const res = await db.query(base, values);
  return res.rows;
}


async function getReport(id) {
  const rep = await reportModel.getReportById(id);
  if (!rep) throw new Error('Rapport non trouvé');
  return rep;
}

async function updateReport(id, fields) {
  return reportModel.updateReportById(id, fields);
}

async function deleteReport(id) {
  return reportModel.deleteReportById(id);
}

module.exports = { createReport, listReports, getReport, updateReport, deleteReport };