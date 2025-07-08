import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LevelProgressService } from "../../services/levelProgressService";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  hideClose?: boolean;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  hideClose = false,
  children,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
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
            className={`relative overflow-visible shadow-2xl rounded-2xl ${
              isMobileHorizontal
                ? "py-1 px-2 rounded-lg max-w-[98vw] w-[420px] min-h-[120px] border-4 border-indigo-500/80"
                : "p-6 border-4 border-indigo-500/80 max-w-3xl w-[600px]"
            }`}
            style={{
              background:
                "linear-gradient(135deg, #0a0428 0%, #1a0b47 30%, #281980 70%, #3311a0 100%)",
              backgroundSize: "cover",
              borderRadius: isMobileHorizontal ? "0.75rem" : "1rem",
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
              padding: isMobileHorizontal ? "0.5rem 0.75rem" : undefined,
              maxWidth: isMobileHorizontal ? "98vw" : "900px",
              width: isMobileHorizontal ? "420px" : "600px",
              minHeight: isMobileHorizontal ? "120px" : undefined,
              boxShadow: "0 8px 32px 0 rgba(80, 0, 255, 0.25)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
          >
            {/* Advanced cosmic gamified background */}
            <div
              className="absolute inset-0 z-0 rounded-2xl pointer-events-none overflow-hidden"
              style={{
                borderRadius: isMobileHorizontal ? "0.75rem" : "1rem",
                background:
                  "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogIDxmaWx0ZXIgaWQ9Im4iPgogICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNTUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz4KICA8L2ZpbHRlcj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuMTUiLz4KPC9zdmc+')",
              }}
            >
              {/* Star field - Small stars */}
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={`bg-star-sm-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.2,
                    animation: `twinkle ${
                      Math.random() * 4 + 2
                    }s infinite alternate ${Math.random() * 2}s`,
                  }}
                />
              ))}

              {/* Medium stars with glow effect */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`bg-star-md-${i}`}
                  className="absolute rounded-full bg-blue-100"
                  style={{
                    width: `${Math.random() * 3 + 2}px`,
                    height: `${Math.random() * 3 + 2}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    boxShadow: "0 0 3px 1px rgba(255, 255, 255, 0.3)",
                    opacity: Math.random() * 0.6 + 0.3,
                    animation: `twinkle ${
                      Math.random() * 5 + 3
                    }s infinite alternate ${Math.random() * 2}s`,
                  }}
                />
              ))}

              {/* Occasional larger star with stronger glow */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`bg-star-lg-${i}`}
                  className="absolute rounded-full bg-indigo-50"
                  style={{
                    width: `${Math.random() * 2 + 3}px`,
                    height: `${Math.random() * 2 + 3}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    boxShadow: "0 0 6px 2px rgba(176, 196, 255, 0.6)",
                    opacity: Math.random() * 0.7 + 0.3,
                    animation: `twinkle ${
                      Math.random() * 5 + 4
                    }s infinite alternate ${Math.random() * 3}s`,
                  }}
                />
              ))}

              {/* Cosmic nebula effect */}
              <div
                className="absolute inset-0 opacity-30 mix-blend-screen"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 40%, rgba(142, 45, 226, 0.4) 0%, rgba(74, 0, 224, 0) 50%), radial-gradient(ellipse at 80% 60%, rgba(0, 255, 240, 0.4) 0%, rgba(0, 89, 178, 0) 50%)",
                }}
              />

              {/* Animated particle trail */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`cosmic-trail-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: "150px",
                    height: "10px",
                    top: `${20 + i * 25}%`,
                    left: "-50px",
                    background:
                      "linear-gradient(90deg, rgba(138, 43, 226, 0), rgba(138, 43, 226, 0.8) 50%, rgba(138, 43, 226, 0))",
                    boxShadow: "0 0 20px 5px rgba(138, 43, 226, 0.3)",
                    opacity: 0.6,
                    animation: `cosmic-trail 8s infinite ease-in-out ${
                      i * 2.5
                    }s`,
                    filter: "blur(4px)",
                    transform: `rotate(${-15 + i * 15}deg)`,
                  }}
                />
              ))}

              {/* Light rays from top right */}
              <div
                className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] opacity-40"
                style={{
                  background:
                    "conic-gradient(from 225deg at 50% 50%, rgba(125, 39, 255, 0.2) 0%, rgba(0, 247, 255, 0.1) 25%, rgba(125, 39, 255, 0) 50%)",
                  transform: "rotate(45deg)",
                  filter: "blur(20px)",
                }}
              />

              {/* Bottom glow effect */}
              <div
                className="absolute bottom-0 left-0 w-full h-[35%]"
                style={{
                  background:
                    "linear-gradient(to top, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0))",
                  filter: "blur(10px)",
                }}
              />
            </div>
            {/* Hide close button if hideClose is true */}
            {!hideClose && (
              <motion.button
                onClick={onClose}
                className={`absolute ${
                  isMobileHorizontal
                    ? "top-1.5 right-1.5 p-0.5"
                    : "top-2 right-2 p-1"
                } z-10 rounded-full transition-all duration-300 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 shadow-[0_0_15px_rgba(139,92,246,0.7)] border-2 border-violet-400/70 hover:border-fuchsia-300/80 focus:outline-none group overflow-hidden`}
                aria-label="Close"
                style={isMobileHorizontal ? { width: 28, height: 28 } : {}}
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.85, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                {/* Cosmic background with animated particles */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  {/* Nebula background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/70 via-purple-700/70 to-fuchsia-800/70 opacity-90"></div>

                  {/* Deep space effect */}
                  <div className="absolute inset-0 bg-black opacity-20 mix-blend-multiply"></div>

                  {/* Animated stars */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={`btn-star-${i}`}
                      className="absolute rounded-full bg-white"
                      style={{
                        width: `${Math.random() * 2 + 1}px`,
                        height: `${Math.random() * 2 + 1}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.4 + 0.3,
                        animation: `twinkle ${
                          Math.random() * 3 + 1
                        }s infinite alternate ${Math.random() * 2}s`,
                      }}
                    />
                  ))}

                  {/* Energy ripple effect - only visible on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-wave-x"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-wave-y"></div>
                  </div>

                  {/* Cosmic vortex effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-violet-600/20 animate-spin-slow"></div>
                  </div>
                </div>

                <span className="relative flex items-center justify-center">
                  {/* Outer glow ring */}
                  <span
                    className={`absolute ${
                      isMobileHorizontal ? "w-7 h-7" : "w-10 h-10"
                    } rounded-full bg-gradient-to-br from-fuchsia-500/60 via-purple-500/40 to-indigo-500/30 blur-md animate-pulse-slow z-0 group-hover:animate-ping-slow`}
                  ></span>

                  {/* Multiple spinning rings */}
                  <span
                    className={`absolute ${
                      isMobileHorizontal ? "w-5 h-5" : "w-8 h-8"
                    } rounded-full border border-fuchsia-300/60 group-hover:border-pink-300/80 z-0 opacity-80 group-hover:opacity-100`}
                    style={{
                      animation: "spin 7s linear infinite",
                    }}
                  ></span>

                  <span
                    className={`absolute ${
                      isMobileHorizontal ? "w-6 h-6" : "w-9 h-9"
                    } rounded-full border border-indigo-300/40 group-hover:border-cyan-300/60 z-0 opacity-70 group-hover:opacity-100`}
                    style={{
                      animation: "spin 10s linear infinite reverse",
                    }}
                  ></span>

                  {/* Orbital particle */}
                  <span
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/80 opacity-0 group-hover:opacity-100"
                    style={{
                      animation: "orbit 2s linear infinite",
                      boxShadow: "0 0 4px 1px rgba(255, 255, 255, 0.6)",
                    }}
                  ></span>

                  {/* Main icon with enhanced glow */}
                  <span className="relative z-10 animate-float">
                    <Icon
                      icon="mdi:close-circle-outline"
                      className={`${
                        isMobileHorizontal ? "w-4 h-4" : "w-6 h-6"
                      } text-white drop-shadow-lg group-hover:text-pink-100`}
                      style={{
                        filter:
                          "drop-shadow(0 0 8px rgba(233, 213, 255, 0.9)) drop-shadow(0 0 16px rgba(216, 180, 254, 0.7))",
                        animation: "pulse-subtle 2s infinite",
                      }}
                    />
                  </span>

                  {/* Multiple sparkles that appear on hover */}
                  <span className="absolute -top-1 -right-1 text-yellow-200 text-xs animate-bounce select-none pointer-events-none">
                    ✦
                  </span>
                  <span className="absolute -bottom-1 -left-1 text-pink-200 text-xs animate-bounce-delay select-none pointer-events-none opacity-0 group-hover:opacity-100">
                    ✦
                  </span>
                  <span className="absolute top-1 left-0 text-cyan-200 text-[10px] animate-bounce-slow select-none pointer-events-none opacity-0 group-hover:opacity-100">
                    ✧
                  </span>
                </span>

                {/* Power-up burst effect on click */}
                <span className="absolute inset-0 bg-white opacity-0 group-active:opacity-50 group-active:animate-ping-fast pointer-events-none rounded-full"></span>

                {/* Radial explosion on active */}
                <span className="absolute inset-0 rounded-full border-2 border-white/0 group-active:border-white/30 group-active:animate-circle-expand-fast opacity-0 group-active:opacity-100"></span>
              </motion.button>
            )}
            {children}
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
  highScore?: number; // Add high score property
  showNext?: boolean;
  isLevelCompleted?: boolean;
  showGoToModules?: boolean;
  showReset?: boolean;
  onReset?: () => void;
  moduleId?: string;
}

export const VictoryPopup: React.FC<VictoryPopupProps> = ({
  open,
  onClose,
  score,
  combo,
  health,
  highScore, // Add high score parameter
  showNext = false,
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

  // Handler for Reset
  const handleReset = useCallback(() => {
    if (onReset) onReset();
  }, [onReset]);

  // Update level progress when modal becomes visible and level is completed
  useEffect(() => {
    const updateLevelProgress = async () => {
      if (!open || !user || !isLevelCompleted || !moduleId || isUpdatingProgress) return;

      setIsUpdatingProgress(true);
      try {
        const { error } = await LevelProgressService.completeLevel(
          user.id,
          parseInt(moduleId),
          3 // Level 3
        );

        if (error) {
          console.error('Failed to update level progress:', error);
        } else {
          console.log(`Level 3 of Module ${moduleId} marked as completed`);
        }
      } catch (error) {
        console.error('Error updating level progress:', error);
      } finally {
        setIsUpdatingProgress(false);
      }
    };

    updateLevelProgress();
  }, [open, user, isLevelCompleted, moduleId, isUpdatingProgress]);

  // Reset the progress update flag when modal is closed
  useEffect(() => {
    if (!open) {
      setIsUpdatingProgress(false);
    }
  }, [open]);

  return (
    <Popup open={open} onClose={onClose} hideClose={showReset}>
      <motion.div
        className={`flex flex-col items-center mx-auto justify-center text-center text-white${
          isMobileHorizontal ? " scale-90 max-w-[320px] px-1" : ""
        }`}
        style={
          isMobileHorizontal
            ? {
                fontSize: "0.92rem",
                padding: "0.5rem",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }
            : { gap: "0.7rem" }
        }
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 22,
          duration: 0.5,
        }}
      >
        {/* 🧑‍🔬 Character + Info Side by Side with Stars Above */}
        <div className="w-full flex flex-col items-center">
          {/* Character + Info Side by Side */}
          <motion.div
            className={`relative w-full flex items-center justify-center py-3${
              isMobileHorizontal
                ? " py-1 mb-0 justify-center flex-row gap-2"
                : " flex-row gap-4"
            }`}
            style={isMobileHorizontal ? { justifyContent: "center" } : {}}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
          >
            <div className="flex flex-col justify-center flex-1">
              {/* ⭐ Stars */}
              <motion.div
                className={`relative flex justify-center items-center ${
                  isMobileHorizontal ? "h-12 w-full gap-1" : "h-16 w-full gap-2"
                }`}
                style={{
                  overflow: "visible",
                }}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 220,
                  damping: 16,
                }}
              >
                {[0, 1, 2].map((i) => {
                  // Star size based on position (middle star is bigger)
                  const getStarSize = () => {
                    if (i === 1) {
                      // Middle star
                      return isMobileHorizontal ? " text-3xl" : " text-5xl";
                    }
                    return isMobileHorizontal ? " text-2xl" : " text-4xl";
                  };

                  return (
                    <motion.div
                      key={i}
                      className={`relative flex items-center justify-center text-yellow-400 ${
                        i == 1 &&
                        (isMobileHorizontal ? "top-[-10px]" : "top-[-20px]")
                      } ${getStarSize()}`}
                      style={{
                        filter:
                          "drop-shadow(0 0 3px #fde68a) drop-shadow(0 0 6px #fbbf24)",
                      }}
                      initial={{ scale: 0.4, opacity: 0, rotate: -720 }}
                      animate={{
                        scale: [1.4, 0.95, 1],
                        opacity: 1,
                        rotate: [-720, 0],
                      }}
                      transition={{
                        delay: 0.25 + i * 0.18,
                        type: "tween",
                        ease: "easeOut",
                        duration: 0.9,
                      }}
                    >
                      ⭐
                    </motion.div>
                  );
                })}
              </motion.div>
              <motion.img
                src="/characters/chara.webp"
                alt="Worker Character"
                className={`object-contain mx-auto ${
                  isMobileHorizontal
                    ? "w-[210px] min-w-[100px] h-[130px] -mt-3"
                    : "w-[220px] min-w-[120px] h-[190px] -mt-4"
                }`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.7,
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                }}
              />
            </div>

            {/* Info Section */}
            <div
              className={`flex flex-col flex-1 ${
                isMobileHorizontal
                  ? "gap-1 ml-2 items-center justify-center text-center"
                  : "gap-2 ml-4 items-center justify-center text-center"
              }`}
              style={{ flex: 1, minWidth: 0 }}
            >
              {/* Level Completed Message */}
              {isLevelCompleted && (
                <motion.div
                  className={`relative flex flex-col items-center justify-center w-full mb-2 ${
                    isMobileHorizontal ? "mb-1" : "mb-3"
                  }`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                  }}
                >
                  {/* Gamified badge */}
                  <div
                    className={`relative flex items-center justify-center mb-1`}
                  >
                    <span
                      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-400 to-orange-300 shadow-lg border-2 border-yellow-200 ${
                        isMobileHorizontal ? "w-10 h-10 text-2xl" : "w-14 h-14 text-3xl"
                      } animate-bounce-slow`}
                      style={{
                        boxShadow:
                          "0 0 24px 6px rgba(253,224,71,0.25), 0 2px 8px 0 rgba(255,193,7,0.18)",
                        filter: "drop-shadow(0 0 8px #fde047)",
                      }}
                    >
                      🏆
                    </span>
                    {/* Confetti sparkles */}
                    <span className="absolute -top-2 left-1 text-yellow-200 text-xs animate-bounce select-none">✨</span>
                    <span className="absolute -bottom-2 right-1 text-orange-200 text-xs animate-bounce-delay select-none">✨</span>
                  </div>
                  {/* Gamified text */}
                  <span
                    className={`font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-300 ${
                      isMobileHorizontal ? "text-lg" : "text-2xl"
                    }`}
                    style={{
                      letterSpacing: "0.04em",
                      animation: "pulse-subtle 2s infinite ease-in-out",
                    }}
                  >
                    Level Up!
                  </span>
                  
                </motion.div>
              )}
              <div
                className={`flex items-center gap-2 font-semibold text-white/90 ${
                  isMobileHorizontal ? "text-sm" : "text-base"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:star" className={`text-yellow-400 ${isMobileHorizontal ? "w-4 h-4" : "w-5 h-5"}`} />
                  <span>Score:</span>
                  <span className="font-bold text-yellow-200">{score}</span>
                </span>
              </div>
              <div
                className={`flex items-center gap-2 font-semibold text-white/90 ${
                  isMobileHorizontal ? "text-sm" : "text-base"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:fire" className={`text-pink-400 ${isMobileHorizontal ? "w-4 h-4" : "w-5 h-5"}`} />
                  <span>Combo:</span>
                  <span className="font-bold text-pink-200">{combo}</span>
                </span>
              </div>
              <div
                className={`flex items-center gap-2 font-semibold text-white/90 ${
                  isMobileHorizontal ? "text-sm" : "text-base"
                }`}
              >
                Well Done!
              </div>
            </div>
          </motion.div>
        </div>
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
                className={`absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-[4px] opacity-50 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[2px]" : ""
                }`}
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2s infinite ease-in-out",
                }}
              />

              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(0,100,0,0.5),0_0_12px_rgba(34,197,94,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(0,100,0,0.5)] ${
                    isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                  }`}
                onClick={handleGoToLevels}
                aria-label="Back to Levels"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>

                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}
                    ></div>
                    <Icon
                      icon="mdi:home-map-marker"
                      className={`w-5 h-5 drop-shadow-glow${
                        isMobileHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                  </div>
                  <span className="whitespace-nowrap"></span>
                </div>

                {/* Particle effects - only shown on hover */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 rounded-full bg-white opacity-0 group-hover:animate-particle-float"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: "100%",
                        animationDelay: `${Math.random() * 1.5}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </button>
            </motion.div>
          )}

          {!isLevelCompleted && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-[4px] opacity-50 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[2px]" : ""
                }`}
                style={{
                  transform: "translateY(2px)",
                  animation:
                    "pulse-subtle 2s infinite ease-in-out alternate-reverse",
                }}
              />

              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(0,42,100,0.5),0_0_12px_rgba(59,130,246,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(0,42,100,0.5)] ${
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

                {/* Arrow trail effect - only shown on hover */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`arrow-${i}`}
                      className="absolute h-2 w-4 right-0 bg-white opacity-0 group-hover:animate-arrow-trail"
                      style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </button>
            </motion.div>
          )}

          {showReset && onReset && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur-[4px] opacity-50 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[2px]" : ""
                }`}
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2.5s infinite ease-in-out",
                }}
              />

              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(100,45,0,0.5),0_0_12px_rgba(245,158,11,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(100,45,0,0.5)] ${
                    isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                  }`}
                onClick={handleReset}
                aria-label="Reset Level"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>

                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div
                      className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}
                    ></div>
                    <Icon
                      icon="mdi:refresh"
                      className={`w-5 h-5 drop-shadow-glow group-hover:animate-spin-slow${
                        isMobileHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                  </div>
                  <span className="whitespace-nowrap">Reset Level</span>
                </div>

                {/* Circular reset animation - only shown on hover */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/20 group-hover:animate-circle-expand opacity-0 group-hover:opacity-100"></div>
                </div>
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </Popup>
  );
};
