-- =====================================================
-- MODULES TABLE SETUP - COMPLETE SCHEMA
-- =====================================================
-- This script creates the modules table and populates it with the correct data

-- Create the modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'locked',
    progress INTEGER DEFAULT 0,
    unlock_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the levels table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    stars INTEGER DEFAULT 1,
    taxonomy TEXT DEFAULT 'Recall',
    time_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(module_id, level_number)
);

-- Create the level_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.level_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, level_id)
);

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM level_progress;
-- DELETE FROM levels;
-- DELETE FROM modules;

-- Insert modules data
INSERT INTO modules (id, title, description, status, progress) VALUES
('1', 'Introduction', 'Foundation of pharmaceutical regulations and GMP principles', 'available', 0),
('2', 'Personal Hygiene', 'Learn about proper hygiene practices in manufacturing', 'available', 0),
('3', 'Cleaning Validation', 'Understanding cleaning validation processes and requirements', 'available', 0),
('4', 'Documentation', 'Good Documentation Practices and maintaining data integrity', 'available', 0),
('HL1', 'Hackathon Level-1', 'First level hackathon challenge', 'locked', 0),
('HL2', 'Hackathon Level-2', 'Advanced hackathon challenge', 'locked', 0)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    updated_at = now();

-- Insert sample levels for each module
INSERT INTO levels (module_id, level_number, title, description, difficulty, stars, taxonomy, time_minutes) VALUES
-- Module 1 levels
('1', 1, 'Introduction to GMP', 'Understand the basics of Good Manufacturing Practices', 'Beginner', 2, 'Recall', 15),
('1', 2, 'Regulatory Bodies', 'Learn about key regulatory agencies in pharmaceuticals', 'Intermediate', 3, 'Classify', 20),

-- Module 2 levels  
('2', 1, 'Personal Hygiene Basics', 'Basic hygiene requirements in manufacturing', 'Beginner', 2, 'Recall', 15),
('2', 2, 'Hygiene Violations', 'Identify and correct hygiene violations', 'Intermediate', 3, 'Apply', 25),

-- Module 3 levels
('3', 1, 'Cleaning Validation Basics', 'Introduction to cleaning validation', 'Beginner', 2, 'Recall', 15),
('3', 2, 'Validation Protocols', 'Creating and executing validation protocols', 'Advanced', 3, 'Apply', 30),

-- Module 4 levels
('4', 1, 'Documentation Basics', 'Introduction to good documentation practices', 'Beginner', 2, 'Recall', 15),
('4', 2, 'Data Integrity', 'Understanding ALCOA principles', 'Intermediate', 3, 'Classify', 20),

-- Hackathon levels
('HL1', 1, 'Hackathon Challenge 1', 'First hackathon challenge level', 'Advanced', 4, 'Create', 45),
('HL2', 1, 'Hackathon Challenge 2', 'Advanced hackathon challenge level', 'Expert', 5, 'Evaluate', 60)
ON CONFLICT (module_id, level_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    difficulty = EXCLUDED.difficulty,
    stars = EXCLUDED.stars,
    taxonomy = EXCLUDED.taxonomy,
    time_minutes = EXCLUDED.time_minutes,
    updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_levels_module_id ON levels(module_id);
CREATE INDEX IF NOT EXISTS idx_level_progress_user_id ON level_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level_progress_module_id ON level_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_level_progress_user_module ON level_progress(user_id, module_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_levels_updated_at
    BEFORE UPDATE ON levels
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_level_progress_updated_at
    BEFORE UPDATE ON level_progress
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Verify the data
SELECT 'Modules created:' as info, count(*) as count FROM modules;
SELECT 'Levels created:' as info, count(*) as count FROM levels;
SELECT * FROM modules ORDER BY 
    CASE 
        WHEN id ~ '^[0-9]+$' THEN id::integer 
        ELSE 999 
    END, id;
