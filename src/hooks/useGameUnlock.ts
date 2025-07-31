import { useState, useEffect } from 'react';
import { GameUnlockService } from '../services/gameUnlockService';

export interface UseGameUnlockReturn {
  isGameLocked: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to check if the game is locked
 * @returns UseGameUnlockReturn
 */
export const useGameUnlock = (): UseGameUnlockReturn => {
  const [isGameLocked, setIsGameLocked] = useState<boolean>(true); // Default to locked
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkGameUnlockStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isLocked = await GameUnlockService.isGameLocked();
      setIsGameLocked(isLocked);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check game unlock status';
      setError(errorMessage);
      // Default to locked on error
      setIsGameLocked(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkGameUnlockStatus();
  }, []);

  const refetch = async () => {
    await checkGameUnlockStatus();
  };

  return {
    isGameLocked,
    isLoading,
    error,
    refetch
  };
};