// src/lib/r2-helpers.js
const crypto = require('crypto');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2, R2_PUBLIC_BASE_URL } = require('./r2');

function safeName(name) {
    return String(name || 'file')
        .normalize('NFKD')
        .replace(/[^\w.\-]+/g, '_')
        .slice(0, 180);
}

function hashName(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

async function putBuffer({ bucket, key, buffer, contentType, cacheControl }) {
    await r2.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ...(cacheControl ? { CacheControl: cacheControl } : {}),
    }));
    return key;
}

// ⬇️ nécessaire pour lire l’original depuis R2 (filigrane)
async function getBuffer({ bucket, key }) {
    const res = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const chunks = [];
    for await (const c of res.Body) chunks.push(c);
    return Buffer.concat(chunks);
}

function publicUrlFor({ key }) {
    if (!R2_PUBLIC_BASE_URL) return null;
    const base = R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
    const path = String(key).replace(/^\/+/, '');
    return `${base}/${path}`;
}

async function presignedGet({ bucket, key, expiresIn = 1800, responseDisposition }) {
    const cmd = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ...(responseDisposition ? { ResponseContentDisposition: responseDisposition } : {}),
    });
    return getSignedUrl(r2, cmd, { expiresIn });
}

module.exports = {
    safeName,
    hashName,
    putBuffer,
    getBuffer,        // ⬅️ remis dans l’export
    publicUrlFor,
    presignedGet,
};
