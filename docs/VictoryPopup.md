# Unified Popup Component - Pixel/Retro Gaming Theme

A sophisticated, unified popup component built with React, Framer Motion, and Tailwind CSS, featuring a distinctive pixel/retro gaming aesthetic. This component can function as both a generic popup for custom content and a specialized gaming-themed victory popup for celebrating player achievements.

## Features

### 🎮 Pixel/Retro Gaming Aesthetic
- **Pixel Borders**: Sharp, pixelated borders using `pixel-border` and `pixel-border-thick` classes
- **Scan Lines Effect**: Retro CRT monitor scan lines overlay
- **Grid Patterns**: Subtle grid background patterns for authentic retro feel
- **Pixel Typography**: Courier New monospace font with `pixel-text` styling
- **Sharp Design**: No rounded corners, maintaining authentic pixel art aesthetic
- **Retro Color Scheme**: Gray-900, indigo-900, blue-900 gradients matching the JigsawBoard theme

### 🎯 Interactive Elements
- **Pixel Buttons**: Sharp, pixelated buttons with `pixel-border-thick` styling
- **Active States**: Button press effects with `active:translate-y-[2px]` for tactile feedback
- **Hover Effects**: Subtle color transitions maintaining pixel aesthetic
- **Responsive Design**: Optimized for mobile, tablet, and desktop with consistent pixel styling

### 📊 Data Display (Victory Mode)
- **Pixel Stats Boxes**: Individual stat containers with `pixel-border` styling
- **Retro Color Coding**: Blue for score, yellow for combo, pink for health
- **Pixel Text**: Monospace font with proper spacing and padding
- **Achievement Badge**: Pixelated achievement indicator
- **Progress Indicator**: Retro-styled loading animation

### 🎛️ Action Buttons (Pixel Style)
- **Continue Button**: Green-to-blue gradient with pixel borders
- **Levels Button**: Yellow-to-orange gradient matching JigsawBoard theme
- **Reset Button**: Red background with pixel styling
- **Close Button**: Gray background with consistent pixel design

## Props Interface

```typescript
interface PopupProps {
  open: boolean;                    // Controls popup visibility
  onClose: () => void;             // Close handler

  // Generic popup props
  children?: React.ReactNode;      // Custom content for generic variant
  showNavigation?: boolean;        // Show navigation buttons
  onBack?: () => void;            // Back button handler
  onContinue?: () => void;        // Continue button handler
  continueText?: string;          // Continue button text
  backText?: string;              // Back button text

  // Victory popup props
  variant?: 'generic' | 'victory'; // Popup variant (default: 'generic')
  score?: number;                  // Player's score
  combo?: number;                  // Combo multiplier
  health?: number;                 // Health percentage (0-100)
  highScore?: number;              // High score (for future use)
  showNext?: boolean;              // Show next button (for future use)
  isLevelCompleted?: boolean;      // Show level completion badge
  showGoToModules?: boolean;       // Show levels navigation button
  showReset?: boolean;             // Show reset button
  onReset?: () => void;           // Reset handler
  moduleId?: string;              // Module ID for progress tracking
}
```

## Usage Examples

### Generic Popup Usage
```tsx
import { Popup } from './components/ui/Popup';

function GameComponent() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <Popup
      variant="generic"
      open={showPopup}
      onClose={() => setShowPopup(false)}
      showNavigation={true}
      onBack={() => console.log('Back')}
      onContinue={() => console.log('Continue')}
    >
      <div className="text-white p-4">
        <h2 className="text-xl font-bold mb-2">Custom Content</h2>
        <p>This is a generic popup with custom content.</p>
      </div>
    </Popup>
  );
}
```

### Victory Popup Usage
```tsx
<Popup
  variant="victory"
  open={showVictory}
  onClose={handleClose}
  score={15420}
  combo={12}
  health={85}
  highScore={18500}
  isLevelCompleted={true}
  showGoToModules={true}
  showReset={true}
  onReset={handleReset}
  moduleId="3"
/>
```

### Backward Compatibility (VictoryPopup alias)
```tsx
import { VictoryPopup } from './components/ui/Popup';

// This automatically uses variant="victory"
<VictoryPopup
  open={showVictory}
  onClose={handleClose}
  score={1500}
  combo={8}
  health={75}
  isLevelCompleted={true}
/>
```

## Responsive Behavior

### Desktop (>768px)
- Full-size popup with maximum visual effects
- Large typography and generous spacing
- All animations and effects enabled

### Mobile Portrait (<768px)
- Compact layout with smaller text
- Optimized button sizes for touch
- Maintained visual hierarchy

### Mobile Landscape (<768px + horizontal)
- Ultra-compact layout for limited vertical space
- Minimal padding and smaller elements
- Single-column button layout

## Animation Details

### Entrance Animation
- **Scale**: 0.8 → 1.0 with spring physics
- **Opacity**: 0 → 1 with smooth transition
- **Y-offset**: 50px → 0 with spring easing
- **Duration**: 0.5s with staggered child animations

### Interactive Animations
- **Button Hover**: Scale 1.02 with enhanced shadows
- **Score Pulsing**: Continuous scale animation (1.0 → 1.05)
- **Particle Float**: Continuous Y-axis movement with opacity changes
- **Shimmer Effect**: Periodic sweep across buttons

## Styling System

### Color Palette
- **Background**: Slate-900 to Purple-900 gradient
- **Borders**: Cyan-400 with transparency
- **Score**: Yellow-400 with glow
- **Combo**: Orange-400 with glow
- **Health**: Green-400 with glow
- **Achievement**: Purple-600 gradient

### Typography
- **Primary Font**: Orbitron (futuristic gaming font)
- **Weight**: Black for scores, Bold for buttons, Semibold for labels
- **Effects**: Text shadows and glows for enhanced visibility

## Dependencies

- **React**: ^18.0.0
- **Framer Motion**: ^10.0.0 (for animations)
- **@iconify/react**: ^4.0.0 (for icons)
- **Tailwind CSS**: ^3.0.0 (for styling)

## Integration Notes

### Progress Tracking
The component automatically handles level progress updates when `isLevelCompleted` is true and `moduleId` is provided. It uses:
- `LevelProgressService.completeLevel()` for backend updates
- `useLevelProgress()` hook for UI refresh
- Loading states during progress updates

### Navigation
- **Continue**: Calls `onClose()` to dismiss popup
- **Levels**: Navigates to module levels page using React Router
- **Reset**: Calls optional `onReset()` callback
- **Close**: Calls `onClose()` to dismiss popup

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Customization

The component is designed to be easily customizable through:
- Tailwind CSS classes
- CSS custom properties
- Framer Motion variants
- Icon replacements

For advanced customization, modify the gradient backgrounds, animation timings, or add new interactive elements following the established patterns.
