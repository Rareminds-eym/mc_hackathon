import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

interface InstallPromptProps {
  className?: string;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ className = '' }) => {
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();

  if (!isInstallable) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App installed successfully');
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mx-auto max-w-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Install GMP Training Game
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Install the app for a better experience and offline access.
              </p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Install App
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
