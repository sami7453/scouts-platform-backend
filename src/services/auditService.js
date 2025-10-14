const db = require("../db");

async function logDownload({ userId, reportId, key, ip, ua }) {
  try {
    await db.query(
      `INSERT INTO download_audit (user_id, report_id, r2_key, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5)`,
      [userId, reportId, key, ip || null, ua || null]
    );
  } catch (e) {
    // Non bloquant: on log mais on ne casse pas le download
    console.error("Audit log insert failed:", e.message);
  }
}

module.exports = { logDownload };
