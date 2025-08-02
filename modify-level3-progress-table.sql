-- Modify existing level3_progress table to support last 3 tries and top performance
-- This extends the current table without breaking existing functionality

-- Add new columns to existing level3_progress table
ALTER TABLE level3_progress 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_module_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS module_total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_total_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_avg_health NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_total_combo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_scenario_results JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_top_performance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS attempt_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for efficient querying of module attempts
CREATE INDEX IF NOT EXISTS idx_level3_progress_module_attempts 
  ON level3_progress(user_id, module_id, attempt_number DESC);

CREATE INDEX IF NOT EXISTS idx_level3_progress_top_performance 
  ON level3_progress(user_id, module_id, is_top_performance) 
  WHERE is_top_performance = TRUE;

CREATE INDEX IF NOT EXISTS idx_level3_progress_module_complete 
  ON level3_progress(user_id, module_id, is_module_complete, attempt_created_at DESC) 
  WHERE is_module_complete = TRUE;

-- Update existing records to have attempt_number = 1 and set attempt_created_at
UPDATE level3_progress 
SET attempt_number = 1, 
    attempt_created_at = COALESCE(created_at, NOW())
WHERE attempt_number IS NULL;

-- Create a unique constraint to ensure we don't have duplicate scenario records within the same attempt
-- This allows multiple attempts but prevents duplicate scenarios within one attempt
CREATE UNIQUE INDEX IF NOT EXISTS idx_level3_progress_unique_attempt_scenario
  ON level3_progress(user_id, module_id, attempt_number, scenario_index);

-- Comments for documentation
COMMENT ON COLUMN level3_progress.attempt_number IS 'Attempt number for this module (1, 2, or 3 for last 3 tries)';
COMMENT ON COLUMN level3_progress.is_module_complete IS 'TRUE when this record represents a completed module attempt';
COMMENT ON COLUMN level3_progress.module_total_score IS 'Total score across all scenarios in the module';
COMMENT ON COLUMN level3_progress.module_total_time IS 'Total time taken for the entire module';
COMMENT ON COLUMN level3_progress.module_avg_health IS 'Average health across all scenarios in the module';
COMMENT ON COLUMN level3_progress.module_total_combo IS 'Total combo count across all scenarios';
COMMENT ON COLUMN level3_progress.module_scenario_results IS 'JSON array of all scenario results for the module';
COMMENT ON COLUMN level3_progress.is_top_performance IS 'TRUE if this is the users best performance for this module';
COMMENT ON COLUMN level3_progress.attempt_created_at IS 'When this attempt was created (for ordering)';

-- Example of how data will be structured:
-- 
-- For a user completing Module 1 three times, the table will have:
-- 
-- Attempt 1 (First try):
-- - Multiple rows for individual scenarios (scenario_index 0, 1, 2, etc.)
-- - One summary row with is_module_complete = TRUE, attempt_number = 1
-- 
-- Attempt 2 (Second try):
-- - Multiple rows for individual scenarios with attempt_number = 2
-- - One summary row with is_module_complete = TRUE, attempt_number = 2
-- 
-- Attempt 3 (Third try):
-- - Multiple rows for individual scenarios with attempt_number = 3
-- - One summary row with is_module_complete = TRUE, attempt_number = 3
-- 
-- When a 4th attempt is made:
-- - Delete all rows with attempt_number = 1
-- - Shift attempt_number 2 -> 1, attempt_number 3 -> 2
-- - Insert new attempt as attempt_number = 3
-- 
-- Top performance tracking:
-- - Only one row per user per module will have is_top_performance = TRUE
-- - This gets updated when a new best score is achieved
