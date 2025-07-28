-- ==========================================
-- ✅ SIMPLE LEVEL 3 TABLE CREATION TEST
-- ==========================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the table if it doesn't exist (with all required columns)
CREATE TABLE IF NOT EXISTS level3_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Removed FK constraint for testing
  module_id TEXT NOT NULL,
  level_number INTEGER NOT NULL DEFAULT 1,
  scenario_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER[] NOT NULL DEFAULT '{}',
  health INTEGER[] NOT NULL DEFAULT '{}',
  combo INTEGER[] NOT NULL DEFAULT '{}',
  placed_pieces JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  current_score INTEGER DEFAULT 0,
  current_health INTEGER DEFAULT 0,
  current_combo INTEGER DEFAULT 0,
  time_taken INTEGER,
  total_attempts INTEGER DEFAULT 0,
  score_history INTEGER[] DEFAULT '{}',
  health_history INTEGER[] DEFAULT '{}',
  combo_history INTEGER[] DEFAULT '{}',
  time_history INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, level_number, scenario_index)
);

-- 3. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_id ON level3_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_progress_module_level_scenario ON level3_progress(module_id, level_number, scenario_index);
CREATE INDEX IF NOT EXISTS idx_level3_progress_is_completed ON level3_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_level3_progress_current_score ON level3_progress(current_score);

-- 4. Test insert
INSERT INTO level3_progress (
    user_id, module_id, level_number, scenario_index,
    score, health, combo, current_score, current_health, current_combo,
    is_completed
) VALUES (
    gen_random_uuid(), 'module1', 1, 0,
    ARRAY[100], ARRAY[50], ARRAY[2], 100, 50, 2,
    true
) ON CONFLICT (user_id, module_id, level_number, scenario_index) DO NOTHING;

-- 5. Test query
SELECT 
    id, user_id, module_id, level_number, scenario_index,
    current_score, current_health, current_combo, is_completed,
    created_at
FROM level3_progress 
LIMIT 5;
