-- =====================================================
-- LEVEL 4 GAME DATA SCHEMA & FUNCTIONS
-- Complete implementation for Level 4 game tracking
-- =====================================================

-- Drop existing table if needed (be careful with this in production!)
-- DROP TABLE IF EXISTS public.level_4 CASCADE;

-- Create the enhanced level_4 table
CREATE TABLE IF NOT EXISTS public.level_4 (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid NOT NULL,
    module integer NOT NULL,
    level integer NOT NULL DEFAULT 4,
    score INTEGER NOT NULL,
    time integer NOT NULL DEFAULT 0,
    time_history integer[] NOT NULL DEFAULT '{}'::integer[],
    score_history integer[] NOT NULL DEFAULT '{}'::integer[],
    cases jsonb NOT NULL,
    is_completed boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Add primary key and unique constraint
    CONSTRAINT level_4_pkey PRIMARY KEY (id),
    CONSTRAINT level_4_user_module_unique UNIQUE (user_id, module)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_level_4_user_id ON public.level_4 (user_id);
CREATE INDEX IF NOT EXISTS idx_level_4_module_level ON public.level_4 (module, level);
CREATE INDEX IF NOT EXISTS idx_level_4_completed ON public.level_4 (is_completed);
CREATE INDEX IF NOT EXISTS idx_level_4_score ON public.level_4 (score);
CREATE INDEX IF NOT EXISTS idx_level_4_score_history ON public.level_4 USING GIN (score_history);
CREATE INDEX IF NOT EXISTS idx_level_4_time ON public.level_4 (time);
CREATE INDEX IF NOT EXISTS idx_level_4_time_history ON public.level_4 USING GIN (time_history);
CREATE INDEX IF NOT EXISTS idx_level_4_user_module_completed ON public.level_4 (user_id, module, is_completed);
CREATE INDEX IF NOT EXISTS idx_level_4_created_at ON public.level_4 (created_at);
CREATE INDEX IF NOT EXISTS idx_level_4_updated_at ON public.level_4 (updated_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE level_4 ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own game data
DROP POLICY IF EXISTS "Users can view own game data" ON level_4;
CREATE POLICY "Users can view own game data" ON level_4
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own game data
DROP POLICY IF EXISTS "Users can insert own game data" ON level_4;
CREATE POLICY "Users can insert own game data" ON level_4
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own game data
DROP POLICY IF EXISTS "Users can update own game data" ON level_4;
CREATE POLICY "Users can update own game data" ON level_4
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own game data
DROP POLICY IF EXISTS "Users can delete own game data" ON level_4;
CREATE POLICY "Users can delete own game data" ON level_4
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Updated trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_level_4_updated_at ON level_4;
CREATE TRIGGER update_level_4_updated_at
    BEFORE UPDATE ON level_4
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- READ FUNCTIONS
-- =====================================================

-- Function to get the past 3 scores from score_history array with aligned times
CREATE OR REPLACE FUNCTION get_level4_past_three_scores(
    p_user_id UUID,
    p_module INTEGER
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
    FROM level_4
    WHERE user_id = p_user_id
      AND module = p_module;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERT/UPSERT FUNCTIONS
-- =====================================================

-- Enhanced UPSERT function that manages score history arrays
CREATE OR REPLACE FUNCTION upsert_level4_game_data_with_history(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER,
    p_is_completed BOOLEAN,
    p_new_time INTEGER,
    p_cases JSONB
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    existing_record RECORD;
    new_score_history INTEGER[];
    new_time_history INTEGER[];
    i INTEGER;
BEGIN
    -- Get existing record
    SELECT score_history, time_history, score, time
    INTO existing_record
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;

    -- If no existing record, create arrays with just the new attempt
    IF existing_record IS NULL THEN
        new_score_history := ARRAY[p_new_score];
        new_time_history := ARRAY[p_new_time];
    ELSE
        -- Create a temporary table to store score-time pairs
        DROP TABLE IF EXISTS temp_score_pairs;
        CREATE TEMP TABLE temp_score_pairs (
            score INTEGER,
            time_val INTEGER,
            attempt_order INTEGER
        );

        -- Insert existing attempts (from history arrays)
        IF existing_record.score_history IS NOT NULL THEN
            FOR i IN 1..array_length(existing_record.score_history, 1) LOOP
                INSERT INTO temp_score_pairs (score, time_val, attempt_order) 
                VALUES (
                    existing_record.score_history[i], 
                    COALESCE(existing_record.time_history[i], 0),
                    i
                );
            END LOOP;
        END IF;

        -- Add the new attempt
        INSERT INTO temp_score_pairs (score, time_val, attempt_order) 
        VALUES (p_new_score, p_new_time, 999); -- Use 999 as new attempt marker

        -- Get top 3 attempts ordered by score (highest first)
        WITH top_attempts AS (
            SELECT score, time_val
            FROM temp_score_pairs
            ORDER BY score DESC, attempt_order ASC
            LIMIT 3
        )
        SELECT 
            array_agg(score ORDER BY score DESC) as scores,
            array_agg(time_val ORDER BY score DESC) as times
        INTO new_score_history, new_time_history
        FROM top_attempts;

        -- Clean up temp table
        DROP TABLE temp_score_pairs;
    END IF;

    -- Insert or update the record
    INSERT INTO level_4 (
        user_id, module, level,
        score, is_completed, time, 
        time_history, score_history, cases
    )
    VALUES (
        p_user_id, p_module, 4,
        new_score_history[1], p_is_completed, new_time_history[1],
        new_time_history, new_score_history, p_cases
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = new_score_history[1],
        is_completed = EXCLUDED.is_completed OR level_4.is_completed,
        time = new_time_history[1],
        time_history = new_time_history,
        score_history = new_score_history,
        cases = CASE
            WHEN new_score_history[1] > level_4.score THEN EXCLUDED.cases
            ELSE level_4.cases
        END,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Simple UPSERT function (for backward compatibility)
CREATE OR REPLACE FUNCTION upsert_level4_game_data(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER,
    p_is_completed BOOLEAN,
    p_new_time INTEGER,
    p_cases JSONB
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO level_4 (
        user_id,
        module,
        level,
        score,
        is_completed,
        time,
        cases
    )
    VALUES (
        p_user_id,
        p_module,
        4,
        p_new_score,
        p_is_completed,
        p_new_time,
        p_cases
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = EXCLUDED.score,
        is_completed = EXCLUDED.is_completed,
        time = EXCLUDED.time,
        cases = EXCLUDED.cases,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE FUNCTIONS
-- =====================================================

-- Function to update specific fields of existing game data
CREATE OR REPLACE FUNCTION update_level4_game_data(
    p_user_id UUID,
    p_module INTEGER,
    p_score INTEGER DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_time INTEGER DEFAULT NULL,
    p_cases JSONB DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    current_record RECORD;
BEGIN
    -- Get the current record
    SELECT * INTO current_record
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;
    
    -- Check if record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No game data found for user % and module %', p_user_id, p_module;
    END IF;
    
    -- Update the record with provided values, keeping existing values for NULL parameters
    UPDATE level_4 SET
        score = COALESCE(p_score, score),
        is_completed = COALESCE(p_is_completed, is_completed),
        time = COALESCE(p_time, time),
        cases = COALESCE(p_cases, cases),
        updated_at = NOW()
    WHERE user_id = p_user_id AND module = p_module
    RETURNING id INTO result_id;
    
    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to update game data and manage score history (IMPROVED VERSION)
CREATE OR REPLACE FUNCTION update_level4_game_data_with_history(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_new_time INTEGER DEFAULT NULL,
    p_cases JSONB DEFAULT NULL,
    p_update_history BOOLEAN DEFAULT true
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    current_record RECORD;
    new_score_history INTEGER[];
    new_time_history INTEGER[];
    i INTEGER;
BEGIN
    -- Get the current record
    SELECT * INTO current_record
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;
    
    -- Check if record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No game data found for user % and module %', p_user_id, p_module;
    END IF;
    
    -- If we're updating score and managing history
    IF p_new_score IS NOT NULL AND p_update_history THEN
        -- Use the same improved logic as upsert function
        -- Create a temporary table to store score-time pairs
        DROP TABLE IF EXISTS temp_update_score_pairs;
        CREATE TEMP TABLE temp_update_score_pairs (
            score INTEGER,
            time_val INTEGER,
            attempt_order INTEGER
        );

        -- Insert existing attempts (from history arrays)
        IF current_record.score_history IS NOT NULL THEN
            FOR i IN 1..array_length(current_record.score_history, 1) LOOP
                INSERT INTO temp_update_score_pairs (score, time_val, attempt_order) 
                VALUES (
                    current_record.score_history[i], 
                    COALESCE(current_record.time_history[i], 0),
                    i
                );
            END LOOP;
        END IF;

        -- Add the new attempt
        INSERT INTO temp_update_score_pairs (score, time_val, attempt_order) 
        VALUES (p_new_score, COALESCE(p_new_time, 0), 999); -- Use 999 as new attempt marker

        -- Get top 3 attempts ordered by score (highest first)
        WITH top_attempts AS (
            SELECT score, time_val
            FROM temp_update_score_pairs
            ORDER BY score DESC, attempt_order ASC
            LIMIT 3
        )
        SELECT 
            array_agg(score ORDER BY score DESC) as scores,
            array_agg(time_val ORDER BY score DESC) as times
        INTO new_score_history, new_time_history
        FROM top_attempts;

        -- Clean up temp table
        DROP TABLE temp_update_score_pairs;
    ELSE
        new_score_history := current_record.score_history;
        new_time_history := current_record.time_history;
    END IF;
    
    -- Update the record
    UPDATE level_4 SET
        score = CASE
            WHEN p_update_history AND array_length(new_score_history, 1) > 0 THEN new_score_history[1]
            WHEN p_new_score IS NOT NULL AND NOT p_update_history THEN p_new_score
            ELSE score
        END,
        is_completed = COALESCE(p_is_completed, is_completed),
        time = CASE
            WHEN p_update_history AND array_length(new_time_history, 1) > 0 THEN new_time_history[1]
            WHEN p_new_time IS NOT NULL AND NOT p_update_history THEN p_new_time
            ELSE time
        END,
        time_history = new_time_history,
        cases = COALESCE(p_cases, cases),
        score_history = new_score_history,
        updated_at = NOW()
    WHERE user_id = p_user_id AND module = p_module
    RETURNING id INTO result_id;
    
    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to update only completion status
CREATE OR REPLACE FUNCTION update_level4_completion_status(
    p_user_id UUID,
    p_module INTEGER,
    p_is_completed BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE level_4 SET
        is_completed = p_is_completed,
        updated_at = NOW()
    WHERE user_id = p_user_id AND module = p_module;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected = 0 THEN
        RAISE EXCEPTION 'No game data found for user % and module %', p_user_id, p_module;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to update cases data only
CREATE OR REPLACE FUNCTION update_level4_cases(
    p_user_id UUID,
    p_module INTEGER,
    p_cases JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE level_4 SET
        cases = p_cases,
        updated_at = NOW()
    WHERE user_id = p_user_id AND module = p_module;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected = 0 THEN
        RAISE EXCEPTION 'No game data found for user % and module %', p_user_id, p_module;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to bulk update multiple modules for a user
CREATE OR REPLACE FUNCTION bulk_update_level4_completion(
    p_user_id UUID,
    p_modules INTEGER[],
    p_is_completed BOOLEAN
)
RETURNS INTEGER AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE level_4 SET
        is_completed = p_is_completed,
        updated_at = NOW()
    WHERE user_id = p_user_id 
    AND module = ANY(p_modules);
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get user performance analytics
CREATE OR REPLACE FUNCTION get_level4_user_analytics(
    p_user_id UUID
)
RETURNS TABLE(
    total_modules INTEGER,
    completed_modules INTEGER,
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
            COUNT(*) as total_mods,
            COUNT(*) FILTER (WHERE is_completed = true) as completed_mods,
            AVG(score) as avg_score,
            MAX(score) as max_score,
            MIN(score) as min_score,
            SUM(time) as total_time
        FROM level_4 
        WHERE user_id = p_user_id
    ),
    improvement AS (
        SELECT 
            CASE 
                WHEN COUNT(*) > 1 THEN
                    (MAX(score) - MIN(score))::NUMERIC / NULLIF(COUNT(*) - 1, 0)
                ELSE 0
            END as improvement
        FROM level_4 
        WHERE user_id = p_user_id
    )
    SELECT 
        us.total_mods::INTEGER,
        us.completed_mods::INTEGER,
        ROUND(us.avg_score, 2),
        us.max_score,
        us.min_score,
        COALESCE(us.total_time, 0),
        ROUND(imp.improvement, 2),
        CASE 
            WHEN us.total_mods > 0 THEN ROUND((us.completed_mods::NUMERIC / us.total_mods) * 100, 2)
            ELSE 0
        END
    FROM user_stats us
    CROSS JOIN improvement imp;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to clean up old data (optional)
CREATE OR REPLACE FUNCTION cleanup_level4_old_data(
    p_days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    rows_deleted INTEGER;
BEGIN
    DELETE FROM level_4 
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND is_completed = false;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate score history for all users (maintenance)
CREATE OR REPLACE FUNCTION recalculate_all_score_histories()
RETURNS INTEGER AS $$
DECLARE
    rec RECORD;
    processed_count INTEGER := 0;
BEGIN
    FOR rec IN 
        SELECT user_id, module, score, time as time_val
        FROM level_4 
        ORDER BY user_id, module, updated_at DESC
    LOOP
        -- This would need custom logic based on your requirements
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TEST FUNCTION FOR SCORE-TIME ALIGNMENT
-- =====================================================

-- Function to test score-time alignment (for development/testing)
CREATE OR REPLACE FUNCTION test_level4_score_time_alignment(
    p_user_id UUID,
    p_module INTEGER
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
    SELECT score, time, score_history, time_history
    INTO rec
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;

    IF NOT FOUND THEN
        RETURN QUERY SELECT
            'No data found for user/module'::TEXT,
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
        rec.score,
        rec.time,
        CASE
            WHEN rec.score = rec.score_history[1] AND rec.time = rec.time_history[1] THEN
                '✅ ALIGNED: Current score/time matches history[1]'
            WHEN rec.score_history[1] IS NULL THEN
                '⚠️ EMPTY: No score history available'
            ELSE
                '❌ MISALIGNED: Current score/time does not match history[1]'
        END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to test multiple attempts and verify top 3 tracking
CREATE OR REPLACE FUNCTION test_level4_multiple_attempts(
    p_user_id UUID,
    p_module INTEGER,
    p_test_scores INTEGER[],
    p_test_times INTEGER[] DEFAULT NULL
)
RETURNS TABLE(
    attempt_number INTEGER,
    input_score INTEGER,
    input_time INTEGER,
    resulting_score_history INTEGER[],
    resulting_time_history INTEGER[],
    current_best_score INTEGER,
    status TEXT
) AS $$
DECLARE
    score_val INTEGER;
    time_val INTEGER;
    step_counter INTEGER := 1;
    default_times INTEGER[] := ARRAY[120, 130, 125, 110, 135, 115, 140, 105, 145, 100];
    rec RECORD;
BEGIN
    -- Clear existing data for this test
    DELETE FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Use default times if not provided
    IF p_test_times IS NULL THEN
        p_test_times := default_times;
    END IF;
    
    -- Insert each test score
    FOR i IN 1..array_length(p_test_scores, 1) LOOP
        score_val := p_test_scores[i];
        time_val := COALESCE(p_test_times[i], 120);
        
        PERFORM upsert_level4_game_data_with_history(
            p_user_id,
            p_module,
            score_val,
            true,
            time_val,
            ('{"attempt": ' || step_counter || ', "test": true}')::jsonb
        );
        
        -- Get the current state
        SELECT score, time, score_history, time_history
        INTO rec
        FROM level_4
        WHERE user_id = p_user_id AND module = p_module;
        
        -- Return the current state
        RETURN QUERY SELECT
            step_counter::INTEGER,
            score_val::INTEGER,
            time_val::INTEGER,
            rec.score_history,
            rec.time_history,
            rec.score::INTEGER,
            ('Added score ' || score_val || ' - Top 3: [' || 
             array_to_string(rec.score_history, ', ') || ']')::TEXT;
        
        step_counter := step_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON level_4 TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;