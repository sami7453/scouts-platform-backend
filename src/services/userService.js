const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');
const userModel = require('../models/userModel');

async function register({ email, password, role }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) throw new Error('Email already in use');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(email, passwordHash, role);
  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
}

async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Invalid credentials');
  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
}

async function getProfile(id) {
  const user = await userModel.findUserById(id);
  if (!user) throw new Error('User not found');
  delete user.password_hash;
  return user;
}

module.exports = { register, login, getProfile };
