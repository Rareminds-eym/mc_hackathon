-- ==========================================
-- ✅ ENHANCED LEVEL 3 PROGRESS - COMPLETE MIGRATION SCRIPT
-- Using Level 4 logic while maintaining Level 3 table structure
-- ==========================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the table if it doesn't exist (with all required columns)
CREATE TABLE IF NOT EXISTS level3_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module, level, scenario_index)
);

-- 3. Add any missing columns to existing tables (if table already exists)
DO $$
BEGIN
    -- Only add columns if table exists but is missing columns
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'level3_progress') THEN
        -- Add level if missing (renamed from level_number)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level3_progress' AND column_name = 'level') THEN
            ALTER TABLE level3_progress ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
        END IF;

        -- Add scenario_index if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level3_progress' AND column_name = 'scenario_index') THEN
            ALTER TABLE level3_progress ADD COLUMN scenario_index INTEGER NOT NULL DEFAULT 0;
        END IF;

        -- Add current_score if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level3_progress' AND column_name = 'current_score') THEN
            ALTER TABLE level3_progress ADD COLUMN current_score INTEGER DEFAULT 0;
        END IF;

        -- Add time_taken if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level3_progress' AND column_name = 'time_taken') THEN
            ALTER TABLE level3_progress ADD COLUMN time_taken INTEGER;
        END IF;

        -- Add time_history if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'level3_progress' AND column_name = 'time_history') THEN
            ALTER TABLE level3_progress ADD COLUMN time_history INTEGER[] DEFAULT '{}';
        END IF;
    END IF;
END $$;

-- 4. Enhanced Indexes (from Level 4 logic)
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_id ON level3_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_progress_module_level_scenario ON level3_progress(module, level, scenario_index);
CREATE INDEX IF NOT EXISTS idx_level3_progress_is_completed ON level3_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_level3_progress_current_score ON level3_progress(current_score);
CREATE INDEX IF NOT EXISTS idx_level3_progress_score_history ON level3_progress USING GIN (score_history);
CREATE INDEX IF NOT EXISTS idx_level3_progress_time_history ON level3_progress USING GIN (time_history);
CREATE INDEX IF NOT EXISTS idx_level3_progress_time_taken ON level3_progress(time_taken);
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_module_completed ON level3_progress(user_id, module, is_completed);
CREATE INDEX IF NOT EXISTS idx_level3_progress_created_at ON level3_progress(created_at);
CREATE INDEX IF NOT EXISTS idx_level3_progress_updated_at ON level3_progress(updated_at);

-- 5. Enable Row Level Security
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;

-- 6. Enhanced Policies (from Level 4 logic)
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

-- 7. Unique constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'level3_progress' AND constraint_name = 'unique_user_module_level_scenario'
    ) THEN
        ALTER TABLE level3_progress DROP CONSTRAINT unique_user_module_level_scenario;
    END IF;

    ALTER TABLE level3_progress ADD CONSTRAINT unique_user_module_level_scenario
        UNIQUE (user_id, module, level, scenario_index);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- 8. Enhanced updated_at trigger (from Level 4 logic)
CREATE OR REPLACE FUNCTION update_level3_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_level3_progress_updated_at ON level3_progress;
CREATE TRIGGER update_level3_progress_updated_at
  BEFORE UPDATE ON level3_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_level3_updated_at_column();

-- =====================================================
-- ENHANCED READ FUNCTIONS (using Level 4 logic)
-- =====================================================

