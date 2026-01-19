-- 在 apps 表中添加 user_email 字段
-- 这样可以避免关联查询 users 表

ALTER TABLE apps 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Add Comment
COMMENT ON COLUMN apps.user_email IS 'Author\'s email, redundantly stored from users table at creation';
