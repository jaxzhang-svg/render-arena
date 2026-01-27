-- Create generation_quotas table for tracking LLM API calls
CREATE TABLE IF NOT EXISTS generation_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by identifier
CREATE UNIQUE INDEX IF NOT EXISTS idx_generation_quotas_identifier ON generation_quotas(identifier);

COMMENT ON TABLE generation_quotas IS 'Tracks LLM API generation calls per identifier (user ID, IP, or fingerprint)';
COMMENT ON COLUMN generation_quotas.identifier IS 'Identifier: user_id (UUID) for logged-in, IP for anonymous, or other identifiers for future use';
COMMENT ON COLUMN generation_quotas.used_count IS 'Number of API calls made';
COMMENT ON COLUMN generation_quotas.last_used_at IS 'Last time an API call was made';
