-- Add category column to apps table
ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT '';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);

-- Comment on the column
COMMENT ON COLUMN apps.category IS 'App category: physics, visual, game, or empty string for uncategorized';
