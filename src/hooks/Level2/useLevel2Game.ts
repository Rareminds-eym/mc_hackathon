import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Level2GameService } from '../../services/level2GameService';
import { Level2GameData, Level2GameStats, Term } from '../../types/Level2/types';
import { GameStorage } from '../../utils/Level2/gameStorage';

interface UseLevel2GameOptions {
  moduleId: string;
  gameModeId: string;
}

interface UseLevel2GameReturn {
  isLoading: boolean;
  stats: Level2GameStats | null;
  saveGameData: (gameData: {
    score: number;
    isCompleted: boolean;
    time: number;
    totalTerms: number;
    placedTerms: Term[];
  }) => Promise<boolean>;
  loadBestScore: () => Promise<Level2GameData | null>;
  markLevelCompleted: () => Promise<boolean>;
  hasCompleted: boolean;
  error: string | null;
}

export const useLevel2Game = ({ moduleId, gameModeId }: UseLevel2GameOptions): UseLevel2GameReturn => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Level2GameStats | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data when component mounts or dependencies change
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      
      try {
        // Load user stats
        const { data: statsData, error: statsError } = await Level2GameService.getGameStats(moduleId, gameModeId);
        if (statsError) {
          throw new Error('Failed to load game statistics');
        }
        setStats(statsData);

        // Check completion status
        const { data: completionData, error: completionError } = await Level2GameService.hasCompletedLevel(moduleId, gameModeId);
        if (completionError) {
          throw new Error('Failed to check completion status');
        }
        setHasCompleted(completionData);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error loading Level2 game data:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user, moduleId, gameModeId]);

  const saveGameData = useCallback(async (gameData: {
    score: number;
    isCompleted: boolean;
    time: number;
    totalTerms: number;
    placedTerms: Term[];
  }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Always save to localStorage for offline support
      GameStorage.updateScore(gameData.score, gameData.time, gameData.isCompleted);

      // Save to database if user is authenticated
      if (user) {
        const dbGameData = {
          module_id: moduleId,
          level_number: 2,
          game_mode_id: gameModeId,
          score: gameData.score,
          is_completed: gameData.isCompleted,
          time: gameData.time,
          total_terms: gameData.totalTerms,
          placed_terms: gameData.placedTerms,
        };

        const { data: savedData, error: saveError } = await Level2GameService.saveGameData(dbGameData);
        if (saveError) {
          // If it's a duplicate save prevention, don't treat it as an error
          if (saveError.message === 'Duplicate save prevented') {
            console.log('Duplicate save prevented - this is expected behavior');
          } else {
            console.error('Failed to save game data to database:', saveError);
            throw new Error('Failed to save game data to database');
          }
        } else if (savedData) {
          console.log('Game data saved successfully:', {
            id: savedData.id,
            score: savedData.score,
            isCompleted: savedData.is_completed,
            isUpdate: !!savedData.updated_at && savedData.updated_at !== savedData.created_at
          });
        }

        // Update local state
        if (gameData.isCompleted) {
          setHasCompleted(true);
        }

        // Refresh stats
        const { data: updatedStats, error: statsError } = await Level2GameService.getGameStats(moduleId, gameModeId);
        if (!statsError && updatedStats) {
          setStats(updatedStats);
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save game data';
      setError(errorMessage);
      console.error('Error saving game data:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleId, gameModeId]);

  const loadBestScore = useCallback(async (): Promise<Level2GameData | null> => {
    if (!user) return null;

    try {
      const { data, error } = await Level2GameService.getBestScore(moduleId, gameModeId);
      if (error) {
        throw new Error('Failed to load best score');
      }
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load best score';
      setError(errorMessage);
      console.error('Error loading best score:', errorMessage);
      return null;
    }
  }, [user, moduleId, gameModeId]);

  const markLevelCompleted = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await Level2GameService.markLevelCompleted(moduleId, gameModeId);
      if (error) {
        throw new Error('Failed to mark level as completed');
      }

      // Update local state
      setHasCompleted(true);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark level as completed';
      setError(errorMessage);
      console.error('Error marking level as completed:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleId, gameModeId]);

  return {
    isLoading,
    stats,
    saveGameData,
    loadBestScore,
    markLevelCompleted,
    hasCompleted,
    error,
  };
};
