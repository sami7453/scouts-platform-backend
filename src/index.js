// ----- File: src/index.js -----
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const saleRoutes = require('./routes/sales');
const webhookRoutes = require('./routes/webhook');
const { verifyToken } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/webhook', webhookRoutes);

// après les routes auth et avant reports/sales
app.use('/api/scouts', require('./routes/scouts'));
app.use('/api/clubs', require('./routes/clubs'));


// Protected routes
app.use('/api/reports', verifyToken, reportRoutes);
app.use('/api/sales', verifyToken, saleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));