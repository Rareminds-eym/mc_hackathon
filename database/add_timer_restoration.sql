-- Add timer restoration functionality to attempt_details table
-- This allows saving and restoring the timer state when users continue their progress

-- Add time_remaining column to attempt_details table
ALTER TABLE public.attempt_details 
ADD COLUMN IF NOT EXISTS time_remaining INTEGER DEFAULT 5400;

-- Add comment to explain the column
COMMENT ON COLUMN public.attempt_details.time_remaining IS 'Timer state in seconds remaining (default 5400 = 1.5 hours)';

-- Create index for better query performance when loading progress
CREATE INDEX IF NOT EXISTS idx_attempt_details_timer 
ON public.attempt_details(email, session_id, module_number, time_remaining);

-- Update existing records to have default timer value if they don't have one
UPDATE public.attempt_details 
SET time_remaining = 5400 
WHERE time_remaining IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.attempt_details 
ALTER COLUMN time_remaining SET NOT NULL;

-- Add constraint to ensure timer value is reasonable (between 0 and 5400 seconds)
ALTER TABLE public.attempt_details 
ADD CONSTRAINT check_time_remaining_range 
CHECK (time_remaining >= 0 AND time_remaining <= 5400);
