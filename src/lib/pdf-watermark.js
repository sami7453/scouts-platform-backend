// src/lib/pdf-watermark.js
// eslint-disable-next-line import/no-extraneous-dependencies
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

/**
 * Ajoute DEUX filigranes par page : haut-centre et bas-centre.
 * @param {Buffer} buffer - PDF source
 * @param {string} text   - ex: "Seller: … • Buyer: … • Sale#… • 2025-10-13"
 * @param {object} opts   - { size?: number, opacity?: number, angle?: number }
 * @returns {Promise<Buffer>}
 */
async function addWatermark(buffer, text, opts = {}) {
    const size = Number(opts.size) || 28;
    const opacity = Number(opts.opacity) || 0.15;
    const angle = Number.isFinite(opts.angle) ? Number(opts.angle) : 30;

    const pdf = await PDFDocument.load(buffer);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);

        // positions Y (haut & bas)
        const yTop = height * 0.52;
        const yBottom = height * 0.12;

        // X centré (grossièrement, avant rotation)
        const xCentered = (width - textWidth) / 2;

        // 1) Filigrane haut-centre
        page.drawText(text, {
            x: xCentered,
            y: yTop,
            size,
            font,
            color: rgb(0.2, 0.2, 0.2),
            opacity,
            rotate: degrees(angle),
            // Pas de maxWidth ici, on préfère une ligne claire et centrée
        });

        // 2) Filigrane bas-centre
        page.drawText(text, {
            x: xCentered,
            y: yBottom,
            size,
            font,
            color: rgb(0.2, 0.2, 0.2),
            opacity,
            rotate: degrees(angle),
        });
    });

    const out = await pdf.save();
    return Buffer.from(out);
}

module.exports = { addWatermark };
