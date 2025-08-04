-- Create level3_history table to store completed Level 3 game sessions
-- This table preserves all Level 3 data when users click "Play Again"
-- Simple schema without database functions

CREATE TABLE IF NOT EXISTS level3_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    session_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Overall session statistics
    total_scenarios INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    avg_health DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_combo INTEGER NOT NULL DEFAULT 0,

    -- Detailed session data (stored as JSON text)
    scenario_results TEXT, -- JSON string of scenario results array
    detailed_progress TEXT, -- JSON string of all detailed progress records
    session_summary TEXT, -- JSON string of summary statistics

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_level3_history_user_id ON level3_history(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_history_module_id ON level3_history(module_id);
CREATE INDEX IF NOT EXISTS idx_level3_history_user_module ON level3_history(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_level3_history_completed_at ON level3_history(session_completed_at);

-- Add RLS (Row Level Security) policies (simple policies without functions)
ALTER TABLE level3_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own history records
CREATE POLICY "Users can view their own level3 history" ON level3_history
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own history records
CREATE POLICY "Users can insert their own level3 history" ON level3_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own history records (if needed)
CREATE POLICY "Users can update their own level3 history" ON level3_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own history records (if needed)
CREATE POLICY "Users can delete their own level3 history" ON level3_history
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE level3_history IS 'Stores completed Level 3 game sessions for history and analytics';
COMMENT ON COLUMN level3_history.user_id IS 'Reference to the user who completed the session';
COMMENT ON COLUMN level3_history.module_id IS 'Module identifier (e.g., "1", "2", etc.)';
COMMENT ON COLUMN level3_history.session_completed_at IS 'When the user completed the entire Level 3 session';
COMMENT ON COLUMN level3_history.total_scenarios IS 'Number of scenarios completed in this session';
COMMENT ON COLUMN level3_history.total_score IS 'Total score achieved across all scenarios';
COMMENT ON COLUMN level3_history.total_time IS 'Total time spent on the session in seconds';
COMMENT ON COLUMN level3_history.avg_health IS 'Average health across all scenarios';
COMMENT ON COLUMN level3_history.total_combo IS 'Total combo points achieved';
COMMENT ON COLUMN level3_history.scenario_results IS 'Array of individual scenario results';
COMMENT ON COLUMN level3_history.detailed_progress IS 'Complete progress data from level3_progress table';
COMMENT ON COLUMN level3_history.session_summary IS 'Formatted summary statistics for easy display';
