import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useDeviceLayout } from "../../hooks/useOrientation";

interface Scenario {
  title: string;
  description: string;
}

interface ScenarioDialogProps {
  scenario: Scenario;
  onClose: () => void;
}

export const ScenarioDialog: React.FC<ScenarioDialogProps> = ({
  scenario,
  onClose,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const [step, setStep] = useState(0);

  // Early return if scenario is not provided
  if (!scenario) {
    console.error('ScenarioDialog: scenario prop is undefined');
    return null;
  }
  // Each objective is a step after the briefing
  const objectives = useMemo(
    () => [
      {
        color: "red",
        border: "border-red-400",
        bg: "bg-red-500",
        text: "text-red-300",
        label: "violated GMP principles",
        description: "Identify the ",
      },
      {
        color: "blue",
        border: "border-blue-400",
        bg: "bg-blue-500",
        text: "text-blue-300",
        label: "corrective actions",
        description: "Deploy appropriate ",
      },
      {
        color: "green",
        border: "border-green-400",
        bg: "bg-green-500",
        text: "text-green-300",
        label: "efficiency",
        description: "Complete mission with maximum ",
      },
    ],
    []
  );
  const totalSteps = 1 + objectives.length; // 1 for briefing, rest for objectives

  // Progress bar or dots
  const renderProgress = () => (
    <div className="flex justify-center items-center gap-2 mb-4">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === step ? "bg-cyan-400 w-5 h-2" : "bg-gray-600 w-2 h-2"
          } block`}
        />
      ))}
    </div>
  );

  // Typewriter effect for scenario description (robust, no stale closure, no double start)
  const [typedDescription, setTypedDescription] = useState("");
  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (step !== 0 || !scenario?.description) {
      setTypedDescription("");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      return;
    }
    setTypedDescription("");
    let i = 0;
    const desc = scenario.description;
    function typeNext() {
      setTypedDescription((prev) => {
        // Always use prev.length as the index to avoid race conditions
        if (prev.length >= desc.length) return prev;
        return prev + desc.charAt(prev.length);
      });
      i++;
      if (i < desc.length) {
        timeoutRef.current = window.setTimeout(typeNext, 18);
      }
    }
    if (desc.length > 0) {
      timeoutRef.current = window.setTimeout(typeNext, 18);
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario?.description, step]);

  // Animated card effect
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Pixel/retro style overlay */}
        <motion.div
          className="absolute inset-0 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className={`relative pixel-border-thick shadow-2xl
            ${isMobileHorizontal ? "max-w-md w-full p-2" : "max-w-2xl w-full p-6"}
            bg-gradient-to-br from-black via-gray-900 to-gray-950
            overflow-hidden animate-fadeIn text-cyan-100`}
          style={{ borderRadius: 0, boxShadow: "0 0 12px 2px #06b6d4, 0 2px 16px 0 #000" }}
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Scan Lines Effect */}
          <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>
          {/* Header with icon and close */}
          <div className="flex items-center justify-between gap-5 mb-2 relative z-10">
            <div className="flex items-center gap-2">
              <img
                src="/logos/bulb.png"
                alt="Mission"
                className={isMobileHorizontal ? "w-7 h-7" : "w-10 h-10"}
              />
            </div>
            <div
              className={`pixel-text font-black text-cyan-200 drop-shadow-lg text-center ${isMobileHorizontal ? "text-lg" : "text-2xl"}`}
            >
              {scenario.title}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-900/60 hover:bg-red-700/80 text-red-300 hover:text-white shadow-lg transition-all transform hover:scale-110 active:scale-90 border border-red-500/30"
              aria-label="Close dialog"
              autoFocus
              style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
            >
              <X className={`${isMobileHorizontal ? "w-5 h-5" : "w-7 h-7"} animate-pulse`} />
            </button>
          </div>
          {/* Animated content */}
          <div className="transition-all duration-300 min-h-[120px] relative z-10">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="briefing"
                  className="flex flex-col items-center text-center gap-3 animate-fadeIn"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-6 h-6 text-cyan-400" />
                    <h3 className="pixel-text text-cyan-400 font-bold text-base sm:text-lg tracking-wide">
                      MISSION BRIEFING
                    </h3>
                  </div>
                  <p
                    className={`bg-gray-800/60 pixel-border text-gray-200 shadow-inner ${isMobileHorizontal ? "text-sm px-2 py-2" : "text-lg px-4 py-3"}`}
                    style={{ minHeight: 32 }}
                  >
                    {typedDescription}
                    <span className="inline-block w-2 h-5 align-middle animate-pulse bg-cyan-300 ml-1" style={{ borderRadius: 2, verticalAlign: 'middle', opacity: typedDescription.length < (scenario?.description?.length || 0) ? 1 : 0 }} />
                  </p>
                </motion.div>
              ) : step > 0 && step <= objectives.length ? (
                <motion.div
                  key={`objective-${step}`}
                  className="flex flex-col items-center gap-3 animate-fadeIn w-full"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-2 mb-2 justify-center w-full">
                      <Star className={`w-6 h-6 text-${objectives[step - 1].color}-400 animate-pulse`} />
                      <h3 className={`pixel-text text-${objectives[step - 1].color}-400 font-bold text-base sm:text-lg tracking-wide`}>
                        OBJECTIVE {step}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <div className={`flex items-center gap-2 bg-gray-800/60 pixel-border ${objectives[step - 1].border} px-3 py-2 justify-center mx-auto`} style={{ maxWidth: "420px" }}>
                        <span className={`w-6 h-6 flex items-center justify-center ${objectives[step - 1].bg} text-white font-bold rounded-full`}>
                          {step}
                        </span>
                        <span className="text-gray-100 text-sm sm:text-base text-center">
                          {objectives[step - 1].description}
                          <strong className={objectives[step - 1].text}>{objectives[step - 1].label}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          {/* Navigation */}
          <div className="mt-4">{renderProgress()}</div>
          <div className="flex items-center justify-between mt-2 gap-3 relative z-10">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`flex items-center gap-1 pixel-border-thick pixel-text font-bold transition-all transform ${isMobileHorizontal ? 'px-4 py-2 text-xs min-w-[64px]' : 'px-3 py-2'} ${step === 0 ? "bg-gray-700/40 text-gray-400 cursor-not-allowed opacity-60" : "bg-gradient-to-r from-purple-700 to-indigo-900 text-cyan-200 hover:from-purple-600 hover:to-indigo-700 hover:text-white hover:scale-105 active:scale-95 shadow-lg border-cyan-400/30"}`}
              style={{ boxShadow: step === 0 ? 'none' : '0 0 8px rgba(6, 182, 212, 0.4)', minWidth: isMobileHorizontal ? 64 : undefined }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className={isMobileHorizontal ? 'hidden sm:inline' : ''}>Prev</span>
            </button>
            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className={`flex items-center gap-1 pixel-border-thick pixel-text font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:from-cyan-400 hover:to-blue-400 transition-all transform hover:scale-105 active:scale-95 border-cyan-300/50 ${isMobileHorizontal ? 'px-4 py-2 text-xs min-w-[64px]' : 'px-4 py-2'}`}
                style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)', textShadow: '0 0 5px rgba(255, 255, 255, 0.5)', minWidth: isMobileHorizontal ? 64 : undefined }}
              >
                <span className={isMobileHorizontal ? 'hidden sm:inline' : ''}>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`flex items-center gap-1 pixel-border-thick pixel-text font-bold bg-gradient-to-r from-green-400 to-cyan-500 text-yellow-900 shadow-lg hover:from-green-300 hover:to-cyan-400 transition-all transform hover:scale-105 active:scale-95 border-green-300/50 ${isMobileHorizontal ? 'px-4 py-2 text-xs min-w-[64px]' : 'px-4 py-2'}`}
                style={{ boxShadow: '0 0 15px rgba(52, 211, 153, 0.7)', textShadow: '0 0 5px rgba(255, 255, 255, 0.7)', minWidth: isMobileHorizontal ? 64 : undefined }}
              >
                <span className={isMobileHorizontal ? 'hidden sm:inline' : ''}>BEGIN MISSION</span>
                <Star className="w-4 h-4 animate-pulse" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
