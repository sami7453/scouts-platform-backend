const reportService = require('../services/reportService');

exports.create = async (req, res) => {
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const report = await reportService.createReport(req.body, fileUrl, req.user.id);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  const filters = req.query;
  const reports = await reportService.listReports(filters);
  res.json(reports);
};

exports.get = async (req, res) => {
  try {
    const report = await reportService.getReport(parseInt(req.params.id, 10));
    res.json(report);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const fields = req.body;
    const updated = await reportService.updateReport(parseInt(req.params.id, 10), fields);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await reportService.deleteReport(parseInt(req.params.id, 10));
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};