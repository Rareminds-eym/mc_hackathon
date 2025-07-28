-- =====================================================
-- UPDATE MODULES TABLE - HACKATHON IDS MIGRATION
-- =====================================================
-- This script updates module IDs 5 and 6 to HL1 and HL2
-- for the hackathon modules in the Supabase database

-- First, let's check if the modules table exists and see its structure
-- Run this query first to understand your current table structure:
-- SELECT * FROM modules ORDER BY id;

-- Update module ID 5 to HL1
UPDATE modules 
SET id = 'HL1', 
    title = 'Hackathon Level-1'
WHERE id = 5 OR id = '5';

-- Update module ID 6 to HL2  
UPDATE modules 
SET id = 'HL2',
    title = 'Hackathon Level-2' 
WHERE id = 6 OR id = '6';

-- If you need to also update any related tables that reference these module IDs,
-- you would need to update them as well. For example:

-- Update level_progress table if it exists
UPDATE level_progress 
SET module_id = 'HL1' 
WHERE module_id = '5' OR module_id = 5;

UPDATE level_progress 
SET module_id = 'HL2' 
WHERE module_id = '6' OR module_id = 6;

-- Update level3_progress table
UPDATE level3_progress 
SET module_id = 'HL1' 
WHERE module_id = '5' OR module_id = 5;

UPDATE level3_progress 
SET module_id = 'HL2' 
WHERE module_id = '6' OR module_id = 6;

-- Update level_4 table (this uses integer module IDs, so we need to be careful)
-- You might want to keep these as integers or create a mapping
-- For now, let's leave level_4 as is since it expects integer module IDs

-- Verify the changes
SELECT id, title, status FROM modules WHERE id IN ('HL1', 'HL2', '5', '6', 5, 6) ORDER BY id;

-- If you want to see all modules:
-- SELECT * FROM modules ORDER BY 
--   CASE 
--     WHEN id ~ '^[0-9]+$' THEN id::integer 
--     ELSE 999 
--   END, id;
