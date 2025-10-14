const reservationService = require('../services/reservationService');

exports.available = async (req, res) => {
    try {
        const rows = await reservationService.getAvailable({
            scoutId: Number(req.query.scout_id),
            from: req.query.from,
            to: req.query.to
        });
        res.json(rows);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

exports.book = async (req, res) => {
    try {
        const created = await reservationService.book(req.user, {
            scoutId: req.body.scout_id,
            starts_at: req.body.starts_at,
            purpose: req.body.purpose
        });
        res.status(201).json(created);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

exports.cancel = async (req, res) => {
    try {
        const row = await reservationService.cancel(req.user, { id: Number(req.params.id) });
        res.json(row);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

exports.mine = async (req, res) => {
    try {
        const rows = await reservationService.myReservations(req.user, {
            from: req.query.from,
            to: req.query.to
        });
        res.json(rows);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};

exports.forScout = async (req, res) => {
    try {
        const rows = await reservationService.scoutReservations(req.user, {
            scoutId: Number(req.params.scoutId),
            from: req.query.from,
            to: req.query.to
        });
        res.json(rows);
    } catch (err) {
        res.status(err.status || 400).json({ error: err.message });
    }
};
