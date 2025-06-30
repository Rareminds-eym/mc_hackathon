import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-sm sm:max-w-md w-full transform animate-scale-in">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isCorrect ? (
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 animate-bounce" />
            ) : (
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 animate-pulse" />
            )}
            <h3 className={`text-lg sm:text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'} animate-slide-in`}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors hover:rotate-90 transform duration-200 p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-r-lg transform animate-slide-in-left">
            <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Selected Term:</p>
            <p className="text-blue-900 font-semibold text-sm sm:text-base">{selectedTerm}</p>
          </div>

          <div className="bg-gray-50 border-l-4 border-gray-400 p-3 sm:p-4 rounded-r-lg transform animate-slide-in-right">
            <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">Definition:</p>
            <p className="text-gray-800 leading-relaxed text-xs sm:text-sm">{correctDefinition}</p>
          </div>

          {isCorrect ? (
            <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-lg animate-bounce-in">
              <p className="text-green-800 text-xs sm:text-sm">
                🎉 Great job! You correctly matched the term with its definition.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg animate-shake">
              <p className="text-red-800 text-xs sm:text-sm">
                ❌ That's not quite right. Review the definition and try to find the correct term.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={onClose}
            className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 animate-pulse-button text-sm sm:text-base ${
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