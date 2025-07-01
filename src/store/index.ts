import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import audioReducer from './slices/audioSlice';
import uiReducer from './slices/uiSlice';
import progressReducer from './slices/progressSlice';
import level3Reducer from './slices/level3Slice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    audio: audioReducer,
    ui: uiReducer,
    progress: progressReducer,
    level3: level3Reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Set serialization
        ignoredActions: ['game/completeLevel', 'game/loadProgress'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.completedLevels'],
        // Ignore these paths in the state
        ignoredPaths: ['game.completedLevels'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;