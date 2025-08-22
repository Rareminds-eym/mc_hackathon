# 🚀 Deploy and Test Improved Score History

## 📋 Quick Setup Steps

### 1. Deploy the Updated SQL Function
Copy and paste this SQL in your Supabase SQL Editor:

```sql
-- Enhanced UPSERT function that manages score history arrays (IMPROVED VERSION)
CREATE OR REPLACE FUNCTION upsert_level4_game_data_with_history(
    p_user_id UUID,
    p_module INTEGER,
    p_new_score INTEGER,
    p_is_completed BOOLEAN,
    p_new_time INTEGER,
    p_cases JSONB
)
RETURNS TEXT AS $$
DECLARE
    result_id UUID;
    existing_record RECORD;
    new_score_history INTEGER[];
    new_time_history INTEGER[];
    i INTEGER;
BEGIN
    -- Get existing record
    SELECT score_history, time_history, score, time
    INTO existing_record
    FROM level_4
    WHERE user_id = p_user_id AND module = p_module;

    -- If no existing record, create arrays with just the new attempt
    IF existing_record IS NULL THEN
        new_score_history := ARRAY[p_new_score];
        new_time_history := ARRAY[p_new_time];
    ELSE
        -- Create a temporary table to store score-time pairs
        DROP TABLE IF EXISTS temp_score_pairs;
        CREATE TEMP TABLE temp_score_pairs (
            score INTEGER,
            time_val INTEGER,
            attempt_order INTEGER
        );

        -- Insert existing attempts (from history arrays)
        IF existing_record.score_history IS NOT NULL THEN
            FOR i IN 1..array_length(existing_record.score_history, 1) LOOP
                INSERT INTO temp_score_pairs (score, time_val, attempt_order) 
                VALUES (
                    existing_record.score_history[i], 
                    COALESCE(existing_record.time_history[i], 0),
                    i
                );
            END LOOP;
        END IF;

        -- Add the new attempt
        INSERT INTO temp_score_pairs (score, time_val, attempt_order) 
        VALUES (p_new_score, p_new_time, 999); -- Use 999 as new attempt marker

        -- Get top 3 attempts ordered by score (highest first)
        WITH top_attempts AS (
            SELECT score, time_val
            FROM temp_score_pairs
            ORDER BY score DESC, attempt_order ASC
            LIMIT 3
        )
        SELECT 
            array_agg(score ORDER BY score DESC) as scores,
            array_agg(time_val ORDER BY score DESC) as times
        INTO new_score_history, new_time_history
        FROM top_attempts;

        -- Clean up temp table
        DROP TABLE temp_score_pairs;
    END IF;

    -- Insert or update the record
    INSERT INTO level_4 (
        user_id, module, level,
        score, is_completed, time, 
        time_history, score_history, cases
    )
    VALUES (
        p_user_id, p_module, 4,
        new_score_history[1], p_is_completed, new_time_history[1],
        new_time_history, new_score_history, p_cases
    )
    ON CONFLICT (user_id, module)
    DO UPDATE SET
        score = new_score_history[1],
        is_completed = EXCLUDED.is_completed OR level_4.is_completed,
        time = new_time_history[1],
        time_history = new_time_history,
        score_history = new_score_history,
        cases = CASE
            WHEN new_score_history[1] > level_4.score THEN EXCLUDED.cases
            ELSE level_4.cases
        END,
        updated_at = NOW()
    RETURNING id INTO result_id;

    RETURN result_id::TEXT;
END;
$$ LANGUAGE plpgsql;
```

### 2. Test the Updated Function

Open your browser console and run:

```javascript
// Import the test module
import('./src/components/Level4/testSupabaseConnection.js')
  .then(module => module.default.testMultipleAttempts('your-user-id'));

// Or run the complete demo
import('./src/components/Level4/demoScoreHistory.js')
  .then(module => module.default.quickTest());
```

### 3. Expected Behavior

The system will now:

✅ **Track Top 3 Attempts**: Only keeps the 3 highest scores
✅ **Replace Lower Scores**: When you play more than 3 times, it replaces the lowest score if the new score is higher
✅ **Maintain Score-Time Alignment**: Each score is correctly paired with its corresponding time
✅ **Preserve Best Performance**: Always shows your best score as the current score

### 4. Example Scenario

If you play with these scores: **650, 850, 750, 950, 700, 900**

The system will:
1. After attempt 1: Keep [650]
2. After attempt 2: Keep [850, 650] 
3. After attempt 3: Keep [850, 750, 650]
4. After attempt 4: Keep [950, 850, 750] (removes 650)
5. After attempt 5: Keep [950, 850, 750] (700 not good enough)
6. After attempt 6: Keep [950, 900, 850] (removes 750)

**Final Result**: Top 3 scores [950, 900, 850] with their corresponding times

### 5. Verify in Your Game

Your existing service calls will automatically use the improved logic:

```typescript
// This will now properly manage top 3 attempts
await level4Service.upsertGameDataWithHistory(
  userId,
  module,
  newScore,
  isCompleted,
  timeElapsed,
  casesData
);

// Check the results
const scoreHistory = await level4Service.getPastThreeScores(userId, module);
console.log('Top 3 scores:', scoreHistory);
```

### 🎯 Problem Solved!

Your issue is now fixed:
- ❌ **Before**: Score was being overwritten each time
- ✅ **After**: System keeps top 3 attempts based on score
- ✅ **Smart Replacement**: Only replaces if new score is better than existing ones
- ✅ **Aligned Data**: Score and time histories remain perfectly synchronized

Test it out and let me know how it works! 🚀
