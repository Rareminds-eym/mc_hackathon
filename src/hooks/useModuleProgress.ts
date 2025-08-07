import { useState, useEffect, useCallback } from 'react';
import { ModuleProgressService } from '../services/moduleProgressService';
import type { Module } from '../types/module';

interface UseModuleProgressReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
  refreshModules: () => Promise<void>;
  selectModule: (moduleId: number) => Promise<{ success: boolean; error?: any }>;
  initializeModules: () => Promise<{ success: boolean; error?: any }>;
  resetProgress: () => Promise<{ success: boolean; error?: any }>;
}

export function useModuleProgress(userId: string | null): UseModuleProgressReturn {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshModules = useCallback(async () => {
    if (!userId) {
      setModules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure user modules are initialized
      await ModuleProgressService.ensureUserModulesInitialized(userId);

      // Get modules formatted for UI
      const { data, error: moduleError } = await ModuleProgressService.getModulesForUI(userId);

      if (moduleError) {
        console.error('Error fetching modules:', moduleError);
        setError(moduleError.message || 'Failed to load modules');
        return;
      }

      setModules(data || []);
    } catch (err) {
      console.error('Error in refreshModules:', err);
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const selectModule = useCallback(async (moduleId: number): Promise<{ success: boolean; error?: any }> => {
    if (!userId) {
      return { success: false, error: { message: 'User not authenticated' } };
    }

    try {
      const { data, error: selectError } = await ModuleProgressService.selectModule(userId, moduleId);

      if (selectError) {
        console.error('Error selecting module:', selectError);
        return { success: false, error: selectError };
      }

      // Refresh modules to reflect any changes
      await refreshModules();

      return { success: true };
    } catch (err) {
      console.error('Error in selectModule:', err);
      return { success: false, error: err };
    }
  }, [userId, refreshModules]);

  const initializeModules = useCallback(async (): Promise<{ success: boolean; error?: any }> => {
    if (!userId) {
      return { success: false, error: { message: 'User not authenticated' } };
    }

    try {
      const { data, error: initError } = await ModuleProgressService.initializeUserModules(userId);

      if (initError) {
        console.error('Error initializing modules:', initError);
        return { success: false, error: initError };
      }

      // Refresh modules to reflect the initialization
      await refreshModules();

      return { success: true };
    } catch (err) {
      console.error('Error in initializeModules:', err);
      return { success: false, error: err };
    }
  }, [userId, refreshModules]);

  const resetProgress = useCallback(async (): Promise<{ success: boolean; error?: any }> => {
    if (!userId) {
      return { success: false, error: { message: 'User not authenticated' } };
    }

    try {
      const { data, error: resetError } = await ModuleProgressService.resetUserModuleProgress(userId);

      if (resetError) {
        console.error('Error resetting progress:', resetError);
        return { success: false, error: resetError };
      }

      // Refresh modules to reflect the reset
      await refreshModules();

      return { success: true };
    } catch (err) {
      console.error('Error in resetProgress:', err);
      return { success: false, error: err };
    }
  }, [userId, refreshModules]);

  // Load modules when userId changes
  useEffect(() => {
    refreshModules();
  }, [refreshModules]);

  return {
    modules,
    loading,
    error,
    refreshModules,
    selectModule,
    initializeModules,
    resetProgress
  };
}

// Additional hook for checking individual module status
export function useModuleStatus(userId: string | null, moduleId: number) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkModuleStatus = useCallback(async () => {
    if (!userId) {
      setIsUnlocked(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: statusError } = await ModuleProgressService.isModuleUnlocked(userId, moduleId);

      if (statusError) {
        console.error('Error checking module status:', statusError);
        setError(statusError.message || 'Failed to check module status');
        return;
      }

      setIsUnlocked(data);
    } catch (err) {
      console.error('Error in checkModuleStatus:', err);
      setError('Failed to check module status');
    } finally {
      setLoading(false);
    }
  }, [userId, moduleId]);

  useEffect(() => {
    checkModuleStatus();
  }, [checkModuleStatus]);

  return {
    isUnlocked,
    loading,
    error,
    refresh: checkModuleStatus
  };
}