-- Modify existing level3_progress table to support last 3 tries and top performance tracking
-- This approach uses the existing table structure without database functions

-- Add new columns to existing level3_progress table for module completion tracking
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS is_module_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS module_total_score INTEGER DEFAULT 0;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS module_total_time INTEGER DEFAULT 0;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS module_avg_health NUMERIC(5,2) DEFAULT 0;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS module_total_combo INTEGER DEFAULT 0;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS module_completion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE level3_progress ADD COLUMN IF NOT EXISTS is_top_performance BOOLEAN DEFAULT FALSE;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_level3_module_attempts_user_module 
  ON level3_module_attempts(user_id, module_id);

CREATE INDEX IF NOT EXISTS idx_level3_module_attempts_created_at 
  ON level3_module_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_level3_top_performances_user_module 
  ON level3_top_performances(user_id, module_id);

CREATE INDEX IF NOT EXISTS idx_level3_top_performances_score 
  ON level3_top_performances(best_total_score DESC);

-- Function to get last 3 attempts for a user and module
CREATE OR REPLACE FUNCTION get_last_3_attempts(
  p_user_id UUID,
  p_module_id TEXT
)
RETURNS TABLE(
  id UUID,
  total_score INTEGER,
  total_time INTEGER,
  avg_health NUMERIC,
  total_combo INTEGER,
  scenario_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lma.id,
    lma.total_score,
    lma.total_time,
    lma.avg_health,
    lma.total_combo,
    lma.scenario_results,
    lma.created_at
  FROM level3_module_attempts lma
  WHERE lma.user_id = p_user_id 
    AND lma.module_id = p_module_id
  ORDER BY lma.created_at DESC
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performance for a user and module
CREATE OR REPLACE FUNCTION get_top_performance(
  p_user_id UUID,
  p_module_id TEXT
)
RETURNS TABLE(
  best_total_score INTEGER,
  best_total_time INTEGER,
  best_avg_health NUMERIC,
  best_total_combo INTEGER,
  best_scenario_results JSONB,
  achieved_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ltp.best_total_score,
    ltp.best_total_time,
    ltp.best_avg_health,
    ltp.best_total_combo,
    ltp.best_scenario_results,
    ltp.achieved_at
  FROM level3_top_performances ltp
  WHERE ltp.user_id = p_user_id 
    AND ltp.module_id = p_module_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's performance history for a module
CREATE OR REPLACE FUNCTION get_module_performance_history(
  p_user_id UUID,
  p_module_id TEXT
)
RETURNS TABLE(
  attempt_number INTEGER,
  total_score INTEGER,
  total_time INTEGER,
  avg_health NUMERIC,
  total_combo INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_top_performance BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_attempts AS (
    SELECT 
      lma.*,
      ROW_NUMBER() OVER (ORDER BY lma.created_at DESC) as attempt_number,
      CASE 
        WHEN lma.total_score = (
          SELECT MAX(lma2.total_score) 
          FROM level3_module_attempts lma2 
          WHERE lma2.user_id = p_user_id AND lma2.module_id = p_module_id
        ) THEN true 
        ELSE false 
      END as is_top_performance
    FROM level3_module_attempts lma
    WHERE lma.user_id = p_user_id 
      AND lma.module_id = p_module_id
    ORDER BY lma.created_at DESC
    LIMIT 3
  )
  SELECT 
    ra.attempt_number::INTEGER,
    ra.total_score,
    ra.total_time,
    ra.avg_health,
    ra.total_combo,
    ra.created_at,
    ra.is_top_performance
  FROM ranked_attempts ra
  ORDER BY ra.attempt_number;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old attempts (keep only last 3 per user per module)
CREATE OR REPLACE FUNCTION cleanup_old_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  WITH attempts_to_delete AS (
    SELECT lma.id
    FROM level3_module_attempts lma
    WHERE lma.id NOT IN (
      SELECT lma2.id
      FROM level3_module_attempts lma2
      WHERE lma2.user_id = lma.user_id 
        AND lma2.module_id = lma.module_id
      ORDER BY lma2.created_at DESC
      LIMIT 3
    )
  )
  DELETE FROM level3_module_attempts
  WHERE id IN (SELECT id FROM attempts_to_delete);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at timestamp on top performances
CREATE OR REPLACE FUNCTION update_top_performance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_top_performance_timestamp
  BEFORE UPDATE ON level3_top_performances
  FOR EACH ROW
  EXECUTE FUNCTION update_top_performance_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE level3_module_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE level3_top_performances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for level3_module_attempts
CREATE POLICY "Users can view their own module attempts" ON level3_module_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module attempts" ON level3_module_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module attempts" ON level3_module_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module attempts" ON level3_module_attempts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for level3_top_performances
CREATE POLICY "Users can view their own top performances" ON level3_top_performances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own top performances" ON level3_top_performances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own top performances" ON level3_top_performances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own top performances" ON level3_top_performances
  FOR DELETE USING (auth.uid() = user_id);
