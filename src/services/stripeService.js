// src/services/stripeService.js
const stripe = require('../utils/stripe');
const scoutModel = require('../models/scoutModel');
require('dotenv').config();

async function createOnboardingLink(userId, userEmail) {
    // 1) Récupérer ou créer l’ID de compte Stripe Connect
    let scout = await scoutModel.findScoutByUserId(userId);
    let accountId = scout.stripe_account_id;

    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'FR',
            email: userEmail
        });
        accountId = account.id;
        // Sauvegarder l’ID de compte Stripe dans la BDD
        await scoutModel.setStripeAccountId(userId, accountId);
    }

    // 2) Générer l’account link
    const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONT_URL}/onboard/refresh`,
        return_url: `${process.env.FRONT_URL}/onboard/complete`,
        type: 'account_onboarding'
    });

    return link.url;
}

module.exports = { createOnboardingLink };
