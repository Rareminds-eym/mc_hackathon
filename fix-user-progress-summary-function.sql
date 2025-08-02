-- Fix for user progress summary function to match current table schema
-- The current table uses 'module_id' not 'module'

-- Drop and recreate the function with correct column names
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
        lp.module_id,  -- Changed from lp.module to lp.module_id
        3 as level_id, -- Level 3 is hardcoded since this is level3_progress table
        COUNT(*)::INTEGER as total_scenarios,
        COUNT(CASE WHEN lp.is_completed THEN 1 END)::INTEGER as completed_scenarios,
        MAX(lp.final_score) as best_score,  -- Changed from current_score to final_score
        SUM(lp.total_time)::INTEGER as total_time,  -- Changed from time_taken to total_time
        ROUND(
            (COUNT(CASE WHEN lp.is_completed THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100,
            2
        ) as completion_rate,
        MAX(lp.created_at) as last_played  -- Using created_at since updated_at might not exist
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
    GROUP BY lp.module_id
    ORDER BY lp.module_id;
END;
$$ LANGUAGE plpgsql;

-- Also fix other functions that might have similar issues
-- Fix get_level3_top_scores function
DROP FUNCTION IF EXISTS get_level3_top_scores(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_top_scores(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
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
        lp.user_id, 
        lp.final_score as best_score,  -- Changed from current_score
        lp.total_time as best_time,    -- Changed from time_taken
        1 as total_attempts,           -- Simplified since we don't track attempts in current schema
        lp.created_at as last_played   -- Using created_at
    FROM level3_progress lp
    WHERE lp.module_id = p_module      -- Changed from module to module_id
      AND lp.is_completed = TRUE
    ORDER BY lp.final_score DESC, lp.total_time ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Fix get_level3_user_analytics function
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
            AVG(final_score) as avg_score,     -- Changed from current_score
            MAX(final_score) as max_score,     -- Changed from current_score
            MIN(final_score) as min_score,     -- Changed from current_score
            SUM(COALESCE(total_time, 0)) as total_time  -- Changed from time_taken
        FROM level3_progress
        WHERE user_id = p_user_id
          AND (p_module IS NULL OR module_id = p_module)  -- Changed from module
    ),
    improvement AS (
        SELECT
            CASE
                WHEN COUNT(*) > 1 THEN
                    (MAX(final_score) - MIN(final_score))::NUMERIC / NULLIF(COUNT(*) - 1, 0)  -- Changed from current_score
                ELSE 0
            END as improvement
        FROM level3_progress
        WHERE user_id = p_user_id
          AND (p_module IS NULL OR module_id = p_module)  -- Changed from module
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
