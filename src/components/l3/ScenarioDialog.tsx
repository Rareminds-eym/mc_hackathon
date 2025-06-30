import React, { useState } from 'react';
import { X, AlertTriangle, Target, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { useDeviceLayout } from '../../hooks/useOrientation';

interface Scenario {
  title: string;
  description: string;
}

interface ScenarioDialogProps {
  scenario: Scenario;
  onClose: () => void;
}

export const ScenarioDialog: React.FC<ScenarioDialogProps> = ({ scenario, onClose }) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const [step, setStep] = useState(0);
  const totalSteps = 2;

  // Progress bar or dots
  const renderProgress = () => (
    <div className="flex justify-center items-center gap-2 mb-4">
      {[...Array(totalSteps)].map((_, i) => (
        <span
          key={i}
          className={`transition-all duration-300 rounded-full ${i === step ? 'bg-cyan-400 w-5 h-2' : 'bg-gray-600 w-2 h-2'} block`}
        />
      ))}
    </div>
  );

  // Animated card effect
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-cyan-900/50 backdrop-blur-[2px]" />
      <div
        className={`relative rounded-2xl shadow-2xl border-2 border-cyan-400
          ${isMobileHorizontal ? 'max-w-md w-full p-2' : 'max-w-2xl w-full p-6'}
          bg-gradient-to-br from-gray-900/90 to-gray-800/80
          overflow-hidden animate-fadeIn`}
        style={{ boxShadow: '0 0 12px 2px #06b6d4, 0 2px 16px 0 #000' }}
      >
        {/* Header with icon and close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src="/logos/bulb.png" alt="Mission" className={isMobileHorizontal ? 'w-7 h-7' : 'w-10 h-10'} />
            <span className={`game-font font-extrabold text-cyan-300 drop-shadow-lg ${isMobileHorizontal ? 'text-lg' : 'text-2xl'}`}>{scenario.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-cyan-900/60 hover:bg-cyan-700/80 text-cyan-300 hover:text-white shadow-lg transition-all"
            aria-label="Close dialog"
          >
            <X className={isMobileHorizontal ? 'w-5 h-5' : 'w-7 h-7'} />
          </button>
        </div>
        {/* {renderProgress()} */}
        {/* Animated content */}
        <div className="transition-all duration-300 min-h-[120px]">
          {step === 0 && (
            <div className="flex flex-col items-center text-center gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 text-cyan-400" />
                <h3 className="game-font text-cyan-400 font-bold text-base sm:text-lg tracking-wide">MISSION BRIEFING</h3>
              </div>
              <p className={`bg-gray-800/60 border border-cyan-700 rounded-xl px-4 py-3 text-gray-200 shadow-inner ${isMobileHorizontal ? 'text-sm' : 'text-lg'}`}>{scenario.description}</p>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col items-center gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 text-green-400 animate-pulse" />
                <h3 className="game-font text-green-400 font-bold text-base sm:text-lg tracking-wide">MISSION OBJECTIVES</h3>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 bg-gray-800/60 border border-red-400 rounded-lg px-3 py-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white font-bold rounded-full">1</span>
                  <span className="text-gray-100 text-sm sm:text-base">Identify the <strong className="text-red-300">violated GMP principles</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/60 border border-blue-400 rounded-lg px-3 py-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full">2</span>
                  <span className="text-gray-100 text-sm sm:text-base">Deploy appropriate <strong className="text-blue-300">corrective actions</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/60 border border-green-400 rounded-lg px-3 py-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-500 text-white font-bold rounded-full">3</span>
                  <span className="text-gray-100 text-sm sm:text-base">Complete mission with maximum <strong className="text-green-300">efficiency</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg font-bold transition-all
              ${step === 0 ? 'bg-gray-700/40 text-gray-400 cursor-not-allowed' : 'bg-cyan-800/70 text-cyan-200 hover:bg-cyan-700/80 hover:text-white'}`}
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
      </div>
    </div>
  );
};
