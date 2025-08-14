-- Create a function to check if a user exists in auth.users table
-- This function can be called from the frontend to verify email existence before password reset

CREATE OR REPLACE FUNCTION check_user_exists_by_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Check if user exists in auth.users table
    SELECT EXISTS(
        SELECT 1 
        FROM auth.users 
        WHERE email = p_email
    ) INTO user_exists;
    
    RETURN user_exists;
EXCEPTION
    WHEN OTHERS THEN
        -- Return false if there's any error (e.g., permission issues)
        RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_exists_by_email(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION check_user_exists_by_email(TEXT) IS 'Check if a user exists in auth.users table by email address. Returns true if user exists, false otherwise.';

-- Test the function (replace with actual email to test)
-- SELECT check_user_exists_by_email('test@example.com');
