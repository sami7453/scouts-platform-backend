// src/controllers/stripeController.js
const stripeService = require('../services/stripeService');
const userModel = require('../models/userModel');

exports.onboard = async (req, res) => {
    try {
        const userId = req.user.id;
        // Récupérer l’email depuis la table users
        const user = await userModel.findUserById(userId);
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        const url = await stripeService.createOnboardingLink(userId, user.email);
        res.json({ url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
