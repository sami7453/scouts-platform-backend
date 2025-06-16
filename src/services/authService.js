// ----- File: src/services/authService.js -----
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { createScoutProfile } = require('../models/scoutModel');

/**
 * Register a new user. If role is 'scout', create an associated scout profile.
 */
async function register({ email, password, role }) {
    const existing = await userModel.findUserByEmail(email);
    if (existing) throw new Error('Email déjà utilisé');

    // Hash the password
    const hash = await bcrypt.hash(password, 10);
    // Create user in 'users' table
    const user = await userModel.createUser(email, hash, role);

    // If the user is a scout, automatically create a minimal scout profile
    let message = null;
    if (role === 'scout') {
        await createScoutProfile(user.id);
        message = 'Compte créé ! Pensez à compléter votre profil scout (photo, bio, vision_qa, test_report_url).';
    }

    return { user, message };
}

/**
 * Authenticate a user and return a JWT.
 */
async function login({ email, password }) {
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Identifiants invalides');

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
    );
    return { token };
}

/**
 * Retrieve user profile by ID.
 */
async function getProfile(id) {
    const user = await userModel.findUserById(id);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;
}

module.exports = { register, login, getProfile };
