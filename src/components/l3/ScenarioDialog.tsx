import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Target,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
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
  // Each objective is a step after the briefing
  const objectives = [
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
  ];
  const totalSteps = 1 + objectives.length; // 1 for briefing, rest for objectives

  // Progress bar or dots
  const renderProgress = () => (
    <div className="flex justify-center items-center gap-2 mb-4">
      {[...Array(totalSteps)].map((_, i) => (
        <span
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === step ? "bg-cyan-400 w-5 h-2" : "bg-gray-600 w-2 h-2"
          } block`}
        />
      ))}
    </div>
  );

  // Animated card effect
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/70 to-cyan-900/50 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className={`relative rounded-2xl shadow-2xl border-2 border-cyan-400
            ${
              isMobileHorizontal
                ? "max-w-md w-full p-2"
                : "max-w-2xl w-full p-6"
            }
            bg-gradient-to-br from-gray-900/90 to-gray-800/80
            overflow-hidden animate-fadeIn`}
          style={{ boxShadow: "0 0 12px 2px #06b6d4, 0 2px 16px 0 #000" }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header with icon and close */}
          <div className="flex items-center justify-between gap-5 mb-2">
            <div className="flex items-center gap-2">
              <img
                src="/logos/bulb.png"
                alt="Mission"
                className={isMobileHorizontal ? "w-7 h-7" : "w-10 h-10"}
              />
            </div>
            <div
              className={`game-font font-extrabold text-cyan-300 drop-shadow-lg text-center ${
                isMobileHorizontal ? "text-lg" : "text-2xl"
              }`}
            >
              {scenario.title}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-cyan-900/60 hover:bg-cyan-700/80 text-cyan-300 hover:text-white shadow-lg transition-all"
              aria-label="Close dialog"
            >
              <X className={isMobileHorizontal ? "w-5 h-5" : "w-7 h-7"} />
            </button>
          </div>
          {/* Animated content */}
          <div className="transition-all duration-300 min-h-[120px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
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
                    <h3 className="game-font text-cyan-400 font-bold text-base sm:text-lg tracking-wide">
                      MISSION BRIEFING
                    </h3>
                  </div>
                  <p
                    className={`bg-gray-800/60 border border-cyan-700 rounded-xl px-4 py-3 text-gray-200 shadow-inner ${
                      isMobileHorizontal ? "text-sm" : "text-lg"
                    }`}
                  >
                    {scenario.description}
                  </p>
                </motion.div>
              )}
              {step > 0 && step <= objectives.length && (
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
                      <Star
                        className={`w-6 h-6 text-${
                          objectives[step - 1].color
                        }-400 animate-pulse`}
                      />
                      <h3
                        className={`game-font text-${
                          objectives[step - 1].color
                        }-400 font-bold text-base sm:text-lg tracking-wide`}
                      >
                        OBJECTIVE {step}
                      </h3>
                    </div>
                    <div className={`flex flex-col items-center w-full`}>
                      <div
                        className={`flex items-center gap-2 bg-gray-800/60 ${
                          objectives[step - 1].border
                        } rounded-lg px-3 py-2 justify-center mx-auto`}
                        style={{ maxWidth: "420px" }}
                      >
                        <span
                          className={`w-6 h-6 flex items-center justify-center ${
                            objectives[step - 1].bg
                          } text-white font-bold rounded-full`}
                        >
                          {step}
                        </span>
                        <span className="text-gray-100 text-sm sm:text-base text-center">
                          {objectives[step - 1].description}
                          <strong className={objectives[step - 1].text}>
                            {objectives[step - 1].label}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Navigation */}
          <div className="mt-4">{renderProgress()}</div>

          <div className="flex items-center justify-between mt-2 gap-2">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-all
                ${
                  step === 0
                    ? "bg-gray-700/40 text-gray-400 cursor-not-allowed"
                    : "bg-cyan-800/70 text-cyan-200 hover:bg-cyan-700/80 hover:text-white"
                }`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-md hover:from-cyan-400 hover:to-blue-400 transition-all game-font"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-green-400 to-cyan-500 text-white font-bold shadow-md hover:from-green-300 hover:to-cyan-400 transition-all game-font text-base"
              >
                BEGIN MISSION
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
