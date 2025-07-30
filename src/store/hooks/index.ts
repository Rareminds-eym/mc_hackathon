// src/store/hooks/index.ts

// Re-export base Redux hooks
export { useAppDispatch, useAppSelector } from '../hooks';

// Level 3 Game Hooks
export {
  useLevel3Game,
  useLevel3Stats,
  useLevel3Scenarios,
} from './useLevel3Game';

// Level 3 UI Hooks
export {
  useLevel3UI,
  useLevel3Feedback,
  useLevel3DragDrop,
  useLevel3Dialogs,
} from './useLevel3UI';

// Level 3 Progress Hooks
export {
  useLevel3Progress,
  useLevel3Statistics,
  useLevel3Completion,
} from './useLevel3Progress';

// Level 3 Persistence Hook
export { useLevel3Persistence } from './useLevel3Persistence';

// Level 3 Game Action Hooks (with auto-save)
export {
  useLevel3GameActions,
  useLevel3ManualSave,
  useLevel3SaveStatus
} from './useLevel3GameActions';

// Combined Level 3 Hook for convenience
// export { useLevel3 } from './useLevel3'; // Temporarily disabled due to import issues
