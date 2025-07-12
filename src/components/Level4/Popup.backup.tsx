import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  showNext?: boolean;
  children: React.ReactNode;
  showNavigation?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  continueText?: string;
  backText?: string;
}

export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  showNext,
  children,
  showNavigation,
  onBack,
  onContinue,
  continueText = "Start Investigation",
  backText = "Back"
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  
  const handleBack = () => {
    if (onBack) onBack();
  };
  
  const handleContinue = () => {
    if (onContinue) onContinue();
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={`relative bg-gray-900 border border-cyan-400/20 rounded-xl shadow-lg flex flex-col items-center justify-center max-h-[90vh] overflow-y-auto ${
              isMobile ? 
                isHorizontal ? 
                  "w-[90%] p-4" : 
                  "w-[95%] p-4" 
                : "max-w-2xl w-full p-8"
            }`}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              duration: 0.4,
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 rounded-full transition-all duration-200 bg-gradient-to-br from-cyan-200 via-blue-200 to-teal-100 hover:from-pink-200 hover:to-yellow-100 shadow-lg border-2 border-cyan-300/70 hover:border-pink-400/70 focus:outline-none group"
              aria-label="Close"
              style={{ width: 36, height: 36 }}
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-yellow-200/10 blur-md animate-pulse-slow z-0"></span>
                <span className="relative z-10 animate-pop-scale">
                  <Icon
                    icon="mdi:close-circle"
                    className="w-6 h-6"
                    style={{
                      filter: 
                        "drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 16px #f472b6)",
                    }}
                  />
                </span>
                {/* Sparkle */}
                <span className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-bounce select-none pointer-events-none">
                  ✦
                </span>
              </span>
            </button>
            )}
            {children}
            
            {/* Navigation Buttons at Bottom */}
            {showNavigation && (
              <div className="flex flex-row items-center justify-between w-full px-2 pb-1 pt-1 sm:px-4 sm:pt-2 fixed bottom-0 left-0 z-50 shadow-lg">
                <button 
                  onClick={handleBack} 
                  className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300 mb-2 sm:mb-0"
                >
                  <Icon 
                    icon="mdi:chevron-left" 
                    className="w-4 h-4 md:w-[0.7vw] md:h-[0.7vw] min-w-3 min-h-3 mr-1" 
                  />
                  <span>{backText}</span>
                </button>
                <div className="flex w-auto justify-end">
                  <button 
                    onClick={handleContinue} 
                    className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300"
                  >
                    <span>{continueText}</span>
                    <Icon 
                      icon="mdi:chevron-right" 
                      className="w-4 h-4 md:w-[0.7vw] md:h-[0.7vw] min-w-3 min-h-3 ml-1" 
                    />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface VictoryPopupProps {
  open: boolean;
  onClose: () => void;
  score: number;
  combo: number;
  health: number;
  showNext?: boolean;
  showGoToModules?: boolean;
  moduleId?: string;
}

export const VictoryPopup: React.FC<VictoryPopupProps> = ({
  open,
  onClose,
  score,
  combo,
  health,
  showNext = true,
  showGoToModules = true,
  moduleId,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const navigate = useNavigate();

  // Handler for Go to Levels
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

  // Handler for Next
  const handleNext = useCallback(() => {
    onClose(); // Parent handles scenario change
  }, [onClose]);

  return (
    <Popup open={open} onClose={onClose} hideClose={true}>
      <motion.div
        className={`flex flex-col items-center mx-auto justify-center text-center text-white${
          isMobileHorizontal ? " py-2 max-w-xs" : " py-6 max-w-md"
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          duration: 0.4,
        }}
      >
        {/* Trophy Icon */}
        <motion.div
          className={`relative flex items-center justify-center${
            isMobileHorizontal ? " mb-1" : " mb-3"
          }`}
          initial={{ y: -20, scale: 0.5, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <div
            className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-yellow-300/40 via-amber-400/30 to-orange-500/30 blur-xl animate-pulse-slow z-0"
            style={{
              filter: "hue-rotate(-10deg)",
            }}
          />
          <div
            className={`relative ${
              isMobileHorizontal ? "w-14 h-14 my-1" : "w-20 h-20 my-2"
            }`}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{
                delay: 0.6,
                duration: 1.2,
                ease: "easeInOut",
              }}
              className="w-full h-full"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon
                  icon="game-icons:trophy-cup"
                  className="w-full h-full"
                  style={{
                    color: "#FBBC05",
                    filter:
                      "drop-shadow(0 0 8px rgba(251, 188, 5, 0.7)) drop-shadow(0 0 16px rgba(255, 238, 88, 0.8))",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Victory Title */}
        <motion.div
          className={`${
            isMobileHorizontal ? "space-y-1 mb-1" : "space-y-3 mb-3"
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 18,
          }}
        >
          <h2
            className={`text-amber-200 font-black${
              isMobileHorizontal ? " text-lg" : " text-2xl"
            }`}
            style={{
              textShadow:
                "0 0 10px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)",
            }}
          >
            VICTORY!
          </h2>

          {/* Stats Section */}
          <motion.div
            className={`flex items-center justify-center gap-6${
              isMobileHorizontal ? " gap-3" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div
              className={`flex flex-col items-center${
                isMobileHorizontal ? " gap-0.5" : " gap-1"
              }`}
            >
              <div
                className={`flex items-center gap-1 text-amber-300 font-bold${
                  isMobileHorizontal ? " text-xs" : " text-sm"
                }`}
              >
                <Icon
                  icon="mdi:star-circle"
                  className={`${isMobileHorizontal ? "w-4 h-4" : "w-5 h-5"}`}
                />
                <span>SCORE</span>
              </div>
              <div
                className={`bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent font-black${
                  isMobileHorizontal ? " text-lg" : " text-2xl"
                }`}
              >
                {score}
              </div>
            </div>

            <div
              className={`flex flex-col items-center${
                isMobileHorizontal ? " gap-0.5" : " gap-1"
              }`}
            >
              <div
                className={`flex items-center gap-1 text-emerald-300 font-bold${
                  isMobileHorizontal ? " text-xs" : " text-sm"
                }`}
              >
                <Icon
                  icon="mdi:lightning-bolt-circle"
                  className={`${isMobileHorizontal ? "w-4 h-4" : "w-5 h-5"}`}
                />
                <span>COMBO</span>
              </div>
              <div
                className={`bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent font-black${
                  isMobileHorizontal ? " text-lg" : " text-2xl"
                }`}
              >
                <span className="font-bold text-pink-200">{combo}</span>
              </div>
            </div>

            <div
              className={`flex flex-col items-center${
                isMobileHorizontal ? " gap-0.5" : " gap-1"
              }`}
            >
              <div
                className={`flex items-center gap-1 text-cyan-300 font-bold${
                  isMobileHorizontal ? " text-xs" : " text-sm"
                }`}
              >
                <Icon
                  icon="mdi:shield-outline"
                  className={`${isMobileHorizontal ? "w-4 h-4" : "w-5 h-5"}`}
                />
                <span>HEALTH</span>
              </div>
              <div
                className={`bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent font-black${
                  isMobileHorizontal ? " text-lg" : " text-2xl"
                }`}
              >
                {health}
              </div>
            </div>
          </motion.div>

          <div
            className={`flex items-center justify-center gap-2 font-semibold text-white/90 ${
              isMobileHorizontal ? "text-sm" : "text-base"
            }`}
          >
            Well Done!
          </div>
        </motion.div>

        {/* 🔘 Gamified Buttons */}
        <motion.div
          className={`flex justify-center gap-4 w-full mt-2${
            isMobileHorizontal ? " gap-2 mt-1 justify-center" : ""
          }`}
          style={isMobileHorizontal ? { justifyContent: "center" } : {}}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 1.0,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        >
          {showGoToModules && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur-[4px] opacity-50 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[2px]" : ""
                }`}
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 3s infinite ease-in-out",
                }}
              />

              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(30,64,175,0.5),0_0_12px_rgba(30,64,175,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(30,64,175,0.5)] ${
                  isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                }`}
                onClick={handleGoToLevels}
                aria-label="Go to Levels"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>

                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}
                    ></div>
                    <Icon
                      icon="mdi:map-marker-path"
                      className={`w-5 h-5 drop-shadow-glow${
                        isMobileHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                  </div>
                  <span className="whitespace-nowrap">Modules</span>
                </div>
              </button>
            </motion.div>
          )}

          {showNext && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-[4px] opacity-50 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[2px]" : ""
                }`}
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2.5s infinite ease-in-out",
                }}
              />

              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(14,165,233,0.5),0_0_12px_rgba(14,165,233,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(14,165,233,0.5)] ${
                  isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                }`}
                onClick={handleNext}
                aria-label="Next"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>

                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  <span className="whitespace-nowrap">Next</span>
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}
                    ></div>
                    <Icon
                      icon="mdi:arrow-right-bold"
                      className={`w-5 h-5 drop-shadow-glow${
                        isMobileHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </Popup>
  );
};

// FeedbackPopup component matching the provided design
interface FeedbackPopupProps {
  open: boolean;
  onClose: () => void;
  onNext?: () => void; // Made optional since we're using our own navigation
  onBackToLevels: () => void;
  onPlayAgain: () => void; // NEW: callback to reset to login
  score: number;
  time: string;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  open,
  onClose,
  onBackToLevels,
  onPlayAgain, // NEW
  score,
  time,
  // onNext is not used as we're handling navigation directly
}) => {
  // Calculate stars: 0-5 based on score (max 30)
  const maxScore = 30;
  const stars = Math.round((score / maxScore) * 5);
  const isMobile = window.innerWidth <= 600;
  const popupHeight = isMobile ? 'auto' : 'auto';
  const navigate = useNavigate();

  // Stars are shown with different colors:
  // 0-1: Red/Orange
  // 2-3: Yellow/Gold
  // 4-5: Green
  const getStarColor = (index: number) => {
    if (stars < 2) return 'text-red-500';
    if (stars < 4) return 'text-amber-400';
    return 'text-green-500';
  };
  
  // Message based on stars
  const getMessage = () => {
    if (stars < 2) return "Needs improvement. Review the materials and try again.";
    if (stars < 4) return "Good effort! You're on the right track.";
    return "Excellent! You've mastered the concepts.";
  };

  // For the pill badge color
  const getBadgeColor = () => {
    if (stars < 2) return 'bg-red-500';
    if (stars < 4) return 'bg-amber-400';
    return 'bg-green-500';
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative bg-gray-900 border border-cyan-400/20 rounded-xl shadow-lg flex flex-col items-center justify-start w-[95%] max-w-xl max-h-[90vh] overflow-y-auto p-5"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              duration: 0.4,
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 rounded-full transition-all duration-200 bg-gradient-to-br from-cyan-200 via-blue-200 to-teal-100 hover:from-pink-200 hover:to-yellow-100 shadow-lg border-2 border-cyan-300/70 hover:border-pink-400/70 focus:outline-none group"
              aria-label="Close"
              style={{ width: 36, height: 36 }}
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-yellow-200/10 blur-md animate-pulse-slow z-0"></span>
                <span className="relative z-10 animate-pop-scale">
                  <Icon
                    icon="mdi:close-circle"
                    className="w-6 h-6"
                    style={{
                      filter: 
                        "drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 16px #f472b6)",
                    }}
                  />
                </span>
                {/* Sparkle */}
                <span className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-bounce select-none pointer-events-none">
                  ✦
                </span>
              </span>
            </button>

            {/* Header */}
            <div className="flex flex-col items-center w-full mt-6 mb-4">
              <h2 className="text-2xl font-bold text-cyan-300 mb-2">GMP Investigation Results</h2>
              <div className={`${getBadgeColor()} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                {stars} out of 5 stars
              </div>
            </div>

            {/* Stars Display */}
            <div className="flex justify-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon 
                  key={i}
                  icon={i < stars ? "mdi:star" : "mdi:star-outline"}
                  className={`w-8 h-8 ${i < stars ? getStarColor(stars) : 'text-gray-400'}`}
                />
              ))}
            </div>

            {/* Results Metrics */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-gray-800/50 border border-cyan-400/20 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-gray-400 text-sm mb-1">Score</div>
                <div className="text-2xl font-bold text-white">{score} <span className="text-sm font-normal">/ 30</span></div>
              </div>
              <div className="bg-gray-800/50 border border-cyan-400/20 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-gray-400 text-sm mb-1">Time</div>
                <div className="text-2xl font-bold text-white">{time}</div>
              </div>
            </div>

            {/* Feedback Message */}
            <div className="bg-gray-800/30 border border-cyan-400/10 rounded-lg p-4 w-full mb-6">
              <div className="text-gray-300 text-center">{getMessage()}</div>
            </div>

            {/* Background Image (optional - subtle) */}
            {/* <div className="absolute inset-0 opacity-5 z-0">
              <img 
                src="/Level4/character.webp" 
                alt="" 
                className="absolute w-full h-full object-cover opacity-10 pointer-events-none select-none"
                style={{ zIndex: -1, top: 0, left: 0 }}
              />
            </div> */}
            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-4 mt-2 lg:mt-4 w-full px-2">
              <button
                className="hover:text-teal-400 hover:border-teal-400 text-white font-bold py-1.5 md:py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2 border border-green-200/60 w-full md:w-auto"
                onClick={onBackToLevels}
                aria-label="Back to Levels"
                type="button"
              >
                <Icon icon="mdi:map-marker-path" className="w-5 h-5 md:w-6 md:h-6" />
                Back to Modules
              </button>
              <button
                className="hover:text-teal-400 hover:border-teal-400 text-white font-bold py-1.5 md:py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2 border border-green-200/60 w-full md:w-auto"
                onClick={onPlayAgain}
                aria-label="Play Again"
                type="button"
              >
                <Icon icon="mdi:arrow-right-bold" className="w-5 h-5 md:w-6 md:h-6" />
                Play Again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
