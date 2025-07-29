import React, { useState } from 'react';
import { VictoryPopup } from './Popup';

/**
 * Example component demonstrating how to use the VictoryPopup
 * This is for testing and demonstration purposes
 */
const VictoryPopupExample: React.FC = () => {
  const [showVictory, setShowVictory] = useState(false);

  const handleShowVictory = () => {
    setShowVictory(true);
  };

  const handleCloseVictory = () => {
    setShowVictory(false);
  };

  const handleReset = () => {
    console.log('Reset game');
    setShowVictory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          Victory Popup Demo
        </h1>
        
        <button
          onClick={handleShowVictory}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          Show Victory Popup
        </button>

        <div className="mt-8 text-white/70 text-sm max-w-md mx-auto">
          <p>Click the button above to see the VictoryPopup component in action.</p>
          <p className="mt-2">Features demonstrated:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Animated entrance with spring physics</li>
            <li>Gaming-themed design with cosmic effects</li>
            <li>Responsive layout for mobile and desktop</li>
            <li>Score, combo, and health display</li>
            <li>Achievement badge for level completion</li>
            <li>Multiple action buttons with hover effects</li>
            <li>Particle animations and glowing effects</li>
          </ul>
        </div>
      </div>

      <VictoryPopup
        open={showVictory}
        onClose={handleCloseVictory}
        score={15420}
        combo={12}
        health={85}
        highScore={18500}
        isLevelCompleted={true}
        showGoToModules={true}
        showReset={true}
        onReset={handleReset}
        moduleId="3"
      />
    </div>
  );
};

export default VictoryPopupExample;
