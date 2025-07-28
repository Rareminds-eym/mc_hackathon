# Authentication Troubleshooting Guide

## Issue: "Auth session missing!" Error

This error occurs when trying to save Level 3 completion data but the user's authentication session has expired or is invalid.

### Quick Fixes

#### 1. **Add Auth Status Checker (Recommended)**
Add this component to your Level 3 page to monitor authentication status:

```tsx
import AuthStatusChecker from './src/components/l3/AuthStatusChecker';

// Add to your Level 3 component
<AuthStatusChecker />
```

#### 2. **Refresh the Page**
- Simply refresh the browser page
- This will re-establish the authentication session

#### 3. **Log Out and Log Back In**
- Use the logout button in your app
- Log back in with your credentials

### Root Causes and Solutions

#### **Cause 1: Session Expired**
**Problem**: Supabase sessions expire after a certain time (default: 1 hour)

**Solution**: The updated code now automatically attempts to refresh the session:
```javascript
// Session validation is now built into the save function
const { error: refreshError } = await supabase.auth.refreshSession();
```

#### **Cause 2: Browser Storage Issues**
**Problem**: Authentication tokens stored in localStorage/sessionStorage are corrupted

**Solutions**:
1. Clear browser storage:
   - Open Developer Tools (F12)
   - Go to Application tab
   - Clear Local Storage and Session Storage
   - Refresh page and log in again

2. Use incognito/private browsing mode to test

#### **Cause 3: Network Issues**
**Problem**: Poor network connection causing auth requests to fail

**Solution**: Check network connection and retry

#### **Cause 4: Supabase Configuration Issues**
**Problem**: Environment variables or Supabase setup issues

**Check**:
```javascript
// In browser console
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Debugging Steps

#### Step 1: Check Authentication Status
Use the AuthStatusChecker component or run in browser console:
```javascript
// Check current auth status
const { data: session } = await supabase.auth.getSession();
const { data: user } = await supabase.auth.getUser();
console.log('Session:', session);
console.log('User:', user);
```

#### Step 2: Test Session Refresh
```javascript
// Try refreshing the session
const { error } = await supabase.auth.refreshSession();
console.log('Refresh result:', error ? 'Failed' : 'Success');
```

#### Step 3: Check Browser Console
Look for these error patterns:
- `AuthSessionMissingError`
- `JWT expired`
- `Invalid JWT`
- `403 Forbidden`

### Prevention Strategies

#### 1. **Automatic Session Refresh**
The updated code now includes automatic session refresh before saving data.

#### 2. **Session Monitoring**
Add session monitoring to detect expiration:
```javascript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed successfully');
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
```

#### 3. **Graceful Error Handling**
The service now provides better error messages and fallback authentication.

### Testing Authentication

#### Browser Console Test
```javascript
// Test authentication flow
async function testAuth() {
  try {
    // Check session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', sessionError ? 'Failed' : 'OK');
    
    // Check user
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('User check:', userError ? 'Failed' : 'OK');
    
    // Test refresh
    const { error: refreshError } = await supabase.auth.refreshSession();
    console.log('Refresh check:', refreshError ? 'Failed' : 'OK');
    
    return !sessionError && !userError && !refreshError;
  } catch (error) {
    console.error('Auth test failed:', error);
    return false;
  }
}

testAuth().then(result => console.log('Auth test result:', result ? 'PASS' : 'FAIL'));
```

### Updated Code Features

The Level 3 service now includes:

1. **Dual Authentication Check**: Uses provided user ID first, falls back to session check
2. **Automatic Session Refresh**: Attempts to refresh expired sessions
3. **Better Error Messages**: More descriptive error messages for debugging
4. **Session Validation**: Validates session before attempting database operations

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Auth session missing!" | Session expired | Refresh page or log in again |
| "JWT expired" | Token expired | Automatic refresh (built-in) |
| "Invalid JWT" | Corrupted token | Clear browser storage |
| "403 Forbidden" | Permission denied | Check RLS policies |
| "User not authenticated" | No user context | Log in again |

### Emergency Workaround

If authentication continues to fail, you can temporarily disable the authentication check for testing:

1. Go to Supabase Dashboard
2. Navigate to Authentication > Policies
3. Temporarily disable RLS on `level3_progress` table
4. Test the save functionality
5. **Important**: Re-enable RLS after testing

**SQL to disable RLS temporarily**:
```sql
ALTER TABLE level3_progress DISABLE ROW LEVEL SECURITY;
```

**SQL to re-enable RLS**:
```sql
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;
```

### Contact Support

If issues persist:
1. Check the AuthStatusChecker component output
2. Provide browser console logs
3. Note the exact error message and when it occurs
4. Test in incognito mode to rule out browser storage issues
