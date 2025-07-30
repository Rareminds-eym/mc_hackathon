// src/store/thunks/level3Thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../types';
import {
  dropPiece,
  setFeedback,
  clearFeedback,
  showVictoryPopup,
  completeScenario,
  incrementTimer,
  resetGame as resetGameAction,
  saveGameProgress,
  loadGameProgress,
  continueGame,
  setScenarios,
} from '../slices/level3Slice';
import {
  selectIsScenarioComplete,
  selectCurrentScenarioIndex,
  selectScenarios,
  selectGameStats,
  selectScenarioResults,
} from '../selectors/level3Selectors';
import type { PuzzlePiece, ScenarioResult } from '../../data/level3Scenarios';
import { GAME_CONSTANTS } from '../types/level3Types';

// ===== GAME LOGIC THUNKS =====

/**
 * Handle piece drop with validation and side effects
 */
export const handlePieceDrop = createAsyncThunk(
  'level3/handlePieceDrop',
  async (
    { containerType, piece }: { containerType: 'violations' | 'actions'; piece: PuzzlePiece },
    { dispatch, getState }
  ) => {
    // Dispatch the drop action
    dispatch(dropPiece({ containerType, piece }));

    // Auto-clear feedback after delay
    setTimeout(() => {
      dispatch(clearFeedback());
    }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

    // Check for scenario completion after a short delay
    setTimeout(() => {
      const state = getState() as RootState;
      if (selectIsScenarioComplete(state)) {
        dispatch(showVictoryPopup());
      }
    }, 400);

    return { success: true };
  }
);

/**
 * Handle victory popup close and scenario progression
 */
export const handleVictoryClose = createAsyncThunk(
  'level3/handleVictoryClose',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const gameStats = selectGameStats(state);
    const currentScenarioIndex = selectCurrentScenarioIndex(state);
    const scenarios = selectScenarios(state);

    // Create scenario result
    const scenarioResult: ScenarioResult = {
      score: gameStats.score,
      combo: gameStats.combo,
      health: gameStats.health,
      scenarioIndex: currentScenarioIndex,
      timeSpent: gameStats.timer,
    };

    const isLastScenario = currentScenarioIndex >= scenarios.length - 1;

    // Complete the scenario
    dispatch(completeScenario({ scenarioResult, isLastScenario }));

    return { scenarioResult, isLastScenario };
  }
);

/**
 * Start the game timer
 */
export const startGameTimer = createAsyncThunk(
  'level3/startGameTimer',
  async (_, { dispatch }) => {
    const interval = setInterval(() => {
      dispatch(incrementTimer());
    }, GAME_CONSTANTS.TIMER_INTERVAL);

    return interval;
  }
);

/**
 * Stop the game timer
 */
export const stopGameTimer = createAsyncThunk(
  'level3/stopGameTimer',
  async (intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId);
    return true;
  }
);

/**
 * Set feedback with auto-clear
 */
export const setFeedbackWithAutoClear = createAsyncThunk(
  'level3/setFeedbackWithAutoClear',
  async (message: string, { dispatch }) => {
    dispatch(setFeedback({ message }));
    
    setTimeout(() => {
      dispatch(clearFeedback());
    }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);

    return message;
  }
);

/**
 * Reset the entire game state
 */
export const resetGame = createAsyncThunk(
  'level3/resetGame',
  async (_, { dispatch }) => {
    dispatch(resetGameAction());
    return true;
  }
);

// ===== GAME COMPLETION THUNKS =====

/**
 * Save game completion data
 */
