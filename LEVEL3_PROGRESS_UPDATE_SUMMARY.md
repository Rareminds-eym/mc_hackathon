# Level 3 Progress Storage Update

## Summary
Updated the Level 3 JigsawBoard component to store progress data with **one row per scenario** instead of creating multiple rows. The system now uses an update-or-insert approach to maintain a single record for each user-module-scenario combination.

## Changes Made

### 1. Updated `saveProgressToSupabase` Function
- **Before**: Used `insert()` which always created new rows
- **After**: Uses update-first approach:
  1. Try to update existing record for the user-module-scenario combination
  2. If no record exists, insert a new one
  3. This ensures only one row per scenario per user

### 2. Enhanced Progress Restoration Logic
- **Before**: Got the most recent record only
- **After**: Gets all records for the user-module combination and:
  1. Collects completed scenario results
  2. Finds incomplete scenarios and restores their state
  3. Determines the correct current scenario index
  4. Properly handles both completed and in-progress scenarios

### 3. Database Schema Alignment
- Updated code to match the actual table schema:
  - Uses `module_id` (not `module`)
  - Uses correct column names as per the provided schema
  - Added user authentication check before saving

## Database Requirements

### Unique Constraint (Recommended)
To prevent duplicate records, run the SQL script `add-unique-constraint-level3.sql`:

```sql
-- Add unique constraint to ensure one row per scenario per user
ALTER TABLE level3_progress 
ADD CONSTRAINT unique_user_module_scenario 
UNIQUE (user_id, module_id, scenario_index);
```

### Current Table Schema (Confirmed)
```sql
create table public.level3_progress (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  module_id text not null,
  scenario_index integer not null,
  final_score integer not null,
  total_score integer null,
  total_time integer null,
  scenario_results jsonb null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  is_completed boolean null default false,
  placed_pieces jsonb null,
  combo integer null,
  score integer null,
  health integer null,
  constraint level_3_pkey primary key (id)
);
```

## How It Works Now

### Saving Progress
1. **During Gameplay**: Every successful piece placement saves progress
2. **Scenario Completion**: Marks scenario as completed and saves final state
3. **Update Logic**: 
   - First tries to update existing record for (user_id, module_id, scenario_index)
   - If no record exists, creates a new one
   - This ensures exactly one row per scenario per user

### Loading Progress
1. **On Game Start**: Loads all progress records for the user-module combination
2. **State Restoration**:
   - Completed scenarios → added to scenario results
   - Incomplete scenarios → restore game state (pieces, score, health, combo)
   - Determines correct current scenario index
3. **Continuation**: User can continue from where they left off

## Benefits

1. **Clean Data**: One row per scenario eliminates duplicate records
2. **Better Performance**: Fewer database rows to query and manage
3. **Accurate Progress**: Proper tracking of completed vs in-progress scenarios
4. **Data Integrity**: Unique constraint prevents accidental duplicates
5. **Resume Capability**: Users can resume incomplete scenarios exactly where they left off

## Testing Recommendations

1. **Test Scenario Progression**:
   - Complete a scenario → verify single row created with `is_completed = true`
   - Start next scenario → verify new row created for next scenario_index
   - Quit mid-scenario → verify incomplete row saved with current state
   - Resume game → verify state restored correctly

2. **Test Data Integrity**:
   - Try to create duplicate records → should update existing instead
   - Check database after multiple saves → should see one row per completed scenario
   - Verify unique constraint prevents duplicates

3. **Test Edge Cases**:
   - User not authenticated → should not save (graceful handling)
   - Network issues during save → should handle errors properly
   - Multiple browser tabs → should maintain consistency

## Files Modified

1. `src/components/l3/JigsawBoard.tsx` - Main component with updated save/load logic
2. `add-unique-constraint-level3.sql` - Database constraint script (new file)
3. `LEVEL3_PROGRESS_UPDATE_SUMMARY.md` - This documentation (new file)
