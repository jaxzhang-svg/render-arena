-- Create atomic increment function for generation_quotas
-- This function ensures thread-safe quota increments using PostgreSQL's atomic operations
CREATE OR REPLACE FUNCTION increment_quota(iden TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO generation_quotas (identifier, used_count, last_used_at)
  VALUES (iden, 1, NOW())
  ON CONFLICT (identifier)
  DO UPDATE SET
    used_count = generation_quotas.used_count + 1,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_quota IS 'Atomically increment the used_count for a given identifier. Creates the record if it does not exist.';
