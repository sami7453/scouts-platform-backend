// src/models/reservationModel.js
const db = require('../db');

/** Liste des créneaux DISPONIBLES (non réservés) générés à la volée depuis la semaine-type */
async function listAvailableSlots(scoutId, fromISO, toISO) {
    const q = `
  WITH rules AS (
    SELECT * FROM public.scout_availability_rules
    WHERE scout_id = $1 AND active
  ),
  days AS (
    SELECT d::date AS d
    FROM generate_series($2::date, $3::date, interval '1 day') g(d)
  ),
  applicable AS (
    SELECT r.*, d.d
    FROM rules r
    JOIN days d
      ON EXTRACT(DOW FROM d.d) = r.weekday
  ),
  starts AS (
    SELECT
      r.scout_id,
      generate_series(
        make_timestamptz(EXTRACT(YEAR  FROM d)::int, EXTRACT(MONTH FROM d)::int, EXTRACT(DAY FROM d)::int,
                         EXTRACT(HOUR  FROM r.start_time)::int, EXTRACT(MINUTE FROM r.start_time)::int, 0, r.timezone),
        make_timestamptz(EXTRACT(YEAR  FROM d)::int, EXTRACT(MONTH FROM d)::int, EXTRACT(DAY FROM d)::int,
                         EXTRACT(HOUR  FROM r.end_time)::int,   EXTRACT(MINUTE FROM r.end_time)::int,   0, r.timezone)
          - interval '30 minutes',
        interval '30 minutes'
      ) AS starts_at
    FROM applicable r
  ),
  available AS (
    SELECT s.scout_id, s.starts_at, s.starts_at + interval '30 minutes' AS ends_at
    FROM starts s
    WHERE NOT EXISTS (
      SELECT 1 FROM public.reservations rv
      WHERE rv.scout_id = s.scout_id
        AND rv.status = 'booked'
        AND tstzrange(rv.starts_at, rv.ends_at, '[)') && tstzrange(s.starts_at, s.ends_at, '[)')
    )
  )
  SELECT * FROM available
  WHERE starts_at >= $2::timestamptz AND ends_at <= $3::timestamptz
  ORDER BY starts_at;`;
    const res = await db.query(q, [scoutId, fromISO, toISO]);
    return res.rows;
}

/** Crée une réservation (tombera en erreur si conflit/trigger) */
async function createReservation({ scoutId, bookerUserId, startsAtISO, purpose }) {
    const q = `
    INSERT INTO public.reservations (scout_id, booker_user_id, starts_at, ends_at, status, purpose)
    VALUES ($1, $2, $3::timestamptz, ($3::timestamptz + interval '30 minutes'), 'booked', $4)
    RETURNING *`;
    const res = await db.query(q, [scoutId, bookerUserId, startsAtISO, purpose || null]);
    return res.rows[0];
}

async function cancelReservation({ id, userId, allowScoutCancel = true }) {
    // un booker peut annuler sa résa ; un scout peut annuler les siennes
    const q = `
    UPDATE public.reservations r
       SET status = 'cancelled'
     WHERE r.id = $1
       AND (
         r.booker_user_id = $2
         OR ($3 AND r.scout_id IN (SELECT user_id FROM public.scouts WHERE user_id = $2))
       )
     RETURNING *`;
    const res = await db.query(q, [id, userId, allowScoutCancel]);
    return res.rows[0];
}

async function listReservationsForScout(scoutId, fromISO, toISO) {
    const res = await db.query(
        `SELECT * FROM public.reservations
      WHERE scout_id = $1
        AND starts_at >= $2::timestamptz
        AND ends_at   <= $3::timestamptz
      ORDER BY starts_at`,
        [scoutId, fromISO, toISO]
    );
    return res.rows;
}

async function listMyReservations(userId, fromISO, toISO) {
    const res = await db.query(
        `SELECT * FROM public.reservations
      WHERE booker_user_id = $1
        AND starts_at >= $2::timestamptz
        AND ends_at   <= $3::timestamptz
      ORDER BY starts_at`,
        [userId, fromISO, toISO]
    );
    return res.rows;
}

module.exports = {
    listAvailableSlots,
    createReservation,
    cancelReservation,
    listReservationsForScout,
    listMyReservations
};
