// src/store/utils/debugUtils.ts

import type { RootState } from '../types';
import type { Level3State } from '../types/level3Types';

/**
 * Debug utilities for Level 3 Redux state
 */

// ===== STATE INSPECTION UTILITIES =====

/**
 * Get a summary of the current Level 3 game state
 */
export const getLevel3StateSummary = (state: RootState) => {
  const level3 = state.level3;
  
  return {
    // Game Progress
    currentScenario: level3.progress.currentScenarioIndex + 1,
    totalScenarios: level3.scenarios.length,
    completedScenarios: level3.progress.scenarioResults.length,
    
    // Game Stats
    score: level3.gameStats.score,
    health: level3.gameStats.health,
    combo: level3.gameStats.combo,
    timer: level3.gameStats.timer,
    formattedTimer: formatTime(level3.gameStats.timer),
    
    // Placed Pieces
    placedViolations: level3.progress.placedPieces.violations.length,
    placedActions: level3.progress.placedPieces.actions.length,
    
    // UI State
    showScenario: level3.ui.showScenario,
    showVictory: level3.ui.showVictoryPopup,
    showFinalStats: level3.ui.showFinalStats,
    hasFeedback: Boolean(level3.ui.feedback),
    isDragging: Boolean(level3.ui.activeDragPiece),
    
    // Completion Status
    isScenarioComplete: level3.ui.isComplete,
    isGameComplete: level3.progress.isGameComplete,
    
    // Error State
    hasError: Boolean(level3.error),
    isLoading: level3.isLoading,
  };
};

/**
 * Get detailed scenario information
 */
