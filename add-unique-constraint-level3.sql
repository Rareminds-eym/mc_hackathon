-- Add unique constraint to level3_progress table to ensure one row per scenario per user
-- This prevents duplicate records for the same user, module, and scenario combination

-- First, remove any existing duplicates (keeping the most recent one)
WITH ranked_records AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, module_id, scenario_index 
      ORDER BY created_at DESC
    ) as rn
  FROM level3_progress
)
DELETE FROM level3_progress 
WHERE id IN (
  SELECT id FROM ranked_records WHERE rn > 1
);

-- Add the unique constraint
ALTER TABLE level3_progress 
ADD CONSTRAINT unique_user_module_scenario 
UNIQUE (user_id, module_id, scenario_index);

-- Create an index for better performance on queries
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_module_scenario 
ON level3_progress(user_id, module_id, scenario_index);

-- Verify the constraint was added
SELECT 
  constraint_name, 
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'level3_progress' 
  AND constraint_type = 'UNIQUE';
