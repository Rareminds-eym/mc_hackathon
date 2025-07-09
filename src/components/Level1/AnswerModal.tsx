import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { useDeviceLayout } from '../../hooks/useOrientation'; // Add this import

interface AnswerModalProps {
  isVisible: boolean;
  isCorrect: boolean;
  selectedTerm: string;
  correctDefinition: string;
  onClose: () => void;
}

const AnswerModal: React.FC<AnswerModalProps> = ({ 
  isVisible, 
  isCorrect, 
  selectedTerm, 
  correctDefinition, 
  onClose 
}) => {
  const { isHorizontal, isMobile } = useDeviceLayout(); // Add this line
  const isMobileLandscape = isMobile && isHorizontal;

  useEffect(() => {
    if (!isVisible) return;
    let audio: HTMLAudioElement;
    if (isCorrect) {
      audio = new Audio('/correct.mp3');
    } else {
      audio = new Audio('/wrong.mp3');
    }
    audio.volume = 0.5;
    setTimeout(() => {
      audio.play().catch(() => {});
    }, 100);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isVisible, isCorrect]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2">
      <div className={`pixel-border-thick bg-gray-800 relative overflow-hidden w-full max-w-xs sm:max-w-md animate-scale-in ${isMobileLandscape ? 'p-2' : 'p-6 sm:p-8'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Status Icon & Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {isCorrect ? (
              <CheckCircle className="w-8 h-8 text-green-400 animate-bounce" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400 animate-pulse" />
            )}
            <h3 className={`font-black pixel-text text-lg sm:text-2xl ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>{isCorrect ? 'Correct!' : 'Incorrect!'}</h3>
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-gray-200 transition-colors hover:rotate-90 duration-200 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Selected Term & Definition */}
          <div className="mb-4 w-full">
            <div className="pixel-border bg-blue-900/80 px-3 py-2 mb-2 rounded text-blue-100 text-xs sm:text-sm font-bold pixel-text animate-slide-in-left">
              <span className="block text-blue-300">Selected Term</span>
              <span className="block text-white text-base sm:text-lg font-black pixel-text">{selectedTerm}</span>
            </div>
            <div className="pixel-border bg-gray-900/80 px-3 py-2 rounded text-gray-100 text-xs sm:text-sm font-bold pixel-text animate-slide-in-right">
              <span className="block text-gray-400">Definition</span>
              <span className="block text-white text-sm sm:text-base font-medium pixel-text">{correctDefinition}</span>
            </div>
          </div>

          {/* Feedback Message */}
          <div className={`mb-4 w-full ${isCorrect ? 'animate-bounce-in' : 'animate-shake'}`}> 
            {isCorrect ? (
              <div className="pixel-border bg-gradient-to-r from-green-600 to-green-400 px-3 py-2 rounded text-white text-xs sm:text-sm font-bold pixel-text">
                🎉 Great job! You matched the term correctly.
              </div>
            ) : (
              <div className="pixel-border bg-gradient-to-r from-red-600 to-red-400 px-3 py-2 rounded text-white text-xs sm:text-sm font-bold pixel-text">
                ❌ Not quite right. Review the definition and try again!
              </div>
            )}
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className={`w-full pixel-border-thick font-black pixel-text rounded-full transition-all duration-200 hover:scale-105 animate-pulse-button ${
              isCorrect
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            } px-4 py-2 text-sm sm:text-base`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerModal;