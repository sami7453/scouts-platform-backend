// src/lib/upload.js
const multer = require('multer');
const uploadMem = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
module.exports = { uploadMem };
