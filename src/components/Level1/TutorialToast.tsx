import React from 'react';
import { X, ArrowRight, Lightbulb, Target, CheckCircle } from 'lucide-react';
import { useDeviceLayout } from '../../hooks/useOrientation';

interface TutorialStep {
  id: number;
  title: string;
  message: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'center';
  highlight?: string;
}

interface TutorialToastProps {
  step: TutorialStep | null;
  onNext: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

const TutorialToast: React.FC<TutorialToastProps> = ({ step, onNext, onSkip, isVisible }) => {
  const { isHorizontal, isMobile } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;
  if (!step || !isVisible) return null;

  // Move modal to avoid covering highlighted elements
  const getPositionClasses = () => {
    if (!step) return '';
    // Step 2: highlight instructions (top left), so show modal bottom right
    if (step.id === 2) return isMobileLandscape ? 'bottom-4 right-4 left-auto top-auto transform-none' : 'bottom-8 right-8 left-auto top-auto transform-none';
    // Step 3: highlight grid (center), so show modal left bottom
    if (step.id === 3) return isMobileLandscape ? 'bottom-4 left-4 right-auto top-auto transform-none' : 'bottom-8 left-8 right-auto top-auto transform-none';
    // Step 4: highlight menu (right), so show modal right (top right)
    if (step.id === 4) return isMobileLandscape ? 'top-4 right-4 left-auto bottom-auto transform-none' : 'top-8 right-8 left-auto bottom-auto transform-none';
    // Default: center
    switch (step.position) {
      case 'top':
        return isMobileLandscape ? 'top-8 left-1/2 transform -translate-x-1/2' : 'top-16 sm:top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return isMobileLandscape ? 'bottom-8 left-1/2 transform -translate-x-1/2' : 'bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2';
      case 'center':
      default:
        return isMobileLandscape ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Tutorial Toast */}
      <div className={`fixed ${getPositionClasses()} z-50 animate-slide-up px-2 sm:px-4`}>
        <div
          className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-blue-200 w-full transform transition-all duration-300 
            ${isMobileLandscape ? (step.id === 3 ? 'max-w-[260px] p-2' : 'max-w-[320px] p-2') : 'p-3 sm:p-6'} 
            ${!isMobileLandscape && step.id === 3 ? 'max-w-xs sm:max-w-xs' : (!isMobileLandscape ? 'max-w-xs sm:max-w-md' : '')}`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between ${isMobileLandscape ? 'mb-2' : 'mb-3 sm:mb-4'}`}>
            <div className={`flex items-center ${isMobileLandscape ? 'space-x-1' : 'space-x-2 sm:space-x-3'}`}>
              <div className={`${isMobileLandscape ? 'w-7 h-7' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center`}>
                {step.icon}
              </div>
              <h3 className={`${isMobileLandscape ? 'text-base' : 'text-base sm:text-lg'} font-bold text-gray-800`}>{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className={`text-gray-400 hover:text-gray-600 transition-colors p-1 ${isMobileLandscape ? '' : ''}`}
            >
              <X className={`${isMobileLandscape ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'}`} />
            </button>
          </div>

          {/* Message */}
          <div className={`${isMobileLandscape ? 'mb-2' : 'mb-4 sm:mb-6'}`}>
            <p className={`text-gray-700 leading-relaxed ${isMobileLandscape ? 'text-xs' : 'text-sm sm:text-base'}`}>{step.message}</p>
            {step.highlight && (
              <div className={`${isMobileLandscape ? 'mt-2 p-1' : 'mt-3 p-2 sm:p-3'} bg-blue-50 border-l-4 border-blue-400 rounded-r-lg`}>
                <p className={`text-blue-800 ${isMobileLandscape ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>{step.highlight}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className={`flex ${isMobileLandscape ? 'space-x-1' : 'space-x-1 sm:space-x-2'}`}>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${index < step.id ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <div className={`flex ${isMobileLandscape ? 'space-x-1' : 'space-x-2 sm:space-x-3'}`}>
              <button
                onClick={onSkip}
                className={`font-medium transition-colors ${isMobileLandscape ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm'} text-gray-600 hover:text-gray-800`}
              >
                Skip Tutorial
              </button>
              <button
                onClick={onNext}
                className={`flex items-center font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:from-blue-600 hover:to-blue-700 ${isMobileLandscape ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm'} space-x-1 sm:space-x-2`}
              >
                <span>{step.id === 5 ? 'Start Playing!' : 'Next'}</span>
                {step.id !== 5 && <ArrowRight className={`${isMobileLandscape ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Elements */}
      {step.highlight && (
        <style>{`
          .tutorial-highlight {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.7), 0 0 28px rgba(37, 99, 235, 0.5);
            border-radius: 4px;
            animation: pulse-highlight 2s infinite;
          }
          
          @keyframes pulse-highlight {
            0%, 100% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.6), 0 0 28px rgba(37, 99, 235, 0.5); }
            50% { box-shadow: 0 0 0 9px rgba(37, 99, 235, 0.9), 0 0 40px rgba(37, 99, 235, 0.5); }
          }
        `}</style>
      )}
    </>
  );
};

export default TutorialToast;