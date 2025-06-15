require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
// … autres routes

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit);

// Routes publiques
app.use('/api/auth', authRoutes);
// … webhook

// Middleware JWT
const { verifyToken } = require('./middleware/auth');
app.use('/api/reports', verifyToken, require('./routes/reports'));
app.use('/api/sales', verifyToken, require('./routes/sales'));
app.use('/api/clubs', verifyToken, require('./routes/clubs'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
