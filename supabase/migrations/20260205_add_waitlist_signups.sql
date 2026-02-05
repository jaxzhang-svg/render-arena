-- Create waitlist_signups table for Coding Plan waitlist
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'coding_plan',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a user can only join once
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_user_id ON waitlist_signups(user_id);

-- Optional index for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at ON waitlist_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_plan ON waitlist_signups(plan);

COMMENT ON TABLE waitlist_signups IS 'Stores waitlist signups for Novita plans';
COMMENT ON COLUMN waitlist_signups.plan IS 'Plan identifier, default: coding_plan';
COMMENT ON COLUMN waitlist_signups.source IS 'Signup source, e.g. event_page';
