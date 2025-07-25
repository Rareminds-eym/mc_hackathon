import React, { useState, useCallback, useMemo } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { getGameModesByModuleAndType, getTypesForModule } from '../data/gameModes';
import { useDeviceLayout } from '../../../hooks/useOrientation';

interface ContinueButtonProps {
  onContinue: () => void;
  nextType: number;
  moduleId: number;
  disabled?: boolean;
  className?: string;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({
  onContinue,
  nextType,
  moduleId,
  disabled = false,
  className = ''
}) => {
  const { isMobile: isDeviceMobile, isHorizontal } = useDeviceLayout();
  const isMobileLandscape = isDeviceMobile && isHorizontal;
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Memoize the available types for the current module
  const availableTypes = useMemo(() => {
    try {
      const types = getTypesForModule(moduleId);
      if (types.length === 0) {
        console.warn(`No types found for module ${moduleId}`);
        return [1]; // Fallback to [1] if no types found
      }
      return types;
    } catch (error) {
      const errorMessage = `Error fetching types for module ${moduleId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.warn(errorMessage);
      return [1]; // Fallback to [1] on error
    }
  }, [moduleId]);

  // Memoize the next type label to avoid recalculation on every render
  const nextTypeLabel = useMemo(() => {
    try {
      // Get game modes for the specific module and type combination
      const gameModes = getGameModesByModuleAndType(moduleId, nextType);

      // If we found a game mode, extract the title and clean it up
      if (gameModes.length > 0) {
        const title = gameModes[0].title;
        // Remove emoji and extra formatting from the title
        return title.replace(/^[^\w\s]+\s*/, '').trim();
      }

      // Fallback to generic label if no game mode found
      return `Type ${nextType}`;
    } catch (error) {
      console.warn(`Error fetching game mode for module ${moduleId}, type ${nextType}:`, error);
      return `Type ${nextType}`;
    }
  }, [moduleId, nextType]);

  // Memoize responsive sizing calculations - Further reduced sizes for mobile
  const buttonSizing = useMemo(() => ({
    minHeight: isMobileLandscape ? '32px' : '48px',
    textSize: isMobileLandscape ? 'text-xs' : 'text-base',
    padding: isMobileLandscape ? 'py-1.5 px-3' : 'py-3 px-6',
    iconSize: isMobileLandscape ? 'w-3 h-3' : 'w-5 h-5'
  }), [isMobileLandscape]);

  const handleContinue = useCallback(() => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      onContinue();
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [disabled, isLoading, onContinue]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(true);
      handleContinue();
    }
  }, [handleContinue]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(false);
    }
  }, []);

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isMobileLandscape ? 'p-2' : 'p-6'} z-50 ${className}`}
         style={{
           background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
           backdropFilter: 'blur(10px)'
         }}>



      {/* Main Modal Container - Modern Design with Pixel Border */}
      <div className={`relative bg-white/10 backdrop-blur-xl ${isMobileLandscape ? 'rounded-2xl' : 'rounded-3xl'} border border-white/20 overflow-hidden shadow-2xl  border-cyan-400 ${
        isMobileLandscape
          ? 'w-11/12 max-w-sm mx-1'
          : 'max-w-lg w-full'
      }`}
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
           }}>

        {/* Animated Border Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse" />
        <div className="absolute inset-[1px] rounded-3xl bg-slate-900/80 backdrop-blur-xl" />

        <div className={`relative text-center ${isMobileLandscape ? 'p-2' : 'p-5'}`}>
          {/* Success Header */}
          <div className={`${isMobileLandscape ? 'mb-2' : 'mb-4'}`}>
            {/* Success Icon */}
            <div className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg ${
              isMobileLandscape ? 'w-8 h-8 mb-1.5' : 'w-14 h-14 mb-3'
            }`}
                 style={{
                   boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                 }}>
              <Check className={`text-white ${isMobileLandscape ? 'w-4 h-4' : 'w-7 h-7'}`}
                     strokeWidth={2.5} />
            </div>

            <h2 className={`font-bold text-white mb-1 ${
              isMobileLandscape ? 'text-sm' : 'text-xl'
            }`}
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                }}>
              Mission Complete!
            </h2>

            <p className={`text-slate-300 font-medium ${
              isMobileLandscape ? 'text-xs' : 'text-base'
            }`}>
              Ready for your next challenge?
            </p>
          </div>

          {/* Next Activity Card */}
          <div className={`relative ${isMobileLandscape ? 'mb-1' : 'mb-0'}`}>
            <div className={`relative ${
              isMobileLandscape ? 'p-1.5' : 'p-3'
            }`}>

              <div className="relative">
                <span className={`text-indigo-300 font-semibold uppercase tracking-wider block mb-1 ${
                  isMobileLandscape ? 'text-xs' : 'text-xs'
                }`}>
                  Next Mission
                </span>
                <h3 className={`text-white font-bold ${
                  isMobileLandscape ? 'text-xs font-extrabold' : 'text-lg'
                }`}
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}>
                  {nextTypeLabel}
                </h3>
              </div>
            </div>
          </div>

          {/* Modern Continue Button */}
          <button
            onClick={handleContinue}
            disabled={disabled || isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            aria-label={`Continue to ${nextTypeLabel}`}
            aria-describedby="continue-button-description"
            tabIndex={0}
            className={`group w-full relative overflow-hidden ${isMobileLandscape ? 'rounded-xl' : 'rounded-2xl'} transition-all duration-300 transform-gpu focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
              disabled || isLoading
                ? 'opacity-60 cursor-not-allowed'
                : isPressed
                  ? 'scale-[0.97]'
                  : isHovered
                    ? 'scale-[1.02] shadow-2xl'
                    : 'shadow-xl'
            } ${buttonSizing.padding} ${buttonSizing.textSize}`}
            style={{
              minHeight: buttonSizing.minHeight,
              background: disabled || isLoading
                ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                : isHovered
                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
                  : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%)',
              boxShadow: disabled || isLoading
                ? 'none'
                : isHovered
                  ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 10px 25px -3px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Shimmer Effect */}
            {isHovered && !disabled && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-slate-700/90 to-slate-600/90 backdrop-blur-sm ${isMobileLandscape ? 'rounded-xl' : 'rounded-2xl'}`}>
                <div className={`flex items-center ${isMobileLandscape ? 'space-x-2' : 'space-x-3'}`}>
                  <div className={`border-3 border-blue-400/30 border-t-blue-400 animate-spin rounded-full ${
                    isMobileLandscape ? 'w-4 h-4' : 'w-6 h-6'
                  }`}></div>
                  <span className={`text-blue-400 font-semibold ${
                    isMobileLandscape ? 'text-xs' : 'text-base'
                  }`}>
                    Loading...
                  </span>
                </div>
              </div>
            )}

            {/* Button Content */}
            <div className={`relative flex items-center justify-center font-bold z-10 text-white ${
              isMobileLandscape ? 'space-x-2' : 'space-x-4'
            }`}>
              {!isLoading && (
                <>
                  {/* Button Text */}
                  <span className="font-bold tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {isMobileLandscape ? "Continue" : "Continue Mission"}
                  </span>

                  {/* Arrow Icon */}
                  <div className={`transition-all duration-300 ${
                    isHovered ? 'translate-x-1' : 'translate-x-0'
                  }`}>
                    <ArrowRight className={`${buttonSizing.iconSize}`} strokeWidth={2.5} />
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Progress Header */}
          <div className={`flex items-center justify-center ${isMobileLandscape ? 'space-x-1.5 mt-3' : 'space-x-2 mt-4'}`}>
            <div className={`${isMobileLandscape ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-blue-400 animate-pulse`}></div>
            <span className={`text-slate-300 font-semibold uppercase tracking-wider ${
              isMobileLandscape ? 'text-xs' : 'text-xs'
            }`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Progress
            </span>
            <div className={`${isMobileLandscape ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-blue-400 animate-pulse`}></div>
          </div>

          {/* Modern Progress Steps */}
          <div className={`flex items-center justify-center ${isMobileLandscape ? 'space-x-4 mt-2' : 'space-x-8 mt-3'}`}>
            {availableTypes.map((type, index) => {
              const isCompleted = type < nextType;
              const isCurrent = type === nextType;
              const isPending = type > nextType;

              return (
                <div key={type} className="relative group flex flex-col items-center">
                  {/* Connection Line */}
                  {index < availableTypes.length - 1 && (
                    <div className={`absolute ${isMobileLandscape ? 'top-2.5 left-4' : 'top-3 left-6'} h-0.5 transition-all duration-500 ${
                      isMobileLandscape ? 'w-4' : 'w-8'
                    } ${
                      type < nextType
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                        : 'bg-slate-600/30'
                    }`}></div>
                  )}

                  {/* Progress Circle */}
                  <div className="relative">
                    <div
                      className={`relative transition-all duration-500 flex items-center justify-center rounded-full ${
                        isMobileLandscape ? 'w-5 h-5' : 'w-7 h-7'
                      } ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg'
                          : isCurrent
                            ? 'bg-gradient-to-br from-blue-400 to-purple-500 animate-pulse shadow-lg'
                            : 'bg-slate-600/50 border-2 border-slate-500/50'
                      }`}
                      style={{
                        boxShadow: isCompleted || isCurrent
                          ? '0 4px 15px rgba(59, 130, 246, 0.3)'
                          : 'none'
                      }}
                    >
                      {/* Status Icons */}
                      {isCompleted && (
                        <Check className={`text-white ${isMobileLandscape ? 'w-2.5 h-2.5' : 'w-4 h-4'}`}
                               strokeWidth={3} />
                      )}

                      {isCurrent && (
                        <div className={`bg-white rounded-full ${isMobileLandscape ? 'w-1.5 h-1.5' : 'w-3 h-3'}`}></div>
                      )}

                      {isPending && (
                        <div className={`bg-slate-400 rounded-full ${isMobileLandscape ? 'w-1 h-1' : 'w-2 h-2'}`}></div>
                      )}
                    </div>
                  </div>

                  {/* Step Number */}
                  <div
                    className={`${isMobileLandscape ? 'mt-1.5 px-1 py-0.5' : 'mt-2 px-1.5 py-0.5'} rounded-lg font-bold transition-all duration-500 ${
                      isMobileLandscape ? 'text-xs' : 'text-xs'
                    } ${
                      isCompleted
                        ? 'text-emerald-300 bg-emerald-500/20'
                        : isCurrent
                          ? 'text-blue-300 bg-blue-500/20'
                          : 'text-slate-400 bg-slate-700/20'
                    }`}
                    style={{ fontFamily: 'Orbitron, sans-serif' }}
                  >
                    {type}
                  </div>

                  {/* Tooltip */}
                  <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap ${
                    isMobileLandscape ? 'text-xs' : 'text-xs'
                  }`}>
                    {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/80"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueButton;
