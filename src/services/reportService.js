const reportModel = require('../models/reportModel');
const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../config');

async function createReport(data, file) {
  const fileName = Date.now() + path.extname(file.originalname);
  const filePath = path.join(uploadDir, fileName);
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(filePath, file.buffer);
  const reportData = { ...data, pdfUrl: fileName };
  return reportModel.createReport(reportData);
}

async function listReports() {
  return reportModel.listReports();
}

async function getReport(id) {
  return reportModel.findReportById(id);
}

async function updateReport(id, data) {
  return reportModel.updateReport(id, data);
}

async function deleteReport(id) {
  return reportModel.deleteReport(id);
}

module.exports = { createReport, listReports, getReport, updateReport, deleteReport };
