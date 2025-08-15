# Case Change Indication Implementation

## Summary
Added visual indication to the PROBLEM SCENARIO div when each case changes in the GMP Simulation game.

## Changes Made

### 1. Level1Card.tsx
- Added `AlertTriangle` import from lucide-react
- Added `useEffect` import
- Added case change tracking state:
  - `showCaseChangeIndicator`: boolean to control visual indication
  - `previousQuestionId`: tracks the previous question ID to detect changes
- Added useEffect to detect case changes and trigger 3-second visual indication
- Enhanced PROBLEM SCENARIO div with:
  - Dynamic background color (orange/red gradient when case changes)
  - "NEW CASE" badge with AlertTriangle icon
  - Additional warning message
  - Pulse animation and shadow effects

### 2. Level2Card.tsx
- Added `AlertTriangle` import from lucide-react
- Added `useEffect` import
- Added same case change tracking state and logic
- Enhanced header section with:
  - Dynamic background color change
  - "NEW CASE" indicator
  - Warning message about reviewing intel report
- Enhanced Intel Report section with:
  - Dynamic color scheme (orange when case changes)
  - "UPDATED" indicator
  - Animated ping dot

### 3. GmpSimulation.tsx
- Added case change tracking state to main component
- Added useEffect to detect case changes in main game state
- Enhanced mobile horizontal PROBLEM SCENARIO modal with:
  - Dynamic background colors
  - "NEW CASE" badge replacing "ACTIVE" badge
  - Additional warning message
  - Animated indicators

## Visual Indicators

### When Case Changes:
1. **Background Color**: Changes from cyan/blue to orange/red gradient
2. **Animation**: Pulse effect and shadow glow
3. **Badge**: "NEW CASE" with AlertTriangle icon (bouncing animation)
4. **Warning Message**: "Case scenario has changed - review carefully!"
5. **Ping Dot**: Yellow animated ping dot
6. **Duration**: All indicators disappear after 3 seconds

### Normal State:
- Standard cyan/blue gradient background
- No special indicators
- Normal "ACTIVE" badge in mobile modal

## How It Works

1. **Detection**: Each component tracks the previous question ID
2. **Trigger**: When question.id changes, visual indication is activated
3. **Timer**: Indication automatically disappears after 3 seconds
4. **Responsive**: Works in both desktop and mobile horizontal modes
5. **Level Support**: Works for both Level 1 (violation/root cause) and Level 2 (solution)

## Testing

To test the functionality:
1. Start the GMP Simulation game
2. Complete a case and click "Proceed" to move to the next case
3. Observe the visual indication on the PROBLEM SCENARIO section
4. Wait 3 seconds to see the indication disappear
5. Test in both desktop and mobile horizontal modes
6. Test in both Level 1 and Level 2

The indication should appear every time you move to a new case, helping users notice that the scenario has changed and they need to review the new case details.