export const saveGameCompletion = createAsyncThunk(
  'level3/saveGameCompletion',
  async (
    {
      moduleId,
      scenarioIndex,
      finalScore,
      totalTime,
      placedPieces,
      isCompleted,
    }: {
      moduleId: string;
      scenarioIndex: number;
      finalScore: number;
      totalTime: number;
      placedPieces: any;
      isCompleted: boolean;
    },
    { getState }
  ) => {
    try {
      // This would integrate with your existing level3Service
      // For now, we'll just return a mock response
      console.log('Saving game completion:', {
        moduleId,
        scenarioIndex,
        finalScore,
        totalTime,
        placedPieces,
        isCompleted,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        isNewHighScore: false, // This would be determined by the service
        savedData: {
          moduleId,
          scenarioIndex,
          finalScore,
          totalTime,
          isCompleted,
        },
      };
    } catch (error) {
      console.error('Failed to save game completion:', error);
      throw error;
    }
  }
);

/**
 * Load game progress
 */
export const loadGameProgress = createAsyncThunk(
  'level3/loadGameProgress',
  async ({ moduleId, userId }: { moduleId: string; userId: string }) => {
    try {
      // This would integrate with your existing level3Service
      console.log('Loading game progress for:', { moduleId, userId });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock data - in real implementation, this would come from the service
      return {
        success: true,
        progress: null, // No saved progress
      };
    } catch (error) {
      console.error('Failed to load game progress:', error);
      throw error;
    }
  }
);

// ===== SCENARIO MANAGEMENT THUNKS =====

/**
 * Load scenarios for a specific module
 */
export const loadScenariosForModule = createAsyncThunk(
  'level3/loadScenariosForModule',
  async (moduleId: number, { dispatch }) => {
    try {
      // Import the scenarios function
      const { getLevel3ScenariosByModule } = await import('../../data/level3Scenarios');
      
      const scenarios = getLevel3ScenariosByModule(moduleId);
      
      // This would be handled by the setScenarios action in the slice
      // but we can also do additional processing here if needed
      
      return {
        success: true,
        scenarios,
        moduleId,
      };
    } catch (error) {
      console.error('Failed to load scenarios for module:', moduleId, error);
      throw error;
    }
  }
);

// ===== UTILITY THUNKS =====

/**
 * Initialize game for a specific module
 */
export const initializeGame = createAsyncThunk(
  'level3/initializeGame',
  async (moduleId: number, { dispatch }) => {
    try {
      // Reset game state
      dispatch(resetGameAction());
      
      // Load scenarios for the module
      const scenariosResult = await dispatch(loadScenariosForModule(moduleId));
      
      if (scenariosResult.meta.requestStatus === 'fulfilled') {
        // Start the timer
        const timerResult = await dispatch(startGameTimer());
        
        return {
          success: true,
          moduleId,
          timerInterval: timerResult.payload,
        };
      } else {
        throw new Error('Failed to load scenarios');
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }
);

/**
 * Complete the entire game
 */
export const completeGame = createAsyncThunk(
  'level3/completeGame',
  async (
    { moduleId, userId }: { moduleId: string; userId: string },
    { dispatch, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const scenarioResults = selectScenarioResults(state);
      const gameStats = selectGameStats(state);

      // Calculate final statistics
      const totalScore = scenarioResults.reduce((sum, result) => sum + result.score, 0);
      const totalCombo = scenarioResults.reduce((sum, result) => sum + result.combo, 0);
      const avgHealth = scenarioResults.reduce((sum, result) => sum + result.health, 0) / scenarioResults.length;

      // Calculate final score using weighted formula
      const maxPossibleScore = scenarioResults.length * 100;
      const maxPossibleCombo = scenarioResults.length * 5;
      const maxHealth = 100;

      const scorePart = Math.round((totalScore / maxPossibleScore) * GAME_CONSTANTS.SCORE_WEIGHTS.SCORE_PERCENTAGE);
      const comboPart = Math.round((totalCombo / maxPossibleCombo) * GAME_CONSTANTS.SCORE_WEIGHTS.COMBO_PERCENTAGE);
      const healthPart = Math.round((avgHealth / maxHealth) * GAME_CONSTANTS.SCORE_WEIGHTS.HEALTH_PERCENTAGE);

      const finalScore = Math.min(scorePart + comboPart + healthPart, 100);

      // Save game completion
      const saveResult = await dispatch(saveGameCompletion({
        moduleId,
        scenarioIndex: scenarioResults.length - 1,
        finalScore,
        totalTime: gameStats.timer,
        placedPieces: {
          scenarioResults,
          overallStats: {
            totalScore,
            totalCombo,
            avgHealth,
            totalTime: gameStats.timer,
            scenarioCount: scenarioResults.length,
            finalScore,
          },
        },
        isCompleted: true,
      }));

      return {
        success: true,
        finalScore,
        saveResult: saveResult.payload,
      };
    } catch (error) {
      console.error('Failed to complete game:', error);
      throw error;
    }
  }
);

// ===== PROGRESS PERSISTENCE THUNKS =====

/**
 * Save current game progress to localStorage and optionally to server
 */
export const persistGameProgress = createAsyncThunk(
  'level3/persistGameProgress',
  async (
    {
      moduleId,
      userId,
      saveToServer = false
    }: {
      moduleId: string;
      userId: string;
      saveToServer?: boolean;
    },
    { getState, dispatch }
  ) => {
    try {
      const state = getState() as RootState;
      const level3State = state.level3;

      // Create progress snapshot
      const progressData = {
        moduleId,
        userId,
        timestamp: Date.now(),
        gameStats: level3State.gameStats,
        progress: level3State.progress,
        ui: {
          showScenario: level3State.ui.showScenario,
          feedback: level3State.ui.feedback,
          isComplete: level3State.ui.isComplete,
        },
        scenarios: level3State.scenarios,
        version: '1.0.0', // For future compatibility
      };

      // Save to localStorage
      const storageKey = `level3_progress_${moduleId}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(progressData));

      // Update Redux state with save timestamp
      dispatch(saveGameProgress({
        moduleId,
        userId,
        timestamp: progressData.timestamp,
      }));

      // Optionally save to server
      if (saveToServer) {
        // This would integrate with your existing level3Service
        console.log('Saving progress to server:', progressData);
        // await level3Service.saveProgress(progressData);
      }

      return {
        success: true,
        timestamp: progressData.timestamp,
        savedToServer: saveToServer,
      };
    } catch (error) {
      console.error('Failed to persist game progress:', error);
      throw error;
    }
  }
);

/**
 * Load game progress from localStorage or server
 */
export const restoreGameProgress = createAsyncThunk(
  'level3/restoreGameProgress',
  async (
    {
      moduleId,
      userId,
      loadFromServer = false
    }: {
      moduleId: string;
      userId: string;
      loadFromServer?: boolean;
    },
    { dispatch }
  ) => {
    try {
      let progressData = null;

      // Try to load from server first if requested
      if (loadFromServer) {
        // This would integrate with your existing level3Service
        console.log('Loading progress from server for:', { moduleId, userId });
        // progressData = await level3Service.loadProgress(moduleId, userId);
      }

      // Fallback to localStorage if server load failed or not requested
      if (!progressData) {
        const storageKey = `level3_progress_${moduleId}_${userId}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
          progressData = JSON.parse(savedData);
        }
      }

      if (!progressData) {
        return {
          success: false,
          message: 'No saved progress found',
        };
      }

      // Validate progress data
      const isValid = validateProgressData(progressData, moduleId, userId);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid progress data',
        };
      }

      // Load scenarios for the module
      if (progressData.scenarios) {
        dispatch(setScenarios(progressData.scenarios));
      } else {
        // Load scenarios from data if not in saved progress
        const { getLevel3ScenariosByModule } = await import('../../data/level3Scenarios');
        const scenarios = getLevel3ScenariosByModule(parseInt(moduleId));
        dispatch(setScenarios(scenarios));
      }

      // Restore the game state
      dispatch(loadGameProgress({
        gameStats: progressData.gameStats,
        progress: progressData.progress,
        ui: progressData.ui,
      }));

      return {
        success: true,
        timestamp: progressData.timestamp,
        loadedFromServer: loadFromServer,
        progressData,
      };
    } catch (error) {
      console.error('Failed to restore game progress:', error);
      throw error;
    }
  }
);

