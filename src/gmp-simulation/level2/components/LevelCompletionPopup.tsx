import { CheckCircle, Sparkles } from 'lucide-react';
import React from 'react';
import PopupPortal from '../../../components/ui/PopupPortal';

interface LevelCompletionPopupProps {
  show: boolean;
  onContinue?: () => void;
  message?: string;
  isMobileHorizontal?: boolean;
}

const LevelCompletionPopup: React.FC<LevelCompletionPopupProps> = ({ show, onContinue, message, isMobileHorizontal = false }) => {
  if (!show) return null;

  return (
    <PopupPortal
      isOpen={show}
      onClose={() => {}} // No close action for completion popup
      className="bg-black bg-opacity-70 p-4"
      closeOnBackdropClick={false}
    >
      <div className={`pixel-border-thick bg-gradient-to-br from-cyan-900/90 to-blue-900/90 w-full ${
        isMobileHorizontal ? 'max-w-sm max-h-[80vh]' : 'max-w-md max-h-[90vh]'
      } text-center relative overflow-hidden animate-slideIn ${
        isMobileHorizontal ? 'p-4' : 'p-8'
      } overflow-y-auto`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        {/* Content */}
        <div className="relative z-10">
          <div className={`flex items-center justify-center space-x-2 ${
            isMobileHorizontal ? 'mb-2' : 'mb-4'
          }`}>
            <div className={`bg-cyan-400 pixel-border flex items-center justify-center ${
              isMobileHorizontal ? 'w-8 h-8' : 'w-10 h-10'
            } animate-bounce relative`}>
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-60 animate-ping"></span>
              <CheckCircle className={`text-cyan-900 ${
                isMobileHorizontal ? 'w-5 h-5' : 'w-6 h-6'
              } relative z-10`} />
            </div>
            <h2 className={`font-black text-cyan-100 pixel-text ${
              isMobileHorizontal ? 'text-lg' : 'text-xl'
            } drop-shadow`}>LEVEL COMPLETE!</h2>
          </div>
          <div className={isMobileHorizontal ? 'mb-3' : 'mb-6'}>
            <span className={`font-bold text-cyan-100 pixel-text ${
              isMobileHorizontal ? 'text-sm leading-tight' : 'text-base'
            }`}>
              {message || 'Congratulations! You have successfully completed this level.'}
            </span>
          </div>
          <div className="flex justify-center gap-4">
            {onContinue && (
              <button
                className={`pixel-border bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-cyan-900 font-black pixel-text transition-all duration-200 ${
                  isMobileHorizontal ? 'py-2 px-4' : 'py-3 px-6'
                } transform hover:scale-105 shadow-lg`}
                onClick={onContinue}
              >
                <span className={`${
                  isMobileHorizontal ? 'text-xs' : 'text-sm'
                } flex items-center gap-1`}>
                  <Sparkles className={isMobileHorizontal ? 'w-3 h-3' : 'w-4 h-4'} /> 
                  Back to Modules
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </PopupPortal>
  );
};

export default LevelCompletionPopup;
