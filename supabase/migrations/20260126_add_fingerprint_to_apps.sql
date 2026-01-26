-- Add fingerprint_id column to apps table
ALTER TABLE apps
ADD COLUMN IF NOT EXISTS fingerprint_id VARCHAR(255);

-- Add index for faster queries during migration
CREATE INDEX IF NOT EXISTS idx_apps_fingerprint_id ON apps(fingerprint_id);

-- Add comment
COMMENT ON COLUMN apps.fingerprint_id IS 'Browser fingerprint for anonymous user app ownership';
