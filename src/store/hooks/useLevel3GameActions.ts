// src/store/hooks/useLevel3GameActions.ts

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../index';
import {
  dropPiece,
  completeScenario,
  showVictoryPopup,
  hideVictoryPopup,
  resetGame,
  setFeedback,
  clearFeedback,
} from '../slices/level3Slice';
import type { PuzzlePiece, ScenarioResult } from '../../data/level3Scenarios';

/**
 * Custom hook for Level 3 game actions that automatically save progress
 * This hook wraps game actions to ensure progress is saved on user interactions
 */
export const useLevel3GameActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Handle piece drop - automatically saves progress via middleware
   */
  const handlePieceDrop = useCallback((
    containerType: 'violations' | 'actions',
    piece: PuzzlePiece
  ) => {
    // Dispatch the drop action - middleware will handle saving
    dispatch(dropPiece({ containerType, piece }));
    
    // Clear feedback after delay
    setTimeout(() => {
      dispatch(clearFeedback());
    }, 2500);
    
    console.log(`🎯 Piece dropped: ${piece.text} -> ${containerType}`);
  }, [dispatch]);

  /**
   * Complete current scenario - automatically saves progress via middleware
   */
  const handleCompleteScenario = useCallback((
    scenarioResult: ScenarioResult,
    isLastScenario: boolean
  ) => {
    // Dispatch completion - middleware will handle saving
    dispatch(completeScenario({ scenarioResult, isLastScenario }));
    
    console.log(`🏆 Scenario completed: ${scenarioResult.scenarioIndex + 1}`);
  }, [dispatch]);

  /**
   * Show victory popup after scenario completion
   */
  const handleShowVictory = useCallback(() => {
    dispatch(showVictoryPopup());
  }, [dispatch]);

  /**
   * Hide victory popup
   */
  const handleHideVictory = useCallback(() => {
    dispatch(hideVictoryPopup());
  }, [dispatch]);

  /**
   * Reset game - clears saved progress via middleware
   */
  const handleResetGame = useCallback(() => {
    // Dispatch reset - middleware will handle clearing saved progress
    dispatch(resetGame());
    
    console.log('🔄 Game reset');
  }, [dispatch]);

  /**
   * Set feedback message
   */
  const handleSetFeedback = useCallback((message: string) => {
    dispatch(setFeedback({ message }));
    
    // Auto-clear after delay
    setTimeout(() => {
      dispatch(clearFeedback());
    }, 2500);
  }, [dispatch]);

  /**
   * Clear feedback immediately
   */
  const handleClearFeedback = useCallback(() => {
    dispatch(clearFeedback());
  }, [dispatch]);

  return {
    // Core game actions that trigger auto-save
    handlePieceDrop,
    handleCompleteScenario,
    handleResetGame,
    
    // UI actions
    handleShowVictory,
    handleHideVictory,
    handleSetFeedback,
    handleClearFeedback,
  };
};

/**
 * Hook for manual progress saving (for special cases)
 */
export const useLevel3ManualSave = (moduleId: string, userId: string) => {
  const dispatch = useDispatch<AppDispatch>();

  const saveProgressNow = useCallback(async () => {
    try {
      // Import the thunk dynamically to avoid circular dependencies
      const { persistGameProgress } = await import('../thunks/level3Thunks');
      
      const result = await dispatch(persistGameProgress({
        moduleId,
        userId,
        saveToServer: false,
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        console.log('💾 Manual save successful');
        return { success: true };
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('❌ Manual save failed:', error);
      return { success: false, error };
    }
  }, [dispatch, moduleId, userId]);

  return {
    saveProgressNow,
  };
};

/**
 * Hook for components that need to know when saves occur
 */
export const useLevel3SaveStatus = () => {
  // This could be expanded to listen for save events from middleware
  // For now, it's a placeholder for future functionality
  
  return {
    lastSaveTime: null,
    isSaving: false,
    saveError: null,
  };
};
