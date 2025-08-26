import { CheckCircle } from "lucide-react";
import React from "react";
import { NavigationBarProps } from "../types";

const NavigationBar: React.FC<NavigationBarProps> = ({
  stage,
  canProceed,
  currentStageData,
  isMobileHorizontal,
  onProceed,
}) => {
  return (
    <div
      className={` bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-900 via-gray-800/95 to-transparent ${
        isMobileHorizontal ? "p-1" : "p-4"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`pixel-border-thick bg-gray-900/90 relative overflow-hidden ${
            isMobileHorizontal ? "p-2" : "p-4"
          }`}
        >
          <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-10"></div>

          <div
            className={`relative z-10 flex items-center ${
              isMobileHorizontal ? "justify-center" : "justify-between"
            }`}
          >
            {/* Progress Info - Hidden on mobile horizontal */}
            {!isMobileHorizontal && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 transition-all duration-300 ${
                      canProceed ? "bg-green-400 animate-pulse" : "bg-gray-600"
                    } pixel-border`}
                  ></div>
                  <div className="pixel-text text-sm font-bold">
                    <span
                      className={
                        canProceed ? "text-green-400" : "text-gray-400"
                      }
                    >
                      {canProceed
                        ? "READY TO PROCEED"
                        : "COMPLETE CURRENT STAGE"}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center space-x-2">
                  <span className="pixel-text text-sm font-bold text-cyan-300">
                    STAGE {stage}/10
                  </span>
                  <div className="w-20 h-2 bg-gray-700 pixel-border">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${(stage / 9) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Proceed Button */}
            <button
              className={`pixel-border-thick pixel-text flex items-center justify-center transition-all duration-300 font-black relative overflow-hidden group ${
                isMobileHorizontal
                  ? "px-4 py-2 text-xs space-x-1"
                  : "px-8 py-4 text-lg space-x-2"
              } ${
                canProceed
                  ? `bg-gradient-to-r ${currentStageData.color} hover:scale-105 shadow-lg`
                  : "bg-gray-700 cursor-not-allowed opacity-50"
              }`}
              style={{
                minWidth: isMobileHorizontal ? "100px" : "200px",
                boxShadow: canProceed ? `0 0 20px rgba(6,182,212,0.3)` : "none",
              }}
              onClick={onProceed}
              disabled={!canProceed}
            >
              {/* Animated Background */}
              {canProceed && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}

              <div
                className={`relative z-10 flex items-center ${
                  isMobileHorizontal ? "space-x-1" : "space-x-2"
                }`}
              >
                <>
                  <span>{"PROCEED"}</span>
                  {canProceed && !isMobileHorizontal && (
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  )}
                </>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
