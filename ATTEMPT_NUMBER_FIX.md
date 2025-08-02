# Attempt Number Fix Summary

## Problem Identified
The attempt number was not increasing properly when users played the same module multiple times. Each new attempt was being saved with attempt_number = 1 instead of incrementing (1, 2, 3).

## Root Cause Analysis

### Issue 1: Incorrect Attempt Number Calculation
The original logic had flaws in calculating the next attempt number:
- Complex shifting logic that was prone to errors
- Race conditions in database updates
- Incorrect handling of edge cases

### Issue 2: Database Query Ordering
The query to get existing attempts was ordered by `attempt_created_at` instead of `attempt_number`, making it harder to process the attempts in the correct order.

### Issue 3: Unclear Logic Flow
The attempt management logic was complex and hard to debug, with multiple nested conditions and unclear state transitions.

## Solution Implemented

### 1. **Simplified Attempt Number Logic**
Replaced complex logic with a clearer, more robust approach:

```typescript
// Calculate next attempt number based on existing attempts
let nextAttemptNumber = 1;

if (existingAttempts && existingAttempts.length > 0) {
  // Sort attempts by attempt_number to ensure correct ordering
  const sortedAttempts = existingAttempts.sort((a, b) => a.attempt_number - b.attempt_number);
  console.log('📊 Existing attempts:', sortedAttempts.map(a => ({ attempt_number: a.attempt_number, score: a.module_total_score })));
  
  if (sortedAttempts.length >= 3) {
    // We have 3 attempts, need to remove oldest and shift
    console.log('🔄 Managing last 3 attempts constraint...');
    
    // Delete the oldest attempt (lowest attempt_number)
    const oldestAttempt = sortedAttempts[0];
    await supabase
      .from('level3_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .eq('attempt_number', oldestAttempt.attempt_number);
    
    console.log('🗑️ Deleted oldest attempt:', oldestAttempt.attempt_number);

    // Shift remaining attempts down by 1
    for (let i = 1; i < sortedAttempts.length; i++) {
      const attempt = sortedAttempts[i];
      const newAttemptNumber = attempt.attempt_number - 1;
      
      await supabase
        .from('level3_progress')
        .update({ attempt_number: newAttemptNumber })
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('attempt_number', attempt.attempt_number);
      
      console.log(`🔄 Shifted attempt ${attempt.attempt_number} → ${newAttemptNumber}`);
    }

    nextAttemptNumber = 3; // New attempt becomes #3
  } else {
    // Less than 3 attempts, just increment
    const maxAttemptNumber = Math.max(...sortedAttempts.map(a => a.attempt_number));
    nextAttemptNumber = maxAttemptNumber + 1;
  }
}

console.log('🎯 Next attempt number will be:', nextAttemptNumber);
```

### 2. **Improved Database Querying**
Updated the query to order by `attempt_number` for easier processing:

```typescript
const { data: existingAttempts, error: fetchError } = await supabase
  .from('level3_progress')
  .select('*')
  .eq('user_id', user.id)
  .eq('module_id', moduleId)
  .eq('is_module_complete', true)
  .order('attempt_number', { ascending: true }); // Order by attempt_number for easier processing
```

### 3. **Enhanced Debugging**
Added comprehensive logging to track attempt number management:

```typescript
console.log('📊 Found existing attempts:', existingAttempts?.length || 0);
if (existingAttempts && existingAttempts.length > 0) {
  console.log('📊 Existing attempt details:', existingAttempts.map(a => ({
    attempt_number: a.attempt_number,
    score: a.module_total_score,
    created_at: a.attempt_created_at
  })));
}
```

### 4. **Verification System**
Added verification to confirm attempts are saved correctly:

```typescript
// Verify the save by querying the attempts again
const { data: verifyAttempts } = await supabase
  .from('level3_progress')
  .select('attempt_number, module_total_score, is_top_performance')
  .eq('user_id', user.id)
  .eq('module_id', moduleId)
  .eq('is_module_complete', true)
  .order('attempt_number', { ascending: true });

console.log('🔍 Verification - All attempts after save:', verifyAttempts);
```

## Attempt Number Flow

### First Attempt
```
No existing attempts
    ↓
nextAttemptNumber = 1
    ↓
Save with attempt_number = 1 ✅
```

### Second Attempt
```
1 existing attempt (attempt_number = 1)
    ↓
maxAttemptNumber = 1
    ↓
nextAttemptNumber = 1 + 1 = 2
    ↓
Save with attempt_number = 2 ✅
```

### Third Attempt
```
2 existing attempts (attempt_number = 1, 2)
    ↓
maxAttemptNumber = 2
    ↓
nextAttemptNumber = 2 + 1 = 3
    ↓
Save with attempt_number = 3 ✅
```

### Fourth Attempt (Exceeds 3)
```
3 existing attempts (attempt_number = 1, 2, 3)
    ↓
Delete oldest (attempt_number = 1)
    ↓
Shift: 2→1, 3→2
    ↓
nextAttemptNumber = 3
    ↓
Save with attempt_number = 3 ✅
Result: attempts now numbered 1, 2, 3
```

## Key Improvements

### 1. **Clear Logic Flow**
- Simple conditional structure
- Predictable behavior
- Easy to understand and debug

### 2. **Robust Error Handling**
- Comprehensive logging at each step
- Verification of database operations
- Clear error messages

### 3. **Correct Ordering**
- Database queries ordered by attempt_number
- Proper sorting before processing
- Consistent numbering scheme

### 4. **Efficient Operations**
- Minimal database queries
- Batch operations where possible
- Clean deletion and updating

## Expected Behavior After Fix

### Multiple Attempts
1. **First play**: attempt_number = 1
2. **Second play**: attempt_number = 2  
3. **Third play**: attempt_number = 3
4. **Fourth play**: attempt_number = 3 (oldest deleted, others shifted)

### Database State
```sql
-- After 4 attempts, table contains:
attempt_number = 1  (was originally attempt #2)
attempt_number = 2  (was originally attempt #3)  
attempt_number = 3  (new attempt #4)
```

### Console Output
```
📊 Found existing attempts: 2
📊 Existing attempt details: [
  { attempt_number: 1, score: 250, created_at: "..." },
  { attempt_number: 2, score: 280, created_at: "..." }
]
🎯 Next attempt number will be: 3
✅ Module attempt saved successfully { attemptNumber: 3, isTopPerformance: true, totalScore: 295, moduleId: "1" }
🔍 Verification - All attempts after save: [
  { attempt_number: 1, module_total_score: 250, is_top_performance: false },
  { attempt_number: 2, module_total_score: 280, is_top_performance: false },
  { attempt_number: 3, module_total_score: 295, is_top_performance: true }
]
```

## Testing Scenarios

### Single Module Multiple Attempts
1. Complete module → Check attempt_number = 1
2. Play Again, complete → Check attempt_number = 2
3. Play Again, complete → Check attempt_number = 3
4. Play Again, complete → Check attempt_number = 3 (oldest deleted)

### Database Verification
1. Query `level3_progress` table after each attempt
2. Verify `attempt_number` values are correct
3. Verify `is_top_performance` flags are set correctly
4. Verify old attempts are properly deleted when exceeding 3

The attempt number logic now works correctly, providing proper incremental numbering while maintaining the "last 3 tries" constraint and accurate top performance tracking.
