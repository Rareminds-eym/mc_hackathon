import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import audioReducer from './slices/audioSlice';
import uiReducer from './slices/uiSlice';
import progressReducer from './slices/progressSlice';
import bingoReducer from './slices/bingoSlice';
import level3Reducer from './slices/level3Slice';
// redux-persist imports
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
// Level 3 middleware and debug utilities
import { level3Middleware } from './middleware/level3Middleware';
import { createLevel3DebugConsole } from './utils/debugUtils';

const bingoPersistConfig = {
  key: 'bingo',
  storage,
};

const persistedBingoReducer = persistReducer(bingoPersistConfig, bingoReducer);

export const store = configureStore({
  reducer: {
    game: gameReducer,
    audio: audioReducer,
    ui: uiReducer,
    progress: progressReducer,
    bingo: persistedBingoReducer, // use persisted reducer
    level3: level3Reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Set serialization
        ignoredActions: [
          'game/completeLevel',
          'game/loadProgress',
          'persist/PERSIST',
          'level3/startGameTimer/fulfilled', // Ignore timer interval
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          'payload.completedLevels',
          'payload.timerInterval', // Ignore timer interval in payload
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'game.completedLevels',
          'level3.ui.activeDragPiece', // May contain non-serializable data
        ],
      },
    })
    .prepend(level3Middleware.middleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    // Enhanced DevTools configuration
    name: 'GMP Quest - Level 3',
    trace: true,
    traceLimit: 25,
    actionCreators: {
      // Level 3 specific action creators for easier debugging
      'Drop Piece': 'level3/dropPiece',
      'Complete Scenario': 'level3/completeScenario',
      'Reset Game': 'level3/resetGame',
      'Set Feedback': 'level3/setFeedback',
      'Show Victory': 'level3/showVictoryPopup',
      'Start Timer': 'level3/startGameTimer',
    },
    // Serialize state for better debugging
    serialize: {
      options: {
        undefined: true,
        function: true,
        symbol: true,
      },
    },
    // Action sanitizer to clean up actions for DevTools
    actionSanitizer: (action: any) => {
      // Don't log timer increment actions to reduce noise
      if (action.type === 'level3/incrementTimer') {
        return { ...action, type: '⏱️ Timer Tick (hidden)' };
      }
      return action;
    },
    // State sanitizer to clean up state for DevTools
    stateSanitizer: (state: any) => {
      return {
        ...state,
        level3: {
          ...state.level3,
          // Hide sensitive or noisy data
          ui: {
            ...state.level3.ui,
            activeDragPiece: state.level3.ui.activeDragPiece ? '🎯 [Drag Piece]' : null,
          },
        },
      };
    },
  },
});

export const persistor = persistStore(store);

// Initialize debug console in development
if (process.env.NODE_ENV !== 'production') {
  createLevel3DebugConsole(store);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;