# Level 3 History Feature

## Overview

The Level 3 History feature automatically saves complete game session data to a separate `level3_history` table when users click "Play Again". This preserves all progress data for analytics, user history, and potential future features while still providing users with a fresh start.

## How It Works

### When "Play Again" is Clicked:

1. **Save to History**: All current Level 3 data is saved to the `level3_history` table
2. **Clear Current Data**: All records are removed from the `level3_progress` table
3. **Fresh Start**: User begins a new game session with clean state

### Data Saved to History

The history record includes:

#### Summary Statistics
- `total_scenarios`: Number of scenarios completed
- `total_score`: Total score across all scenarios
- `total_time`: Total time spent (in seconds)
- `avg_health`: Average health across scenarios
- `total_combo`: Total combo points achieved

#### Detailed Data
- `scenario_results`: Array of individual scenario results
- `detailed_progress`: Complete raw data from `level3_progress` table
- `session_summary`: Formatted summary for easy display

#### Metadata
- `user_id`: User who completed the session
- `module_id`: Module identifier
- `session_completed_at`: Completion timestamp
- `created_at` / `updated_at`: Record timestamps

## Database Schema

### level3_history Table Structure (Simple, No Functions)

```sql
CREATE TABLE level3_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    module_id TEXT NOT NULL,
    session_completed_at TIMESTAMPTZ NOT NULL,

    -- Summary stats
    total_scenarios INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0,
    avg_health DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_combo INTEGER NOT NULL DEFAULT 0,

    -- Detailed data (JSON as TEXT - no database functions needed)
    scenario_results TEXT, -- JSON string
    detailed_progress TEXT, -- JSON string
    session_summary TEXT, -- JSON string

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Setup Instructions

1. **Create the Table**: Run the SQL script in `database/level3_history_table.sql`
2. **Verify Permissions**: Ensure RLS policies are properly configured
3. **Test**: Complete a Level 3 session and click "Play Again" to verify data is saved

## Usage Examples

### Querying User History

```typescript
// Get last 10 sessions for a user and module
const history = await getLevel3History("1", 10);

// Example history record structure:
{
  id: 123,
  user_id: "uuid-here",
  module_id: "1",
  session_completed_at: "2024-01-15T10:30:00Z",
  total_scenarios: 5,
  total_score: 450,
  total_time: 1200, // 20 minutes
  avg_health: 85.5,
  total_combo: 25,
  scenario_results: [
    { score: 90, combo: 5, health: 100, scenarioIndex: 0 },
    { score: 85, combo: 4, health: 90, scenarioIndex: 1 },
    // ... more scenarios
  ],
  detailed_progress: [
    // Raw progress records from level3_progress table
  ],
  session_summary: {
    completedScenarios: 5,
    avgScorePerScenario: 90,
    totalTimeFormatted: "20:00",
    finalStats: { /* overall stats */ }
  }
}
```

### Analytics Queries

```sql
-- Get user's best scores by module
SELECT 
    module_id,
    MAX(total_score) as best_score,
    MIN(total_time) as fastest_time,
    COUNT(*) as attempts
FROM level3_history 
WHERE user_id = 'user-uuid'
GROUP BY module_id;

-- Get user's progress over time
SELECT 
    session_completed_at,
    total_score,
    total_time,
    avg_health
FROM level3_history 
WHERE user_id = 'user-uuid' AND module_id = '1'
ORDER BY session_completed_at DESC;
```

## Benefits

### For Users
- ✅ Fresh start every time they click "Play Again"
- ✅ No interference from previous session data
- ✅ Consistent, predictable behavior

### For Developers
- ✅ Complete session data preserved for analytics
- ✅ User progress history available for features
- ✅ Debugging information retained
- ✅ Potential for leaderboards, achievements, etc.

### For Analytics
- ✅ Track user improvement over time
- ✅ Identify difficult scenarios
- ✅ Measure engagement and retention
- ✅ Generate insights on game balance

## Future Enhancements

This history data enables future features like:

- **User Progress Dashboard**: Show improvement over time
- **Leaderboards**: Compare scores across users
- **Achievement System**: Unlock rewards based on history
- **Difficulty Adjustment**: Adapt game based on performance
- **Detailed Analytics**: Generate reports on user behavior

## Monitoring

### Key Metrics to Track
- History records created per day
- Average session completion time
- Score distribution across users
- Most/least completed modules

### Maintenance
- Consider archiving old history records (>1 year)
- Monitor table size and performance
- Regular backup of history data
