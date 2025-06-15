const reportService = require('../services/reportService');

exports.list = async (req, res) => {
  const reports = await reportService.listReports();
  res.json(reports);
};

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, scoutId: req.user.id };
    const report = await reportService.createReport(data, req.file);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.get = async (req, res) => {
  const report = await reportService.getReport(req.params.id);
  if (!report) return res.status(404).json({ message: 'Not found' });
  res.json(report);
};

exports.update = async (req, res) => {
  try {
    const report = await reportService.updateReport(req.params.id, req.body);
    res.json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await reportService.deleteReport(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
