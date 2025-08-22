-- =====================================================
-- IMPROVED LEVEL 4 SCORE HISTORY MANAGEMENT
-- This fixes the score-time alignment and properly manages top 3 attempts
-- =====================================================

-- Drop and recreate the improved upsert function
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

-- =====================================================
-- FUNCTION TO GET DETAILED ATTEMPT HISTORY
-- =====================================================

-- Function to get all attempts with proper formatting
CREATE OR REPLACE FUNCTION get_level4_attempt_history(
    p_user_id UUID,
    p_module INTEGER
)
RETURNS TABLE(
    attempt_number INTEGER,
    score INTEGER,
    time_taken INTEGER,
    is_best_score BOOLEAN,
    attempt_rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH attempt_data AS (
        SELECT 
            unnest(score_history) as attempt_score,
            unnest(time_history) as attempt_time,
            generate_subscripts(score_history, 1) as attempt_num,
            score as best_score
        FROM level_4
        WHERE user_id = p_user_id AND module = p_module
    )
    SELECT 
        attempt_data.attempt_num::INTEGER as attempt_number,
        attempt_data.attempt_score::INTEGER as score,
        attempt_data.attempt_time::INTEGER as time_taken,
        (attempt_data.attempt_score = attempt_data.best_score)::BOOLEAN as is_best_score,
        ROW_NUMBER() OVER (ORDER BY attempt_data.attempt_score DESC)::INTEGER as attempt_rank
    FROM attempt_data
    ORDER BY attempt_data.attempt_score DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION TO TEST SCORE HISTORY LOGIC
-- =====================================================

-- Test function to verify the score history management
CREATE OR REPLACE FUNCTION test_level4_score_history_logic(
    p_user_id UUID,
    p_module INTEGER,
    p_test_scores INTEGER[]
)
RETURNS TABLE(
    test_step TEXT,
    current_score INTEGER,
    score_history_result INTEGER[],
    time_history_result INTEGER[]
) AS $$
DECLARE
    score_val INTEGER;
    step_counter INTEGER := 1;
BEGIN
    -- Clear existing data for this test
    DELETE FROM level_4 WHERE user_id = p_user_id AND module = p_module;
    
    -- Insert each test score
    FOREACH score_val IN ARRAY p_test_scores LOOP
        PERFORM upsert_level4_game_data_with_history(
            p_user_id,
            p_module,
            score_val,
            true,
            120 + (step_counter * 10), -- Vary time for testing
            '{"test": true}'::jsonb
        );
        
        -- Return the current state
        RETURN QUERY
        SELECT
            ('Step ' || step_counter || ': Added score ' || score_val)::TEXT,
            l4.score,
            l4.score_history,
            l4.time_history
        FROM level_4 l4
        WHERE l4.user_id = p_user_id AND l4.module = p_module;
        
        step_counter := step_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE USAGE AND TESTING
-- =====================================================

/*
-- Test the improved score history logic:

-- Test with scores: 850, 750, 950, 650, 900 (should keep 950, 900, 850)
SELECT * FROM test_level4_score_history_logic(
    'test-user-123'::uuid, 
    1, 
    ARRAY[850, 750, 950, 650, 900]
);

-- Check the final attempt history
SELECT * FROM get_level4_attempt_history('test-user-123'::uuid, 1);

-- Verify score-time alignment
SELECT * FROM test_level4_score_time_alignment('test-user-123'::uuid, 1);
*/
