import React, { useState } from 'react';
import { Popup } from './Popup';

/**
 * Test component to verify the unified Popup component works correctly
 * This is for testing and debugging purposes
 */
const PopupTest: React.FC = () => {
  const [showGenericPopup, setShowGenericPopup] = useState(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="grid-pattern"></div>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="pixel-text font-black text-cyan-100 text-4xl mb-2 tracking-wider">
          PIXEL POPUP TEST
        </h1>
        <p className="text-cyan-200 font-bold mb-8">Retro Gaming Theme</p>

        <div className="space-y-4">
          <button
            onClick={() => setShowGenericPopup(true)}
            className="block w-full pixel-border-thick bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-black pixel-text py-3 px-6 transition-all duration-200 active:translate-y-[2px]"
            style={{ borderRadius: 0 }}
          >
            SHOW GENERIC POPUP
          </button>

          <button
            onClick={() => setShowVictoryPopup(true)}
            className="block w-full pixel-border-thick bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black pixel-text py-3 px-6 transition-all duration-200 active:translate-y-[2px]"
            style={{ borderRadius: 0 }}
          >
            SHOW VICTORY POPUP
          </button>
        </div>

        <div className="mt-8 pixel-border bg-gray-800/60 p-4 text-cyan-100 text-sm max-w-md mx-auto" style={{ borderRadius: 0 }}>
          <p className="font-bold mb-2">PIXEL THEME FEATURES:</p>
          <ul className="text-left space-y-1">
            <li>• Pixel borders and retro styling</li>
            <li>• Scan lines and grid patterns</li>
            <li>• Sharp, pixelated design elements</li>
            <li>• Gaming-inspired color scheme</li>
          </ul>
        </div>
      </div>

      {/* Generic Popup */}
      <Popup
        variant="generic"
        open={showGenericPopup}
        onClose={() => setShowGenericPopup(false)}
        showNavigation={true}
        onBack={() => console.log('Back clicked')}
        onContinue={() => console.log('Continue clicked')}
        continueText="BACK"
        backText="CONTINUE"
      >
        <div className="text-center text-cyan-100 p-4">
          <h2 className="pixel-text font-black text-yellow-200 text-xl mb-4 tracking-wider">
            GENERIC POPUP TEST
          </h2>
          <p className="mb-4 font-bold">
            This is the unified popup component in generic mode with pixel styling!
          </p>
          <div className="space-y-3">
            <div className="w-4 h-4 bg-cyan-400 mx-auto mb-2 pixel-dot" />
            <div className="pixel-border bg-blue-800/60 p-3" style={{ borderRadius: 0 }}>
              <p className="text-sm text-blue-200 font-bold">
                FEATURES: Pixel borders, scan lines, and retro gaming aesthetics.
              </p>
            </div>
          </div>
        </div>
      </Popup>

      {/* Victory Popup */}
      <Popup
        variant="victory"
        open={showVictoryPopup}
        onClose={() => setShowVictoryPopup(false)}
        score={15420}
        combo={12}
        health={85}
        highScore={18500}
        isLevelCompleted={true}
        showGoToModules={true}
        showReset={true}
        onReset={() => {
          console.log('Reset clicked');
          setShowVictoryPopup(false);
        }}
        moduleId="3"
      />
    </div>
  );
};

export default PopupTest;
