-- ============================================================================
-- Migration: Add Actions Table and Action ID to Items
-- ============================================================================
-- This script:
-- 1. Creates the actions table
-- 2. Adds action_id column to items table
-- 3. Sets up RLS policies for actions
-- 4. Seeds default actions
--
-- IMPORTANT: After running this migration, regenerate TypeScript types if using Supabase:
-- npx supabase gen types typescript --linked > lib/supabase/types.ts
-- ============================================================================

-- Step 1: Create actions table
CREATE TABLE IF NOT EXISTS actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Add action_id column to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS action_id UUID REFERENCES actions(id) ON DELETE SET NULL;

-- Step 3: Create index on action_id for better query performance
CREATE INDEX IF NOT EXISTS idx_items_action_id ON items(action_id);

-- Step 4: Enable RLS on actions table
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Everyone can read all actions
CREATE POLICY "Anyone can view all actions"
  ON actions
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify actions (admins will use service role key)
CREATE POLICY "Only service role can modify actions"
  ON actions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Seed default actions
INSERT INTO actions (name, display_order, created_at, updated_at)
VALUES
  ('watch', 1, NOW(), NOW()),
  ('listen to', 2, NOW(), NOW()),
  ('read', 3, NOW(), NOW()),
  ('visit', 4, NOW(), NOW()),
  ('try', 5, NOW(), NOW()),
  ('play', 6, NOW(), NOW()),
  ('buy', 7, NOW(), NOW()),
  ('explore', 8, NOW(), NOW()),
  ('learn', 9, NOW(), NOW()),
  ('attend', 10, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 6: Create updated_at trigger for actions table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_actions_updated_at ON actions;
CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify the results
SELECT
  name,
  display_order,
  COUNT(*) OVER() as total_actions,
  (SELECT COUNT(*) FROM items WHERE items.action_id = actions.id) as items_count
FROM actions
ORDER BY display_order ASC;