export const getScenarioDetails = (state: RootState) => {
  const level3 = state.level3;
  const currentScenario = level3.scenarios[level3.progress.currentScenarioIndex];
  
  if (!currentScenario) {
    return null;
  }
  
  const correctViolations = currentScenario.pieces.filter(
    p => p.category === 'violation' && p.isCorrect
  );
  const correctActions = currentScenario.pieces.filter(
    p => p.category === 'action' && p.isCorrect
  );
  
  return {
    title: currentScenario.title,
    description: currentScenario.description,
    totalPieces: currentScenario.pieces.length,
    correctViolations: correctViolations.length,
    correctActions: correctActions.length,
    placedViolations: level3.progress.placedPieces.violations.length,
    placedActions: level3.progress.placedPieces.actions.length,
    availablePieces: currentScenario.pieces.length - 
      level3.progress.placedPieces.violations.length - 
      level3.progress.placedPieces.actions.length,
    completionPercentage: Math.round(
      ((level3.progress.placedPieces.violations.length + level3.progress.placedPieces.actions.length) /
       (correctViolations.length + correctActions.length)) * 100
    ),
  };
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = (state: RootState) => {
  const level3 = state.level3;
  const results = level3.progress.scenarioResults;
  
  if (results.length === 0) {
    return {
      averageScore: 0,
      averageHealth: 0,
      averageCombo: 0,
      totalTime: level3.gameStats.timer,
      scenariosCompleted: 0,
      efficiency: 0,
    };
  }
  
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalHealth = results.reduce((sum, r) => sum + r.health, 0);
  const totalCombo = results.reduce((sum, r) => sum + r.combo, 0);
  
  return {
    averageScore: Math.round(totalScore / results.length),
    averageHealth: Math.round(totalHealth / results.length),
    averageCombo: Math.round((totalCombo / results.length) * 10) / 10,
    totalTime: level3.gameStats.timer,
    scenariosCompleted: results.length,
    efficiency: Math.round((totalScore / level3.gameStats.timer) * 100) / 100, // Score per second
  };
};

// ===== ACTION LOGGING UTILITIES =====

/**
 * Log Level 3 actions with context
 */
export const logLevel3Action = (action: any, state: RootState) => {
  if (process.env.NODE_ENV !== 'production' && action.type.startsWith('level3/')) {
    const summary = getLevel3StateSummary(state);
    
    console.group(`🎮 Level 3 Action: ${action.type}`);
    console.log('Action:', action);
    console.log('State Summary:', summary);
    
    if (action.type === 'level3/dropPiece') {
      console.log('Piece Details:', {
        piece: action.payload.piece,
        container: action.payload.containerType,
        isCorrect: action.payload.piece.isCorrect,
      });
    }
    
    console.groupEnd();
  }
};

/**
 * Log state changes with diff
 */
export const logStateChange = (prevState: RootState, nextState: RootState, action: any) => {
  if (process.env.NODE_ENV !== 'production' && action.type.startsWith('level3/')) {
    const prevSummary = getLevel3StateSummary(prevState);
    const nextSummary = getLevel3StateSummary(nextState);
    
    const changes: Record<string, any> = {};
    Object.keys(nextSummary).forEach(key => {
      if (prevSummary[key as keyof typeof prevSummary] !== nextSummary[key as keyof typeof nextSummary]) {
        changes[key] = {
          from: prevSummary[key as keyof typeof prevSummary],
          to: nextSummary[key as keyof typeof nextSummary],
        };
      }
    });
    
    if (Object.keys(changes).length > 0) {
      console.log(`📊 State Changes (${action.type}):`, changes);
    }
  }
};

// ===== VALIDATION UTILITIES =====

/**
 * Validate Level 3 state integrity
 */
export const validateLevel3State = (state: Level3State): string[] => {
  const errors: string[] = [];
  
  // Validate scenarios
  if (!state.scenarios || state.scenarios.length === 0) {
    errors.push('No scenarios loaded');
  }
  
  // Validate current scenario index
  if (state.progress.currentScenarioIndex < 0 || 
      state.progress.currentScenarioIndex >= state.scenarios.length) {
    errors.push('Invalid current scenario index');
  }
  
  // Validate game stats
  if (state.gameStats.health < 0 || state.gameStats.health > 100) {
    errors.push('Invalid health value');
  }
  
  if (state.gameStats.score < 0) {
    errors.push('Invalid score value');
  }
  
  if (state.gameStats.combo < 0) {
    errors.push('Invalid combo value');
  }
  
  if (state.gameStats.timer < 0) {
    errors.push('Invalid timer value');
  }
  
  // Validate placed pieces
  const currentScenario = state.scenarios[state.progress.currentScenarioIndex];
  if (currentScenario) {
    const correctViolations = currentScenario.pieces.filter(
      p => p.category === 'violation' && p.isCorrect
    ).length;
    const correctActions = currentScenario.pieces.filter(
      p => p.category === 'action' && p.isCorrect
    ).length;
    
    if (state.progress.placedPieces.violations.length > correctViolations) {
      errors.push('Too many violations placed');
    }
    
    if (state.progress.placedPieces.actions.length > correctActions) {
      errors.push('Too many actions placed');
    }
  }
  
  return errors;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Export state for debugging
 */
export const exportLevel3State = (state: RootState): string => {
  const exportData = {
    timestamp: new Date().toISOString(),
    summary: getLevel3StateSummary(state),
    scenarioDetails: getScenarioDetails(state),
    performanceMetrics: getPerformanceMetrics(state),
    fullState: state.level3,
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Create a debug console for Level 3
 */
export const createLevel3DebugConsole = (store: any) => {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    (window as any).level3Debug = {
      getState: () => store.getState().level3,
      getSummary: () => getLevel3StateSummary(store.getState()),
      getScenarioDetails: () => getScenarioDetails(store.getState()),
      getPerformanceMetrics: () => getPerformanceMetrics(store.getState()),
      validateState: () => validateLevel3State(store.getState().level3),
      exportState: () => exportLevel3State(store.getState()),
      resetGame: () => store.dispatch({ type: 'level3/resetGame' }),
      completeScenario: () => store.dispatch({ type: 'level3/showVictoryPopup' }),
    };
    
    console.log('🎮 Level 3 Debug Console available at window.level3Debug');
  }
};
