const reportService = require('../services/reportService');

/**
 * Create a new scouting report
 * req.body.file_key (clé R2 privée posée par la route /reports via multer memory + putBuffer)
 */
exports.create = async (req, res) => {
  try {
    // Ancien: const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const fileKey = req.body.file_key || null; // ex: "docs/<userId>/<timestamp>-<hash>--<name>.pdf"
    if (!fileKey) {
      return res.status(400).json({ error: 'file_key manquant: upload PDF requis (champ "pdf").' });
    }

    const report = await reportService.createReport(req.body, fileKey, req.user.id);
    return res.status(201).json(report);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * List reports with optional filters
 */
exports.list = async (req, res) => {
  const filters = req.query;
  const reports = await reportService.listReports(filters);
  return res.json(reports);
};

/**
 * Retrieve a single report by id
 */
exports.get = async (req, res) => {
  try {
    const report = await reportService.getReport(parseInt(req.params.id, 10));
    return res.json(report);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

/**
 * Update an existing report
 * (Si un jour tu autorises le remplacement du PDF, fais passer la route d'update par le même middleware
 * upload et récupère ici un éventuel req.body.file_key pour le transmettre au service.)
 */
exports.update = async (req, res) => {
  try {
    const fields = { ...req.body };
    // si jamais on supporte file_key en update:
    // if (req.body.file_key) fields.file_key = req.body.file_key;

    const updated = await reportService.updateReport(parseInt(req.params.id, 10), fields);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a report
 */
exports.remove = async (req, res) => {
  try {
    await reportService.deleteReport(parseInt(req.params.id, 10));
    return res.status(204).end();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
