import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';


interface InstallPromptProps {
  className?: string;
  onShow?: () => void;
  onHide?: () => void;
}


export const InstallPrompt: React.FC<InstallPromptProps> = ({ className = '', onShow, onHide }) => {
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      setVisible(true);
      if (onShow) onShow();
    } else {
      setVisible(false);
      if (onHide) onHide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInstallable]);

  if (!visible) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setVisible(false);
      if (onHide) onHide();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    dismissInstallPrompt();
    if (onHide) onHide();
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
                {/*  Training Game */}
                Install Hackathon-CodeCare 2.0
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Install the app for a better experience and offline access.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
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
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
