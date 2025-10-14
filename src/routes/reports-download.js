// src/routes/reports-download.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const reportService = require('../services/reportService');
const { presignedGet } = require('../lib/r2-helpers');
const { R2_DOCS_BUCKET } = require('../lib/r2');
const db = require('../db');
const { logDownload } = require('../services/auditService');

const router = express.Router();

// Limiteur: 30 requêtes / 5 min / IP
const downloadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

// util pour proposer un nom de fichier propre au download
function buildFileName(report) {
    const fn = [
        'Report',
        (report.player_firstname || '').trim(),
        (report.player_lastname || '').trim(),
        (report.position || '').trim(),
    ]
        .filter(Boolean)
        .join('_')
        .replace(/[^\w.\-]+/g, '_');
    return (fn || 'document') + '.pdf';
}

/**
 * GET /api/reports/:id/download
 * - Accès si propriétaire (scout) OU si club acheteur (sales.*)
 * - Retourne { url } = URL présignée GET (30 min)
 * - Acheteur : on préfère la copie filigranée (sales.watermarked_key) si elle existe
 */
router.get('/:id/download', verifyToken, downloadLimiter, async (req, res) => {
    try {
        const reportId = parseInt(req.params.id, 10);
        const userId = Number(req.user.id);

        // 1) vérifier accès
        const can = await reportService.userCanAccessReport(userId, reportId);
        if (!can) return res.status(403).json({ error: 'Accès refusé' });

        // 2) récupérer le report (on a besoin de file_key et scout_id)
        const report = await reportService.getReport(reportId);
        if (!report || !report.file_key) {
            return res.status(404).json({ error: 'Fichier introuvable' });
        }

        let keyToSign = report.file_key;

        // 3) si ce n'est PAS le propriétaire, tenter la version filigranée
        const isOwner = Number(report.scout_id) === userId;
        if (!isOwner) {
            const q = await db.query(
                `SELECT watermarked_key
           FROM sales
          WHERE club_id = $1
            AND report_id = $2
          ORDER BY purchased_at DESC
          LIMIT 1`,
                [userId, reportId]
            );
            const wmKey = q.rows[0]?.watermarked_key;
            if (wmKey) keyToSign = wmKey; // priorité au fichier filigrané
        }

        // 4) URL présignée GET
        const fileName = buildFileName(report);
        const url = await presignedGet({
            bucket: R2_DOCS_BUCKET,
            key: keyToSign,
            expiresIn: 30 * 60, // 30 minutes
            responseDisposition: `attachment; filename="${fileName}"`,
        });

        // 5) Audit (non bloquant)
        const ip = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip;
        const ua = req.headers['user-agent'];
        logDownload({ userId, reportId, key: keyToSign, ip, ua });

        return res.json({ url });
    } catch (e) {
        console.error('download error:', e);
        return res.status(500).json({ error: 'Échec de génération du lien' });
    }
});

module.exports = router;
