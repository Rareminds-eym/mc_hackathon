import React, { useState } from 'react';
import { X, AlertTriangle, Target } from 'lucide-react';
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

  // Steps: 0 = Mission Briefing, 1 = Objectives
  const totalSteps = 2;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full border-2 border-cyan-400 glow-border
          ${isMobileHorizontal ? 'max-w-md max-h-60 p-2' : 'max-w-3xl max-h-96'}
          overflow-y-auto`}
      >
        <div className={isMobileHorizontal ? 'p-3' : 'p-8'}>
          <div className={`flex justify-between items-start mb-4 ${isMobileHorizontal ? 'gap-2' : 'mb-6'}`}>
            <div className={`flex items-center ${isMobileHorizontal ? 'gap-1' : 'gap-3'}`}>
              <AlertTriangle className={isMobileHorizontal ? 'w-5 h-5 text-yellow-400' : 'w-8 h-8 text-yellow-400'} />
              <h2 className={`game-font font-bold text-white ${isMobileHorizontal ? 'text-base' : 'text-2xl'}`}>{scenario.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className={`text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 ${isMobileHorizontal ? 'p-1' : 'p-2'}`}
            >
              <X className={isMobileHorizontal ? 'w-4 h-4' : 'w-6 h-6'} />
            </button>
          </div>

          {/* Step 0: Mission Briefing */}
          {step === 0 && (
            <div className={isMobileHorizontal ? 'mb-4' : 'mb-8'}>
              <h3 className={`game-font flex items-center ${isMobileHorizontal ? 'text-sm mb-1 gap-1' : 'text-lg mb-3 gap-2'} font-bold text-cyan-400`}>
                <Target className={isMobileHorizontal ? 'w-3 h-3' : 'w-5 h-5'} />
                MISSION BRIEFING:
              </h3>
              <p className={`leading-relaxed bg-gray-800/50 rounded-lg border border-gray-600 text-gray-300 ${isMobileHorizontal ? 'p-2 text-sm' : 'p-6 text-lg'}`}>
                {scenario.description}
              </p>
            </div>
          )}

          {/* Step 1: Objectives */}
          {step === 1 && (
            <div className={isMobileHorizontal ? 'mb-4' : 'mb-8'}>
              <h3 className={`game-font font-bold text-green-400 ${isMobileHorizontal ? 'text-sm mb-1' : 'text-lg mb-3'}`}>🎯 OBJECTIVES:</h3>
              <div className="space-y-2 text-gray-300">
                <div className={`flex items-center bg-gray-800/50 rounded-lg border border-gray-600 ${isMobileHorizontal ? 'gap-1 p-2 text-xs' : 'gap-3 p-3'}`}>
                  <div className={isMobileHorizontal ? 'w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs' : 'w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm'}>1</div>
                  <span>Identify the <strong className="text-red-400">violated GMP principles</strong></span>
                </div>
                <div className={`flex items-center bg-gray-800/50 rounded-lg border border-gray-600 ${isMobileHorizontal ? 'gap-1 p-2 text-xs' : 'gap-3 p-3'}`}>
                  <div className={isMobileHorizontal ? 'w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs' : 'w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm'}>2</div>
                  <span>Deploy appropriate <strong className="text-blue-400">corrective actions</strong></span>
                </div>
                <div className={`flex items-center bg-gray-800/50 rounded-lg border border-gray-600 ${isMobileHorizontal ? 'gap-1 p-2 text-xs' : 'gap-3 p-3'}`}>
                  <div className={isMobileHorizontal ? 'w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs' : 'w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm'}>3</div>
                  <span>Complete mission with maximum <strong className="text-green-400">efficiency</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div>
            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg game-font transition-all duration-300 transform shadow-lg hover:shadow-cyan-500/25
                  ${isMobileHorizontal ? 'py-1 px-2 text-sm min-h-8 h-8 hover:from-cyan-400 hover:to-blue-400 hover:scale-100' : 'py-4 text-lg hover:from-cyan-400 hover:to-blue-400 hover:scale-105'}`}
                style={isMobileHorizontal ? { minHeight: 32, height: 32, fontSize: '0.95rem', padding: '0.25rem 0.5rem' } : {}}
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg game-font transition-all duration-300 transform shadow-lg hover:shadow-cyan-500/25
                  ${isMobileHorizontal ? 'py-1 px-2 text-sm min-h-8 h-8 hover:from-cyan-400 hover:to-blue-400 hover:scale-100' : 'py-4 text-lg hover:from-cyan-400 hover:to-blue-400 hover:scale-105'}`}
                style={isMobileHorizontal ? { minHeight: 32, height: 32, fontSize: '0.95rem', padding: '0.25rem 0.5rem' } : {}}
              >
                🚀 BEGIN MISSION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
