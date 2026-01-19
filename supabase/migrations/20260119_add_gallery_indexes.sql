-- 优化 Gallery 查询的复合索引
-- 用于: 分类筛选 + 点赞数排序

-- 当有分类筛选时使用的复合索引
CREATE INDEX IF NOT EXISTS idx_apps_public_category_likes 
ON apps(is_public, category, like_count DESC)
WHERE is_public = true;

-- 说明：
-- 1. idx_apps_public_likes 用于无分类筛选的查询（is_public + like_count）
-- 2. idx_apps_public_category_likes 用于有分类筛选的查询（is_public + category + like_count）
-- 3. 使用 partial index (WHERE is_public = true) 减少索引大小，只索引公开的 apps
