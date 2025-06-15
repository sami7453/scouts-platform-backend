const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function generateToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '12h' });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
