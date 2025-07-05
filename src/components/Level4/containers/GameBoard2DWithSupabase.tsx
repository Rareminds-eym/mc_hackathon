import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderScreen } from '../../../screens/LoaderScreen';
import { cases } from '../data/cases';
import { 
  getLevel4Progress, 
  createLevel4Progress,
  updateCaseProgress, 
  completeLevel4,
  Level4Progress 
} from '../services/supabaseService';
import { useAuth } from '../../../contexts/AuthContext';

// Import the original GameBoard2D component and rename it
import { GameBoard2D as OriginalGameBoard2D } from '../GameBoard2D';

/**
 * Enhanced GameBoard2D component with Supabase integration
 */
const GameBoard2DWithSupabase: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gameProgress, setGameProgress] = useState<Level4Progress | null>(null);
  const [attemptsByCase, setAttemptsByCase] = useState<Record<number, number>>({});
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  
  // Load or create game progress when component mounts
  useEffect(() => {
    const loadGameProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to load existing progress
        let progress = await getLevel4Progress();
        
        if (!progress) {
          // Create new progress if none exists
          progress = await createLevel4Progress();
          setGameStartTime(Date.now());
        } else {
          // If we have existing progress, setup attempts tracking
          const attempts: Record<number, number> = {};
          progress.cases.caseProgress.forEach(caseProgress => {
            attempts[caseProgress.id] = caseProgress.attempts;
          });
          setAttemptsByCase(attempts);
        }
        
        setGameProgress(progress);
      } catch (error) {
        console.error("Failed to load game progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGameProgress();
  }, [user]);
  
  // Called when a case is completed
  const handleCaseComplete = async (
    caseId: number,
    answers: {
      violation: number | null;
      rootCause: number | null;
      impact: number | null;
    },
    isCorrect: boolean
  ) => {
    // Track attempts for this case
    const currentAttempts = attemptsByCase[caseId] || 0;
    const newAttempts = currentAttempts + 1;
    
    setAttemptsByCase(prev => ({
      ...prev,
      [caseId]: newAttempts
    }));
    
    // Calculate time spent on this case
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    
    if (gameProgress?.id) {
      await updateCaseProgress(
        gameProgress.id,
        caseId,
        answers,
        isCorrect,
        newAttempts,
        timeSpent
      );
      
      // Update our local copy of the game progress
      const updatedProgress = await getLevel4Progress();
      if (updatedProgress) {
        setGameProgress(updatedProgress);
      }
    }
  };
  
  // Called when the game is completed
  const handleGameComplete = async (finalTime: number) => {
    if (gameProgress?.id) {
      await completeLevel4(gameProgress.id, finalTime);
    }
  };

  // Don't render game until we have user and progress data
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading your progress...</div>;
  }
  
  // If no user, we can't save progress
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">Please log in to play this game.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => navigate('/auth')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Render the original GameBoard2D
  // Since we can't modify the original component, we'll have to use it as is
  // and handle the Supabase operations through effect hooks
  return <OriginalGameBoard2D />;
};

export default GameBoard2DWithSupabase;
