import React from 'react';
import { X, ArrowRight, Lightbulb, Target, CheckCircle } from 'lucide-react';

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
  if (!step || !isVisible) return null;

  const getPositionClasses = () => {
    switch (step.position) {
      case 'top':
        return 'top-16 sm:top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 animate-fade-in" />
      
      {/* Tutorial Toast */}
      <div className={`fixed ${getPositionClasses()} z-50 animate-slide-up px-4`}>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-blue-200 p-4 sm:p-6 max-w-xs sm:max-w-md w-full transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Message */}
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{step.message}</p>
            {step.highlight && (
              <div className="mt-3 p-2 sm:p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-blue-800 text-xs sm:text-sm font-medium">{step.highlight}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 sm:space-x-2">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                    index < step.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={onSkip}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-xs sm:text-sm"
              >
                Skip Tutorial
              </button>
              <button
                onClick={onNext}
                className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
              >
                <span>{step.id === 5 ? 'Start Playing!' : 'Next'}</span>
                {step.id !== 5 && <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlight Elements */}
      {step.highlight && (
        <style jsx>{`
          .tutorial-highlight {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            animation: pulse-highlight 2s infinite;
          }
          
          @keyframes pulse-highlight {
            0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5); }
          }
        `}</style>
      )}
    </>
  );
};

export default TutorialToast;