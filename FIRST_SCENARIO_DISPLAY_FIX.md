# First Scenario Display Fix for Play Again

## Problem Identified
When clicking "Play Again", the game was resetting all variables but not properly showing the first scenario dialog. The user would see a blank game board instead of the first scenario.

## Root Cause Analysis

### Issue 1: Timing Problem
The scenario dialog depends on both `showScenario` and `scenario` being truthy:
```typescript
{showScenario && scenario && (
  <ScenarioDialog scenario={scenario} onClose={() => setShowScenario(false)} />
)}
```

Where `scenario = scenarios?.[scenarioIndex]`

### Issue 2: Scenarios Loading State
When resetting, there was a race condition where:
1. `setShowScenario(true)` was called immediately
2. But `scenarios` might not be loaded yet
3. So `scenario` would be `undefined`
4. Result: No dialog shown

### Issue 3: Initialization Conflicts
The reset was setting `setIsInitializing(true)` which could interfere with showing the first scenario.

## Solution Implemented

### 1. **Delayed Scenario Display**
```typescript
// Reset state first, hide scenario dialog initially
setShowScenario(false);
setIsInitializing(false); // Don't trigger initialization
setHasCheckedProgress(true); // Skip progress check

// Then show scenario after delay
setTimeout(() => {
  // Ensure scenarios are loaded and show first scenario dialog
  if (scenarios && scenarios.length > 0) {
    console.log("🎯 Showing first scenario for replay...", scenarios[0]?.title);
    setShowScenario(true);
  } else {
    console.log("⚠️ Scenarios not loaded yet, will show when available");
  }
}, 200); // Delay to ensure state is fully reset
```

### 2. **Auto-Show When Scenarios Load**
Added a useEffect to automatically show the first scenario when scenarios become available:

```typescript
// Show first scenario when scenarios are loaded after reset
useEffect(() => {
  if (scenarios && scenarios.length > 0 && scenarioIndex === 0 && !showScenario && !showFinalStats && !isInitializing) {
    console.log("🎯 Auto-showing first scenario after scenarios loaded");
    setShowScenario(true);
  }
}, [scenarios, scenarioIndex, showScenario, showFinalStats, isInitializing]);
```

### 3. **Proper Reset Sequence**
```typescript
// 1. Hide final stats popup
setShowFinalStats(false);

// 2. Reset core game state
setScenarioIndex(0);
setScenarioResults([]);
setScore(0);
setHealth(100);
setCombo(0);
setTimer(0);
setPlacedPieces({ violations: [], actions: [] });
setCorrectPlacementIndex(0);

// 3. Reset UI state (initially hide scenario)
setShowScenario(false);
setShowBriefing(false);
setIsComplete(false);
setFeedback("");
setActiveDragPiece(null);

// 4. Skip initialization process
setShowContinueDialog(false);
setIsInitializing(false);
setHasCheckedProgress(true);

// 5. After delay, show first scenario
setTimeout(() => {
  // Show scenario if scenarios are loaded
  if (scenarios && scenarios.length > 0) {
    setShowScenario(true);
  }
}, 200);
```

## Flow Diagram

### Before Fix (Broken)
```
Play Again Clicked
    ↓
Reset Variables (including setShowScenario(true))
    ↓
Render: showScenario=true, but scenario=undefined
    ↓
No dialog shown (blank screen)
```

### After Fix (Working)
```
Play Again Clicked
    ↓
Reset Variables (setShowScenario(false))
    ↓
setTimeout(200ms)
    ↓
Check if scenarios loaded
    ↓
If loaded: setShowScenario(true)
    ↓
Render: showScenario=true, scenario=scenarios[0]
    ↓
First scenario dialog shown ✅

Alternative path if scenarios not loaded:
    ↓
useEffect detects scenarios loaded + scenarioIndex=0 + !showScenario
    ↓
Auto setShowScenario(true)
    ↓
First scenario dialog shown ✅
```

## Key Improvements

### 1. **Robust Scenario Loading**
- Checks if scenarios are available before showing dialog
- Fallback mechanism with useEffect for delayed loading
- Proper logging for debugging

### 2. **Timing Control**
- 200ms delay ensures all state is reset before showing scenario
- Prevents race conditions between state updates
- Allows React to complete re-rendering

### 3. **Initialization Bypass**
- Skips progress restoration on replay
- Avoids conflicts with initialization logic
- Direct path to first scenario

### 4. **Comprehensive Logging**
```typescript
console.log("🔄 Resetting all game state for replay...");
console.log("🎯 Showing first scenario for replay...", scenarios[0]?.title);
console.log("⚠️ Scenarios not loaded yet, will show when available");
console.log("🎯 Auto-showing first scenario after scenarios loaded");
console.log("✅ Complete game reset for replay finished");
```

## Expected Behavior After Fix

### Immediate Response
1. User clicks "Play Again"
2. Final stats popup closes immediately
3. Brief moment of game board (200ms)
4. First scenario dialog appears

### Scenario Dialog Content
- Shows first scenario (index 0)
- Displays scenario title and description
- "Start Scenario" button available
- Proper styling and animations

### Game State
- Timer at 0:00
- Health at 100/100
- Score at 0
- Combo at 0x
- No pieces placed
- Clean game board

## Error Handling

### Scenarios Not Loaded
If scenarios aren't loaded immediately:
- Timeout logs warning message
- useEffect watches for scenarios to load
- Automatically shows dialog when available
- No user action required

### Multiple Clicks
- Reset is idempotent
- Multiple "Play Again" clicks won't break state
- Each click properly resets and shows first scenario

## Testing Checklist

After implementing the fix, verify:
- [ ] Click "Play Again" shows first scenario dialog
- [ ] Dialog displays correct scenario content
- [ ] "Start Scenario" button works
- [ ] Game state is completely reset
- [ ] Timer starts from 0:00 when scenario starts
- [ ] No blank screens or stuck states
- [ ] Works consistently on multiple replays
- [ ] Console shows proper logging messages

The fix ensures that "Play Again" reliably shows the first scenario dialog, providing a smooth replay experience.
