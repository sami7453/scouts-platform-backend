// src/routes/scouts-download.js
const express = require('express');
const { presignedGet } = require('../lib/r2-helpers');
const { R2_DOCS_BUCKET } = require('../lib/r2');
const scoutService = require('../services/scoutService');

const router = express.Router();

router.get('/me/vision-qa', async (req, res) => {
    try {
        const me = await scoutService.getProfile(req.user.id); // renvoie { user, scout }
        const key = me?.scout?.test_report_url;
        if (!key) return res.status(404).json({ error: 'Aucun fichier de test' });

        const url = await presignedGet({
            bucket: R2_DOCS_BUCKET,
            key,
            expiresIn: 30 * 60, // 30 min
            responseDisposition: 'inline; filename="vision_qa.pdf"',
        });

        return res.json({ url });
    } catch (e) {
        console.error('vision-qa download error:', e);
        return res.status(500).json({ error: 'Impossible de générer le lien' });
    }
});

module.exports = router;
