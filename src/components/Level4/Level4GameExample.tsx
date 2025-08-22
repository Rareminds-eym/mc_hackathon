/**
 * Example Level 4 Game Component
 * Demonstrates how to save data to Supabase during gameplay
 */

import React, { useState, useEffect } from 'react';
import level4Service from './services';
import { useAuth } from '../../contexts/AuthContext'; // Assuming you have auth context

interface GameCase {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent?: number;
}

interface GameState {
  currentCase: number;
  score: number;
  timeElapsed: number;
  cases: GameCase[];
  isCompleted: boolean;
  isLoading: boolean;
}

interface Level4GameExampleProps {
  module: number;
  onGameComplete?: (results: any) => void;
}

const Level4GameExample: React.FC<Level4GameExampleProps> = ({ 
  module, 
  onGameComplete 
}) => {
  const { user } = useAuth(); // Get current user from auth context
  const [gameState, setGameState] = useState<GameState>({
    currentCase: 0,
    score: 0,
    timeElapsed: 0,
    cases: [
      {
        id: 'case1',
        question: 'What is the correct ICD-10 code for Type 2 Diabetes Mellitus?',
        options: ['E11.9', 'E10.9', 'E13.9', 'E14.9'],
        correctAnswer: 'E11.9'
      },
      {
        id: 'case2',
        question: 'Which modifier indicates a bilateral procedure?',
        options: ['50', '51', '52', '53'],
        correctAnswer: '50'
      },
      {
        id: 'case3',
        question: 'What is the CPT code for a routine office visit (level 3)?',
        options: ['99213', '99214', '99215', '99212'],
        correctAnswer: '99213'
      }
    ],
    isCompleted: false,
    isLoading: false
  });

  const [startTime] = useState<number>(Date.now());

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!user || gameState.isCompleted) return;

    const autoSaveInterval = setInterval(() => {
      saveProgressToSupabase(false); // Save as incomplete
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [user, gameState, module]);

  /**
   * Save game progress to Supabase
   */
  const saveProgressToSupabase = async (isGameComplete: boolean = false) => {
    if (!user) {
      console.error('No user found for saving game data');
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      // Calculate current time elapsed
      const currentTime = Math.floor((Date.now() - startTime) / 1000);

      // Prepare cases data with results
      const casesData = gameState.cases.reduce((acc, gameCase, index) => {
        acc[gameCase.id] = {
          question: gameCase.question,
          options: gameCase.options,
          correctAnswer: gameCase.correctAnswer,
          userAnswer: gameCase.userAnswer || null,
          isCorrect: gameCase.isCorrect || false,
          timeSpent: gameCase.timeSpent || 0,
          completed: index < gameState.currentCase || isGameComplete
        };
        return acc;
      }, {} as Record<string, any>);

      // Add game metadata
      casesData._metadata = {
        totalCases: gameState.cases.length,
        completedCases: gameState.currentCase,
        startTime: startTime,
        lastSaveTime: Date.now(),
        gameVersion: '1.0'
      };

      console.log('💾 Saving game progress to Supabase...');

      // Use the enhanced upsert function to save with history
      const result = await level4Service.upsertGameDataWithHistory(
        user.id,
        module,
        gameState.score,
        isGameComplete,
        currentTime,
        casesData
      );

      console.log('✅ Game progress saved successfully:', result);

      // If game is complete, get final statistics
      if (isGameComplete) {
        const finalStats = await level4Service.getUserStats(user.id);
        const scoreHistory = await level4Service.getPastThreeScores(user.id, module);
        
        console.log('📊 Final game statistics:', finalStats);
        console.log('📈 Score history:', scoreHistory);

        // Call completion callback
        if (onGameComplete) {
          onGameComplete({
            score: gameState.score,
            timeElapsed: currentTime,
            stats: finalStats,
            scoreHistory: scoreHistory,
            casesData: casesData
          });
        }
      }

    } catch (error) {
      console.error('❌ Failed to save game progress:', error);
      // You might want to show a user-friendly error message here
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Handle answer selection
   */
  const handleAnswerSelect = async (selectedAnswer: string) => {
    const currentCase = gameState.cases[gameState.currentCase];
    const isCorrect = selectedAnswer === currentCase.correctAnswer;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000) - gameState.timeElapsed;

    // Update the current case with user's answer
    const updatedCases = [...gameState.cases];
    updatedCases[gameState.currentCase] = {
      ...currentCase,
      userAnswer: selectedAnswer,
      isCorrect: isCorrect,
      timeSpent: timeSpent
    };

    // Calculate new score (100 points per correct answer)
    const newScore = gameState.score + (isCorrect ? 100 : 0);

    // Update game state
    setGameState(prev => ({
      ...prev,
      cases: updatedCases,
      score: newScore,
      timeElapsed: prev.timeElapsed + timeSpent
    }));

    // Move to next case or complete game
    setTimeout(() => {
      if (gameState.currentCase < gameState.cases.length - 1) {
        // Move to next case
        setGameState(prev => ({
          ...prev,
          currentCase: prev.currentCase + 1
        }));
      } else {
        // Game completed
        setGameState(prev => ({ ...prev, isCompleted: true }));
        saveProgressToSupabase(true); // Save as completed
      }
    }, 1500); // Show result for 1.5 seconds
  };

  /**
   * Load existing game data on component mount
   */
  useEffect(() => {
    const loadExistingGameData = async () => {
      if (!user) return;

      try {
        const existingData = await level4Service.getUserModuleData(user.id, module);
        
        if (existingData && !existingData.is_completed) {
          console.log('📂 Loading existing game data:', existingData);
          
          // You can restore game state from existingData.cases if needed
          // This is useful for resuming incomplete games
        }
      } catch (error) {
        console.error('Error loading existing game data:', error);
      }
    };

    loadExistingGameData();
  }, [user, module]);

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to play Level 4 games.</p>
      </div>
    );
  }

  if (gameState.isCompleted) {
    return (
      <div className="p-6 text-center bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          🎉 Congratulations!
        </h2>
        <p className="text-lg mb-2">Module {module} Completed!</p>
        <p className="text-xl font-bold text-green-600 mb-2">
          Final Score: {gameState.score}
        </p>
        <p className="text-gray-600">
          Time: {Math.floor(gameState.timeElapsed / 60)}:
          {(gameState.timeElapsed % 60).toString().padStart(2, '0')}
        </p>
        {gameState.isLoading && (
          <p className="text-blue-600 mt-4">💾 Saving results...</p>
        )}
      </div>
    );
  }

  const currentCase = gameState.cases[gameState.currentCase];
  const progress = ((gameState.currentCase + 1) / gameState.cases.length) * 100;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Level 4 - Module {module}</h1>
          <div className="text-right">
            <p className="text-lg font-semibold">Score: {gameState.score}</p>
            <p className="text-sm text-gray-600">
              Case {gameState.currentCase + 1} of {gameState.cases.length}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Case */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h2 className="text-xl font-semibold mb-4">{currentCase.question}</h2>
        
        <div className="space-y-3">
          {currentCase.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
              disabled={gameState.isLoading}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {gameState.isLoading && (
        <div className="text-center text-blue-600">
          <p>💾 Auto-saving progress...</p>
        </div>
      )}

      {/* Manual save button (optional) */}
      <div className="text-center">
        <button
          onClick={() => saveProgressToSupabase(false)}
          disabled={gameState.isLoading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          💾 Save Progress
        </button>
      </div>
    </div>
  );
};

export default Level4GameExample;
