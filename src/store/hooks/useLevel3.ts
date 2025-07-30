// src/store/hooks/useLevel3.ts

import { useMemo } from 'react';
import { useLevel3Game } from './useLevel3Game';
import { useLevel3UI } from './useLevel3UI';
import { useLevel3Progress } from './useLevel3Progress';

/**
 * Combined hook that provides all Level 3 functionality
 * This is the main hook components should use for comprehensive Level 3 state management
 *
 * @returns Memoized object with game state and actions
 */
export const useLevel3 = () => {
  const game = useLevel3Game();
  const ui = useLevel3UI();
  const progress = useLevel3Progress();

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Game functionality
    game,

    // UI functionality
    ui,

    // Progress functionality
    progress,

    // Quick access to commonly used values (memoized)
    gameStats: game.gameStats,
    currentScenario: game.currentScenario,
    availablePieces: game.availablePieces,
    correctViolations: game.correctViolations,
    correctActions: game.correctActions,
    isComplete: ui.isComplete,
    feedback: ui.feedback,
    showVictory: ui.showVictory,
    showFinalStats: ui.showFinalStatsDialog,
    showScenarioDialog: ui.showScenarioDialog,
    showBriefingDialog: ui.showBriefingDialog,
    activeDragPiece: ui.activeDragPiece,
    overallStats: progress.overallStats,
    currentScenarioProgress: progress.currentScenarioProgress,

    // Quick access to commonly used actions (stable references)
    handleDrop: game.handleDrop,
    handleVictoryClose: game.handleVictoryClose,
    showFeedback: game.showFeedback,
    setDragPiece: game.setDragPiece,
    handleShowScenario: ui.handleShowScenario,
    handleHideScenario: ui.handleHideScenario,
    handleShowBriefing: ui.handleShowBriefing,
    handleHideBriefing: ui.handleHideBriefing,
    handleResetGame: progress.handleResetGame,
    startTimer: game.startTimer,
    stopTimer: game.stopTimer,
  }), [
    game,
    ui,
    progress,
  ]);
};
