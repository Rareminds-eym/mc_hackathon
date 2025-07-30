// src/components/l3/components/GameActionsDemo.tsx

import React, { useState } from 'react';
import {
  useLevel3GameActions,
  useLevel3ManualSave,
  useLevel3SaveStatus
} from '../../../store/hooks';

/**
 * Demo component showing how to use Level 3 game actions with auto-save
 */
export const GameActionsDemo: React.FC = () => {
  const [message, setMessage] = useState('');
  
  // Game actions that automatically save progress
  const {
    handlePieceDrop,
    handleCompleteScenario,
    handleResetGame,
    handleSetFeedback,
  } = useLevel3GameActions();
  
  // Manual save functionality
  const manualSave = useLevel3ManualSave('1', 'demo-user');
  
  // Save status monitoring
  const saveStatus = useLevel3SaveStatus();

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Demo actions
  const handleDemoDropPiece = () => {
    const demopiece = {
      id: 'demo-1',
      text: 'Demo Piece',
      category: 'violation' as const,
      isCorrect: true,
    };
    
    handlePieceDrop('violations', demopiece);
    showMessage('✅ Piece dropped - Progress auto-saved!');
  };

  const handleDemoCompleteScenario = () => {
    const demoResult = {
      score: 100,
      combo: 5,
      health: 90,
      scenarioIndex: 0,
      timeSpent: 120,
    };
    
    handleCompleteScenario(demoResult, false);
    showMessage('🏆 Scenario completed - Progress auto-saved!');
  };

  const handleDemoReset = () => {
    handleResetGame();
    showMessage('🔄 Game reset - Progress cleared!');
  };

  const handleManualSave = async () => {
    const result = await manualSave.saveProgressNow();
    if (result.success) {
      showMessage('💾 Manual save successful!');
    } else {
      showMessage('❌ Manual save failed!');
    }
  };

  const handleDemoFeedback = () => {
    handleSetFeedback('Demo feedback message!');
    showMessage('💬 Feedback set!');
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-lg font-bold mb-3 text-green-300">Game Actions Demo</h3>
      
      {/* Save Status */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <div className="text-xs font-bold mb-1 text-blue-300">Save Status:</div>
        <div className="text-xs">
          Last Save: {saveStatus.lastSaveTime || 'Never'}
        </div>
        <div className="text-xs">
          Saving: {saveStatus.isSaving ? 'Yes' : 'No'}
        </div>
        {saveStatus.saveError && (
          <div className="text-xs text-red-400">
            Error: {saveStatus.saveError}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleDemoDropPiece}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
        >
          🎯 Drop Piece (Auto-Save)
        </button>
        
        <button
          onClick={handleDemoCompleteScenario}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
        >
          🏆 Complete Scenario (Auto-Save)
        </button>
        
        <button
          onClick={handleDemoReset}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
        >
          🔄 Reset Game (Clear Save)
        </button>
        
        <button
          onClick={handleManualSave}
          className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
        >
          💾 Manual Save
        </button>
        
        <button
          onClick={handleDemoFeedback}
          className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium"
        >
          💬 Set Feedback
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className="mt-3 p-2 bg-blue-800 rounded text-xs">
          {message}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <div className="font-bold mb-1">How it works:</div>
          <div>• Game actions automatically save progress</div>
          <div>• No timers or intervals needed</div>
          <div>• Saves only on meaningful user interactions</div>
          <div>• Check browser localStorage to see saves</div>
        </div>
      </div>
    </div>
  );
};
