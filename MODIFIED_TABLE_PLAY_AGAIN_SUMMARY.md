# Modified Table Play Again Implementation Summary

## Overview
Modified the existing `level3_progress` table to support last 3 tries and top performance tracking without using database functions. This approach extends the current table structure while maintaining backward compatibility.

## Table Modifications

### New Columns Added to `level3_progress`
```sql
ALTER TABLE level3_progress 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_module_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS module_total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_total_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_avg_health NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_total_combo INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS module_scenario_results JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_top_performance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS attempt_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Column Purposes
- **`attempt_number`**: Tracks which attempt this is (1, 2, or 3 for last 3 tries)
- **`is_module_complete`**: Distinguishes module summary records from individual scenario records
- **`module_total_score`**: Total score across all scenarios in the module
- **`module_total_time`**: Total time taken for the entire module
- **`module_avg_health`**: Average health across all scenarios
- **`module_total_combo`**: Total combo count across all scenarios
- **`module_scenario_results`**: JSON array of all scenario results
- **`is_top_performance`**: Marks the user's best performance for this module
- **`attempt_created_at`**: Timestamp for ordering attempts

## Data Structure

### Individual Scenario Records (Existing)
```json
{
  "user_id": "uuid",
  "module_id": "1",
  "scenario_index": 0,
  "final_score": 95,
  "total_time": 120,
  "is_completed": true,
  "attempt_number": 1,
  "is_module_complete": false
}
```

### Module Summary Records (New)
```json
{
  "user_id": "uuid",
  "module_id": "1",
  "scenario_index": -1,
  "final_score": 285,
  "total_time": 420,
  "attempt_number": 1,
  "is_module_complete": true,
  "module_total_score": 285,
  "module_total_time": 420,
  "module_avg_health": 78.33,
  "module_total_combo": 12,
  "module_scenario_results": [...],
  "is_top_performance": true,
  "attempt_created_at": "2024-01-15T10:30:00Z"
}
```

## Last 3 Tries Logic

### Frontend Implementation
```typescript
const saveModuleAttempt = async (moduleId, totalScore, totalTime, avgHealth, totalCombo, scenarioResults) => {
  // 1. Get existing module completion attempts
  const existingAttempts = await supabase
    .from('level3_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('is_module_complete', true)
    .order('attempt_created_at', { ascending: false });

  // 2. Check if this is a new top performance
  const isTopPerformance = !existingAttempts || existingAttempts.length === 0 || 
    totalScore > Math.max(...existingAttempts.map(a => a.module_total_score || 0));

  // 3. Manage last 3 tries constraint
  let nextAttemptNumber = 1;
  
  if (existingAttempts && existingAttempts.length >= 3) {
    // Delete oldest attempt (attempt_number = 1)
    await supabase
      .from('level3_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .eq('attempt_number', 1);

    // Shift attempt numbers: 2->1, 3->2
    await supabase
      .from('level3_progress')
      .update({ attempt_number: 1 })
      .eq('attempt_number', 2);

    await supabase
      .from('level3_progress')
      .update({ attempt_number: 2 })
      .eq('attempt_number', 3);

    nextAttemptNumber = 3;
  } else {
    nextAttemptNumber = (existingAttempts?.length || 0) + 1;
  }

  // 4. Clear existing top performance flags if this is new best
  if (isTopPerformance) {
    await supabase
      .from('level3_progress')
      .update({ is_top_performance: false })
      .eq('is_top_performance', true);
  }

  // 5. Insert new module completion record
  await supabase
    .from('level3_progress')
    .insert([{
      user_id: user.id,
      module_id: moduleId,
      scenario_index: -1, // Special value for module summary
      attempt_number: nextAttemptNumber,
      is_module_complete: true,
      module_total_score: totalScore,
      module_total_time: totalTime,
      module_avg_health: avgHealth,
      module_total_combo: totalCombo,
      module_scenario_results: scenarioResults,
      is_top_performance: isTopPerformance,
      attempt_created_at: new Date().toISOString()
    }]);
};
```

## Service Layer Methods (No Database Functions)

### 1. Get Last 3 Attempts
```typescript
static async getLast3Attempts(module: string) {
  const { data } = await supabase
    .from('level3_progress')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('module_id', module)
    .eq('is_module_complete', true)
    .order('attempt_created_at', { ascending: false })
    .limit(3);

  return data.map(attempt => ({
    id: attempt.id,
    total_score: attempt.module_total_score,
    total_time: attempt.module_total_time,
    avg_health: attempt.module_avg_health,
    total_combo: attempt.module_total_combo,
    scenario_results: attempt.module_scenario_results,
    created_at: attempt.attempt_created_at,
    attempt_number: attempt.attempt_number,
    is_top_performance: attempt.is_top_performance
  }));
}
```

### 2. Get Top Performance
```typescript
static async getTopPerformance(module: string) {
  const { data } = await supabase
    .from('level3_progress')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('module_id', module)
    .eq('is_module_complete', true)
    .eq('is_top_performance', true)
    .single();

  return {
    best_total_score: data.module_total_score,
    best_total_time: data.module_total_time,
    best_avg_health: data.module_avg_health,
    best_total_combo: data.module_total_combo,
    best_scenario_results: data.module_scenario_results,
    achieved_at: data.attempt_created_at
  };
}
```

### 3. Get Performance History
```typescript
static async getModulePerformanceHistory(module: string) {
  const { data } = await supabase
    .from('level3_progress')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('module_id', module)
    .eq('is_module_complete', true)
    .order('attempt_number', { ascending: true });

  return data.map(attempt => ({
    attempt_number: attempt.attempt_number,
    total_score: attempt.module_total_score,
    total_time: attempt.module_total_time,
    avg_health: attempt.module_avg_health,
    total_combo: attempt.module_total_combo,
    created_at: attempt.attempt_created_at,
    is_top_performance: attempt.is_top_performance
  }));
}
```

## Benefits of Modified Table Approach

### 1. **No Database Functions Required**
- All logic implemented in frontend TypeScript
- Easier to debug and maintain
- No dependency on PostgreSQL function syntax

### 2. **Backward Compatibility**
- Existing scenario records remain unchanged
- New columns have default values
- Existing functionality continues to work

### 3. **Single Table Management**
- No need for additional tables
- Simplified data model
- Consistent with existing architecture

### 4. **Flexible Querying**
- Can query individual scenarios or module summaries
- Easy filtering with standard SQL WHERE clauses
- No complex function parameters

### 5. **Performance Optimized**
- Proper indexes for efficient querying
- Minimal data duplication
- Fast lookups for last 3 tries and top performance

## Data Flow Example

### First Module Completion
1. User completes Module 1
2. Insert module summary with `attempt_number = 1`, `is_top_performance = true`
3. Play Again button resets game state

### Second Module Completion
1. User completes Module 1 again with better score
2. Update previous record: `is_top_performance = false`
3. Insert new summary with `attempt_number = 2`, `is_top_performance = true`

### Fourth Module Completion (Exceeds 3 tries)
1. Delete all records with `attempt_number = 1`
2. Update `attempt_number = 2` → `attempt_number = 1`
3. Update `attempt_number = 3` → `attempt_number = 2`
4. Insert new summary with `attempt_number = 3`

## Indexes for Performance
```sql
CREATE INDEX idx_level3_progress_module_attempts 
  ON level3_progress(user_id, module_id, attempt_number DESC);

CREATE INDEX idx_level3_progress_top_performance 
  ON level3_progress(user_id, module_id, is_top_performance) 
  WHERE is_top_performance = TRUE;

CREATE INDEX idx_level3_progress_module_complete 
  ON level3_progress(user_id, module_id, is_module_complete, attempt_created_at DESC) 
  WHERE is_module_complete = TRUE;
```

This approach provides all the functionality of the previous implementation while using the existing table structure and avoiding database functions entirely.
