CREATE TABLE module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id integer NOT NULL,
  total_levels integer NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- =====================================================
-- 3. INDEXES FOR MODULE PROGRESS
-- =====================================================
CREATE INDEX idx_module_progress_user ON module_progress(user_id);
CREATE INDEX idx_module_progress_user_module ON module_progress(user_id, module_id);
CREATE INDEX idx_module_progress_completed ON module_progress(user_id, is_completed);

-- =====================================================
-- 4. ROW LEVEL SECURITY FOR MODULE PROGRESS
-- =====================================================
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own module progress" 
ON module_progress FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own module progress" 
ON module_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own module progress" 
ON module_progress FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. CORE FUNCTIONS
-- =====================================================

-- Function: Check if a module is unlocked for a user
CREATE OR REPLACE FUNCTION is_module_unlocked(
  p_user_id uuid,
  p_module_id integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Module 1 is always unlocked
  IF p_module_id = 1 THEN
    RETURN true;
  END IF;
  
  -- Check if previous module is completed
  RETURN EXISTS (
    SELECT 1 
    FROM module_progress 
    WHERE user_id = p_user_id 
      AND module_id = p_module_id - 1 
      AND is_completed = true
  );
END;
$$;

-- Function: Get module progress for a user
CREATE OR REPLACE FUNCTION get_user_module_progress(p_user_id uuid)
RETURNS TABLE(
  module_id integer,
  total_levels integer,
  is_unlocked boolean,
  is_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.module_id,
    mp.total_levels,
    is_module_unlocked(p_user_id, mp.module_id) as is_unlocked,
    mp.is_completed
  FROM module_progress mp
  WHERE mp.user_id = p_user_id
  ORDER BY mp.module_id;
END;
$$;

-- Function: Get total levels for a module based on module_id
CREATE OR REPLACE FUNCTION get_module_total_levels(
  p_module_id integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_levels integer;
BEGIN
  -- Get total levels from module_config table
  SELECT total_levels INTO v_total_levels
  FROM module_config
  WHERE module_id = p_module_id;
  
  -- If module not found in config, use default
  IF v_total_levels IS NULL THEN
    v_total_levels := 4; -- Default value
  END IF;
  
  RETURN v_total_levels;
END;
$$;

-- Function: Mark module as completed and unlock next module
CREATE OR REPLACE FUNCTION complete_module(
  p_user_id uuid,
  p_module_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_module_id integer;
  v_next_total_levels integer;
BEGIN
  -- Mark current module as completed
  UPDATE module_progress
  SET 
    is_completed = true,
    updated_at = now()
  WHERE user_id = p_user_id AND module_id = p_module_id;
  
  -- Find the next module (if any)
  SELECT module_id INTO v_next_module_id
  FROM module_progress
  WHERE user_id = p_user_id 
    AND module_id = p_module_id + 1;
  
  -- If next module doesn't exist, create it
  IF v_next_module_id IS NULL THEN
    -- Get total levels for the next module from config
    v_next_total_levels := get_module_total_levels(p_module_id + 1);
    
    -- Create record for next module
    INSERT INTO module_progress (user_id, module_id, total_levels, is_completed)
    VALUES (p_user_id, p_module_id + 1, v_next_total_levels, false);
  END IF;
END;
$$;

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function: Get comprehensive user progress
CREATE OR REPLACE FUNCTION get_comprehensive_user_progress(p_user_id uuid)
RETURNS TABLE(
  module_id integer,
  total_levels integer,
  is_unlocked boolean,
  is_completed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.module_id,
    mp.total_levels,
    is_module_unlocked(p_user_id, mp.module_id) as is_unlocked,
    mp.is_completed
  FROM module_progress mp
  WHERE mp.user_id = p_user_id
  ORDER BY mp.module_id;
END;
$$;

-- =====================================================
-- 7. INITIALIZATION FUNCTION
-- =====================================================

-- Function to initialize user progress (create record for Module 1)
CREATE OR REPLACE FUNCTION initialize_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_module_1_levels integer;
BEGIN
  -- Get total levels for Module 1 from config
  v_module_1_levels := get_module_total_levels(1);
  
  -- Create record for Module 1 for new users
  INSERT INTO module_progress (user_id, module_id, total_levels, is_completed)
  VALUES (p_user_id, 1, v_module_1_levels, false)
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET updated_at = now();
END;
$$;

-- =====================================================
-- 8. TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_module_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_module_progress_updated_at
  BEFORE UPDATE ON module_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_module_progress_updated_at();