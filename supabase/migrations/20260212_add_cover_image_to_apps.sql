-- Add cover_image_url column to apps table for storing auto-generated cover images
ALTER TABLE apps ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;

-- Index for gallery queries to quickly find apps without cover images (for backfill)
CREATE INDEX IF NOT EXISTS idx_apps_cover_image_null ON apps (is_public, cover_image_url) WHERE is_public = true AND cover_image_url IS NULL;
