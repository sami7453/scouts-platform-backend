// src/models/availabilityModel.js
const db = require('../db');

/** Remplace TOUTES les règles actives du scout par la nouvelle liste */
async function replaceRules(scoutId, rules) {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM public.scout_availability_rules WHERE scout_id = $1', [scoutId]);

        const q = `
      INSERT INTO public.scout_availability_rules
      (scout_id, weekday, start_time, end_time, timezone, active, slot_minutes)
      VALUES ($1,$2,$3,$4,$5,true,30)
      RETURNING *`;
        const inserted = [];
        for (const r of rules) {
            const { weekday, start_time, end_time, timezone = 'Europe/Paris' } = r;
            const res = await client.query(q, [scoutId, weekday, start_time, end_time, timezone]);
            inserted.push(res.rows[0]);
        }
        await client.query('COMMIT');
        return inserted;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getRules(scoutId) {
    const res = await db.query(
        `SELECT id, scout_id, weekday, start_time, end_time, timezone, active, slot_minutes
     FROM public.scout_availability_rules
     WHERE scout_id = $1 AND active
     ORDER BY weekday, start_time`,
        [scoutId]
    );
    return res.rows;
}

module.exports = { replaceRules, getRules };
