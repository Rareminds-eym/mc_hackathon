-- ==========================================
-- Level 3 Database Structure Fix
-- Addresses duplicate user_id issues and ensures proper module separation
-- ==========================================

-- 1. Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS level3_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 3,
  scenario_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER[] NOT NULL DEFAULT '{}',
  placed_pieces JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  current_score INTEGER DEFAULT 0,
  time_taken INTEGER,
  total_attempts INTEGER DEFAULT 0,
  score_history INTEGER[] DEFAULT '{}',
  time_history INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Remove any existing unique constraints that might be incorrect
DO $$
BEGIN
    -- Drop existing unique constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'level3_progress' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name != 'level3_progress_pkey'
    ) THEN
        -- Get all unique constraint names and drop them
        FOR constraint_name IN 
            SELECT tc.constraint_name
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'level3_progress' 
            AND tc.constraint_type = 'UNIQUE'
            AND tc.constraint_name != 'level3_progress_pkey'
        LOOP
            EXECUTE 'ALTER TABLE level3_progress DROP CONSTRAINT IF EXISTS ' || constraint_name;
        END LOOP;
    END IF;
END $$;

-- 3. Add the correct unique constraint
ALTER TABLE level3_progress 
ADD CONSTRAINT unique_user_module_level_scenario 
UNIQUE (user_id, module, level, scenario_index);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_id ON level3_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_progress_module ON level3_progress(module);
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_module ON level3_progress(user_id, module);
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_module_level_scenario ON level3_progress(user_id, module, level, scenario_index);
CREATE INDEX IF NOT EXISTS idx_level3_progress_completed ON level3_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_level3_progress_created_at ON level3_progress(created_at);
CREATE INDEX IF NOT EXISTS idx_level3_progress_updated_at ON level3_progress(updated_at);

-- 5. Enable Row Level Security
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
DROP POLICY IF EXISTS "Users can view own progress data" ON level3_progress;
CREATE POLICY "Users can view own progress data" ON level3_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress data" ON level3_progress;
CREATE POLICY "Users can insert own progress data" ON level3_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress data" ON level3_progress;
CREATE POLICY "Users can update own progress data" ON level3_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress data" ON level3_progress;
CREATE POLICY "Users can delete own progress data" ON level3_progress
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Function to clean up duplicate records
CREATE OR REPLACE FUNCTION cleanup_level3_duplicates()
RETURNS INTEGER AS $$
DECLARE
    duplicate_count INTEGER := 0;
    rec RECORD;
BEGIN
    -- Find and remove duplicates, keeping the oldest record for each unique combination
    FOR rec IN
        SELECT user_id, module, level, scenario_index, COUNT(*) as cnt
        FROM level3_progress
        GROUP BY user_id, module, level, scenario_index
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all but the oldest record for this combination
        DELETE FROM level3_progress
        WHERE (user_id, module, level, scenario_index) = (rec.user_id, rec.module, rec.level, rec.scenario_index)
        AND id NOT IN (
            SELECT id FROM level3_progress
            WHERE user_id = rec.user_id 
            AND module = rec.module 
            AND level = rec.level 
            AND scenario_index = rec.scenario_index
            ORDER BY created_at ASC
            LIMIT 1
        );
        
        duplicate_count := duplicate_count + (rec.cnt - 1);
    END LOOP;
    
    RETURN duplicate_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to verify data integrity
CREATE OR REPLACE FUNCTION verify_level3_data_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check for duplicates
    RETURN QUERY
    SELECT 
        'Duplicate Records'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END as status,
        CASE 
            WHEN COUNT(*) = 0 THEN 'No duplicate records found'::TEXT
            ELSE COUNT(*)::TEXT || ' duplicate groups found'::TEXT
        END as details
    FROM (
        SELECT user_id, module, level, scenario_index, COUNT(*) as cnt
        FROM level3_progress
        GROUP BY user_id, module, level, scenario_index
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Check unique constraint
    RETURN QUERY
    SELECT 
        'Unique Constraint'::TEXT as check_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'level3_progress' 
                AND constraint_type = 'UNIQUE'
                AND constraint_name = 'unique_user_module_level_scenario'
            ) THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END as status,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_name = 'level3_progress' 
                AND constraint_type = 'UNIQUE'
                AND constraint_name = 'unique_user_module_level_scenario'
            ) THEN 'Unique constraint exists'::TEXT
            ELSE 'Unique constraint missing'::TEXT
        END as details;
    
    -- Check RLS policies
    RETURN QUERY
    SELECT 
        'RLS Policies'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) >= 4 THEN 'PASS'::TEXT
            ELSE 'FAIL'::TEXT
        END as status,
        COUNT(*)::TEXT || ' RLS policies found (expected: 4)'::TEXT as details
    FROM pg_policies
    WHERE tablename = 'level3_progress';
    
    -- Check indexes
    RETURN QUERY
    SELECT 
        'Indexes'::TEXT as check_name,
        CASE 
            WHEN COUNT(*) >= 6 THEN 'PASS'::TEXT
            ELSE 'WARN'::TEXT
        END as status,
        COUNT(*)::TEXT || ' indexes found'::TEXT as details
    FROM pg_indexes
    WHERE tablename = 'level3_progress';
END;
$$ LANGUAGE plpgsql;

-- 9. Function to get module-specific statistics
CREATE OR REPLACE FUNCTION get_level3_module_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
    module TEXT,
    total_scenarios INTEGER,
    completed_scenarios INTEGER,
    best_score INTEGER,
    total_attempts INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lp.module,
        COUNT(*)::INTEGER as total_scenarios,
        COUNT(*) FILTER (WHERE lp.is_completed = true)::INTEGER as completed_scenarios,
        MAX(lp.current_score)::INTEGER as best_score,
        SUM(lp.total_attempts)::INTEGER as total_attempts,
        ROUND(
            (COUNT(*) FILTER (WHERE lp.is_completed = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as completion_rate
    FROM level3_progress lp
    WHERE (p_user_id IS NULL OR lp.user_id = p_user_id)
    GROUP BY lp.module
    ORDER BY lp.module;
END;
$$ LANGUAGE plpgsql;

-- 10. Run cleanup and verification
SELECT 'Cleaning up duplicates...' as action;
SELECT cleanup_level3_duplicates() as duplicates_removed;

SELECT 'Verifying data integrity...' as action;
SELECT * FROM verify_level3_data_integrity();

-- 11. Show module statistics
SELECT 'Module statistics:' as action;
SELECT * FROM get_level3_module_stats();

-- Success message
SELECT 'Level 3 database structure fix completed successfully!' as result;
