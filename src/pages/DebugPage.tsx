import React, { useState } from 'react';
import LevelProgressDebug from '../components/Debug/LevelProgressDebug';
import { Popup, VictoryPopup } from '../components/ui/Popup';

const DebugPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState(1);
  const [showBasicPopup, setShowBasicPopup] = useState(false);
  const [showVictoryPopup, setShowVictoryPopup] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">Level Progress Debug Tool</h1>
          <p className="text-center text-gray-600 mb-4">
            Use this tool to debug and fix level progression issues
          </p>
          
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(moduleId => (
                <button
                  key={moduleId}
                  onClick={() => setSelectedModule(moduleId)}
                  className={`px-4 py-2 rounded ${
                    selectedModule === moduleId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Module {moduleId}
                </button>
              ))}
            </div>
          </div>
        </div>

        <LevelProgressDebug moduleId={selectedModule} />

        {/* Popup Demo Section */}
        <div className="mt-8 p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🎮 Redesigned Popup Demo</h2>
          <p className="text-gray-600 mb-4">
            Test the new gaming-style popup components with enhanced animations and pixel art aesthetic.
          </p>

          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setShowBasicPopup(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Show Basic Popup
            </button>
            <button
              onClick={() => setShowVictoryPopup(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Show Victory Popup
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">New Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Enhanced backdrop with gradient and blur effects</li>
              <li>Animated background particles for gaming atmosphere</li>
              <li>Pixel art borders with cyan accent colors</li>
              <li>Spring animations for smooth entrance/exit</li>
              <li>Gaming-style corner accents and overlays</li>
              <li>Enhanced buttons with hover effects and shine animations</li>
              <li>Improved stats display with animated icons</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Check Current State:</strong> Click "Refresh Data" to see the current progress data
            </li>
            <li>
              <strong>Test Level Unlocking:</strong> Use the "Test Level X" buttons to check if levels are properly locked/unlocked
            </li>
            <li>
              <strong>Reset if Needed:</strong> If levels are incorrectly unlocked, click "Reset All Progress" to clear all data
            </li>
            <li>
              <strong>Initialize Properly:</strong> Click "Initialize Module X" to set up the module with only level 1 unlocked
            </li>
            <li>
              <strong>Test Progression:</strong> Complete level 1 in the game, then check if only level 2 becomes unlocked
            </li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Important Notes</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            <li>This debug tool should only be used in development/testing</li>
            <li>Resetting progress will delete ALL user progress data</li>
            <li>Make sure to test the progression after making changes</li>
            <li>Check the browser console for detailed debug logs</li>
          </ul>
        </div>

        {/* Popup Components */}
        <Popup open={showBasicPopup} onClose={() => setShowBasicPopup(false)}>
          <div className="text-center text-white p-4">
            <h2 className="text-2xl font-bold mb-4 pixel-text">Basic Popup Demo</h2>
            <p className="mb-4">This is the redesigned basic popup with enhanced gaming aesthetics!</p>
            <div className="space-y-2">
              <div className="pixel-dot bg-cyan-400 w-4 h-4 mx-auto mb-2" />
              <p className="text-sm text-gray-300">
                Features pixel art styling, animated backdrop, and smooth transitions.
              </p>
            </div>
          </div>
        </Popup>

        <VictoryPopup
          open={showVictoryPopup}
          onClose={() => setShowVictoryPopup(false)}
          score={1250}
          combo={15}
          health={85}
          highScore={1500}
          isLevelCompleted={true}
          showGoToModules={true}
          showReset={false}
          moduleId="1"
        />
      </div>
    </div>
  );
};

export default DebugPage;
