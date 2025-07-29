// src/store/hooks/useLevel3UI.ts

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  showScenario,
  hideScenario,
  showBriefing,
  hideBriefing,
  showVictoryPopup,
  hideVictoryPopup,
  showFinalStats,
  hideFinalStats,
  setFeedback,
  clearFeedback,
  setActiveDragPiece,
} from '../slices/level3Slice';
import {
  selectUIState,
  selectShowScenario,
  selectShowBriefing,
  selectShowVictoryPopup,
  selectShowFinalStats,
  selectFeedback,
  selectActiveDragPiece,
  selectIsComplete,
} from '../selectors/level3Selectors';
import type { PuzzlePiece } from '../../data/level3Scenarios';

/**
 * Custom hook for Level 3 UI state management
 */
export const useLevel3UI = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const uiState = useAppSelector(selectUIState);
  const showScenarioDialog = useAppSelector(selectShowScenario);
  const showBriefingDialog = useAppSelector(selectShowBriefing);
  const showVictory = useAppSelector(selectShowVictoryPopup);
  const showFinalStatsDialog = useAppSelector(selectShowFinalStats);
  const feedback = useAppSelector(selectFeedback);
  const activeDragPiece = useAppSelector(selectActiveDragPiece);
  const isComplete = useAppSelector(selectIsComplete);

  // ===== DIALOG ACTIONS =====

  /**
   * Show scenario dialog
   */
  const handleShowScenario = useCallback(() => {
    dispatch(showScenario());
  }, [dispatch]);

  /**
   * Hide scenario dialog
   */
  const handleHideScenario = useCallback(() => {
    dispatch(hideScenario());
  }, [dispatch]);

  /**
   * Show briefing dialog
   */
  const handleShowBriefing = useCallback(() => {
    dispatch(showBriefing());
  }, [dispatch]);

  /**
   * Hide briefing dialog
   */
  const handleHideBriefing = useCallback(() => {
    dispatch(hideBriefing());
  }, [dispatch]);

  /**
   * Show victory popup
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
   * Show final stats dialog
   */
  const handleShowFinalStats = useCallback(() => {
    dispatch(showFinalStats());
  }, [dispatch]);

  /**
   * Hide final stats dialog
   */
  const handleHideFinalStats = useCallback(() => {
    dispatch(hideFinalStats());
  }, [dispatch]);

  // ===== FEEDBACK ACTIONS =====

  /**
   * Set feedback message
   */
  const handleSetFeedback = useCallback((message: string, type?: 'success' | 'error' | 'info') => {
    dispatch(setFeedback({ message, type }));
  }, [dispatch]);

  /**
   * Clear feedback message
   */
  const handleClearFeedback = useCallback(() => {
    dispatch(clearFeedback());
  }, [dispatch]);

  // ===== DRAG AND DROP ACTIONS =====

  /**
   * Set active drag piece
   */
  const handleSetActiveDragPiece = useCallback((piece: PuzzlePiece | null) => {
    dispatch(setActiveDragPiece(piece));
  }, [dispatch]);

  /**
   * Clear active drag piece
   */
  const handleClearActiveDragPiece = useCallback(() => {
    dispatch(setActiveDragPiece(null));
  }, [dispatch]);

  // ===== COMPUTED VALUES =====

  const hasActiveFeedback = Boolean(feedback);
  const isAnyDialogOpen = showScenarioDialog || showBriefingDialog || showVictory || showFinalStatsDialog;
  const isDragging = Boolean(activeDragPiece);

  // ===== RETURN INTERFACE =====

  return {
    // UI State
    uiState,
    showScenarioDialog,
    showBriefingDialog,
    showVictory,
    showFinalStatsDialog,
    feedback,
    activeDragPiece,
    isComplete,
    
    // Computed Values
    hasActiveFeedback,
    isAnyDialogOpen,
    isDragging,
    
    // Dialog Actions
    handleShowScenario,
    handleHideScenario,
    handleShowBriefing,
    handleHideBriefing,
    handleShowVictory,
    handleHideVictory,
    handleShowFinalStats,
    handleHideFinalStats,
    
    // Feedback Actions
    handleSetFeedback,
    handleClearFeedback,
    
    // Drag and Drop Actions
    handleSetActiveDragPiece,
    handleClearActiveDragPiece,
  };
};

// ===== SPECIALIZED UI HOOKS =====

/**
 * Hook for feedback management only
 */
export const useLevel3Feedback = () => {
  const dispatch = useAppDispatch();
  const feedback = useAppSelector(selectFeedback);

  const setFeedbackMessage = useCallback((message: string, type?: 'success' | 'error' | 'info') => {
    dispatch(setFeedback({ message, type }));
  }, [dispatch]);

  const clearFeedbackMessage = useCallback(() => {
    dispatch(clearFeedback());
  }, [dispatch]);

  return {
    feedback,
    hasActiveFeedback: Boolean(feedback),
    setFeedbackMessage,
    clearFeedbackMessage,
  };
};

/**
 * Hook for drag and drop state only
 */
export const useLevel3DragDrop = () => {
  const dispatch = useAppDispatch();
  const activeDragPiece = useAppSelector(selectActiveDragPiece);

  const setActiveDragPiece = useCallback((piece: PuzzlePiece | null) => {
    dispatch(setActiveDragPiece(piece));
  }, [dispatch]);

  const clearActiveDragPiece = useCallback(() => {
    dispatch(setActiveDragPiece(null));
  }, [dispatch]);

  return {
    activeDragPiece,
    isDragging: Boolean(activeDragPiece),
    setActiveDragPiece,
    clearActiveDragPiece,
  };
};

/**
 * Hook for dialog state management only
 */
export const useLevel3Dialogs = () => {
  const dispatch = useAppDispatch();
  
  const showScenarioDialog = useAppSelector(selectShowScenario);
  const showBriefingDialog = useAppSelector(selectShowBriefing);
  const showVictory = useAppSelector(selectShowVictoryPopup);
  const showFinalStatsDialog = useAppSelector(selectShowFinalStats);

  const toggleScenario = useCallback((show: boolean) => {
    dispatch(show ? showScenario() : hideScenario());
  }, [dispatch]);

  const toggleBriefing = useCallback((show: boolean) => {
    dispatch(show ? showBriefing() : hideBriefing());
  }, [dispatch]);

  const toggleVictory = useCallback((show: boolean) => {
    dispatch(show ? showVictoryPopup() : hideVictoryPopup());
  }, [dispatch]);

  const toggleFinalStats = useCallback((show: boolean) => {
    dispatch(show ? showFinalStats() : hideFinalStats());
  }, [dispatch]);

  return {
    showScenarioDialog,
    showBriefingDialog,
    showVictory,
    showFinalStatsDialog,
    isAnyDialogOpen: showScenarioDialog || showBriefingDialog || showVictory || showFinalStatsDialog,
    toggleScenario,
    toggleBriefing,
    toggleVictory,
    toggleFinalStats,
  };
};
