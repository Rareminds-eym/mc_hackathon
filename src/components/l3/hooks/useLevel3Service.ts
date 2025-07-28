import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Level3Service, { Level3CompletionData } from '../services/level3Service';

/**
 * Custom hook for Level 3 database operations
 * 
 * Provides easy-to-use methods for saving game data and retrieving statistics
 * with proper error handling and loading states.
 */
export const useLevel3Service = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save game completion data to the database
   */
  const saveGameCompletion = useCallback(async (
    module: string,
    scenarioIndex: number,
    finalScore: number,
    finalTime: number,
    placedPieces: any,
    isCompleted: boolean = true
  ) => {
    if (!user) {
      console.error('🚫 useLevel3Service: User not authenticated');
      setError('User not authenticated');
      return { success: false, isNewHighScore: false };
    }

    if (!user.id) {
      console.error('🚫 useLevel3Service: User ID missing');
      setError('User ID missing');
      return { success: false, isNewHighScore: false };
    }

    console.log('👤 useLevel3Service: User authenticated:', {
      userId: user.id,
      email: user.email
    });

    setLoading(true);
    setError(null);

    // Validate session before proceeding
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.warn('⚠️ useLevel3Service: Session validation failed, attempting refresh...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error(`Session refresh failed: ${refreshError.message}`);
        }
      }
    } catch (sessionErr) {
      console.error('🚫 useLevel3Service: Session validation error:', sessionErr);
      setError('Authentication session expired. Please log in again.');
      setLoading(false);
      return { success: false, isNewHighScore: false };
    }

    try {
      const completionData: Level3CompletionData = {
        userId: user.id,
        module,
        level: 3,
        scenario_index: scenarioIndex,
        finalScore,
        finalTime,
        placedPieces,
        isCompleted
      };

      const result = await Level3Service.saveGameCompletion(completionData);

      if (result.error) {
        setError(result.error.message);
        return { success: false, isNewHighScore: false };
      }

      console.log('Game completion saved successfully:', {
        module,
        scenarioIndex,
        finalScore,
        finalTime,
        isNewHighScore: result.isNewHighScore
      });

      return { 
        success: true, 
        isNewHighScore: result.isNewHighScore,
        data: result.data
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving game completion:', err);
      return { success: false, isNewHighScore: false };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get user's best score for a scenario
   */
  const getBestScore = useCallback(async (module: string, scenarioIndex: number) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Level3Service.getBestScore(module, scenarioIndex);

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching best score:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get user's game statistics
   */
  const getGameStats = useCallback(async (module?: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Level3Service.getGameStats(module);

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching game stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get score history for a scenario
   */
  const getScoreHistory = useCallback(async (module: string, scenarioIndex: number) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Level3Service.getPastThreeAttempts(module, scenarioIndex);

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching score history:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Check if a scenario is completed
   */
  const isScenarioCompleted = useCallback(async (module: string, scenarioIndex: number) => {
    if (!user) return false;

    try {
      return await Level3Service.isScenarioCompleted(module, scenarioIndex);
    } catch (err) {
      console.error('Error checking completion status:', err);
      return false;
    }
  }, [user]);

  /**
   * Get top 3 best scores for a module (for final statistics display)
   */
  const getTopThreeBestScores = useCallback(async (module: string) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Level3Service.getTopThreeBestScores(module);

      if (result.error) {
        setError(result.error.message);
        return null;
      }

      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching top scores:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Test database connection
   */
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await Level3Service.testDatabaseConnection();

      if (!result.success) {
        setError(result.error?.message || 'Database connection failed');
        return false;
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error testing database connection:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    user,

    // Methods
    saveGameCompletion,
    getBestScore,
    getGameStats,
    getScoreHistory,
    getTopThreeBestScores,
    isScenarioCompleted,
    testConnection,

    // Utility
    clearError: () => setError(null)
  };
};

export default useLevel3Service;