/**
 * Continue game from a specific scenario
 */
export const continueFromScenario = createAsyncThunk(
  'level3/continueFromScenario',
  async (
    {
      scenarioIndex,
      preserveStats = true,
      moduleId,
      userId,
    }: {
      scenarioIndex: number;
      preserveStats?: boolean;
      moduleId: string;
      userId: string;
    },
    { dispatch }
  ) => {
    try {
      // Continue the game from the specified scenario
      dispatch(continueGame({
        fromScenarioIndex: scenarioIndex,
        preserveStats,
      }));

      // Save the continuation state
      await dispatch(persistGameProgress({
        moduleId,
        userId,
        saveToServer: false,
      }));

      return {
        success: true,
        scenarioIndex,
        preserveStats,
      };
    } catch (error) {
      console.error('Failed to continue from scenario:', error);
      throw error;
    }
  }
);

/**
 * Clear saved progress
 */
export const clearSavedProgress = createAsyncThunk(
  'level3/clearSavedProgress',
  async (
    {
      moduleId,
      userId,
      clearFromServer = false
    }: {
      moduleId: string;
      userId: string;
      clearFromServer?: boolean;
    }
  ) => {
    try {
      // Clear from localStorage
      const storageKey = `level3_progress_${moduleId}_${userId}`;
      localStorage.removeItem(storageKey);

      // Optionally clear from server
      if (clearFromServer) {
        console.log('Clearing progress from server:', { moduleId, userId });
        // await level3Service.clearProgress(moduleId, userId);
      }

      return {
        success: true,
        clearedFromServer: clearFromServer,
      };
    } catch (error) {
      console.error('Failed to clear saved progress:', error);
      throw error;
    }
  }
);

