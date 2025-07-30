// src/store/hooks/useLevel3Progress.ts

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  nextScenario,
  completeScenario,
  resetGame,
  setScenarios,
} from '../slices/level3Slice';
import {
  selectProgress,
  selectCurrentScenarioIndex,
  selectScenarioResults,
  selectPlacedPieces,
  selectIsGameComplete,
  selectOverallStats,
  selectGameCompletionData,
  selectScenarios,
  selectCurrentScenario,
  selectCanProceedToNext,
} from '../selectors/level3Selectors';
import type { Scenario, ScenarioResult } from '../../data/level3Scenarios';
import type { SaveGameCompletionParams } from '../types/level3Types';

/**
 * Custom hook for Level 3 progress and completion management
 */
export const useLevel3Progress = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const progress = useAppSelector(selectProgress);
  const currentScenarioIndex = useAppSelector(selectCurrentScenarioIndex);
  const scenarioResults = useAppSelector(selectScenarioResults);
  const placedPieces = useAppSelector(selectPlacedPieces);
  const isGameComplete = useAppSelector(selectIsGameComplete);
  const overallStats = useAppSelector(selectOverallStats);
  const gameCompletionData = useAppSelector(selectGameCompletionData);
  const scenarios = useAppSelector(selectScenarios);
  const currentScenario = useAppSelector(selectCurrentScenario);
  const canProceedToNext = useAppSelector(selectCanProceedToNext);

  // ===== SCENARIO PROGRESSION =====

  /**
   * Move to the next scenario
   */
  const handleNextScenario = useCallback(() => {
    if (canProceedToNext) {
      dispatch(nextScenario());
    }
  }, [dispatch, canProceedToNext]);

  /**
   * Complete current scenario and handle progression
   */
  const handleCompleteScenario = useCallback((scenarioResult: ScenarioResult) => {
    const isLastScenario = currentScenarioIndex >= scenarios.length - 1;
    dispatch(completeScenario({ scenarioResult, isLastScenario }));
  }, [dispatch, currentScenarioIndex, scenarios.length]);

  /**
   * Reset game to initial state
   */
  const handleResetGame = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  /**
   * Load scenarios for a specific module
   */
  const loadScenariosForModule = useCallback((moduleScenarios: Scenario[]) => {
    dispatch(setScenarios(moduleScenarios));
  }, [dispatch]);

  // ===== PROGRESS CALCULATIONS =====

  /**
   * Calculate progress percentage for current scenario
   */
  const getCurrentScenarioProgress = useCallback(() => {
    if (!currentScenario) return 0;
    
    const totalCorrectPieces = currentScenario.pieces.filter(p => p.isCorrect).length;
    const placedCorrectPieces = [
      ...placedPieces.violations.filter(p => p.isCorrect),
      ...placedPieces.actions.filter(p => p.isCorrect)
    ].length;
    
    return totalCorrectPieces > 0 ? Math.round((placedCorrectPieces / totalCorrectPieces) * 100) : 0;
  }, [currentScenario, placedPieces]);

  /**
   * Calculate overall game progress percentage
   */
  const getOverallGameProgress = useCallback(() => {
    if (scenarios.length === 0) return 0;
    
    const completedScenarios = scenarioResults.length;
    const currentScenarioProgress = getCurrentScenarioProgress() / 100;
    
    return Math.round(((completedScenarios + currentScenarioProgress) / scenarios.length) * 100);
  }, [scenarios.length, scenarioResults.length, getCurrentScenarioProgress]);

  /**
   * Get scenario completion status
   */
  const getScenarioCompletionStatus = useCallback(() => {
    return scenarios.map((_, index) => ({
      scenarioIndex: index,
      isCompleted: index < scenarioResults.length,
      isCurrent: index === currentScenarioIndex,
      result: scenarioResults.find(r => r.scenarioIndex === index) || null,
    }));
  }, [scenarios, scenarioResults, currentScenarioIndex]);

  // ===== STATISTICS AND ANALYTICS =====

  /**
   * Get performance analytics
   */
  const getPerformanceAnalytics = useCallback(() => {
    if (scenarioResults.length === 0) {
      return {
        averageScore: 0,
        averageHealth: 0,
        averageCombo: 0,
        bestScenario: null,
        worstScenario: null,
        improvementTrend: 'stable' as const,
      };
    }

    const scores = scenarioResults.map(r => r.score);
    const healths = scenarioResults.map(r => r.health);
    const combos = scenarioResults.map(r => r.combo);

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const averageHealth = healths.reduce((sum, health) => sum + health, 0) / healths.length;
    const averageCombo = combos.reduce((sum, combo) => sum + combo, 0) / combos.length;

    const bestScenario = scenarioResults.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    const worstScenario = scenarioResults.reduce((worst, current) => 
      current.score < worst.score ? current : worst
    );

    // Simple improvement trend calculation
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scenarioResults.length >= 3) {
      const recentScores = scores.slice(-3);
      const earlierScores = scores.slice(0, 3);
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;
      
      if (recentAvg > earlierAvg * 1.1) improvementTrend = 'improving';
      else if (recentAvg < earlierAvg * 0.9) improvementTrend = 'declining';
    }

    return {
      averageScore: Math.round(averageScore),
      averageHealth: Math.round(averageHealth),
      averageCombo: Math.round(averageCombo * 10) / 10,
      bestScenario,
      worstScenario,
      improvementTrend,
    };
  }, [scenarioResults]);

  // ===== SAVE/LOAD FUNCTIONALITY =====

  /**
   * Prepare game completion data for saving
   */
  const prepareGameCompletionData = useCallback((params: Omit<SaveGameCompletionParams, 'finalScore' | 'totalTime'>) => {
    return {
      ...params,
      finalScore: overallStats.finalScore,
      totalTime: overallStats.totalTime,
      placedPieces: {
        scenarioResults,
        overallStats,
        completionData: gameCompletionData,
      },
    };
  }, [overallStats, scenarioResults, gameCompletionData]);

  // ===== COMPUTED VALUES =====

  const currentScenarioProgress = getCurrentScenarioProgress();
  const overallGameProgress = getOverallGameProgress();
  const scenarioCompletionStatus = getScenarioCompletionStatus();
  const performanceAnalytics = getPerformanceAnalytics();

  const isFirstScenario = currentScenarioIndex === 0;
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const hasCompletedScenarios = scenarioResults.length > 0;
  const totalScenarios = scenarios.length;

  // ===== RETURN INTERFACE =====

  return {
    // Progress State
    progress,
    currentScenarioIndex,
    scenarioResults,
    placedPieces,
    isGameComplete,
    overallStats,
    gameCompletionData,
    
    // Scenario Information
    scenarios,
    currentScenario,
    canProceedToNext,
    totalScenarios,
    
    // Progress Calculations
    currentScenarioProgress,
    overallGameProgress,
    scenarioCompletionStatus,
    performanceAnalytics,
    
    // Status Flags
    isFirstScenario,
    isLastScenario,
    hasCompletedScenarios,
    
    // Actions
    handleNextScenario,
    handleCompleteScenario,
    handleResetGame,
    loadScenariosForModule,
    prepareGameCompletionData,
    
    // Utility Functions
    getCurrentScenarioProgress,
    getOverallGameProgress,
    getScenarioCompletionStatus,
    getPerformanceAnalytics,
  };
};

// ===== SPECIALIZED PROGRESS HOOKS =====

/**
 * Hook for scenario statistics only
 */
export const useLevel3Statistics = () => {
  const overallStats = useAppSelector(selectOverallStats);
  const scenarioResults = useAppSelector(selectScenarioResults);
  
  return {
    overallStats,
    scenarioResults,
    hasResults: scenarioResults.length > 0,
    completedScenarios: scenarioResults.length,
  };
};

/**
 * Hook for completion status only
 */
export const useLevel3Completion = () => {
  const isGameComplete = useAppSelector(selectIsGameComplete);
  const gameCompletionData = useAppSelector(selectGameCompletionData);
  const canProceedToNext = useAppSelector(selectCanProceedToNext);
  
  return {
    isGameComplete,
    gameCompletionData,
    canProceedToNext,
  };
};
