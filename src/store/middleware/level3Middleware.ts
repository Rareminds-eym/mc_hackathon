// src/store/middleware/level3Middleware.ts

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { RootState } from '../types';
import {
  dropPiece,
  setFeedback,
  showVictoryPopup,
  completeScenario,
  incrementTimer,
  resetGame,
} from '../slices/level3Slice';
import {
  selectIsScenarioComplete,
  selectCurrentScenarioIndex,
  selectScenarios,
} from '../selectors/level3Selectors';
import { GAME_CONSTANTS } from '../types/level3Types';

// Create the listener middleware
export const level3Middleware = createListenerMiddleware();

// ===== FEEDBACK AUTO-CLEAR LISTENER =====

/**
 * Auto-clear feedback after a delay
 */
level3Middleware.startListening({
  actionCreator: setFeedback,
  effect: async (action, listenerApi) => {
    // Cancel any existing feedback clear timer
    listenerApi.cancelActiveListeners();
    
    // Wait for the specified duration
    await listenerApi.delay(GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);
    
    // Clear the feedback
    listenerApi.dispatch({ type: 'level3/clearFeedback' });
  },
});

// ===== SCENARIO COMPLETION LISTENER =====

/**
 * Check for scenario completion after piece drop
 */
level3Middleware.startListening({
  actionCreator: dropPiece,
  effect: async (action, listenerApi) => {
    // Wait a short delay for UI feedback
    await listenerApi.delay(400);
    
    // Check if scenario is complete
    const state = listenerApi.getState() as RootState;
    const isComplete = selectIsScenarioComplete(state);
    
    if (isComplete) {
      listenerApi.dispatch(showVictoryPopup());
    }
  },
});

// ===== TIMER MANAGEMENT LISTENERS =====

/**
 * Start timer when game starts
 */
level3Middleware.startListening({
  actionCreator: resetGame,
  effect: async (action, listenerApi) => {
    // Start the timer
    const timerInterval = setInterval(() => {
      listenerApi.dispatch(incrementTimer());
    }, GAME_CONSTANTS.TIMER_INTERVAL);
    
    // Store the interval ID for cleanup
    (listenerApi as any).timerInterval = timerInterval;
  },
});

/**
 * Stop timer when game completes
 */
level3Middleware.startListening({
  matcher: isAnyOf(completeScenario),
  effect: async (action, listenerApi) => {
    // Check if this was the last scenario
    if (action.payload.isLastScenario) {
      // Clear the timer interval
      const timerInterval = (listenerApi as any).timerInterval;
      if (timerInterval) {
        clearInterval(timerInterval);
        (listenerApi as any).timerInterval = null;
      }
    }
  },
});

// ===== GAME STATE PERSISTENCE LISTENER =====

/**
 * Save game state to localStorage on important changes
 */
level3Middleware.startListening({
  matcher: isAnyOf(dropPiece, completeScenario, resetGame),
  effect: async (action, listenerApi) => {
    try {
      const state = listenerApi.getState() as RootState;
      const level3State = state.level3;
      
      // Only save if there's meaningful progress
      if (level3State.progress.scenarioResults.length > 0 || 
          level3State.progress.placedPieces.violations.length > 0 ||
          level3State.progress.placedPieces.actions.length > 0) {
        
        const gameStateToSave = {
          currentScenarioIndex: level3State.progress.currentScenarioIndex,
          scenarioResults: level3State.progress.scenarioResults,
          placedPieces: level3State.progress.placedPieces,
          gameStats: level3State.gameStats,
          timestamp: Date.now(),
        };
        
        localStorage.setItem('level3_game_state', JSON.stringify(gameStateToSave));
      }
    } catch (error) {
      console.warn('Failed to save game state to localStorage:', error);
    }
  },
});

// ===== GAME STATE RESTORATION LISTENER =====

/**
 * Restore game state from localStorage on game reset (if user wants to continue)
 */
level3Middleware.startListening({
  actionCreator: resetGame,
  effect: async (action, listenerApi) => {
    try {
      const savedState = localStorage.getItem('level3_game_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Check if the saved state is recent (within 24 hours)
        const isRecent = Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000;
        
        if (isRecent && parsedState.scenarioResults.length > 0) {
          // Could dispatch actions to restore state here
          // For now, we'll just log that we found a saved state
          console.log('Found recent saved game state:', parsedState);
          
          // In a full implementation, you might want to show a dialog
          // asking the user if they want to continue from where they left off
        }
      }
    } catch (error) {
      console.warn('Failed to restore game state from localStorage:', error);
    }
  },
});

// ===== PERFORMANCE MONITORING LISTENER =====

/**
 * Monitor game performance and log metrics
 */
level3Middleware.startListening({
  matcher: isAnyOf(dropPiece, completeScenario),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const level3State = state.level3;
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Level 3 Performance Metrics:', {
        action: action.type,
        currentScenario: level3State.progress.currentScenarioIndex,
        totalScenarios: level3State.scenarios.length,
        gameTime: level3State.gameStats.timer,
        score: level3State.gameStats.score,
        health: level3State.gameStats.health,
        combo: level3State.gameStats.combo,
        placedPieces: {
          violations: level3State.progress.placedPieces.violations.length,
          actions: level3State.progress.placedPieces.actions.length,
        },
      });
    }
  },
});

// ===== ERROR HANDLING LISTENER =====

/**
 * Handle and log errors from async actions
 */
level3Middleware.startListening({
  predicate: (action) => action.type.endsWith('/rejected'),
  effect: async (action, listenerApi) => {
    console.error('Level 3 Action Failed:', {
      type: action.type,
      error: action.error,
      payload: action.payload,
    });
    
    // Could dispatch an error action here to show user-friendly error messages
    listenerApi.dispatch({
      type: 'level3/setError',
      payload: 'An error occurred. Please try again.',
    });
  },
});

// ===== ANALYTICS LISTENER =====

/**
 * Track game events for analytics
 */
level3Middleware.startListening({
  matcher: isAnyOf(dropPiece, completeScenario, resetGame),
  effect: async (action, listenerApi) => {
    // In a real application, you would send analytics events here
    const state = listenerApi.getState() as RootState;
    const level3State = state.level3;
    
    const analyticsEvent = {
      event: action.type,
      properties: {
        scenario_index: level3State.progress.currentScenarioIndex,
        game_time: level3State.gameStats.timer,
        score: level3State.gameStats.score,
        health: level3State.gameStats.health,
        combo: level3State.gameStats.combo,
        timestamp: Date.now(),
      },
    };
    
    // Example: Send to analytics service
    // analytics.track(analyticsEvent.event, analyticsEvent.properties);
    
    console.log('Analytics Event:', analyticsEvent);
  },
});

// ===== ACCESSIBILITY LISTENER =====

/**
 * Handle accessibility announcements
 */
level3Middleware.startListening({
  actionCreator: setFeedback,
  effect: async (action, listenerApi) => {
    // Announce feedback to screen readers
    const message = action.payload.message;
    
    if (message && typeof window !== 'undefined') {
      // Create or update ARIA live region
      let liveRegion = document.getElementById('level3-live-region');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'level3-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
      }
      
      // Update the live region with the feedback message
      liveRegion.textContent = message.replace(/[^\w\s]/g, ''); // Remove emojis for screen readers
    }
  },
});

export default level3Middleware;
