// src/store/hooks/useLevel3Game.ts

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  hideVictoryPopup,
  setActiveDragPiece,
} from '../slices/level3Slice';
import {
  selectGameStats,
  selectDerivedGameState,
  selectCurrentScenarioIndex,
  selectScenarioResults,
  selectIsScenarioComplete,
  selectCanProceedToNext,
  selectOverallStats,
  selectCurrentScenario,
} from '../selectors/level3Selectors';
import {
  handlePieceDrop,
  handleVictoryClose,
  startGameTimer,
  stopGameTimer,
  setFeedbackWithAutoClear,
  resetGame,
} from '../thunks/level3Thunks';
import type { PuzzlePiece } from '../../data/level3Scenarios';

/**
 * Custom hook for Level 3 game logic and state management
 */
export const useLevel3Game = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const gameStats = useAppSelector(selectGameStats);
  const derivedState = useAppSelector(selectDerivedGameState);
  const currentScenarioIndex = useAppSelector(selectCurrentScenarioIndex);
  const scenarioResults = useAppSelector(selectScenarioResults);
  const isScenarioComplete = useAppSelector(selectIsScenarioComplete);
  const canProceedToNext = useAppSelector(selectCanProceedToNext);
  const overallStats = useAppSelector(selectOverallStats);
  const currentScenario = useAppSelector(selectCurrentScenario);

  // ===== GAME ACTIONS =====

  /**
   * Handle piece drop with validation and state updates
   */
  const handleDrop = useCallback(
    (containerType: 'violations' | 'actions', piece: PuzzlePiece) => {
      dispatch(handlePieceDrop({ containerType, piece }));
    },
    [dispatch]
  );

  /**
   * Handle victory popup close and scenario progression
   */
  const handleVictoryCloseAction = useCallback(() => {
    dispatch(handleVictoryClose());
  }, [dispatch]);

  /**
   * Start the game timer
   */
  const startTimer = useCallback(() => {
    return dispatch(startGameTimer());
  }, [dispatch]);

  /**
   * Stop the game timer
   */
  const stopTimer = useCallback((intervalId: NodeJS.Timeout) => {
    return dispatch(stopGameTimer(intervalId));
  }, [dispatch]);

  /**
   * Reset the entire game state
   */
  const handleResetGame = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  /**
   * Set feedback message with auto-clear
   */
  const showFeedback = useCallback((message: string) => {
    dispatch(setFeedbackWithAutoClear(message));
  }, [dispatch]);

  /**
   * Set active drag piece for DnD
   */
  const setDragPiece = useCallback((piece: PuzzlePiece | null) => {
    dispatch(setActiveDragPiece(piece));
  }, [dispatch]);

  // ===== COMPUTED VALUES =====

  const formattedTimer = `${Math.floor(gameStats.timer / 60)
    .toString()
    .padStart(2, '0')}:${(gameStats.timer % 60).toString().padStart(2, '0')}`;

  const progressPercentage = currentScenario
    ? Math.round(
        ((derivedState.correctViolations.length + derivedState.correctActions.length) /
          (derivedState.correctViolations.length + derivedState.correctActions.length)) *
          100
      )
    : 0;

  // ===== RETURN INTERFACE =====

  return {
    // Game State
    gameStats,
    formattedTimer,
    progressPercentage,
    
    // Derived State
    ...derivedState,
    
    // Scenario State
    currentScenarioIndex,
    scenarioResults,
    isScenarioComplete,
    canProceedToNext,
    overallStats,
    
    // Actions
    handleDrop,
    handleVictoryClose: handleVictoryCloseAction,
    startTimer,
    stopTimer,
    handleResetGame,
    showFeedback,
    setDragPiece,
  };
};

// ===== ADDITIONAL UTILITY HOOKS =====

/**
 * Hook for game statistics only
 */
export const useLevel3Stats = () => {
  const gameStats = useAppSelector(selectGameStats);
  const overallStats = useAppSelector(selectOverallStats);
  
  return {
    ...gameStats,
    overallStats,
    formattedTimer: `${Math.floor(gameStats.timer / 60)
      .toString()
      .padStart(2, '0')}:${(gameStats.timer % 60).toString().padStart(2, '0')}`,
  };
};

/**
 * Hook for scenario management only
 */
export const useLevel3Scenarios = () => {
  const currentScenario = useAppSelector(selectCurrentScenario);
  const currentScenarioIndex = useAppSelector(selectCurrentScenarioIndex);
  const derivedState = useAppSelector(selectDerivedGameState);
  
  return {
    currentScenario,
    currentScenarioIndex,
    ...derivedState,
  };
};
