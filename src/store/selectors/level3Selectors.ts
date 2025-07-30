// src/store/selectors/level3Selectors.ts

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../types';
import type {
  DerivedGameState,
  GameCompletionData,
  OverallStats
} from '../types/level3Types';
import { GAME_CONSTANTS } from '../types/level3Types';
import type { PuzzlePiece } from '../../data/level3Scenarios';

// ===== BASE SELECTORS =====

export const selectLevel3 = (state: RootState) => state.level3;

export const selectScenarios = createSelector(
  [selectLevel3],
  (level3) => level3.scenarios
);

export const selectGameStats = createSelector(
  [selectLevel3],
  (level3) => level3.gameStats
);

export const selectUIState = createSelector(
  [selectLevel3],
  (level3) => level3.ui
);

export const selectProgress = createSelector(
  [selectLevel3],
  (level3) => level3.progress
);

export const selectIsLoading = createSelector(
  [selectLevel3],
  (level3) => level3.isLoading
);

export const selectError = createSelector(
  [selectLevel3],
  (level3) => level3.error
);

// ===== GAME STATE SELECTORS =====

export const selectScore = createSelector(
  [selectGameStats],
  (stats) => stats.score
);

export const selectHealth = createSelector(
  [selectGameStats],
  (stats) => stats.health
);

export const selectCombo = createSelector(
  [selectGameStats],
  (stats) => stats.combo
);

export const selectTimer = createSelector(
  [selectGameStats],
  (stats) => stats.timer
);

export const selectFormattedTimer = createSelector(
  [selectTimer],
  (timer) => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
);

// ===== UI STATE SELECTORS =====

export const selectShowScenario = createSelector(
  [selectUIState],
  (ui) => ui.showScenario
);

export const selectShowBriefing = createSelector(
  [selectUIState],
  (ui) => ui.showBriefing
);

export const selectShowVictoryPopup = createSelector(
  [selectUIState],
  (ui) => ui.showVictoryPopup
);

export const selectShowFinalStats = createSelector(
  [selectUIState],
  (ui) => ui.showFinalStats
);

export const selectFeedback = createSelector(
  [selectUIState],
  (ui) => ui.feedback
);

export const selectActiveDragPiece = createSelector(
  [selectUIState],
  (ui) => ui.activeDragPiece
);

export const selectIsComplete = createSelector(
  [selectUIState],
  (ui) => ui.isComplete
);

// ===== PROGRESS SELECTORS =====

export const selectCurrentScenarioIndex = createSelector(
  [selectProgress],
  (progress) => progress.currentScenarioIndex
);

export const selectScenarioResults = createSelector(
  [selectProgress],
  (progress) => progress.scenarioResults
);

export const selectPlacedPieces = createSelector(
  [selectProgress],
  (progress) => progress.placedPieces
);

export const selectIsGameComplete = createSelector(
  [selectProgress],
  (progress) => progress.isGameComplete
);

// ===== DERIVED STATE SELECTORS =====

export const selectCurrentScenario = createSelector(
  [selectScenarios, selectCurrentScenarioIndex],
  (scenarios, index) => scenarios[index] || null
);

export const selectCorrectViolations = createSelector(
  [selectCurrentScenario],
  (scenario) => scenario?.pieces.filter(
    (p: PuzzlePiece) => p.category === 'violation' && p.isCorrect
  ) || []
);

export const selectCorrectActions = createSelector(
  [selectCurrentScenario],
  (scenario) => scenario?.pieces.filter(
    (p: PuzzlePiece) => p.category === 'action' && p.isCorrect
  ) || []
);

export const selectAvailablePieces = createSelector(
  [selectCurrentScenario, selectPlacedPieces],
  (scenario, placedPieces) => {
    if (!scenario) return [];
    
    return scenario.pieces.filter(
      (piece: PuzzlePiece) =>
        !placedPieces.violations.some((p) => p.id === piece.id) &&
        !placedPieces.actions.some((p) => p.id === piece.id)
    );
  }
);

