// src/services/availabilityService.js
const { replaceRules, getRules } = require('../models/availabilityModel');

function assertScoutRole(user) {
    if (!user || user.role !== 'scout') {
        const e = new Error('Accès réservé aux scouts');
        e.status = 403;
        throw e;
    }
}

function validateRules(rules) {
    if (!Array.isArray(rules)) throw new Error('rules doit être un tableau');
    for (const r of rules) {
        const { weekday, start_time, end_time } = r;
        if (![0, 1, 2, 3, 4, 5, 6].includes(Number(weekday))) throw new Error('weekday invalide');
        if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time))
            throw new Error('start_time/end_time au format HH:MM');
    }
}

async function setWeekTemplate(user, rules) {
    assertScoutRole(user);
    validateRules(rules);
    return replaceRules(user.id, rules);
}

async function getWeekTemplate(user, scoutId) {
    // un scout voit les siennes ; admin ou club/other_user peuvent lire celles d’un scout donné
    const id = scoutId || user.id;
    return getRules(id);
}

module.exports = { setWeekTemplate, getWeekTemplate };
