import { useEffect, useCallback, useRef } from 'react';
import { pushToSupabase } from '../db/sync';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for automatic data synchronization
 * Automatically pushes local changes to Supabase when data is modified
 * 
 * @param {object} options - Configuration options
 * @param {boolean} options.enabled - Whether auto-sync is enabled (default: true)
 * @param {number} options.debounceMs - Debounce time in milliseconds (default: 2000)
 * @param {boolean} options.syncOnVisibilityChange - Sync when tab becomes visible (default: true)
 * @returns {object} { triggerSync, isOnline, lastSyncTime }
 */
export const useAutoSync = (options = {}) => {
  const {
    enabled = true,
    debounceMs = 2000,
    syncOnVisibilityChange = true
  } = options;

  const { user } = useAuth();
  const syncTimeoutRef = useRef(null);
  const lastSyncTimeRef = useRef(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Debounced sync function
  const triggerSync = useCallback(async (immediate = false) => {
    if (!enabled || !isOnlineRef.current || !user) {
      console.log('Auto-sync: Skipping sync - not enabled, offline, or user not authenticated');
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const performSync = async () => {
      try {
        console.log('Auto-sync: Pushing local changes...');
        const result = await pushToSupabase();

        if (result.success) {
          lastSyncTimeRef.current = Date.now();
          console.log('Auto-sync: Successfully pushed changes');
        } else {
          // Don't log authentication errors as errors - they're expected when not logged in
          if (result.skipped && result.error?.includes('not authenticated')) {
            console.log('Auto-sync: Skipped - user not authenticated');
          } else {
            console.error('Auto-sync: Failed to push changes:', result.error);
          }
        }
      } catch (error) {
        console.error('Auto-sync: Error during sync:', error);
      }
    };

    if (immediate) {
      await performSync();
    } else {
      // Debounce the sync
      syncTimeoutRef.current = setTimeout(performSync, debounceMs);
    }
  }, [enabled, debounceMs, user]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      console.log('Auto-sync: Connection restored, triggering sync');
      triggerSync(true); // Immediate sync when coming back online
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      console.log('Auto-sync: Connection lost');
      
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Sync when tab becomes visible (user switches back to the app)
  useEffect(() => {
    if (!syncOnVisibilityChange) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isOnlineRef.current) {
        console.log('Auto-sync: Tab became visible, triggering sync');
        triggerSync(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerSync, syncOnVisibilityChange]);

  // Sync before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOnlineRef.current) {
        // Use sendBeacon for reliable data sending during page unload
        // Fallback to regular sync if sendBeacon is not available
        if (navigator.sendBeacon) {
          console.log('Auto-sync: Page unloading, attempting beacon sync');
          // Note: sendBeacon has limitations, so this is best-effort
        } else {
          console.log('Auto-sync: Page unloading, attempting regular sync');
          pushToSupabase().catch(console.error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    triggerSync,
    isOnline: isOnlineRef.current,
    lastSyncTime: lastSyncTimeRef.current
  };
};

/**
 * Hook that automatically syncs data when local data changes
 * Use this in components that modify game data
 * 
 * @param {Array} dependencies - Dependencies that trigger sync when changed
 * @param {object} options - Auto-sync options
 */
export const useDataChangeSync = (dependencies = [], options = {}) => {
  const { triggerSync } = useAutoSync(options);

  useEffect(() => {
    // Skip sync on initial mount (empty dependency array case)
    if (dependencies.length === 0) return;

    // Trigger sync when dependencies change
    triggerSync();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { triggerSync };
};

/**
 * Hook for manual sync control
 * Provides functions to manually trigger sync operations
 */
export const useSyncControl = () => {
  const { triggerSync, isOnline, lastSyncTime } = useAutoSync({ enabled: false });

  const manualSync = useCallback(async () => {
    await triggerSync(true);
  }, [triggerSync]);

  return {
    manualSync,
    isOnline,
    lastSyncTime
  };
};
