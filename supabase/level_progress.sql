-- Level Progress System for Game Level Unlocking
-- This file creates a complete level progression tracking system
-- Supports 4 levels per module with sequential unlocking

-- =====================================================
-- 1. CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS level_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id integer NOT NULL,
  level_id integer NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id, level_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for user's module progress queries
CREATE INDEX IF NOT EXISTS idx_level_progress_user_module
ON level_progress(user_id, module_id);

-- Index for completion status checks
CREATE INDEX IF NOT EXISTS idx_level_progress_completion
ON level_progress(user_id, module_id, is_completed);

-- Index for level ordering
CREATE INDEX IF NOT EXISTS idx_level_progress_level_order
ON level_progress(user_id, module_id, level_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own progress
DROP POLICY IF EXISTS "Users can view their own level progress" ON level_progress;
CREATE POLICY "Users can view their own level progress"
ON level_progress FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
DROP POLICY IF EXISTS "Users can insert their own level progress" ON level_progress;
CREATE POLICY "Users can insert their own level progress"
ON level_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
DROP POLICY IF EXISTS "Users can update their own level progress" ON level_progress;
CREATE POLICY "Users can update their own level progress"
ON level_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users cannot delete progress (optional - remove if deletion needed)
DROP POLICY IF EXISTS "Users cannot delete level progress" ON level_progress;
CREATE POLICY "Users cannot delete level progress"
ON level_progress FOR DELETE
USING (false);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function: Check if a level is unlocked for a user
CREATE OR REPLACE FUNCTION is_level_unlocked(
  p_user_id uuid,
  p_module_id integer,
  p_level_id integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_level_completed boolean;
BEGIN
  -- Level 1 is always unlocked
  IF p_level_id = 1 THEN
    RAISE NOTICE 'Level % of module % is always unlocked (level 1)', p_level_id, p_module_id;
    RETURN true;
  END IF;

  -- Check if previous level is completed
  SELECT EXISTS (
    SELECT 1
    FROM level_progress
    WHERE user_id = p_user_id
      AND module_id = p_module_id
      AND level_id = p_level_id - 1
      AND is_completed = true
  ) INTO previous_level_completed;

  RAISE NOTICE 'Level % of module % unlock check: previous level (%) completed = %',
    p_level_id, p_module_id, p_level_id - 1, previous_level_completed;

  RETURN previous_level_completed;
END;
$$;

-- Function: Get user's progress for a module
CREATE OR REPLACE FUNCTION get_module_progress(
  p_user_id uuid,
  p_module_id integer
)
RETURNS TABLE(
  level_id integer,
  is_completed boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH levels AS (
    -- Generate all 4 levels for the module
    SELECT generate_series(1, 4) as level_num
  ),
  progress AS (
    SELECT
      l.level_num,
      COALESCE(lp.is_completed, false) as is_completed,
      COALESCE(lp.created_at, null) as created_at,
      COALESCE(lp.updated_at, null) as updated_at
    FROM levels l
    LEFT JOIN level_progress lp ON (
      lp.user_id = p_user_id
      AND lp.module_id = p_module_id
      AND lp.level_id = l.level_num
    )
  )
  SELECT
    p.level_num::integer,
    p.is_completed,
    p.created_at,
    p.updated_at
  FROM progress p
  ORDER BY p.level_num;
END;
$$;

-- Function: Mark level as completed
CREATE OR REPLACE FUNCTION complete_level(
  p_user_id uuid,
  p_module_id integer,
  p_level_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update the level progress
  INSERT INTO level_progress (user_id, module_id, level_id, is_completed)
  VALUES (p_user_id, p_module_id, p_level_id, true)
  ON CONFLICT (user_id, module_id, level_id)
  DO UPDATE SET 
    is_completed = true,
    updated_at = now();
END;
$$;

-- Function: Start a level (create record if doesn't exist)
CREATE OR REPLACE FUNCTION start_level(
  p_user_id uuid,
  p_module_id integer,
  p_level_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow starting if level is unlocked
  IF NOT is_level_unlocked(p_user_id, p_module_id, p_level_id) THEN
    RAISE EXCEPTION 'Level % in module % is locked for user', p_level_id, p_module_id;
  END IF;
  
  -- Insert record if doesn't exist
  INSERT INTO level_progress (user_id, module_id, level_id, is_completed)
  VALUES (p_user_id, p_module_id, p_level_id, false)
  ON CONFLICT (user_id, module_id, level_id)
  DO UPDATE SET updated_at = now();
END;
$$;

-- Function: Get overall user progress summary
CREATE OR REPLACE FUNCTION get_user_progress_summary(p_user_id uuid)
RETURNS TABLE(
  module_id integer,
  total_levels integer,
  completed_levels integer,
  progress_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH module_stats AS (
    SELECT
      m.module_id,
      4 as total_levels, -- Each module has 4 levels
      COUNT(CASE WHEN lp.is_completed THEN 1 END) as completed_levels
    FROM (
      -- Generate module and level combinations (assuming modules 1-10)
      SELECT
        generate_series(1, 10) as module_id,
        generate_series(1, 4) as level_num
    ) m
    LEFT JOIN level_progress lp ON (
      lp.user_id = p_user_id
      AND lp.module_id = m.module_id
      AND lp.level_id = m.level_num
    )
    GROUP BY m.module_id
  )
  SELECT
    ms.module_id::integer,
    ms.total_levels::integer,
    ms.completed_levels::integer,
    ROUND((ms.completed_levels::numeric / ms.total_levels::numeric) * 100, 2) as progress_percentage
  FROM module_stats ms
  ORDER BY ms.module_id;
END;
$$;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_level_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_level_progress_updated_at ON level_progress;
CREATE TRIGGER trigger_update_level_progress_updated_at
  BEFORE UPDATE ON level_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_level_progress_updated_at();

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function: Reset user progress (for testing/debugging)
CREATE OR REPLACE FUNCTION reset_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM level_progress WHERE user_id = p_user_id;
  RAISE NOTICE 'Reset all progress for user %', p_user_id;
END;
$$;

-- Function: Initialize user with only level 1 unlocked
CREATE OR REPLACE FUNCTION initialize_user_progress(p_user_id uuid, p_module_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove any existing progress for this module
  DELETE FROM level_progress WHERE user_id = p_user_id AND module_id = p_module_id;

  -- Create a record for level 1 (unlocked but not completed)
  INSERT INTO level_progress (user_id, module_id, level_id, is_completed)
  VALUES (p_user_id, p_module_id, 1, false);

  RAISE NOTICE 'Initialized user % for module % with only level 1 available', p_user_id, p_module_id;
END;
$$;

-- =====================================================
-- 7. SAMPLE DATA (For testing the level unlocking system)
-- =====================================================

-- Create sample users for testing (replace with actual user UUIDs in production)
-- Note: These are example UUIDs - replace with real ones from your auth.users table
-- COMMENT OUT OR REMOVE THIS SECTION IN PRODUCTION

/*
INSERT INTO level_progress (user_id, module_id, level_id, is_completed) VALUES

-- ===== USER 1: Advanced Player (John Doe) =====
-- Module 1: Completed all 4 levels ✅✅✅✅
('550e8400-e29b-41d4-a716-446655440001', 1, 1, true),
('550e8400-e29b-41d4-a716-446655440001', 1, 2, true),
('550e8400-e29b-41d4-a716-446655440001', 1, 3, true),
('550e8400-e29b-41d4-a716-446655440001', 1, 4, true),

-- Module 2: Completed first 3 levels ✅✅✅🔒
('550e8400-e29b-41d4-a716-446655440001', 2, 1, true),
('550e8400-e29b-41d4-a716-446655440001', 2, 2, true),
('550e8400-e29b-41d4-a716-446655440001', 2, 3, true),
('550e8400-e29b-41d4-a716-446655440001', 2, 4, false), -- Started level 4

-- Module 3: Only completed level 1 ✅🔒🔒🔒
('550e8400-e29b-41d4-a716-446655440001', 3, 1, true),

-- ===== USER 2: Intermediate Player (Jane Smith) =====
-- Module 1: Completed first 2 levels ✅✅🔒🔒
('550e8400-e29b-41d4-a716-446655440002', 1, 1, true),
('550e8400-e29b-41d4-a716-446655440002', 1, 2, true),
('550e8400-e29b-41d4-a716-446655440002', 1, 3, false), -- Started but not completed

-- Module 2: Only completed level 1 ✅🔒🔒🔒
('550e8400-e29b-41d4-a716-446655440002', 2, 1, true),

-- ===== USER 3: Beginner Player (Mike Johnson) =====
-- Module 1: Only completed level 1 ✅🔒🔒🔒
('550e8400-e29b-41d4-a716-446655440003', 1, 1, true),
('550e8400-e29b-41d4-a716-446655440003', 1, 2, false), -- Started level 2 but not completed

-- ===== USER 4: New Player (Sarah Wilson) =====
-- Module 1: Started level 1 but not completed 🔓🔒🔒🔒
('550e8400-e29b-41d4-a716-446655440004', 1, 1, false); -- Just started
*/

-- =====================================================
-- SAMPLE DATA EXPLANATION
-- =====================================================
/*
Progress Summary:

USER 1 (Advanced): 
- Module 1: 100% complete (4/4) - All levels unlocked
- Module 2: 75% complete (3/4) - Level 4 available 
- Module 3: 25% complete (1/4) - Level 2 available

USER 2 (Intermediate):
- Module 1: 50% complete (2/4) - Level 3 available
- Module 2: 25% complete (1/4) - Level 2 available

USER 3 (Beginner):
- Module 1: 25% complete (1/4) - Level 2 available

USER 4 (New):
- Module 1: 0% complete (0/4) - Level 1 available

This data demonstrates:
✅ Sequential unlocking (can't skip levels)
🔓 Level availability based on previous completion
🔒 Locked levels that need prerequisites
📊 Different progress stages across users
*/

-- =====================================================
-- 7. USAGE EXAMPLES
-- =====================================================

/*
-- Example queries to use the system:

-- 1. Check if level 3 of module 1 is unlocked for a user
SELECT is_level_unlocked('user-uuid', 1, 3);

-- 2. Get all progress for module 1
SELECT * FROM get_module_progress('user-uuid', 1);

-- 3. Mark level 2 of module 1 as completed
SELECT complete_level('user-uuid', 1, 2);

-- 4. Start level 3 of module 1 (if unlocked)
SELECT start_level('user-uuid', 1, 3);

-- 5. Get overall progress summary for a user
SELECT * FROM get_user_progress_summary('user-uuid');

-- 6. Get user's current level progress for a specific module
SELECT 
  level_id,
  is_completed,
  is_unlocked,
  CASE 
    WHEN is_completed THEN '✅ Completed'
    WHEN is_unlocked THEN '🔓 Available'
    ELSE '🔒 Locked'
  END as status
FROM get_module_progress('user-uuid', 1);
*/
