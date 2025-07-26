# Level 3 Database Troubleshooting Guide

## Issue: Data not saving to level3_progress table

### Possible Causes and Solutions

#### 1. SQL Functions Not Executed
**Problem**: The SQL functions in `Level3.sql` haven't been executed in Supabase.

**Solution**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the entire content of `GMP/src/components/l3/Level3.sql`
4. Execute the SQL script
5. Verify functions exist by running:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name LIKE '%level3%';
   ```

#### 2. Authentication Issues
**Problem**: User not properly authenticated or user ID mismatch.

**Solution**:
1. Check browser console for authentication errors
2. Verify user is logged in: `console.log(user)` in component
3. Test authentication:
   ```javascript
   const { data, error } = await supabase.auth.getUser();
   console.log('Auth data:', data, 'Error:', error);
   ```

#### 3. Row Level Security (RLS) Issues
**Problem**: RLS policies preventing data access.

**Solution**:
1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'level3_progress';
   ```
2. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'level3_progress';
   ```
3. Test without RLS (temporarily):
   ```sql
   ALTER TABLE level3_progress DISABLE ROW LEVEL SECURITY;
   ```

#### 4. Table Structure Issues
**Problem**: Table missing or has incorrect structure.

**Solution**:
1. Verify table exists:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'level3_progress';
   ```
2. Check table structure:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'level3_progress';
   ```

#### 5. Function Parameter Mismatch
**Problem**: Function signature doesn't match the call.

**Solution**:
1. Check function signature:
   ```sql
   SELECT routine_name, routine_definition 
   FROM information_schema.routines 
   WHERE routine_name = 'upsert_level3_progress_with_history';
   ```
2. Verify parameters match the service call in `level3Service.ts`

### Debugging Steps

#### Step 1: Use the Debug Component
1. Add the debug component to your app:
   ```tsx
   import DebugLevel3Database from './src/components/l3/DebugLevel3Database';
   
   // Add to your route or component
   <DebugLevel3Database />
   ```

#### Step 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors when saving game completion
4. Check Network tab for failed requests

#### Step 3: Test Direct Database Access
1. Open browser console
2. Test direct Supabase access:
   ```javascript
   // Test table access
   const { data, error } = await supabase
     .from('level3_progress')
     .select('*')
     .limit(1);
   console.log('Table test:', data, error);
   
   // Test function call
   const { data: funcData, error: funcError } = await supabase.rpc('upsert_level3_progress_with_history', {
     p_user_id: 'test-user-id',
     p_module: 'test',
     p_level: 3,
     p_scenario_index: 0,
     p_score: 100,
     p_placed_pieces: { test: true },
     p_is_completed: true,
     p_time_taken: 60
   });
   console.log('Function test:', funcData, funcError);
   ```

#### Step 4: Verify Environment Variables
1. Check `.env` file contains:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
2. Restart development server after changing `.env`

### Common Error Messages and Solutions

#### "relation 'level3_progress' does not exist"
- **Cause**: Table not created
- **Solution**: Execute the SQL script in Supabase

#### "function upsert_level3_progress_with_history does not exist"
- **Cause**: SQL functions not executed
- **Solution**: Run the SQL script in Supabase SQL Editor

#### "new row violates row-level security policy"
- **Cause**: RLS policy blocking insert
- **Solution**: Check RLS policies or temporarily disable RLS

#### "permission denied for table level3_progress"
- **Cause**: User doesn't have table permissions
- **Solution**: Grant permissions or check RLS policies

#### "JWT expired" or "Invalid JWT"
- **Cause**: Authentication token expired
- **Solution**: Re-authenticate user

### Testing Checklist

- [ ] SQL script executed in Supabase
- [ ] Table `level3_progress` exists
- [ ] Functions exist (check with SQL query)
- [ ] User is authenticated
- [ ] RLS policies are correct
- [ ] Environment variables are set
- [ ] No console errors
- [ ] Debug component tests pass

### Quick Fix Commands

Execute these in Supabase SQL Editor if you suspect issues:

```sql
-- Check if table exists
SELECT * FROM level3_progress LIMIT 1;

-- Check if functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%level3%';

-- Test function manually
SELECT upsert_level3_progress_with_history(
  'test-user-id'::uuid,
  'test-module',
  3,
  0,
  100,
  '{"test": true}'::jsonb,
  true,
  60
);

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'level3_progress';

-- Temporarily disable RLS for testing
ALTER TABLE level3_progress DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS after testing
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;
```

### Contact Information

If issues persist after following this guide:
1. Check the browser console for specific error messages
2. Use the debug component to identify the exact failure point
3. Verify all SQL functions are properly created in Supabase
4. Test with RLS temporarily disabled to isolate permission issues
