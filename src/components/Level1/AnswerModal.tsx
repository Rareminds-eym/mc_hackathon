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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-2">
      <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md transform animate-scale-in
        ${isMobileLandscape ? 'p-2' : 'p-4 sm:p-6 md:p-8'}`}>
        <div className={`flex justify-between items-start mb-2 ${isMobileLandscape ? '' : 'mb-4'}`}>
          <div className={`flex items-center ${isMobileLandscape ? 'space-x-1' : 'space-x-2 sm:space-x-3'}`}>
            {isCorrect ? (
              <CheckCircle className={`${isMobileLandscape ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8'} text-green-500 animate-bounce`} />
            ) : (
              <XCircle className={`${isMobileLandscape ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8'} text-red-500 animate-pulse`} />
            )}
            <h3 className={`font-bold animate-slide-in ${isMobileLandscape ? 'text-base' : 'text-lg sm:text-2xl'} ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 transform duration-200 p-1"
          >
            <X className={`${isMobileLandscape ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'}`} />
          </button>
        </div>

        <div className={`space-y-2 ${isMobileLandscape ? '' : 'sm:space-y-4'}`}>
          <div className={`bg-blue-50 border-l-4 border-blue-500 rounded-r-lg transform animate-slide-in-left ${isMobileLandscape ? 'p-2' : 'p-3 sm:p-4'}`}>
            <p className={`font-medium mb-1 ${isMobileLandscape ? 'text-[10px]' : 'text-xs sm:text-sm'} text-blue-700`}>Selected Term:</p>
            <p className={`font-semibold ${isMobileLandscape ? 'text-xs' : 'text-blue-900 text-sm sm:text-base'}`}>{selectedTerm}</p>
          </div>

          <div className={`bg-gray-50 border-l-4 border-gray-400 rounded-r-lg transform animate-slide-in-right ${isMobileLandscape ? 'p-2' : 'p-3 sm:p-4'}`}>
            <p className={`font-medium mb-1 ${isMobileLandscape ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-700`}>Definition:</p>
            <p className={`leading-relaxed ${isMobileLandscape ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-800`}>{correctDefinition}</p>
          </div>

          {isCorrect ? (
            <div className={`bg-green-50 border border-green-200 rounded-lg animate-bounce-in ${isMobileLandscape ? 'p-2' : 'p-3 sm:p-4'}`}>
              <p className={`${isMobileLandscape ? 'text-xs' : 'text-green-800 text-xs sm:text-sm'}`}>
                🎉 Great job! You correctly matched the term with its definition.
              </p>
            </div>
          ) : (
            <div className={`bg-red-50 border border-red-200 rounded-lg animate-shake ${isMobileLandscape ? 'p-2' : 'p-3 sm:p-4'}`}>
              <p className={`${isMobileLandscape ? 'text-xs' : 'text-red-800 text-xs sm:text-sm'}`}>
                ❌ That's not quite right. Review the definition and try to find the correct term.
              </p>
            </div>
          )}
        </div>

        <div className={`mt-3 text-center ${isMobileLandscape ? '' : 'sm:mt-6'}`}>
          <button
            onClick={onClose}
            className={`rounded-full font-semibold transition-all duration-200 transform hover:scale-105 animate-pulse-button ${
              isMobileLandscape
                ? 'px-3 py-1 text-xs'
                : 'px-4 sm:px-6 py-2 text-sm sm:text-base'
            } ${
              isCorrect
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerModal;