require('dotenv').config();
module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  dbUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR || 'src/uploads'
};