-- Enhanced function to get past 3 attempts with aligned data
DROP FUNCTION IF EXISTS get_level3_past_three_attempts(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_past_three_attempts(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER
)
RETURNS TABLE(
    current_score INTEGER,
    previous_score INTEGER,
    past_previous_score INTEGER,
    current_time_value INTEGER,
    previous_time INTEGER,
    past_previous_time INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Scores from score_history (already sorted by score DESC)
        COALESCE(score_history[1], 0) as current_score,
        COALESCE(score_history[2], 0) as previous_score,
        COALESCE(score_history[3], 0) as past_previous_score,
        -- Times from time_history (aligned with score_history)
        COALESCE(time_history[1], 0) as current_time_value,
        COALESCE(time_history[2], 0) as previous_time,
        COALESCE(time_history[3], 0) as past_previous_time
    FROM level3_progress
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENHANCED INSERT/UPSERT FUNCTIONS (using Level 4 logic)
-- =====================================================

-- Enhanced UPSERT with score history tracking (using Level 4 logic)
DROP FUNCTION IF EXISTS upsert_level3_progress_with_history(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, BOOLEAN, INTEGER);
CREATE OR REPLACE FUNCTION upsert_level3_progress_with_history(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER,
    p_score INTEGER,
    p_placed_pieces JSONB,
    p_is_completed BOOLEAN,
    p_time_taken INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
    existing_score_history INTEGER[];
    existing_time_history INTEGER[];
    combined_scores INTEGER[];
    combined_times INTEGER[];
    temp_scores INTEGER[];
    temp_times INTEGER[];
    current_attempts INTEGER := 0;
BEGIN
    -- Get existing histories
    SELECT score_history, time_history, total_attempts
    INTO existing_score_history, existing_time_history, current_attempts
    FROM level3_progress
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index;

    -- Initialize empty arrays if no existing record
    IF existing_score_history IS NULL THEN
        existing_score_history := '{}';
        existing_time_history := '{}';
        current_attempts := 0;
    END IF;

    -- Add new values to existing arrays
    combined_scores := existing_score_history || ARRAY[p_score];
    combined_times := existing_time_history || ARRAY[COALESCE(p_time_taken, 0)];

    -- Sort all data together to maintain alignment (using Level 4 logic)
    WITH attempt_data AS (
        SELECT
            unnest(combined_scores) as score,
            unnest(combined_times) as time,
            generate_subscripts(combined_scores, 1) as original_index
    ),
    sorted_attempts AS (
        SELECT score, time
        FROM attempt_data
        ORDER BY score DESC, original_index ASC
        LIMIT 3
    )
    SELECT
        array_agg(score ORDER BY score DESC) as sorted_scores,
        array_agg(time ORDER BY score DESC) as sorted_times
    INTO temp_scores, temp_times
    FROM sorted_attempts;

    -- Keep only top 3 results
    temp_scores := temp_scores[1:3];
    temp_times := temp_times[1:3];

    -- UPSERT operation
    INSERT INTO level3_progress (
        user_id, module, level, scenario_index,
        score, placed_pieces, is_completed, time_taken,
        current_score,
        total_attempts,
        score_history, time_history
    )
    VALUES (
        p_user_id, p_module, p_level, p_scenario_index,
        ARRAY[p_score], p_placed_pieces, p_is_completed, p_time_taken,
        p_score,
        1,
        temp_scores, temp_times
    )
    ON CONFLICT (user_id, module, level, scenario_index)
    DO UPDATE SET
        -- Always use the highest score and its corresponding data
        score = level3_progress.score || ARRAY[p_score],
        current_score = temp_scores[1],
        time_taken = temp_times[1],
        placed_pieces = CASE
            WHEN temp_scores[1] > level3_progress.current_score THEN p_placed_pieces
            ELSE level3_progress.placed_pieces
        END,
        is_completed = level3_progress.is_completed OR p_is_completed,
        total_attempts = level3_progress.total_attempts + 1,
        score_history = temp_scores,
        time_history = temp_times,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Simple UPSERT function (for backward compatibility)
DROP FUNCTION IF EXISTS upsert_level3_progress(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, JSONB, BOOLEAN, INTEGER);
CREATE OR REPLACE FUNCTION upsert_level3_progress(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER,
    p_score INTEGER,
    p_placed_pieces JSONB,
    p_is_completed BOOLEAN,
    p_time_taken INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO level3_progress (
        user_id, module, level, scenario_index,
        score, placed_pieces, is_completed, time_taken,
        current_score, total_attempts
    )
    VALUES (
        p_user_id, p_module, p_level, p_scenario_index,
        ARRAY[p_score], p_placed_pieces, p_is_completed, p_time_taken,
        p_score, 1
    )
    ON CONFLICT (user_id, module, level, scenario_index)
    DO UPDATE SET
        score = level3_progress.score || ARRAY[p_score],
        current_score = EXCLUDED.current_score,
        time_taken = EXCLUDED.time_taken,
        placed_pieces = EXCLUDED.placed_pieces,
        is_completed = EXCLUDED.is_completed,
        total_attempts = level3_progress.total_attempts + 1,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENHANCED UPDATE FUNCTIONS (using Level 4 logic)
-- =====================================================

-- Function to update specific fields
DROP FUNCTION IF EXISTS update_level3_progress_data(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, BOOLEAN, INTEGER, JSONB);
CREATE OR REPLACE FUNCTION update_level3_progress_data(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER,
    p_score INTEGER DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_time_taken INTEGER DEFAULT NULL,
    p_placed_pieces JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
    current_record RECORD;
BEGIN
    -- Get the current record
    SELECT * INTO current_record
    FROM level3_progress
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index;

    -- Check if record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No progress data found for user %, module %, level %, scenario %',
            p_user_id, p_module, p_level, p_scenario_index;
    END IF;

    -- Update the record with provided values
    UPDATE level3_progress SET
        current_score = COALESCE(p_score, current_score),
        is_completed = COALESCE(p_is_completed, is_completed),
        time_taken = COALESCE(p_time_taken, time_taken),
        placed_pieces = COALESCE(p_placed_pieces, placed_pieces),
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index
    RETURNING id INTO result_id;

    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update only completion status
DROP FUNCTION IF EXISTS update_level3_completion_status(UUID, TEXT, INTEGER, INTEGER, BOOLEAN);
CREATE OR REPLACE FUNCTION update_level3_completion_status(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER,
    p_is_completed BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE level3_progress SET
        is_completed = p_is_completed,
        updated_at = NOW()
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index;

    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    IF rows_affected = 0 THEN
        RAISE EXCEPTION 'No progress data found for user %, module %, level %, scenario %',
            p_user_id, p_module, p_level, p_scenario_index;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENHANCED ANALYTICS FUNCTIONS (using Level 4 logic)
-- =====================================================

-- Enhanced leaderboard function
DROP FUNCTION IF EXISTS get_level3_leaderboard(TEXT, INTEGER, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_leaderboard(
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    user_id UUID,
    best_score INTEGER,
    best_time INTEGER,
    total_attempts INTEGER,
    last_played TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.user_id, lp.current_score,
        lp.time_taken, lp.total_attempts, lp.updated_at
    FROM level3_progress lp
    WHERE lp.module = p_module
      AND lp.level = p_level
      AND lp.scenario_index = p_scenario_index
      AND lp.is_completed = TRUE
    ORDER BY lp.current_score DESC, lp.time_taken ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user performance analytics
DROP FUNCTION IF EXISTS get_level3_user_analytics(UUID, TEXT);
CREATE OR REPLACE FUNCTION get_level3_user_analytics(
    p_user_id UUID,
    p_module TEXT DEFAULT NULL
)
RETURNS TABLE(
    total_scenarios INTEGER,
    completed_scenarios INTEGER,
    average_score NUMERIC,
    highest_score INTEGER,
    lowest_score INTEGER,
    total_playtime INTEGER,
    improvement_rate NUMERIC,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT
            COUNT(*) as total_scen,
            COUNT(*) FILTER (WHERE is_completed = true) as completed_scen,
            AVG(current_score) as avg_score,
            MAX(current_score) as max_score,
            MIN(current_score) as min_score,
            SUM(COALESCE(time_taken, 0)) as total_time
        FROM level3_progress
        WHERE user_id = p_user_id
          AND (p_module IS NULL OR module = p_module)
    ),
    improvement AS (
        SELECT
            CASE
                WHEN COUNT(*) > 1 THEN
                    (MAX(current_score) - MIN(current_score))::NUMERIC / NULLIF(COUNT(*) - 1, 0)
                ELSE 0
            END as improvement
        FROM level3_progress
        WHERE user_id = p_user_id
          AND (p_module IS NULL OR module = p_module)
    )
    SELECT
        us.total_scen::INTEGER,
        us.completed_scen::INTEGER,
        ROUND(us.avg_score, 2),
        us.max_score,
        us.min_score,
        COALESCE(us.total_time, 0),
        ROUND(imp.improvement, 2),
        CASE
            WHEN us.total_scen > 0 THEN ROUND((us.completed_scen::NUMERIC / us.total_scen) * 100, 2)
            ELSE 0
        END
    FROM user_stats us
    CROSS JOIN improvement imp;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to get user's best performance
DROP FUNCTION IF EXISTS get_level3_best_performance(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_best_performance(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER
)
RETURNS TABLE(
    best_score INTEGER,
    best_time INTEGER,
    total_attempts INTEGER,
    is_completed BOOLEAN,
    placed_pieces JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.current_score as best_score,
        lp.time_taken as best_time,
        lp.total_attempts,
        lp.is_completed,
        lp.placed_pieces
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
      AND lp.module = p_module
      AND lp.level = p_level
      AND lp.scenario_index = p_scenario_index;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to get level summary
DROP FUNCTION IF EXISTS get_level3_level_summary(UUID, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_level_summary(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER
)
RETURNS TABLE(
    scenario_index INTEGER,
    best_score INTEGER,
    total_attempts INTEGER,
    is_completed BOOLEAN,
    last_played TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.scenario_index, lp.current_score,
        lp.total_attempts, lp.is_completed, lp.updated_at
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
      AND lp.module = p_module
      AND lp.level = p_level
    ORDER BY lp.scenario_index;
END;
$$ LANGUAGE plpgsql;

-- Function to get user progress summary (for compatibility with levelProgressService)
DROP FUNCTION IF EXISTS get_user_progress_summary(UUID);
CREATE OR REPLACE FUNCTION get_user_progress_summary(
    p_user_id UUID
)
RETURNS TABLE(
    module_id TEXT,
    level_id INTEGER,
    total_scenarios INTEGER,
    completed_scenarios INTEGER,
    best_score INTEGER,
    total_time INTEGER,
    completion_rate NUMERIC,
    last_played TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.module as module_id,
        lp.level as level_id,
        COUNT(*)::INTEGER as total_scenarios,
        COUNT(CASE WHEN lp.is_completed THEN 1 END)::INTEGER as completed_scenarios,
        MAX(lp.current_score) as best_score,
        SUM(lp.time_taken)::INTEGER as total_time,
        ROUND(
            (COUNT(CASE WHEN lp.is_completed THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100,
            2
        ) as completion_rate,
        MAX(lp.updated_at) as last_played
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
    GROUP BY lp.module, lp.level
    ORDER BY lp.module, lp.level;
END;
$$ LANGUAGE plpgsql;

-- Function to get top N best scores for a user
DROP FUNCTION IF EXISTS get_level3_top_scores(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_top_scores(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_limit INTEGER DEFAULT 3
)
RETURNS TABLE(
    best_score INTEGER,
    best_time INTEGER,
    total_attempts INTEGER,
    is_completed BOOLEAN,
    placed_pieces JSONB,
    scenario_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.current_score as best_score,
        lp.time_taken as best_time,
        lp.total_attempts,
        lp.is_completed,
        lp.placed_pieces,
        lp.scenario_index,
        lp.created_at
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
      AND lp.module = p_module
      AND lp.level = p_level
      AND lp.is_completed = TRUE
    ORDER BY lp.current_score DESC, lp.time_taken ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MAINTENANCE FUNCTIONS (using Level 4 logic)
-- =====================================================

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_level3_old_data(
    p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM level3_progress 
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND is_completed = false;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST FUNCTION FOR DATA ALIGNMENT (using Level 4 logic)
-- =====================================================

-- Function to test score-time alignment
DROP FUNCTION IF EXISTS test_level3_data_alignment(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION test_level3_data_alignment(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER
)
RETURNS TABLE(
    test_description TEXT,
    score_history_result INTEGER[],
    time_history_result INTEGER[],
    current_score INTEGER,
    current_time_value INTEGER,
    alignment_status TEXT
) AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Get the current data
    SELECT current_score, time_taken, score_history, time_history
    INTO rec
    FROM level3_progress
    WHERE user_id = p_user_id
      AND module = p_module
      AND level = p_level
      AND scenario_index = p_scenario_index;

    IF NOT FOUND THEN
        RETURN QUERY SELECT
            'No data found for user/module/level/scenario'::TEXT,
            '{}'::INTEGER[],
            '{}'::INTEGER[],
            0::INTEGER,
            0::INTEGER,
            'ERROR: No data'::TEXT;
        RETURN;
    END IF;

    -- Check alignment
    RETURN QUERY SELECT
        'Score-Time Alignment Test'::TEXT,
        rec.score_history,
        rec.time_history,
        rec.current_score,
        rec.time_taken,
        CASE
            WHEN rec.current_score = rec.score_history[1] AND
                 rec.time_taken = rec.time_history[1] THEN
                '✅ ALIGNED: All current values match history[1]'
            WHEN rec.score_history[1] IS NULL THEN
                '⚠️ EMPTY: No score history available'
            ELSE
                '❌ MISALIGNED: Current values do not match history[1]'
        END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON level3_progress TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;