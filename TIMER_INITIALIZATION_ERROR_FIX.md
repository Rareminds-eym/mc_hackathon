# Timer Initialization Error Fix Summary

## Problem Identified
**Error**: `Uncaught ReferenceError: Cannot access 'scenarios' before initialization`

The timer useEffect was trying to access the `scenarios` variable before it was declared, causing a JavaScript initialization error.

## Root Cause Analysis

### Issue: Variable Declaration Order
The timer useEffect was placed before the Redux state declarations:

```typescript
// ❌ WRONG ORDER - useEffect before scenarios declaration
// Line 395
useEffect(() => {
  const shouldRunTimer = !showScenario && !showFinalStats && !isComplete && scenarios && scenarios.length > 0;
  // ... timer logic
}, [showScenario, showFinalStats, isComplete, scenarios]); // ❌ scenarios not declared yet

// Line 430 - scenarios declared AFTER the useEffect
const scenarios = useSelector((state: RootState) => state.level3.scenarios);
```

### JavaScript Hoisting Behavior
- **useEffect dependencies**: Evaluated immediately when component renders
- **const declarations**: Not hoisted, cannot be accessed before declaration
- **Result**: `scenarios` referenced before it exists → ReferenceError

## Solution Implemented

### 1. **Moved Timer useEffect After State Declarations**
Relocated the timer useEffect to **after** the Redux state declarations:

```typescript
// ✅ CORRECT ORDER - State declarations first
// Line 405
const scenarios = useSelector((state: RootState) => state.level3.scenarios);
const currentModule = useSelector((state: RootState) => state.game.currentModule);

// Line 411 - Timer useEffect after scenarios declaration
useEffect(() => {
  const shouldRunTimer = !showScenario && !showFinalStats && !isComplete && scenarios && scenarios.length > 0;
  // ... timer logic
}, [showScenario, showFinalStats, isComplete, scenarios]); // ✅ scenarios is now available
```

### 2. **Maintained Timer Functionality**
The timer logic remains exactly the same, just moved to the correct location:
- Starts only during active gameplay
- Stops when scenario dialogs are open
- Proper cleanup on component unmount

## Component Structure Order

### Before Fix (Broken)
```typescript
// Line 395: Timer useEffect tries to access scenarios
useEffect(() => {
  // ... uses scenarios variable ❌ ReferenceError
}, [scenarios]);

// Line 430: scenarios declared later
const scenarios = useSelector(...);
```

### After Fix (Working)
```typescript
// Line 405: scenarios declared first
const scenarios = useSelector(...);

// Line 411: Timer useEffect can safely access scenarios
useEffect(() => {
  // ... uses scenarios variable ✅ Works correctly
}, [scenarios]);
```

## Correct Component Initialization Order

### 1. **State Declarations**
```typescript
const [showScenario, setShowScenario] = useState(true);
const [timer, setTimer] = useState(0);
// ... other useState declarations
```

### 2. **Refs**
```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);
// ... other useRef declarations
```

### 3. **Redux Selectors**
```typescript
const scenarios = useSelector((state: RootState) => state.level3.scenarios);
const currentModule = useSelector((state: RootState) => state.game.currentModule);
```

### 4. **Effects That Depend on Redux State**
```typescript
// Timer effect (depends on scenarios)
useEffect(() => {
  const shouldRunTimer = !showScenario && !showFinalStats && !isComplete && scenarios && scenarios.length > 0;
  // ... timer logic
}, [showScenario, showFinalStats, isComplete, scenarios]);

// Other effects that depend on scenarios or currentModule
```

### 5. **Other Effects and Functions**
```typescript
// Effects that don't depend on external state
// Event handlers
// Other component logic
```

## Benefits of the Fix

### 1. **No Initialization Errors**
- All variables are declared before use
- Proper JavaScript scoping
- Clean component initialization

### 2. **Maintained Functionality**
- Timer behavior unchanged
- All existing features preserved
- No regression in game logic

### 3. **Better Code Organization**
- Logical grouping of related code
- Clear dependency relationships
- Easier to understand and maintain

### 4. **Debugging Support**
- Clear error messages if issues arise
- Proper variable scoping for debugging
- Consistent code structure

## Error Prevention

### Best Practices Applied
1. **Declaration Before Use**: All variables declared before being referenced
2. **Proper Dependency Arrays**: useEffect dependencies are available when declared
3. **Logical Code Organization**: Related code grouped together
4. **Clear Scoping**: Variables accessible in their intended scope

### Component Structure Guidelines
1. **State first**: useState and useRef declarations
2. **External state**: useSelector and other external data
3. **Dependent effects**: useEffect that depend on external state
4. **Independent effects**: useEffect that don't depend on external state
5. **Functions and handlers**: Component methods and event handlers

## Testing Verification

### Expected Behavior
- ✅ Component loads without initialization errors
- ✅ Timer starts when scenario dialog closes
- ✅ Timer stops when scenario dialog opens
- ✅ All existing functionality preserved
- ✅ No console errors related to variable access

### Error Cases Handled
- ✅ scenarios undefined during initial load
- ✅ scenarios empty array
- ✅ Component unmounting during timer operation
- ✅ State changes during timer operation

## Result
The initialization error is fixed by moving the timer useEffect after the Redux state declarations. The timer functionality remains exactly the same but now works without causing JavaScript errors during component initialization.
