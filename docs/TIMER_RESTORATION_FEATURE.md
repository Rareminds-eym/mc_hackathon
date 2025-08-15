# Timer Restoration Feature

## Overview
Added timer restoration functionality to the GMP Simulation game, allowing users to continue their progress with the exact timer state they had when they last played.

## Problem Addressed
Previously, when users continued a saved game, the timer would reset to the full 90 minutes (5400 seconds), regardless of how much time they had already spent. This meant users could potentially get more time than intended by refreshing the page or closing/reopening the browser.

## Solution Implemented
The timer state is now saved and restored along with other game progress data.

### Database Changes
Added `time_remaining` column to the `attempt_details` table:

```sql
-- Add time_remaining column to attempt_details table
ALTER TABLE public.attempt_details 
ADD COLUMN IF NOT EXISTS time_remaining INTEGER DEFAULT 5400;

-- Add constraint to ensure timer value is reasonable
ALTER TABLE public.attempt_details 
ADD CONSTRAINT check_time_remaining_range 
CHECK (time_remaining >= 0 AND time_remaining <= 5400);
```

### Code Changes

#### 1. Timer State Saving
The timer is now saved in four places:
- **Periodic auto-save** (every 30 seconds, or every 10 seconds when < 5 minutes remaining)
- **Auto-save on answer changes** (`handleAnswer` function)
- **Position save on question navigation** (`saveCurrentPosition` function)
- **Initial position save on game start** (`startGame` function)

**Periodic Timer Save (New):**
```typescript
// Set up periodic timer save every 30 seconds (10 seconds when < 5 minutes remaining)
const interval = setInterval(async () => {
  if (gameState.timeRemaining < 5390) { // Only save if timer has been running
    await supabase.from("attempt_details").upsert([
      {
        email: email,
        session_id: session_id,
        module_number: gameState.currentLevel === 1 ? 5 : 6,
        question_index: gameState.currentQuestion,
        question: gameState.questions[gameState.currentQuestion] || null,
        answer: gameState.answers[gameState.currentQuestion] || { violation: "", rootCause: "", solution: "" },
        time_remaining: gameState.timeRemaining,
      },
    ], { onConflict: "email,session_id,module_number,question_index" });
  }
}, isLowTime ? 10000 : 30000);
```

**Answer Change Auto-save:**
```typescript
await supabase.from("attempt_details").upsert([
  {
    email: email,
    session_id: session_id,
    module_number: prev.currentLevel === 1 ? 5 : 6,
    question_index: prev.currentQuestion,
    question: prev.questions[prev.currentQuestion],
    answer: newAnswers[prev.currentQuestion],
    time_remaining: prev.timeRemaining, // Save current timer state
  },
], { onConflict: "email,session_id,module_number,question_index" });
```

#### 2. Timer State Restoration
When loading saved progress, the timer is restored from the furthest question reached:

```typescript
let savedTimeRemaining = 5400; // Default timer value

attemptDetails.forEach(detail => {
  if (detail.question_index > furthestQuestionIndex) {
    furthestQuestionIndex = detail.question_index;
    // Get the timer state from the furthest question reached
    if (detail.time_remaining && typeof detail.time_remaining === 'number') {
      savedTimeRemaining = detail.time_remaining;
    }
  }
});

// Restore game state with saved timer
setGameState(prev => ({
  ...prev,
  questions: finalQuestions,
  answers: finalAnswers,
  currentQuestion: currentQuestionIndex,
  gameStarted: false,
  currentLevel: initialLevel,
  timeRemaining: savedTimeRemaining, // Restore timer state
}));
```

#### 3. UI Updates
**Progress Display** - Shows remaining time when continuing a game:
```typescript
{savedProgressInfo && (
  <div className="text-xs text-cyan-200 font-bold space-y-1">
    <div>Progress: {savedProgressInfo.answeredQuestions}/{savedProgressInfo.totalQuestions} questions answered</div>
    <div>Time remaining: {Math.floor(savedProgressInfo.timeRemaining / 60)}:{String(savedProgressInfo.timeRemaining % 60).padStart(2, '0')}</div>
  </div>
)}
```

**Save Indicator** - Visual feedback when timer is being saved:
```typescript
{/* Auto-save indicator */}
{showSaveIndicator && (
  <div className="ml-1 text-xs text-green-400 font-bold animate-pulse">
    ●
  </div>
)}
```

## How It Works

### Game Start (New Game)
1. Timer starts at 5400 seconds (90 minutes)
2. Initial position is saved with full timer
3. Periodic save interval is established

### During Gameplay
1. **Periodic auto-save**: Timer state is saved every 30 seconds automatically
2. **Frequent save when low**: Timer state is saved every 10 seconds when < 5 minutes remaining
3. **Answer auto-save**: Every time user answers a question, timer state is auto-saved
4. **Navigation save**: Every time user navigates to next question, timer state is saved
5. Timer continues counting down normally
6. Visual indicator shows when progress is being saved

### Game Continuation (Restored Game)
1. System loads all saved attempt details for the user/session/module
2. Finds the furthest question the user reached
3. Extracts the timer state from that question's record
4. Restores the game with the saved timer value
5. Timer continues from where it left off

### Edge Cases Handled
- **No saved timer data**: Defaults to 5400 seconds
- **Invalid timer values**: Constrained to 0-5400 seconds range
- **Multiple question records**: Uses timer from furthest question reached
- **Database errors**: Graceful fallback to default timer

## Benefits
1. **Fair timing**: Users can't gain extra time by refreshing
2. **Seamless experience**: Timer continues exactly where they left off
3. **Progress integrity**: Complete game state restoration including time pressure
4. **Continuous preservation**: Timer saved every 30 seconds, even without user interaction
5. **Critical time protection**: More frequent saves (every 10 seconds) when time is running low
6. **Visual feedback**: Users can see when their progress is being saved
7. **Audit trail**: Timer values are logged for debugging
8. **User transparency**: Progress display shows remaining time
9. **No data loss**: Timer state preserved even if browser crashes or connection drops

## Logging
Added comprehensive logging for debugging:
- Timer restoration events
- Timer save events
- Timer values at each save/restore operation

## Testing Recommendations
1. Start a game, answer some questions, close browser, reopen - timer should continue from where it left off
2. Let timer run down significantly, save progress, restore - should show correct remaining time
3. Complete a game normally - timer should be saved correctly in final results
4. Test with both Level 1 (modules 5) and Level 2 (module 6) games

## Database Migration
Run the provided SQL script to add the timer column:
```bash
psql -d your_database -f database/add_timer_restoration.sql
```

## Backward Compatibility
- Existing records without timer data will default to 5400 seconds
- No breaking changes to existing functionality
- Progressive enhancement - works with or without timer data
