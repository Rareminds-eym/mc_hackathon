import React from 'react';
import { CheckCircle, Clock, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeviceLayout } from '../hooks/useOrientation';

interface ModuleCompleteModalProps {
  level1CompletionTime: number;
  onProceed: () => void;
}

export const ModuleCompleteModal: React.FC<ModuleCompleteModalProps> = ({
  level1CompletionTime,
  onProceed
}) => {
  const navigate = useNavigate();
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`pixel-border-thick bg-gray-800 w-full text-center relative overflow-hidden animate-slideIn ${
        isMobileHorizontal ? 'max-w-lg p-3' : 'max-w-md p-6'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with Icon - Compact for mobile horizontal */}
          <div className={`pixel-border bg-gradient-to-r from-cyan-600 to-blue-600 -mx-3 -mt-3 mb-3 ${
            isMobileHorizontal ? 'p-2' : 'p-3 mb-4 -mx-6 -mt-6'
          }`}>
            <div className={`flex items-center justify-center space-x-2 ${
              isMobileHorizontal ? 'mb-1' : 'mb-2'
            }`}>
              <div className={`bg-cyan-500 pixel-border flex items-center justify-center ${
                isMobileHorizontal ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                <Target className={`text-cyan-900 ${
                  isMobileHorizontal ? 'w-4 h-4' : 'w-5 h-5'
                }`} />
              </div>
              <h2 className={`font-black text-cyan-100 pixel-text ${
                isMobileHorizontal ? 'text-sm' : 'text-lg'
              }`}>
                LEVEL 1 COMPLETE!
              </h2>
            </div>
            {!isMobileHorizontal && (
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-cyan-100 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Time Display - Compact for mobile horizontal */}
          <div className={`pixel-border bg-gradient-to-r from-indigo-900 to-indigo-800 mb-3 ${
            isMobileHorizontal ? 'p-2' : 'p-3 mb-4'
          }`}>
            <div className={`flex items-center justify-center space-x-2 ${
              isMobileHorizontal ? 'mb-0' : 'mb-1'
            }`}>
              <div className={`bg-indigo-700 pixel-border flex items-center justify-center ${
                isMobileHorizontal ? 'w-4 h-4' : 'w-5 h-5'
              }`}>
                <Clock className={`text-indigo-300 ${
                  isMobileHorizontal ? 'w-2 h-2' : 'w-3 h-3'
                }`} />
              </div>
              <span className={`font-black text-indigo-100 pixel-text text-xs`}>
                {isMobileHorizontal ? 'TIME' : 'COMPLETION TIME'}
              </span>
            </div>
            <div className={`font-black text-indigo-100 pixel-text ${
              isMobileHorizontal ? 'text-lg' : 'text-xl'
            }`}>
              {formatTime(level1CompletionTime)}
            </div>
          </div>
          
          {/* Proceed Button - Navigate to modules page */}
          <button
            onClick={() => navigate('/modules')}
            className={`pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black pixel-text transition-all duration-200 flex items-center space-x-2 mx-auto transform hover:scale-105 shadow-lg ${
              isMobileHorizontal ? 'py-2 px-4' : 'py-3 px-6'
            }`}
          >
            <span className={isMobileHorizontal ? 'text-xs' : 'text-sm'}>
              {isMobileHorizontal ? 'MODULES' : 'RETURN TO MODULES'}
            </span>
            <ChevronRight className={isMobileHorizontal ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        </div>
        
        {/* Corner Decorations - Smaller for mobile horizontal */}
        <div className={`absolute top-2 right-2 bg-cyan-500 rounded-full animate-ping ${
          isMobileHorizontal ? 'w-1 h-1' : 'w-2 h-2'
        }`}></div>
        <div className={`absolute bottom-2 left-2 bg-green-500 rounded-full animate-ping ${
          isMobileHorizontal ? 'w-1 h-1' : 'w-2 h-2'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};