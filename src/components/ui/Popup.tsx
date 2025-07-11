import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className={`pixel-border-thick bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl flex flex-col items-stretch relative ${
              isMobileHorizontal
                ? "w-[95vw] max-w-[360px] min-h-[120px] p-2"
                : "w-[420px] max-w-[96vw] p-6"
            }`}
            style={{
              borderRadius: 0,
              maxWidth: isMobileHorizontal ? "95vw" : "420px",
              minHeight: isMobileHorizontal ? "120px" : undefined,
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
            }}
          >
            {/* Close button, always top right, never overlaps content */}
            {!hideClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 z-10 pixel-border bg-red-700 hover:bg-red-600 text-white font-bold px-2 py-1 pixel-text text-xs transition-all duration-150 active:scale-95"
                aria-label="Close"
                style={{ borderRadius: 0 }}
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            )}
            {/* Main content, with consistent padding and spacing */}
            <div className="flex flex-col items-center w-full px-2 py-1 sm:px-4 sm:py-2">
              {children}
            </div>
          </div>
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
  isLevelCompleted = false,
  showGoToModules = true,
  showReset = false,
  onReset,
  moduleId,
}) => {
  // Handler for reset button
  const handleReset = () => {
    if (onReset) onReset();
  };
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

  // Handler for Reset
  return (
    <Popup open={open} onClose={onClose} hideClose={showReset}>
      <div className={`flex flex-col items-center mx-auto justify-center text-center text-white${isMobileHorizontal ? " scale-90 max-w-[320px] px-1" : ""}`}
        style={isMobileHorizontal ? { fontSize: "0.92rem", padding: "0.5rem", alignItems: "center", textAlign: "center", justifyContent: "center", gap: "0.4rem" } : { gap: "0.7rem" }}>
        {/* Pixel-art retro popup container */}
        <div className="relative w-full flex flex-col items-center">
          <div className={`relative w-full flex items-center justify-center py-3${isMobileHorizontal ? " py-1 mb-0 justify-center flex-row gap-2" : " flex-row gap-4"}`}
            style={isMobileHorizontal ? { justifyContent: "center" } : {}}>
            {/* Pixel border and background */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none pixel-border-thick bg-gradient-to-br from-gray-800 to-gray-900 ${isMobileHorizontal ? "w-[260px] h-[180px]" : "w-[340px] h-[240px]"}`}
              style={{ opacity: 0.98, borderRadius: "12px" }} />
            {/* Character and pixel stars */}
            <div className="flex flex-col justify-center flex-1 z-10">
              {/* Pixel stars */}
              <div className={`relative flex justify-center items-center ${isMobileHorizontal ? "h-12 w-full gap-1" : "h-16 w-full gap-2"}`}
                style={{ overflow: "visible" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`relative flex items-center justify-center ${i === 1 ? (isMobileHorizontal ? "text-3xl" : "text-5xl") : (isMobileHorizontal ? "text-2xl" : "text-4xl")}`}
                  >
                    <span className={`inline-block pixel-dot ${i === 1 ? "bg-yellow-400" : "bg-blue-400"} rounded-sm`} style={{ width: i === 1 ? 18 : 12, height: i === 1 ? 18 : 12, margin: 2 }} />
                  </div>
                ))}
              </div>
              {/* Character (no neon glow) */}
              <img
                src="/characters/chara.webp"
                alt="Worker Character"
                className={`object-contain mx-auto pixel-border ${isMobileHorizontal ? "w-[80px] h-[60px]" : "w-[120px] h-[100px]"}`}
                style={{ borderRadius: "8px", background: "#222", marginTop: isMobileHorizontal ? 0 : -8 }}
              />
            </div>
            {/* Info Section */}
            <div className={`flex flex-col flex-1 z-10 ${isMobileHorizontal ? "gap-1 ml-2 items-center justify-center text-center" : "gap-2 ml-4 items-center justify-center text-center"}`} style={{ flex: 1, minWidth: 0 }}>
              {/* Level Completed Message */}
              {isLevelCompleted && (
                <div className={`relative flex flex-col items-center justify-center w-full mb-2 ${isMobileHorizontal ? "mb-1" : "mb-3"}`}>
                  {/* Pixel badge */}
                  <div className="relative flex items-center justify-center mb-1">
                    <span className="inline-flex items-center justify-center select-none pixel-border-thick bg-yellow-400 text-yellow-900 font-black animate-bounce-slow" style={{ width: isMobileHorizontal ? 40 : 56, height: isMobileHorizontal ? 40 : 56, fontSize: isMobileHorizontal ? 22 : 28, borderRadius: 6 }}>
                      <Icon icon="mdi:trophy-variant-outline" className="text-yellow-900" />
                    </span>
                  </div>
                  {/* Pixel text */}
                  <span className="font-black pixel-text tracking-wide text-yellow-200" style={{ fontSize: isMobileHorizontal ? 18 : 26, letterSpacing: "0.04em" }}>
                    LEVEL UP!
                  </span>
                </div>
              )}
              {/* Score, Combo, Health - pixel style */}
              <div className={`flex items-center gap-2 font-black text-green-200 pixel-text ${isMobileHorizontal ? "text-sm" : "text-base"}`}>
                <span className="inline-flex items-center gap-1">
                  <span className="pixel-dot bg-yellow-400 w-3 h-3 inline-block rounded-sm" />
                  <span>Score:</span>
                  <span className="font-black text-yellow-200">{score}</span>
                </span>
              </div>
              <div className={`flex items-center gap-2 font-black text-blue-200 pixel-text ${isMobileHorizontal ? "text-sm" : "text-base"}`}>
                <span className="inline-flex items-center gap-1">
                  <span className="pixel-dot bg-blue-400 w-3 h-3 inline-block rounded-sm" />
                  <span>Combo:</span>
                  <span className="font-black text-blue-100">{combo}</span>
                </span>
              </div>
              <div className={`flex items-center gap-2 font-black text-pink-200 pixel-text ${isMobileHorizontal ? "text-sm" : "text-base"}`}>
                <span className="inline-flex items-center gap-1">
                  <span className="pixel-dot bg-pink-400 w-3 h-3 inline-block rounded-sm" />
                  <span>Health:</span>
                  <span className="font-black text-pink-100">{health}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Pixel-art retro buttons */}
        <div className={`flex justify-center gap-4 w-full mt-2${isMobileHorizontal ? " gap-2 mt-1 justify-center" : ""}`} style={isMobileHorizontal ? { justifyContent: "center" } : {}}>
          {showGoToModules && (
            <button
              className="pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 text-white font-black rounded-sm flex items-center gap-1 px-4 py-2 pixel-text hover:from-green-400 hover:to-blue-500 transition-all duration-200 active:translate-y-[2px]"
              onClick={handleGoToLevels}
              aria-label="Back to Levels"
              type="button"
              style={{ fontSize: isMobileHorizontal ? 14 : 16 }}
            >
              <Icon icon="mdi:home-map-marker" className="w-5 h-5 mr-1" />
              Back to Levels
            </button>
          )}
          {!isLevelCompleted && (
            <button
              className="pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-black rounded-sm flex items-center gap-1 px-4 py-2 pixel-text hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 active:translate-y-[2px]"
              onClick={handleNext}
              aria-label="Next"
              type="button"
              style={{ fontSize: isMobileHorizontal ? 14 : 16 }}
            >
              Next
              <Icon icon="mdi:arrow-right-bold" className="w-5 h-5 ml-1" />
            </button>
          )}
          {showReset && onReset && (
            <button
              className="pixel-border-thick bg-gradient-to-r from-red-500 to-pink-500 text-white font-black rounded-sm flex items-center gap-1 px-4 py-2 pixel-text hover:from-red-400 hover:to-pink-400 transition-all duration-200 active:translate-y-[2px]"
              onClick={handleReset}
              aria-label="Reset Level"
              type="button"
              style={{ fontSize: isMobileHorizontal ? 14 : 16 }}
            >
              <Icon icon="mdi:refresh" className="w-5 h-5 mr-1" />
              Reset Level
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
}
