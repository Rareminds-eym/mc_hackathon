// src/store/hooks/useLevel3Persistence.ts

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  persistGameProgress,
  restoreGameProgress,
  continueFromScenario,
  clearSavedProgress,
  checkSavedProgress,
} from '../thunks/level3Thunks';
import { selectCurrentScenarioIndex, selectGameStats, selectProgress } from '../selectors/level3Selectors';

interface SavedProgressInfo {
  hasProgress: boolean;
  timestamp?: number;
  currentScenario?: number;
  totalScenarios?: number;
  completedScenarios?: number;
  gameStats?: any;
}

/**
 * Custom hook for managing Level 3 game progress persistence
 */
export const useLevel3Persistence = (moduleId: string, userId: string) => {
  const dispatch = useAppDispatch();
  const [savedProgressInfo, setSavedProgressInfo] = useState<SavedProgressInfo>({ hasProgress: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux selectors
  const currentScenarioIndex = useAppSelector(selectCurrentScenarioIndex);
  const gameStats = useAppSelector(selectGameStats);
  const progress = useAppSelector(selectProgress);

  // ===== PROGRESS CHECKING =====

  /**
   * Check if saved progress exists
   */
  const checkForSavedProgress = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isLoading) return savedProgressInfo;

    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(checkSavedProgress({ moduleId, userId }));

      if (result.meta.requestStatus === 'fulfilled') {
        const progressInfo = result.payload as SavedProgressInfo;
        setSavedProgressInfo(progressInfo);
        return progressInfo;
      } else {
        const noProgress = { hasProgress: false };
        setSavedProgressInfo(noProgress);
        return noProgress;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check saved progress';
      setError(errorMessage);
      const noProgress = { hasProgress: false };
      setSavedProgressInfo(noProgress);
      return noProgress;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId, isLoading, savedProgressInfo]);

  // ===== PROGRESS SAVING =====

  /**
   * Save current game progress
   */
  const saveProgress = useCallback(async (saveToServer = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dispatch(persistGameProgress({
        moduleId,
        userId,
        saveToServer,
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        // Update saved progress info
        await checkForSavedProgress();
        return result.payload;
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId, checkForSavedProgress]);

  /**
   * Save progress manually (called by user action or component)
   */
  const saveProgressManually = useCallback(async (saveToServer = false) => {
    // Only save if there's meaningful progress
    if (progress.scenarioResults.length === 0 &&
        progress.placedPieces.violations.length === 0 &&
        progress.placedPieces.actions.length === 0) {
      return { success: false, message: 'No progress to save' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await dispatch(persistGameProgress({
        moduleId,
        userId,
        saveToServer,
      }));

      if (result.meta.requestStatus === 'fulfilled') {
        // Update saved progress info
        await checkForSavedProgress();
        return result.payload;
      } else {
        throw new Error('Failed to save progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId, progress, checkForSavedProgress]);

  /**
   * Auto-save is now handled by Redux middleware
   * This function is kept for backward compatibility but does nothing
   */
  const enableAutoSave = useCallback(() => {
    console.log('Auto-save is now handled by Redux middleware on user interactions');
    return () => {}; // Return empty cleanup function
  }, []);

  // ===== PROGRESS LOADING =====

  /**
   * Load saved game progress
   */
  const loadProgress = useCallback(async (loadFromServer = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dispatch(restoreGameProgress({
        moduleId,
        userId,
        loadFromServer,
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        const payload = result.payload as any;
        if (payload.success) {
          return payload;
        } else {
          throw new Error(payload.message || 'Failed to load progress');
        }
      } else {
        throw new Error('Failed to load progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load progress';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId]);

  // ===== PROGRESS CONTINUATION =====

  /**
   * Continue game from a specific scenario
   */
  const continueFromSpecificScenario = useCallback(async (
    scenarioIndex: number, 
    preserveStats = true
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dispatch(continueFromScenario({
        scenarioIndex,
        preserveStats,
        moduleId,
        userId,
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        return result.payload;
      } else {
        throw new Error('Failed to continue from scenario');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to continue from scenario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId]);

  // ===== PROGRESS CLEARING =====

  /**
   * Clear saved progress
   */
  const clearProgress = useCallback(async (clearFromServer = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dispatch(clearSavedProgress({
        moduleId,
        userId,
        clearFromServer,
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        setSavedProgressInfo({ hasProgress: false });
        return result.payload;
      } else {
        throw new Error('Failed to clear progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear progress';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, moduleId, userId]);

  // ===== EFFECTS =====

  /**
   * Check for saved progress on mount
   */
  useEffect(() => {
    checkForSavedProgress();
  }, [checkForSavedProgress]);

  // ===== UTILITY FUNCTIONS =====

  /**
   * Get formatted progress summary
   */
  const getProgressSummary = useCallback(() => {
    if (!savedProgressInfo.hasProgress) {
      return null;
    }

    const timeSaved = savedProgressInfo.timestamp ? new Date(savedProgressInfo.timestamp) : null;
    const timeAgo = timeSaved ? getTimeAgo(timeSaved) : 'Unknown';

    return {
      currentScenario: savedProgressInfo.currentScenario || 1,
      totalScenarios: savedProgressInfo.totalScenarios || 0,
      completedScenarios: savedProgressInfo.completedScenarios || 0,
      progressPercentage: savedProgressInfo.totalScenarios 
        ? Math.round(((savedProgressInfo.completedScenarios || 0) / savedProgressInfo.totalScenarios) * 100)
        : 0,
      timeSaved: timeSaved?.toLocaleString() || 'Unknown',
      timeAgo,
      gameStats: savedProgressInfo.gameStats,
    };
  }, [savedProgressInfo]);

  /**
   * Check if current progress is different from saved progress (memoized)
   */
  const hasUnsavedChanges = useMemo(() => {
    if (!savedProgressInfo.hasProgress) {
      return progress.scenarioResults.length > 0 ||
             progress.placedPieces.violations.length > 0 ||
             progress.placedPieces.actions.length > 0;
    }

    // Compare current state with saved state
    return currentScenarioIndex !== (savedProgressInfo.currentScenario || 1) - 1 ||
           progress.scenarioResults.length !== (savedProgressInfo.completedScenarios || 0);
  }, [savedProgressInfo.hasProgress, savedProgressInfo.currentScenario, savedProgressInfo.completedScenarios,
      currentScenarioIndex, progress.scenarioResults.length, progress.placedPieces.violations.length, progress.placedPieces.actions.length]);

  // ===== RETURN INTERFACE =====

  return useMemo(() => ({
    // State
    savedProgressInfo,
    isLoading,
    error,
    hasUnsavedChanges,

    // Actions
    checkForSavedProgress,
    saveProgress,
    saveProgressManually,
    loadProgress,
    continueFromSpecificScenario,
    clearProgress,
    enableAutoSave, // Deprecated - now handled by middleware

    // Utilities
    getProgressSummary,

    // Computed values
    hasSavedProgress: savedProgressInfo.hasProgress,
    canContinue: savedProgressInfo.hasProgress && (savedProgressInfo.currentScenario || 0) > 1,
  }), [
    savedProgressInfo,
    isLoading,
    error,
    hasUnsavedChanges,
    checkForSavedProgress,
    saveProgress,
    saveProgressManually,
    loadProgress,
    continueFromSpecificScenario,
    clearProgress,
    enableAutoSave,
    getProgressSummary,
  ]);
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get human-readable time ago string
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return date.toLocaleDateString();
}
