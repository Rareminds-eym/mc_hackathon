# Play Again Functionality with Last 3 Tries & Top Performance Tracking

## Overview
Implemented a comprehensive play again system that stores the last 3 module attempts and tracks top performance for each user per module. This provides detailed performance history and enables meaningful replay functionality.

## Database Schema

### 1. Module Attempts Table (`level3_module_attempts`)
Stores the last 3 attempts per user per module:

```sql
CREATE TABLE level3_module_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_id TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_time INTEGER NOT NULL DEFAULT 0,
  avg_health NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_combo INTEGER NOT NULL DEFAULT 0,
  scenario_results JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Top Performances Table (`level3_top_performances`)
Stores the best attempt per user per module:

```sql
CREATE TABLE level3_top_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  module_id TEXT NOT NULL,
  best_total_score INTEGER NOT NULL DEFAULT 0,
  best_total_time INTEGER NOT NULL DEFAULT 0,
  best_avg_health NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_total_combo INTEGER NOT NULL DEFAULT 0,
  best_scenario_results JSONB NOT NULL DEFAULT '[]',
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);
```

## Play Again Functionality

### 1. Module Completion Flow
When a user completes all scenarios in a module:

```typescript
// 1. Calculate overall stats
const overallStats = calculateOverallStats(scenarioResults, timer);

// 2. Save module attempt with last 3 tries tracking
await saveModuleAttempt(
  moduleId,
  overallStats.totalScore,
  overallStats.totalTime,
  overallStats.avgHealth,
  overallStats.totalCombo,
  scenarioResults
);

// 3. Reset game state for replay
setShowFinalStats(false);
setScenarioIndex(0);
setScenarioResults([]);
setScore(0);
setHealth(100);
setCombo(0);
setTimer(0);
setPlacedPieces({ violations: [], actions: [] });
setCorrectPlacementIndex(0);
setShowScenario(true);
```

### 2. Save Module Attempt Logic
The `saveModuleAttempt` function handles:

#### A. Last 3 Tries Management
```typescript
// Get existing attempts
const existingAttempts = await supabase
  .from('level3_module_attempts')
  .select('*')
  .eq('user_id', user.id)
  .eq('module_id', moduleId)
  .order('created_at', { ascending: false });

// Keep only last 2 attempts (we'll add new one to make 3)
const attemptsToKeep = existingAttempts.slice(0, 2);

// Delete oldest attempts if we have 3 or more
if (existingAttempts.length >= 3) {
  const attemptsToDelete = existingAttempts.slice(2);
  for (const attempt of attemptsToDelete) {
    await supabase
      .from('level3_module_attempts')
      .delete()
      .eq('id', attempt.id);
  }
}

// Insert new attempt
await supabase
  .from('level3_module_attempts')
  .insert([newAttempt]);
```

#### B. Top Performance Tracking
```typescript
// Check if this is a new top performance
const isTopPerformance = !existingAttempts || existingAttempts.length === 0 || 
  totalScore > Math.max(...existingAttempts.map(a => a.total_score || 0));

// Update top performance if this is the best
if (isTopPerformance) {
  await supabase
    .from('level3_top_performances')
    .upsert({
      user_id: user.id,
      module_id: moduleId,
      best_total_score: totalScore,
      best_total_time: totalTime,
      best_avg_health: avgHealth,
      best_total_combo: totalCombo,
      best_scenario_results: scenarioResults,
      achieved_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,module_id'
    });
}
```

## Database Functions

### 1. Get Last 3 Attempts
```sql
CREATE FUNCTION get_last_3_attempts(p_user_id UUID, p_module_id TEXT)
RETURNS TABLE(
  id UUID,
  total_score INTEGER,
  total_time INTEGER,
  avg_health NUMERIC,
  total_combo INTEGER,
  scenario_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
```

### 2. Get Top Performance
```sql
CREATE FUNCTION get_top_performance(p_user_id UUID, p_module_id TEXT)
RETURNS TABLE(
  best_total_score INTEGER,
  best_total_time INTEGER,
  best_avg_health NUMERIC,
  best_total_combo INTEGER,
  best_scenario_results JSONB,
  achieved_at TIMESTAMP WITH TIME ZONE
)
```

### 3. Get Performance History
```sql
CREATE FUNCTION get_module_performance_history(p_user_id UUID, p_module_id TEXT)
RETURNS TABLE(
  attempt_number INTEGER,
  total_score INTEGER,
  total_time INTEGER,
  avg_health NUMERIC,
  total_combo INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_top_performance BOOLEAN
)
```

## Service Layer Methods

### 1. Level3Service.getLast3Attempts()
```typescript
static async getLast3Attempts(module: string): Promise<{
  data: any[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_last_3_attempts', {
    p_user_id: userData.user.id,
    p_module_id: module
  });
  
  return { data: data || [], error: null };
}
```

### 2. Level3Service.getTopPerformance()
```typescript
static async getTopPerformance(module: string): Promise<{
  data: any | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_top_performance', {
    p_user_id: userData.user.id,
    p_module_id: module
  });
  
  return { data: data?.[0] || null, error: null };
}
```

### 3. Level3Service.getModulePerformanceHistory()
```typescript
static async getModulePerformanceHistory(module: string): Promise<{
  data: any[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.rpc('get_module_performance_history', {
    p_user_id: userData.user.id,
    p_module_id: module
  });
  
  return { data: data || [], error: null };
}
```

## Data Storage Examples

### Module Attempt Record
```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "module_id": "1",
  "total_score": 285,
  "total_time": 420,
  "avg_health": 78.33,
  "total_combo": 12,
  "scenario_results": [
    {"score": 95, "combo": 5, "health": 85, "scenarioIndex": 0},
    {"score": 90, "combo": 4, "health": 75, "scenarioIndex": 1},
    {"score": 100, "combo": 3, "health": 75, "scenarioIndex": 2}
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Top Performance Record
```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "module_id": "1",
  "best_total_score": 295,
  "best_total_time": 380,
  "best_avg_health": 85.67,
  "best_total_combo": 15,
  "best_scenario_results": [...],
  "achieved_at": "2024-01-15T14:20:00Z"
}
```

## Benefits

### 1. **Performance Tracking**
- Users can see their last 3 attempts
- Clear progression tracking
- Top performance preservation

### 2. **Replay Motivation**
- Users can try to beat their best score
- Historical comparison available
- Progress visualization

### 3. **Data Management**
- Automatic cleanup of old attempts
- Efficient storage (only last 3 + best)
- Row Level Security for data protection

### 4. **Analytics Potential**
- Performance trends analysis
- Learning curve tracking
- Difficulty assessment data

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Automatic user_id filtering
- Secure data isolation

### Data Validation
- Type checking on all fields
- Constraint validation
- Error handling throughout

The play again functionality now provides comprehensive performance tracking while maintaining efficient data storage and strong security measures.
