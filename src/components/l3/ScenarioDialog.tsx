
import React from 'react';
import { X, AlertTriangle, Target } from 'lucide-react';

interface Scenario {
  title: string;
  description: string;
}

interface ScenarioDialogProps {
  scenario: Scenario;
  onClose: () => void;
}

export const ScenarioDialog: React.FC<ScenarioDialogProps> = ({ scenario, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-96 overflow-y-auto border-2 border-cyan-400 glow-border">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white game-font">{scenario.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-bold text-cyan-400 mb-3 game-font flex items-center gap-2">
              <Target className="w-5 h-5" />
              MISSION BRIEFING:
            </h3>
            <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-6 rounded-lg border border-gray-600 text-lg">
              {scenario.description}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-green-400 mb-3 game-font">🎯 OBJECTIVES:</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <span>Identify the <strong className="text-red-400">violated GMP principles</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <span>Deploy appropriate <strong className="text-blue-400">corrective actions</strong></span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <span>Complete mission with maximum <strong className="text-green-400">efficiency</strong></span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 game-font text-lg"
          >
            🚀 BEGIN MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
