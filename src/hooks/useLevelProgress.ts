import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LevelProgressService, ModuleProgress, UserProgressSummary } from '../services/levelProgressService';

interface UseLevelProgressReturn {
  moduleProgress: ModuleProgress[];
  userProgressSummary: UserProgressSummary[];
  isLoading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;
  isLevelCompleted: (moduleId: number, levelId: number) => boolean;
  isLevelUnlocked: (moduleId: number, levelId: number) => boolean;
  completeLevel: (moduleId: number, levelId: number) => Promise<boolean>;
}

export const useLevelProgress = (moduleId?: number): UseLevelProgressReturn => {
  const { user } = useAuth();
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [userProgressSummary, setUserProgressSummary] = useState<UserProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProgress = useCallback(async () => {
    if (!user) {
      setModuleProgress([]);
      setUserProgressSummary([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch module progress if moduleId is provided
      if (moduleId !== undefined) {
        const { data: moduleData, error: moduleError } = await LevelProgressService.getModuleProgress(
          user.id,
          moduleId
        );

        if (moduleError) {
          throw new Error(`Failed to fetch module progress: ${moduleError.message}`);
        }

        setModuleProgress(moduleData || []);
      }

      // Fetch overall user progress summary
      const { data: summaryData, error: summaryError } = await LevelProgressService.getUserProgressSummary(
        user.id
      );

      if (summaryError) {
        throw new Error(`Failed to fetch user progress summary: ${summaryError.message}`);
      }

      setUserProgressSummary(summaryData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress data';
      setError(errorMessage);
      console.error('Error fetching progress:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleId]);

  // Load progress when component mounts or dependencies change
  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  // Helper function to check if a level is completed
  const isLevelCompleted = useCallback((checkModuleId: number, levelId: number): boolean => {
    if (checkModuleId === moduleId && moduleProgress.length > 0) {
      // Use module progress data if available for the current module
      const levelProgress = moduleProgress.find(progress => progress.level_id === levelId);
      return levelProgress?.is_completed || false;
    } else {
      // Fallback to user progress summary for other modules
      // This is a simplified check - in a real scenario, you might need more detailed data
      return false; // We don't have level-specific data in the summary
    }
  }, [moduleId, moduleProgress, userProgressSummary]);

  // Helper function to check if a level is unlocked
  const isLevelUnlocked = useCallback((checkModuleId: number, levelId: number): boolean => {
    if (checkModuleId === moduleId && moduleProgress.length > 0) {
      // Use module progress data if available for the current module
      const levelProgress = moduleProgress.find(progress => progress.level_id === levelId);
      return levelProgress?.is_unlocked || false;
    } else {
      // For other modules, assume level 1 is always unlocked
      return levelId === 1;
    }
  }, [moduleId, moduleProgress]);

  // Function to complete a level
  const completeLevel = useCallback(async (completeModuleId: number, levelId: number): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: completeError } = await LevelProgressService.completeLevel(
        user.id,
        completeModuleId,
        levelId
      );

      if (completeError) {
        throw new Error(`Failed to complete level: ${completeError.message}`);
      }

      // Refresh progress after completing a level
      await refreshProgress();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete level';
      setError(errorMessage);
      console.error('Error completing level:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProgress]);

  return {
    moduleProgress,
    userProgressSummary,
    isLoading,
    error,
    refreshProgress,
    isLevelCompleted,
    isLevelUnlocked,
    completeLevel,
  };
};
