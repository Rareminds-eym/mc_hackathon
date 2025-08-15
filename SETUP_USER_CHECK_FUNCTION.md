# Setup User Existence Check Function

## Overview
To properly handle password reset error messages, we need to create a Supabase RPC function that can check if a user exists in the `auth.users` table.

## Step 1: Create the RPC Function

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the following SQL:

```sql
-- Create a function to check if a user exists in auth.users table
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
```

4. Click **Run** to execute the SQL

## Step 2: Test the Function

After creating the function, test it in the SQL Editor:

```sql
-- Test with an existing email (replace with actual email)
SELECT check_user_exists_by_email('existing@example.com');

-- Test with a non-existing email
SELECT check_user_exists_by_email('nonexistent@example.com');
```

## Step 3: Verify in Application

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5174/auth`
3. Click "Forgot Password?"
4. Test with different email addresses:
   - **Existing email**: Should show "Password reset email sent!"
   - **Non-existing email**: Should show "No account found with this email address..."

## Expected Behavior

### ✅ Existing Email
- **Input**: Email that exists in auth.users
- **Result**: Green success message - "Password reset email sent! Check your inbox..."
- **Action**: Email is actually sent by Supabase

### ❌ Non-existing Email  
- **Input**: Email that doesn't exist in auth.users
- **Result**: Red error message - "No account found with this email address..."
- **Action**: No email is sent, user gets immediate feedback

### ❌ Other Errors
- **Rate limiting**: "Too many requests. Please wait a few minutes..."
- **Invalid format**: "Please enter a valid email address."
- **Database error**: "Unable to process request. Please try again later."

## Troubleshooting

### Function Not Found Error
If you get an error like "function check_user_exists_by_email does not exist":

1. Make sure you ran the SQL in the Supabase SQL Editor
2. Check that the function was created successfully
3. Verify permissions are granted correctly

### Permission Denied Error
If you get permission errors:

1. Make sure the `GRANT EXECUTE` statement was run
2. Check that your RLS policies allow the function to be called
3. Verify you're authenticated when testing

### Function Returns False for Existing Users
If the function returns false for users you know exist:

1. Check the email format (case sensitivity, spaces)
2. Verify the user actually exists in auth.users table
3. Check for any RLS policies blocking access

## Security Notes

- The function uses `SECURITY DEFINER` to run with elevated privileges
- It only returns a boolean (true/false), not sensitive user data
- Error handling prevents information leakage
- Function is only accessible to authenticated users

## Alternative: Fallback to Teams Table

If you prefer not to use the RPC function, you can fallback to checking the teams table by modifying the AuthContext:

```typescript
// In resetPassword function, replace the RPC call with:
const { data: teamData, error: teamError } = await supabase
  .from('teams')
  .select('email')
  .eq('email', email.trim())
  .limit(1)

if (!teamData || teamData.length === 0) {
  // User not found logic...
}
```

This approach uses your existing teams table instead of the auth.users table.
