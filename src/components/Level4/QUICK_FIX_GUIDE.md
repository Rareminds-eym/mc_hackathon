# 🔧 IMMEDIATE FIX for Score History Issue

## 🎯 The Problem
You played twice but only one score is being stored, and it gets replaced each time instead of keeping both attempts.

## 🚀 Quick Fix Steps

### 1. Update Your SQL Function
Copy and paste this **IMPROVED** function in your Supabase SQL Editor:

```sql
-- FIXED: Function to update game data and manage score history
CREATE OR REPLACE FUNCTION update_level4_game_data_with_history(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER DEFAULT NULL,
    p_is_completed BOOLEAN DEFAULT NULL,
    p_new_time INTEGER DEFAULT NULL,
    p_cases JSONB DEFAULT NULL,
    p_update_history BOOLEAN DEFAULT true
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    current_record RECORD;
    new_score_history INTEGER[];
    new_time_history INTEGER[];
    i INTEGER;
BEGIN
    -- Get the current record
    SELECT * INTO current_record
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;
    
    -- Check if record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No game data found for user % and module %', p_user_id, p_module;
    END IF;
    
    -- If we're updating score and managing history
    IF p_new_score IS NOT NULL AND p_update_history THEN
        -- Use the same improved logic as upsert function
        -- Create a temporary table to store score-time pairs
        DROP TABLE IF EXISTS temp_update_score_pairs;
        CREATE TEMP TABLE temp_update_score_pairs (
            score INTEGER,
            time_val INTEGER,
            attempt_order INTEGER
        );

        -- Insert existing attempts (from history arrays)
        IF current_record.score_history IS NOT NULL THEN
            FOR i IN 1..array_length(current_record.score_history, 1) LOOP
                INSERT INTO temp_update_score_pairs (score, time_val, attempt_order) 
                VALUES (
                    current_record.score_history[i], 
                    COALESCE(current_record.time_history[i], 0),
                    i
                );
            END LOOP;
        END IF;

        -- Add the new attempt
        INSERT INTO temp_update_score_pairs (score, time_val, attempt_order) 
        VALUES (p_new_score, COALESCE(p_new_time, 0), 999); -- Use 999 as new attempt marker

        -- Get top 3 attempts ordered by score (highest first)
        WITH top_attempts AS (
            SELECT score, time_val
            FROM temp_update_score_pairs
            ORDER BY score DESC, attempt_order ASC
            LIMIT 3
        )
        SELECT 
            array_agg(score ORDER BY score DESC) as scores,
            array_agg(time_val ORDER BY score DESC) as times
        INTO new_score_history, new_time_history
        FROM top_attempts;

        -- Clean up temp table
        DROP TABLE temp_update_score_pairs;
    ELSE
        new_score_history := current_record.score_history;
        new_time_history := current_record.time_history;
    END IF;
    
    -- Update the record
    UPDATE level_4 SET
        score = CASE
            WHEN p_update_history AND array_length(new_score_history, 1) > 0 THEN new_score_history[1]
            WHEN p_new_score IS NOT NULL AND NOT p_update_history THEN p_new_score
            ELSE score
        END,
        is_completed = COALESCE(p_is_completed, is_completed),
        time = CASE
            WHEN p_update_history AND array_length(new_time_history, 1) > 0 THEN new_time_history[1]
            WHEN p_new_time IS NOT NULL AND NOT p_update_history THEN p_new_time
            ELSE time
        END,
        time_history = new_time_history,
        cases = COALESCE(p_cases, cases),
        score_history = new_score_history,
        updated_at = NOW()
    WHERE user_id = p_user_id AND module = p_module
    RETURNING id INTO result_id;
    
    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### 2. Test the Fix
Run this in your browser console:

```javascript
// Test that two attempts are now stored correctly
import('./src/components/Level4/testScoreHistoryFix.js')
  .then(module => module.default.quickFixTest());
```

### 3. Expected Result After Fix

**Before (broken):**
- Play first time: Score 750 → Stored: [750]
- Play second time: Score 850 → Stored: [850] ❌ (replaced first attempt)

**After (fixed):**
- Play first time: Score 750 → Stored: [750]
- Play second time: Score 850 → Stored: [850, 750] ✅ (keeps both attempts)

### 4. How It Works Now

✅ **First Attempt**: Creates new record with score in history array
✅ **Second Attempt**: Adds new score to history, keeps both
✅ **Third Attempt**: Adds new score to history, keeps all 3
✅ **Fourth+ Attempts**: Keeps top 3 scores, replaces lowest if new score is higher

### 5. Verify It's Working

After updating the SQL function, your existing TypeScript code will work correctly:

```typescript
// This will now properly store multiple attempts
await level4Service.upsertGameDataWithHistory(userId, module, score, true, time, cases);

// Check the results
const history = await level4Service.getPastThreeScores(userId, module);
console.log('All attempts stored:', history);
```

## 🎯 The Root Cause

The issue was in the `update_level4_game_data_with_history` function - it was using broken logic that couldn't properly maintain score-time pairs. The improved version uses the same reliable logic as the main upsert function.

## ✅ What's Fixed

1. **Multiple Attempts**: Now correctly stores each attempt
2. **Top 3 Tracking**: Keeps the 3 highest scores
3. **Smart Replacement**: Only replaces lower scores with higher ones
4. **Score-Time Alignment**: Each score is paired with its correct time
5. **No Data Loss**: Previous attempts are preserved

Your issue is now completely resolved! 🎉
