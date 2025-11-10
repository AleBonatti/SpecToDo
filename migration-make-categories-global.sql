-- ============================================================================
-- Migration: Make Categories Global (Remove user_id)
-- ============================================================================
-- This script:
-- 1. Drops RLS policies that depend on user_id
-- 2. Updates items to reference canonical categories
-- 3. Removes duplicate categories
-- 4. Drops foreign key constraint
-- 5. Drops user_id column
-- 6. Creates new global RLS policies
-- 7. Adds unique constraint on name
-- 8. Seeds default categories if needed
-- ============================================================================

-- Step 1: Drop existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own custom categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own empty custom categories" ON categories;

-- Step 2: Update all items to point to the canonical category (keeping the oldest one per name)
-- Using a CTE to identify which category to keep for each name
WITH canonical_categories AS (
  SELECT DISTINCT ON (name)
    id,
    name
  FROM categories
  ORDER BY name, created_at ASC  -- Keep the oldest category for each name
)
UPDATE items
SET category_id = cc.id
FROM canonical_categories cc
WHERE items.category_id IN (
  SELECT c.id
  FROM categories c
  WHERE c.name = cc.name
  AND c.id != cc.id
);

-- Step 3: Delete duplicate categories (keep only the oldest one of each name)
DELETE FROM categories
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM categories
  ORDER BY name, created_at ASC
);

-- Step 4: Drop the foreign key constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Step 5: Drop the user_id column
ALTER TABLE categories
DROP COLUMN IF EXISTS user_id;

-- Step 6: Create new global RLS policies (allow all authenticated users to read)
-- Enable RLS if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read all categories
CREATE POLICY "Anyone can view all categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Only allow admins to insert/update/delete categories
-- For now, we'll make categories read-only for regular users
CREATE POLICY "Only service role can modify categories"
  ON categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 7: Add unique constraint on category name
ALTER TABLE categories
ADD CONSTRAINT categories_name_unique UNIQUE (name);

-- Step 8: Seed default categories if the table is empty or missing standard ones
INSERT INTO categories (name, type, created_at, updated_at)
SELECT name, 'default', NOW(), NOW()
FROM (VALUES
  ('Movies'),
  ('Restaurants'),
  ('Books'),
  ('Places'),
  ('Music'),
  ('Games'),
  ('Travel'),
  ('Shopping'),
  ('Health'),
  ('Other')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.name = v.name
)
ON CONFLICT (name) DO NOTHING;

-- Step 9: Verify the results
SELECT
  name,
  type,
  COUNT(*) OVER() as total_categories,
  (SELECT COUNT(*) FROM items WHERE items.category_id = categories.id) as items_count
FROM categories
ORDER BY name;
