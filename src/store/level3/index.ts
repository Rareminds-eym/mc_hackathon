// src/store/level3/index.ts

/**
 * Level 3 Redux Module
 * 
 * This module provides a complete Redux implementation for the Level 3 Jigsaw puzzle game.
 * It includes state management, actions, selectors, hooks, and utilities.
 */

// ===== CORE REDUX EXPORTS =====

// Slice and actions
export { default as level3Reducer } from '../slices/level3Slice';
export * from '../slices/level3Slice';

// Selectors
export * from '../selectors/level3Selectors';

// Types
export * from '../types/level3Types';

// ===== HOOKS =====

// Main hooks
export {
  useLevel3,
  useLevel3Game,
  useLevel3UI,
  useLevel3Progress,
  useLevel3Stats,
  useLevel3Scenarios,
  useLevel3Feedback,
  useLevel3DragDrop,
  useLevel3Dialogs,
  useLevel3Statistics,
  useLevel3Completion,
} from '../../store/hooks/index';

// ===== THUNKS =====

export {
  handlePieceDrop,
  handleVictoryClose,
  startGameTimer,
  stopGameTimer,
  setFeedbackWithAutoClear,
  resetGame,
  saveGameCompletion,
  loadGameProgress,
  loadScenariosForModule,
  initializeGame,
  completeGame,
} from '../thunks/level3Thunks';

// ===== MIDDLEWARE =====

export { level3Middleware } from '../middleware/level3Middleware';

// ===== UTILITIES =====

export {
  getLevel3StateSummary,
  getScenarioDetails,
  getPerformanceMetrics,
  logLevel3Action,
  logStateChange,
  validateLevel3State,
  formatTime,
  exportLevel3State,
  createLevel3DebugConsole,
} from '../utils/debugUtils';

// ===== CONSTANTS =====

export { GAME_CONSTANTS } from '../types/level3Types';

// ===== TYPE GUARDS =====

/**
 * Type guard to check if an action is a Level 3 action
 */
export const isLevel3Action = (action: any): boolean => {
  return typeof action.type === 'string' && action.type.startsWith('level3/');
};

/**
 * Type guard to check if state has Level 3 data
 */
export const hasLevel3State = (state: any): boolean => {
  return state && typeof state === 'object' && 'level3' in state;
};

// ===== HELPER FUNCTIONS =====

/**
 * Create a Level 3 store enhancer
 */
export const createLevel3StoreEnhancer = () => {
  return (createStore: any) => (reducer: any, preloadedState: any, enhancer: any) => {
    const store = createStore(reducer, preloadedState, enhancer);
    
    // Initialize Level 3 debug console in development
    if (process.env.NODE_ENV !== 'production') {
      const { createLevel3DebugConsole } = require('../utils/debugUtils');
      createLevel3DebugConsole(store);
    }
    
    return store;
  };
};

/**
 * Get Level 3 state from root state
 */
export const getLevel3State = (rootState: any) => {
  if (!hasLevel3State(rootState)) {
    throw new Error('Level 3 state not found in root state');
  }
  return rootState.level3;
};

/**
 * Create Level 3 action with metadata
 */
export const createLevel3Action = (type: string, payload?: any, meta?: any) => ({
  type: `level3/${type}`,
  payload,
  meta: {
    timestamp: Date.now(),
    source: 'level3',
    ...meta,
  },
});

// ===== VERSION INFO =====

export const LEVEL3_REDUX_VERSION = '1.0.0';

export const LEVEL3_REDUX_INFO = {
  version: LEVEL3_REDUX_VERSION,
  features: [
    'Centralized state management',
    'Type-safe Redux implementation',
    'Memoized selectors',
    'Custom hooks',
    'Async thunks',
    'Custom middleware',
    'Debug utilities',
    'Performance optimizations',
  ],
  compatibility: {
    reduxToolkit: '^1.9.0',
    react: '^18.0.0',
    typescript: '^4.9.0',
  },
} as const;