export const selectIsScenarioComplete = createSelector(
  [selectCorrectViolations, selectCorrectActions, selectPlacedPieces],
  (correctViolations, correctActions, placedPieces) => {
    return (
      placedPieces.violations.length === correctViolations.length &&
      placedPieces.actions.length === correctActions.length
    );
  }
);

export const selectCanProceedToNext = createSelector(
  [selectIsScenarioComplete, selectCurrentScenarioIndex, selectScenarios],
  (isComplete, currentIndex, scenarios) => {
    return isComplete && currentIndex < scenarios.length - 1;
  }
);

export const selectDerivedGameState = createSelector(
  [
    selectAvailablePieces,
    selectCorrectViolations,
    selectCorrectActions,
    selectCurrentScenario,
    selectIsScenarioComplete,
    selectCanProceedToNext,
  ],
  (
    availablePieces,
    correctViolations,
    correctActions,
    currentScenario,
    isScenarioComplete,
    canProceedToNext
  ): DerivedGameState => ({
    availablePieces,
    correctViolations,
    correctActions,
    currentScenario,
    isScenarioComplete,
    canProceedToNext,
  })
);

// ===== STATISTICS SELECTORS =====

export const selectOverallStats = createSelector(
  [selectScenarioResults, selectTimer],
  (scenarioResults, totalTime): OverallStats => {
    if (scenarioResults.length === 0) {
      return {
        totalScore: 0,
        totalCombo: 0,
        avgHealth: 0,
        totalTime: 0,
        scenarioCount: 0,
        finalScore: 0,
      };
    }

    const totalScore = scenarioResults.reduce((sum, result) => sum + result.score, 0);
    const totalCombo = scenarioResults.reduce((sum, result) => sum + result.combo, 0);
    const totalHealth = scenarioResults.reduce((sum, result) => sum + result.health, 0);
    const avgHealth = parseFloat((totalHealth / scenarioResults.length).toFixed(2));

    // Calculate final score using weighted formula
    const maxPossibleScore = scenarioResults.length * 100;
    const maxPossibleCombo = scenarioResults.length * 5;
    const maxHealth = 100;

    const scorePart = Math.round((totalScore / maxPossibleScore) * GAME_CONSTANTS.SCORE_WEIGHTS.SCORE_PERCENTAGE);
    const comboPart = Math.round((totalCombo / maxPossibleCombo) * GAME_CONSTANTS.SCORE_WEIGHTS.COMBO_PERCENTAGE);
    const healthPart = Math.round((avgHealth / maxHealth) * GAME_CONSTANTS.SCORE_WEIGHTS.HEALTH_PERCENTAGE);

    const finalScore = Math.min(scorePart + comboPart + healthPart, 100);

    return {
      totalScore,
      totalCombo,
      avgHealth,
      totalTime,
      scenarioCount: scenarioResults.length,
      finalScore,
    };
  }
);

export const selectGameCompletionData = createSelector(
  [selectOverallStats, selectScenarioResults],
  (overallStats, scenarioResults): GameCompletionData => ({
    overallStats,
    scenarioResults,
    finalScore: overallStats.finalScore,
    totalTime: overallStats.totalTime,
  })
);

// ===== VALIDATION SELECTORS =====

export const selectIsPieceAlreadyPlaced = createSelector(
  [selectPlacedPieces, (state: RootState, pieceId: string) => pieceId],
  (placedPieces, pieceId) => {
    return (
      placedPieces.violations.some((p) => p.id === pieceId) ||
      placedPieces.actions.some((p) => p.id === pieceId)
    );
  }
);

export const selectPointsPerPiece = createSelector(
  [selectCorrectViolations, selectCorrectActions],
  (correctViolations, correctActions) => {
    const totalCorrectPieces = correctViolations.length + correctActions.length;
    return totalCorrectPieces > 0 ? Math.floor(100 / totalCorrectPieces) : 0;
  }
);
