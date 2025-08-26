import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  isMobileHorizontal?: boolean;
  title?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading your progress...", 
  isMobileHorizontal = false,
  title = "INNOVATION QUEST"
}) => {
  return (
    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
      
      {/* Loading Content */}
      <div className={`relative z-10 text-center ${isMobileHorizontal ? 'px-4' : 'px-8'}`}>
        {/* Animated Loading Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Loader2 
              className={`${isMobileHorizontal ? 'w-12 h-12' : 'w-16 h-16'} text-cyan-400 animate-spin`} 
            />
            {/* Glow effect */}
            <div className={`absolute inset-0 ${isMobileHorizontal ? 'w-12 h-12' : 'w-16 h-16'} bg-cyan-400 rounded-full blur-lg opacity-30 animate-pulse`}></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 
            className={`pixel-text ${isMobileHorizontal ? 'text-lg' : 'text-2xl'} font-black text-white mb-2`}
            style={{ 
              textShadow: isMobileHorizontal 
                ? '2px 2px 0px rgba(0,0,0,0.7), 0 0 10px rgba(6,182,212,0.5)' 
                : '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(6,182,212,0.5)' 
            }}
          >
            {title}
          </h2>
          <p className={`text-cyan-200 ${isMobileHorizontal ? 'text-sm' : 'text-base'} font-medium animate-pulse`}>
            {message}
          </p>
          
          {/* Loading Dots Animation */}
          <div className="flex justify-center items-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className={`mt-8 ${isMobileHorizontal ? 'w-48' : 'w-64'} mx-auto`}>
          <div className="pixel-border bg-gray-700 h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
