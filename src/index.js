require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const { verifyToken } = require('./middleware/auth');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit);

app.use('/api/auth', authRoutes);

app.use('/api/reports', verifyToken, reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
