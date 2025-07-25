import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isOffline, isUpdateAvailable, reloadApp } = usePWA();

  if (!isOffline && !isUpdateAvailable) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${className}`}>
      {isOffline && (
        <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mx-auto max-w-md">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                You're offline
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Some features may be limited. The app will sync when you're back online.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isOffline && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-3 mx-auto max-w-md">
          <div className="flex items-center space-x-3">
            <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Back online
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                All features are now available.
              </p>
            </div>
          </div>
        </div>
      )}

      {isUpdateAvailable && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mx-auto max-w-md mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Update available
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  A new version of the app is ready.
                </p>
              </div>
            </div>
            <button
              onClick={reloadApp}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
