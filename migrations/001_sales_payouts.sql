-- Sales and Payouts tables
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
  club_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  stripe_payment_intent TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  scout_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payout_id TEXT,
  paid_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_club ON sales(club_id);
CREATE INDEX IF NOT EXISTS idx_payouts_scout ON payouts(scout_id);
