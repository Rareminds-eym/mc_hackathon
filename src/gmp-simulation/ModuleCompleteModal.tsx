import React from 'react';
import { CheckCircle, Clock, ChevronRight, Target, ExternalLink } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`pixel-border-thick bg-gray-800 w-full text-center relative overflow-hidden animate-slideIn ${
        isMobileHorizontal ? 'max-w-lg max-h-[85vh] p-3' : 'max-w-md max-h-[90vh] p-6'
      } overflow-y-auto`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header with Icon - Compact for mobile horizontal */}
          <div className={`pixel-border bg-gradient-to-r from-green-600 to-green-500 -mx-3 -mt-3 mb-3 ${
            isMobileHorizontal ? 'p-2' : 'p-3 mb-4 -mx-6 -mt-6'
          }`}>
            <div className={`flex items-center justify-center space-x-2 ${
              isMobileHorizontal ? 'mb-1' : 'mb-2'
            }`}>
              <div className={`bg-green-400 pixel-border flex items-center justify-center ${
                isMobileHorizontal ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                <CheckCircle className={`text-green-900 ${
                  isMobileHorizontal ? 'w-4 h-4' : 'w-5 h-5'
                }`} />
              </div>
              <h2 className={`font-black text-green-100 pixel-text ${
                isMobileHorizontal ? 'text-sm' : 'text-lg'
              }`}>
                GREAT WORK!
              </h2>
            </div>
            {!isMobileHorizontal && (
              <div className="flex justify-center">
                <CheckCircle className="w-12 h-12 text-green-100 animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className={`text-left space-y-3 ${
            isMobileHorizontal ? 'text-xs' : 'text-sm'
          }`}>
            <p className="text-gray-200 font-medium">
              Your project has been successfully submitted for evaluation.
            </p>
            
            {/* What's Next Section */}
            <div className={`pixel-border bg-gradient-to-r from-blue-900 to-blue-800 ${
              isMobileHorizontal ? 'p-2' : 'p-3'
            }`}>
              <h3 className={`font-black text-blue-100 pixel-text flex items-center space-x-1 mb-2 ${
                isMobileHorizontal ? 'text-xs' : 'text-sm'
              }`}>
                <span>📌</span>
                <span>What's Next?</span>
              </h3>
              
              <div className="space-y-2 text-blue-100">
                <p>Results will be announced by Monday afternoon.</p>
                
                <div className="flex items-center space-x-2">
                  <span>Check the results at:</span>
                  <a 
                    href="https://rareminds.in/hackathons/capathon/results" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pixel-border bg-blue-700 hover:bg-blue-600 px-2 py-1 text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <span>Results Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <p>
                  While you wait, start thinking of solutions and ideas for any one of your problem statements—you'll need this for Level 2.
                </p>
              </div>
            </div>
            
            {/* Tip Section */}
            <div className={`pixel-border bg-gradient-to-r from-yellow-900 to-yellow-800 ${
              isMobileHorizontal ? 'p-2' : 'p-3'
            }`}>
              <h3 className={`font-black text-yellow-100 pixel-text flex items-center space-x-1 mb-2 ${
                isMobileHorizontal ? 'text-xs' : 'text-sm'
              }`}>
                <span>💡</span>
                <span>Tip:</span>
              </h3>
              
              <p className="text-yellow-100">
                Focus on practical, innovative solutions that can make your idea stand out in the next round!
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => navigate('/modules')}
            className={`pixel-border bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-black pixel-text transition-all duration-200 flex items-center space-x-2 mx-auto transform hover:scale-105 shadow-lg mt-4 ${
              isMobileHorizontal ? 'py-2 px-4' : 'py-3 px-6'
            }`}
          >
            <span className={isMobileHorizontal ? 'text-xs' : 'text-sm'}>
              {isMobileHorizontal ? 'CLOSE' : 'RETURN TO MODULES'}
            </span>
            <ChevronRight className={isMobileHorizontal ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        </div>
        
        {/* Corner Decorations - Smaller for mobile horizontal */}
        <div className={`absolute top-2 right-2 bg-green-500 rounded-full animate-ping ${
          isMobileHorizontal ? 'w-1 h-1' : 'w-2 h-2'
        }`}></div>
        <div className={`absolute bottom-2 left-2 bg-blue-500 rounded-full animate-ping ${
          isMobileHorizontal ? 'w-1 h-1' : 'w-2 h-2'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};