// Cache for progress checks to prevent excessive localStorage reads
const progressCheckCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

/**
 * Check if saved progress exists
 */
export const checkSavedProgress = createAsyncThunk(
  'level3/checkSavedProgress',
  async ({ moduleId, userId }: { moduleId: string; userId: string }) => {
    try {
      const cacheKey = `${moduleId}_${userId}`;
      const now = Date.now();

      // Check cache first
      const cached = progressCheckCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
      }

      const storageKey = `level3_progress_${moduleId}_${userId}`;
      const savedData = localStorage.getItem(storageKey);

      if (!savedData) {
        const result = { hasProgress: false };
        progressCheckCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }

      const progressData = JSON.parse(savedData);
      const isValid = validateProgressData(progressData, moduleId, userId);

      if (!isValid) {
        // Clean up invalid data
        localStorage.removeItem(storageKey);
        const result = { hasProgress: false };
        progressCheckCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }

      const result = {
        hasProgress: true,
        timestamp: progressData.timestamp,
        currentScenario: progressData.progress.currentScenarioIndex + 1,
        totalScenarios: progressData.scenarios?.length || 0,
        completedScenarios: progressData.progress.scenarioResults.length,
        gameStats: progressData.gameStats,
      };

      // Cache the result
      progressCheckCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    } catch (error) {
      console.error('Failed to check saved progress:', error);
      return { hasProgress: false };
    }
  }
);

// ===== UTILITY FUNCTIONS =====

/**
 * Validate progress data structure
 */
function validateProgressData(data: any, expectedModuleId: string, expectedUserId: string): boolean {
  if (!data || typeof data !== 'object') return false;

  // Check required fields
  if (data.moduleId !== expectedModuleId) return false;
  if (data.userId !== expectedUserId) return false;
  if (!data.timestamp || typeof data.timestamp !== 'number') return false;
  if (!data.gameStats || typeof data.gameStats !== 'object') return false;
  if (!data.progress || typeof data.progress !== 'object') return false;

  // Check gameStats structure
  const { gameStats } = data;
  if (typeof gameStats.score !== 'number') return false;
  if (typeof gameStats.health !== 'number') return false;
  if (typeof gameStats.combo !== 'number') return false;
  if (typeof gameStats.timer !== 'number') return false;

  // Check progress structure
  const { progress } = data;
  if (typeof progress.currentScenarioIndex !== 'number') return false;
  if (!Array.isArray(progress.scenarioResults)) return false;
  if (!progress.placedPieces || typeof progress.placedPieces !== 'object') return false;
  if (typeof progress.isGameComplete !== 'boolean') return false;

  // Check if progress is recent (within 7 days)
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  if (data.timestamp < weekAgo) return false;

  return true;
}
