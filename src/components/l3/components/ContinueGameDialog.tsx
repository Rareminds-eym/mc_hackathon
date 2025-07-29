// src/components/l3/components/ContinueGameDialog.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Clock, Play, RotateCcw, X } from 'lucide-react';
import { useDeviceLayout } from '../../../hooks/useOrientation';

interface ContinueGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onStartNew: () => void;
  progressSummary: {
    currentScenario: number;
    totalScenarios: number;
    completedScenarios: number;
    progressPercentage: number;
    timeSaved: string;
    timeAgo: string;
    gameStats?: {
      score: number;
      health: number;
      combo: number;
      timer: number;
    };
  } | null;
  isLoading?: boolean;
}

/**
 * Dialog component for continuing saved game progress
 */
export const ContinueGameDialog: React.FC<ContinueGameDialogProps> = ({
  isOpen,
  onClose,
  onContinue,
  onStartNew,
  progressSummary,
  isLoading = false,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();

  if (!isOpen || !progressSummary) return null;

  const isMobileHorizontal = isMobile && isHorizontal;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`pixel-border-thick bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-cyan-100 shadow-2xl relative overflow-hidden ${
          isMobileHorizontal
            ? "w-[95vw] max-w-[500px] p-3 max-h-[85vh] overflow-y-auto"
            : isMobile
            ? "w-[90vw] max-w-[380px] p-4 max-h-[90vh] overflow-y-auto"
            : "w-[500px] max-w-[90vw] p-6"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: 0 }}
      >
        {/* Scan Lines Effect */}
        <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-300" />
        </button>

        {/* Header */}
        <div className={`relative z-10 text-center ${isMobile ? "mb-4" : "mb-6"}`}>
          <div className={`flex items-center justify-center gap-2 ${isMobile ? "mb-2" : "mb-3"}`}>
            <Icon icon="mdi:content-save" className={`text-green-300 ${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />
            <h2 className={`pixel-text font-black text-green-200 tracking-wider ${
              isMobile ? "text-lg" : "text-2xl"
            }`}>
              CONTINUE GAME?
            </h2>
          </div>
          <p className={`text-cyan-200 font-bold ${isMobile ? "text-sm" : ""}`}>
            We found your saved progress!
          </p>
        </div>

        {/* Progress Summary */}
        <div className={`relative z-10 ${isMobile ? "mb-4" : "mb-6"}`}>
          <div className={`pixel-border bg-gray-800/60 ${isMobile ? "p-3" : "p-4"}`}>
            <h3 className={`pixel-text font-bold text-yellow-200 text-center ${
              isMobile ? "text-sm mb-2" : "text-base mb-3"
            }`}>
              SAVED PROGRESS
            </h3>
            
            {/* Progress Stats */}
            <div className={`grid ${isMobile ? "grid-cols-2 gap-2 mb-3" : "grid-cols-2 gap-3 mb-4"}`}>
              <div className={`pixel-border bg-blue-800/80 text-center ${isMobile ? "p-2" : "p-3"}`}>
                <div className={`text-blue-200 font-bold mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>
                  SCENARIO
                </div>
                <div className={`text-blue-100 font-black ${isMobile ? "text-sm" : "text-lg"}`}>
                  {progressSummary.currentScenario} / {progressSummary.totalScenarios}
                </div>
              </div>
              
              <div className={`pixel-border bg-green-800/80 text-center ${isMobile ? "p-2" : "p-3"}`}>
                <div className={`text-green-200 font-bold mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>
                  PROGRESS
                </div>
                <div className={`text-green-100 font-black ${isMobile ? "text-sm" : "text-lg"}`}>
                  {progressSummary.progressPercentage}%
                </div>
              </div>
            </div>

            {/* Game Stats */}
            {progressSummary.gameStats && (
              <div className={`grid grid-cols-3 gap-2 ${isMobile ? "mb-3" : "mb-4"}`}>
                <div className={`pixel-border bg-purple-800/80 text-center ${isMobile ? "p-1.5" : "p-2"}`}>
                  <div className={`text-purple-200 font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    SCORE
                  </div>
                  <div className={`text-purple-100 font-black ${isMobile ? "text-xs" : "text-sm"}`}>
                    {progressSummary.gameStats.score}
                  </div>
                </div>
                
                <div className={`pixel-border bg-red-800/80 text-center ${isMobile ? "p-1.5" : "p-2"}`}>
                  <div className={`text-red-200 font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    HEALTH
                  </div>
                  <div className={`text-red-100 font-black ${isMobile ? "text-xs" : "text-sm"}`}>
                    {progressSummary.gameStats.health}
                  </div>
                </div>
                
                <div className={`pixel-border bg-yellow-800/80 text-center ${isMobile ? "p-1.5" : "p-2"}`}>
                  <div className={`text-yellow-200 font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    COMBO
                  </div>
                  <div className={`text-yellow-100 font-black ${isMobile ? "text-xs" : "text-sm"}`}>
                    {progressSummary.gameStats.combo}
                  </div>
                </div>
              </div>
            )}

            {/* Time Info */}
            <div className={`flex items-center justify-center gap-2 text-gray-300 ${
              isMobile ? "text-xs" : "text-sm"
            }`}>
              <Clock className="w-4 h-4" />
              <span>Saved {progressSummary.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`relative z-10 flex gap-3 ${
          isMobile ? "flex-col" : "flex-col sm:flex-row"
        }`}>
          <button
            className={`pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 text-white font-black pixel-text hover:from-green-400 hover:to-blue-500 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMobile ? "px-4 py-3 text-sm" : "px-6 py-3 flex-1"
            }`}
            onClick={onContinue}
            disabled={isLoading}
            aria-label="Continue Game"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Loading...
              </>
            ) : (
              <>
                <Play className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                Continue Game
              </>
            )}
          </button>
          
          <button
            className={`pixel-border-thick bg-gradient-to-r from-orange-500 to-red-600 text-white font-black pixel-text hover:from-orange-400 hover:to-red-500 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMobile ? "px-4 py-3 text-sm" : "px-6 py-3 flex-1"
            }`}
            onClick={onStartNew}
            disabled={isLoading}
            aria-label="Start New Game"
          >
            <RotateCcw className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            Start New
          </button>
        </div>

        {/* Warning Text */}
        <div className={`relative z-10 text-center ${isMobile ? "mt-3" : "mt-4"}`}>
          <p className={`text-yellow-200 font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
            ⚠️ Starting a new game will overwrite your saved progress
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
