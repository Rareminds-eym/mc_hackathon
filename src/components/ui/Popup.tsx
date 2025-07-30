import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LevelProgressService } from "../../services/levelProgressService";
import { useLevelProgress } from "../../hooks/useLevelProgress";

// Unified Popup Component Interface
interface PopupProps {
  open: boolean;
  onClose: () => void;

  // Generic popup props
  children?: React.ReactNode;
  showNavigation?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  continueText?: string;
  backText?: string;

  // Victory popup props
  variant?: 'generic' | 'victory';
  score?: number;
  combo?: number;
  health?: number;
  highScore?: number;
  showNext?: boolean;
  isLevelCompleted?: boolean;
  showGoToModules?: boolean;
  showReset?: boolean;
  onReset?: () => void;
  moduleId?: string;
}

// Unified Popup Component
export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  children,
  showNavigation = false,
  onBack,
  onContinue,
  continueText = "Continue",
  backText = "Back",

  // Victory props
  variant = 'generic',
  score = 0,
  combo = 0,
  health = 0,
  highScore: _highScore,
  showNext: _showNext = false,
  isLevelCompleted = false,
  showGoToModules = true,
  showReset = false,
  onReset,
  moduleId,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const { refreshProgress } = useLevelProgress(
    moduleId ? parseInt(moduleId) : undefined
  );

  // Navigation handlers
  const handleGoToLevels = useCallback(() => {
    let id = moduleId;
    if (!id) {
      const match = window.location.pathname.match(/modules\/(\w+)/);
      id = match ? match[1] : "";
    }
    if (id) {
      navigate(`/modules/${id}`);
    } else {
      navigate("/modules");
    }
  }, [moduleId, navigate]);

  const handleNext = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleReset = useCallback(() => {
    if (onReset) onReset();
  }, [onReset]);

  const handleBack = () => {
    if (onBack) onBack();
  };

  const handleContinue = () => {
    if (onContinue) onContinue();
  };

  // Progress update effect (only for victory variant)
  useEffect(() => {
    const updateLevelProgress = async () => {
      if (
        variant !== 'victory' ||
        !open ||
        !user ||
        !isLevelCompleted ||
        !moduleId ||
        isUpdatingProgress
      )
        return;
      setIsUpdatingProgress(true);
      try {
        const { error } = await LevelProgressService.completeLevel(
          user.id,
          parseInt(moduleId),
          3
        );
        if (!error) await refreshProgress();
      } catch (error) {
        console.error("Error updating level progress:", error);
      } finally {
        setIsUpdatingProgress(false);
      }
    };
    updateLevelProgress();
  }, [
    variant,
    open,
    user,
    isLevelCompleted,
    moduleId,
    isUpdatingProgress,
    refreshProgress,
  ]);

  useEffect(() => {
    if (!open) setIsUpdatingProgress(false);
  }, [open]);

  // Determine styling based on variant
  const isVictory = variant === 'victory';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            className={`pixel-border-thick bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-cyan-100 shadow-2xl relative overflow-hidden ${
              isMobileHorizontal
                ? "w-[98vw] max-w-[500px] p-2 max-h-[85vh] overflow-y-auto"
                : isMobile
                ? "w-[95vw] max-w-[380px] p-3 max-h-[90vh] overflow-y-auto"
                : "w-[600px] max-w-[90vw] p-6"
            }`}
            style={{ borderRadius: 0 }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {/* Scan Lines Effect */}
            <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>

            {/* Victory-specific pixel effects */}
            {isVictory && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="grid-pattern"></div>
                </div>

                {/* Pixel Particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 pixel-dot opacity-60"
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${15 + (i % 4) * 20}%`,
                    }}
                    animate={{
                      y: [-8, 8, -8],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close Button - Pixel Style */}
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className={`fixed md:absolute top-2 right-2 z-50 pixel-border bg-gray-800 hover:bg-gray-700 text-cyan-100 flex items-center justify-center transition-all duration-150 active:scale-95 ${
                isMobile ? "w-6 h-6" : "w-8 h-8"
              }`}
              style={{ borderRadius: 0 }}
              aria-label="Close popup"
            >
              <Icon icon="mdi:close" className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
            </button>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full">
              {isVictory ? (
                /* Victory Content - Pixel/Retro Style */
                <>
                  {/* Header Section */}
                  <motion.div
                    className={`text-center ${isMobile ? "mb-3" : "mb-4"}`}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {/* Victory Icon - Pixel Style */}
                    <motion.div
                      className={`mx-auto mb-2 flex items-center justify-center ${
                        isMobileHorizontal ? 'w-12 h-12' : isMobile ? 'w-16 h-16' : 'w-20 h-20'
                      } pixel-border bg-yellow-600/20`}
                      style={{ borderRadius: 0 }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Icon
                        icon="game-icons:trophy"
                        className={`text-yellow-300 ${
                          isMobileHorizontal ? 'w-8 h-8' : isMobile ? 'w-10 h-10' : 'w-12 h-12'
                        }`}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                        }}
                      />
                    </motion.div>

                    {/* Victory Title - Pixel Text */}
                    <motion.h2
                      className={`pixel-text font-black text-yellow-200 tracking-wider ${
                        isMobileHorizontal ? 'text-lg' : isMobile ? 'text-xl' : 'text-2xl'
                      }`}
                      animate={{
                        textShadow: [
                          '0 0 10px rgba(251, 191, 36, 0.5)',
                          '0 0 20px rgba(251, 191, 36, 0.8)',
                          '0 0 10px rgba(251, 191, 36, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      MISSION COMPLETE!
                    </motion.h2>

                    {isLevelCompleted && (
                      <motion.p
                        className={`text-cyan-200 font-bold ${
                          isMobileHorizontal ? 'text-xs' : isMobile ? 'text-sm' : 'text-base'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        Scenario Cleared Successfully!
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Stats Section - Pixel Style */}
                  <motion.div
                    className={`flex-1 ${isMobile ? "space-y-2" : "space-y-3"}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    {/* Score Display - Pixel Borders */}
                    <div className={`pixel-border bg-gray-800/60 ${isMobile ? "p-2" : "p-3"}`} style={{ borderRadius: 0 }}>
                      <div className={`grid grid-cols-3 ${isMobile ? "gap-2" : "gap-4"} text-center`}>
                        {/* Score */}
                        <div className={`pixel-border bg-blue-800/80 ${isMobile ? "p-1.5" : "p-2"}`} style={{ borderRadius: 0 }}>
                          <div className={`text-blue-200 font-bold mb-1 ${
                            isMobileHorizontal ? 'text-[8px]' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            SCORE
                          </div>
                          <motion.div
                            className={`text-blue-100 font-black pixel-text ${
                              isMobileHorizontal ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'
                            }`}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {score}
                          </motion.div>
                        </div>

                        {/* Combo */}
                        <div className={`pixel-border bg-yellow-700/80 ${isMobile ? "p-1.5" : "p-2"}`} style={{ borderRadius: 0 }}>
                          <div className={`text-yellow-200 font-bold mb-1 ${
                            isMobileHorizontal ? 'text-[8px]' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            COMBO
                          </div>
                          <motion.div
                            className={`text-yellow-100 font-black pixel-text ${
                              isMobileHorizontal ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'
                            }`}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {combo}x
                          </motion.div>
                        </div>

                        {/* Health */}
                        <div className={`pixel-border bg-fuchsia-900/80 ${isMobile ? "p-1.5" : "p-2"}`} style={{ borderRadius: 0 }}>
                          <div className={`text-pink-200 font-bold mb-1 ${
                            isMobileHorizontal ? 'text-[8px]' : isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            HEALTH
                          </div>
                          <motion.div
                            className={`text-pink-100 font-black pixel-text ${
                              isMobileHorizontal ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'
                            }`}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {health}
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Badge - Pixel Style */}
                    {isLevelCompleted && (
                      <motion.div
                        className={`pixel-border bg-purple-800/60 text-center ${isMobile ? "p-2" : "p-3"}`}
                        style={{ borderRadius: 0 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.8,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Icon
                            icon="game-icons:achievement"
                            className={`text-purple-300 ${
                              isMobileHorizontal ? 'w-3 h-3' : isMobile ? 'w-4 h-4' : 'w-5 h-5'
                            }`}
                          />
                          <span className={`text-purple-200 font-bold pixel-text ${
                            isMobileHorizontal ? 'text-xs' : 'text-sm'
                          }`}>
                            SCENARIO MASTERED
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Progress Update Indicator - Pixel Style */}
                    {isUpdatingProgress && (
                      <motion.div
                        className={`pixel-border bg-blue-800/60 text-center ${isMobile ? "p-2" : "p-3"}`}
                        style={{ borderRadius: 0 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-blue-400 border-t-transparent pixel-dot"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className={`text-blue-300 font-semibold pixel-text ${
                            isMobileHorizontal ? 'text-xs' : 'text-sm'
                          }`}>
                            UPDATING PROGRESS...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Victory Action Buttons - Pixel Style */}
                  <motion.div
                    className={`${isMobile ? "space-y-2 mt-3" : "space-y-3 mt-4"}`}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    {/* Primary Actions */}
                    <div className="flex gap-2 flex-row justify-center">
                      {/* Continue/Next Button */}
                      <button
                        className={`pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 text-white font-black pixel-text hover:from-green-400 hover:to-blue-500 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 ${
                          isMobile ? "px-4 py-2 text-sm" : "px-6 py-3"
                        }`}
                        style={{ borderRadius: 0 }}
                        onClick={handleNext}
                        aria-label="Continue"
                      >
                        <Icon icon="game-icons:play-button" className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                        CONTINUE
                      </button>

                      {/* Go to Levels Button */}
                      {showGoToModules && (
                        <button
                          className={`pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-black pixel-text hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 ${
                            isMobile ? "px-4 py-2 text-sm" : "px-6 py-3"
                          }`}
                          style={{ borderRadius: 0 }}
                          onClick={handleGoToLevels}
                          aria-label="Go to Levels"
                        >
                          <Icon icon="mdi:home-map-marker" className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                          LEVELS
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      {/* Reset Button */}
                      {showReset && onReset && (
                        <button
                          className={`flex-1 pixel-border bg-red-700/80 hover:bg-red-600/80 text-white font-bold pixel-text transition-all duration-200 active:translate-y-[1px] flex items-center justify-center gap-2 ${
                            isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
                          }`}
                          style={{ borderRadius: 0 }}
                          onClick={handleReset}
                          aria-label="Reset"
                        >
                          <Icon icon="game-icons:restart" className="w-4 h-4" />
                          RESET
                        </button>
                      )}
                    </div>
                  </motion.div>
                </>
              ) : (
                /* Generic Content - Pixel Style */
                <>
                  <div className="flex-1 overflow-y-auto">
                    {children}
                  </div>

                  {/* Generic Navigation Buttons - Pixel Style */}
                  {showNavigation && (
                    <div className={`flex gap-2 ${isMobile ? "mt-3 pt-3" : "mt-4 pt-4"} border-t border-cyan-400/30`}>
                      {onBack && (
                        <button
                          onClick={handleBack}
                          className={`flex-1 pixel-border bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold pixel-text transition-all duration-200 active:translate-y-[1px] ${
                            isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          {backText}
                        </button>
                      )}
                      {onContinue && (
                        <button
                          onClick={handleContinue}
                          className={`flex-1 pixel-border bg-blue-700/80 hover:bg-blue-600/80 text-white font-bold pixel-text transition-all duration-200 active:translate-y-[1px] ${
                            isMobile ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm"
                          }`}
                          style={{ borderRadius: 0 }}
                        >
                          {continueText}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export VictoryPopup as an alias for backward compatibility
export const VictoryPopup: React.FC<PopupProps> = (props) => (
  <Popup {...props} variant="victory" />
);
