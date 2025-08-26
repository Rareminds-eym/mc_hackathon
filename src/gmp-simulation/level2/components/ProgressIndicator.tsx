import React from 'react';
import { CheckCircle, Save, AlertCircle, RotateCcw } from 'lucide-react';

interface ProgressIndicatorProps {
  hasExistingProgress: boolean;
  isLoading: boolean;
  error: string | null;
  progressPercentage: number;
  onLoadProgress?: () => void;
  onResetProgress?: () => void;
  isMobileHorizontal?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  hasExistingProgress,
  isLoading,
  error,
  progressPercentage,
  onLoadProgress,
  onResetProgress,
  isMobileHorizontal = false
}) => {
  const iconSize = isMobileHorizontal ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = isMobileHorizontal ? 'text-xs' : 'text-sm';
  const padding = isMobileHorizontal ? 'p-2' : 'p-3';

  return (
    <div className={`${padding} bg-gray-900/80 backdrop-blur-sm rounded-lg border border-cyan-500/30`}>
      <div className="flex items-center justify-between gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent" />
              <span className={`text-cyan-400 ${textSize}`}>
                {isMobileHorizontal ? 'Saving...' : 'Saving progress...'}
              </span>
            </>
          ) : error ? (
            <>
              <AlertCircle className={`text-red-400 ${iconSize}`} />
              <span className={`text-red-400 ${textSize}`}>
                {isMobileHorizontal ? 'Error' : `Error: ${error}`}
              </span>
            </>
          ) : hasExistingProgress ? (
            <>
              <CheckCircle className={`text-green-400 ${iconSize}`} />
              <span className={`text-green-400 ${textSize}`}>
                {isMobileHorizontal ? 'Saved' : 'Progress saved'}
              </span>
            </>
          ) : (
            <>
              <Save className={`text-gray-400 ${iconSize}`} />
              <span className={`text-gray-400 ${textSize}`}>
                {isMobileHorizontal ? 'New' : 'New session'}
              </span>
            </>
          )}
        </div>

        {/* Progress Percentage */}
        {hasExistingProgress && (
          <div className="flex items-center gap-2">
            <div className={`text-cyan-400 font-semibold ${textSize}`}>
              {Math.round(progressPercentage)}%
            </div>
            {!isMobileHorizontal && (
              <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {hasExistingProgress && onLoadProgress && (
            <button
              onClick={onLoadProgress}
              disabled={isLoading}
              className={`
                ${padding} rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 
                border border-cyan-500/50 text-cyan-400 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${textSize}
              `}
              title="Reload saved progress"
            >
              {isMobileHorizontal ? 'Load' : 'Load Progress'}
            </button>
          )}
          
          {hasExistingProgress && onResetProgress && (
            <button
              onClick={onResetProgress}
              disabled={isLoading}
              className={`
                ${padding} rounded-lg bg-red-600/20 hover:bg-red-600/30 
                border border-red-500/50 text-red-400 transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${textSize} flex items-center gap-1
              `}
              title="Reset all progress"
            >
              <RotateCcw className={iconSize} />
              {!isMobileHorizontal && 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      {isMobileHorizontal && hasExistingProgress && (
        <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Error Details */}
      {error && !isMobileHorizontal && (
        <div className="mt-2 text-xs text-red-300 bg-red-900/20 rounded p-2 border border-red-500/30">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
