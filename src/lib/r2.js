// src/lib/r2.js
require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

module.exports = {
    r2,
    R2_AVATARS_BUCKET: process.env.R2_AVATARS_BUCKET,
    R2_DOCS_BUCKET: process.env.R2_DOCS_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
};
