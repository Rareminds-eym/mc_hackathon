// src/components/l3/components/GameProgressDemo.tsx

import React, { useState } from 'react';
import { useLevel3Persistence } from '../../../store/hooks';

/**
 * Demo component to showcase game progress persistence functionality
 */
export const GameProgressDemo: React.FC = () => {
  const [moduleId] = useState("1");
  const [userId] = useState("demo-user");
  const persistence = useLevel3Persistence(moduleId, userId);
  const [message, setMessage] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveProgress = async () => {
    try {
      await persistence.saveProgress();
      showMessage("✅ Progress saved successfully!");
    } catch (error) {
      showMessage("❌ Failed to save progress");
    }
  };

  const handleLoadProgress = async () => {
    try {
      await persistence.loadProgress();
      showMessage("✅ Progress loaded successfully!");
    } catch (error) {
      showMessage("❌ Failed to load progress");
    }
  };

  const handleClearProgress = async () => {
    try {
      await persistence.clearProgress();
      showMessage("✅ Progress cleared successfully!");
    } catch (error) {
      showMessage("❌ Failed to clear progress");
    }
  };

  const progressSummary = persistence.getProgressSummary();

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="text-lg font-bold mb-3">Game Progress Demo</h3>
      
      {/* Progress Status */}
      <div className="mb-4">
        <div className="text-sm mb-2">
          <strong>Has Saved Progress:</strong> {persistence.hasSavedProgress ? "Yes" : "No"}
        </div>
        <div className="text-sm mb-2">
          <strong>Can Continue:</strong> {persistence.canContinue ? "Yes" : "No"}
        </div>
        <div className="text-sm mb-2">
          <strong>Has Unsaved Changes:</strong> {persistence.hasUnsavedChanges ? "Yes" : "No"}
        </div>
        <div className="text-sm mb-2">
          <strong>Loading:</strong> {persistence.isLoading ? "Yes" : "No"}
        </div>
      </div>

      {/* Progress Summary */}
      {progressSummary && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <div className="text-xs font-bold mb-1">Progress Summary:</div>
          <div className="text-xs">Scenario: {progressSummary.currentScenario}/{progressSummary.totalScenarios}</div>
          <div className="text-xs">Progress: {progressSummary.progressPercentage}%</div>
          <div className="text-xs">Saved: {progressSummary.timeAgo}</div>
          {progressSummary.gameStats && (
            <div className="text-xs mt-1">
              Score: {progressSummary.gameStats.score} | 
              Health: {progressSummary.gameStats.health} | 
              Combo: {progressSummary.gameStats.combo}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleSaveProgress}
          disabled={persistence.isLoading}
          className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
        >
          Save Progress
        </button>
        
        <button
          onClick={handleLoadProgress}
          disabled={persistence.isLoading || !persistence.hasSavedProgress}
          className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
        >
          Load Progress
        </button>
        
        <button
          onClick={handleClearProgress}
          disabled={persistence.isLoading}
          className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm"
        >
          Clear Progress
        </button>
      </div>

      {/* Error Display */}
      {persistence.error && (
        <div className="mt-2 p-2 bg-red-800 rounded text-xs">
          Error: {persistence.error}
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className="mt-2 p-2 bg-blue-800 rounded text-xs">
          {message}
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Module: {moduleId} | User: {userId}
        </div>
      </div>
    </div>
  );
};
