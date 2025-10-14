// src/services/reservationService.js
const {
    listAvailableSlots,
    createReservation,
    cancelReservation,
    listReservationsForScout,
    listMyReservations
} = require('../models/reservationModel');

function assertBookerRole(user) {
    // si tu veux limiter aux clubs/other_user :
    if (!['club', 'other_user', 'admin'].includes(user.role)) {
        const e = new Error('Seuls clubs/other_users peuvent réserver');
        e.status = 403;
        throw e;
    }
}

function isoOrThrow(s) {
    if (!s) throw new Error('date manquante');
    return s;
}

async function getAvailable({ scoutId, from, to }) {
    return listAvailableSlots(scoutId, isoOrThrow(from), isoOrThrow(to));
}

async function book(user, { scoutId, starts_at, purpose }) {
    assertBookerRole(user);
    try {
        return await createReservation({ scoutId, bookerUserId: user.id, startsAtISO: starts_at, purpose });
    } catch (err) {
        // 23P01 = exclusion_violation (chevauchement) ; 23514 = check_violation (trigger/règle)
        if (err.code === '23P01') {
            const e = new Error('Créneau déjà réservé');
            e.status = 409;
            throw e;
        }
        if (err.code === '23514') {
            const e = new Error('Créneau hors disponibilités');
            e.status = 422;
            throw e;
        }
        throw err;
    }
}

async function cancel(user, { id }) {
    const row = await cancelReservation({ id, userId: user.id, allowScoutCancel: true });
    if (!row) {
        const e = new Error('Annulation impossible');
        e.status = 403;
        throw e;
    }
    return row;
}

async function myReservations(user, { from, to }) {
    return listMyReservations(user.id, isoOrThrow(from), isoOrThrow(to));
}

async function scoutReservations(user, { scoutId, from, to }) {
    return listReservationsForScout(scoutId ?? user.id, isoOrThrow(from), isoOrThrow(to));
}

module.exports = { getAvailable, book, cancel, myReservations, scoutReservations };
