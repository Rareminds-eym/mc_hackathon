import React, { useEffect, useRef } from 'react';
import { CheckCircle, Flame, Star } from 'lucide-react';
import { ProgressTrackProps } from '../types';

const ProgressTrack: React.FC<ProgressTrackProps> = ({
  stages,
  currentStage,
  isStageComplete,
  onStageClick,
  progress,
  isMobileHorizontal,
  isAnimating,
  setIsAnimating
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const handleStageClick = (stageNumber: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      onStageClick(stageNumber);
      setIsAnimating(false);
    }, 200);
  };

  // Auto-scroll to current stage
  useEffect(() => {
    if (sliderRef.current) {
      const currentStageElement = sliderRef.current.querySelector(`[data-stage="${currentStage}"]`);
      if (currentStageElement) {
        currentStageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentStage]);

  return (
    <div className={`${isMobileHorizontal ? 'mb-3' : 'mb-6'}`}>
      <div className="pixel-border-thick bg-gray-900/90 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
        <div className="relative z-10">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <span className="pixel-text font-black text-white text-sm">MISSION PROGRESS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="pixel-text font-bold text-cyan-300 text-sm">{Math.round(progress)}% COMPLETE</span>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          
          {/* Visual Progress Bar */}
          <div className="relative h-2 bg-gray-800 pixel-border mb-4">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 10px rgba(6,182,212,0.6)'
              }}
            ></div>
            <div className="absolute top-0 right-0 h-full w-4 bg-gradient-to-l from-white/20 to-transparent animate-pulse"></div>
          </div>

          {/* Stage Navigation Slider */}
          <div 
            ref={sliderRef}
            className="overflow-x-auto pb-2 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <div className="flex items-center justify-center space-x-2 min-w-max px-1">
              {stages.map((stageData, index) => {
                const stageNumber = index + 1;
                const isCurrent = stageNumber === currentStage;
                const isCompleted = stageNumber < currentStage || isStageComplete(stageNumber);
                const isPrevious = stageNumber < currentStage;
                const isNext = stageNumber === currentStage + 1;
                const isOptional = stageData.isOptional;
                
                return (
                  <React.Fragment key={stageNumber}>
                    <div
                      data-stage={stageNumber}
                      className={`relative group transition-all duration-300 transform ${
                        isCurrent ? 'scale-110' : 'hover:scale-105'
                      } cursor-default flex-shrink-0`}
                      // onClick removed to disable stage change
                    >
                      {/* Stage Card - More Compact */}
                      <div className={`pixel-border flex flex-col items-center transition-all duration-300 ${
                        isMobileHorizontal ? 'p-1 w-12' : 'p-2 w-16'
                      } relative overflow-hidden ${
                        isCurrent 
                          ? `bg-gradient-to-br ${stageData.bgColor} ring-2 ring-cyan-400 ring-opacity-50` 
                          : isCompleted 
                            ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 hover:from-green-800/40 hover:to-emerald-800/40' 
                            : isNext
                              ? (isOptional 
                                  ? 'bg-gradient-to-br from-slate-600/20 to-purple-800/20 hover:from-slate-500/30 hover:to-purple-700/30'
                                  : 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 hover:from-yellow-800/30 hover:to-orange-800/30')
                              : (isOptional 
                                  ? 'bg-gray-700/40 hover:bg-slate-600/50'
                                  : 'bg-gray-800/50 hover:bg-gray-700/60')
                      }`}>
                        
                        {/* Animated Background for Current Stage */}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 animate-pulse"></div>
                        )}
                        
                        {/* Stage Icon - Smaller */}
                        <div className={`pixel-border ${isMobileHorizontal ? 'p-0.5' : 'p-1'} mb-1 transition-all duration-300 relative overflow-hidden ${
                          isCurrent 
                            ? `bg-gradient-to-br ${stageData.color} shadow-lg` 
                            : isCompleted 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                              : isNext
                                ? (isOptional 
                                    ? 'bg-gradient-to-br from-slate-500 to-purple-500'
                                    : 'bg-gradient-to-br from-yellow-500 to-orange-500')
                                : (isOptional 
                                    ? 'bg-gray-500'
                                    : 'bg-gray-600')
                        }`}>
                          {/* Glow Effect */}
                          {(isCurrent || isCompleted) && (
                            <div className={`absolute inset-0 blur-sm ${
                              isCurrent ? `bg-gradient-to-br ${stageData.color}` : 'bg-green-500'
                            } opacity-30 -z-10`}></div>
                          )}
                          
                          {/* Icon with State - Smaller Icons */}
                          {isCompleted && !isCurrent ? (
                            <CheckCircle className={`${isMobileHorizontal ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`} />
                          ) : isNext ? (
                            <div className="relative">
                              <stageData.icon className={`${isMobileHorizontal ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white animate-pulse`} />
                              <div className="absolute inset-0 bg-white/30 animate-ping rounded-full"></div>
                            </div>
                          ) : (
                            <stageData.icon className={`${isMobileHorizontal ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`} />
                          )}
                        </div>
                        
                        {/* Stage Number - Smaller */}
                        <div className={`pixel-text ${isMobileHorizontal ? 'text-[7px]' : 'text-[8px]'} font-black mb-0.5 ${
                          isCurrent 
                            ? 'text-cyan-300' 
                            : isCompleted 
                              ? 'text-green-400' 
                              : isNext 
                                ? (isOptional ? 'text-purple-300' : 'text-yellow-400')
                                : (isOptional ? 'text-slate-400' : 'text-gray-400')
                        }`}>
                          {stageNumber}
                        </div>
                        
                        {/* Stage Title - Smaller */}
                        <span className={`pixel-text ${isMobileHorizontal ? 'text-[6px]' : 'text-[7px]'} font-bold text-center leading-tight ${
                          isCurrent 
                            ? 'text-cyan-200' 
                            : isCompleted 
                              ? 'text-green-300' 
                              : isNext 
                                ? (isOptional ? 'text-purple-200' : 'text-yellow-300')
                                : (isOptional ? 'text-slate-400' : 'text-gray-500')
                        }`}>
                          {stageData.subtitle}
                        </span>
                      </div>
                      
                      {/* Tooltip on Hover */}
                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs pixel-text font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap ${
                        isMobileHorizontal ? 'hidden' : ''
                      }`}>
                        {stageData.title}
                        {isOptional && (
                          <span className="text-purple-300 text-[10px] ml-1">(Optional)</span>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                    
                    {/* Connection Line Between Stages */}
                    {index < stages.length - 1 && (
                      <div className={`flex-shrink-0 w-3 h-0.5 mt-6 transition-all duration-500 ${
                        isPrevious || isCurrent ? 'bg-cyan-400' : 'bg-gray-600'
                      }`} style={{
                        boxShadow: isPrevious || isCurrent ? '0 0 4px rgba(6,182,212,0.5)' : 'none'
                      }}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrack;
