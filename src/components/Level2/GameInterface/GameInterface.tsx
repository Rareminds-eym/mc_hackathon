import React, { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { GameMode, Term } from '../../../types/Level2/types';
import { useDeviceLayout } from '../../../hooks/useOrientation';
import { useLevel2Game } from '../../../hooks/Level2/useLevel2Game';
import DndProvider from '../DndProvider';
import { soundManager, playDragSound, playCorrectSound, playIncorrectSound, playScoreSound } from '../../../utils/Level2/sounds';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';
import ResultsModal from './ResultsModal';
import '../index.css';

interface GameInterfaceProps {
  gameMode: GameMode;
  moduleId: string;
  onBack: () => void;
  onNextLevel?: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameMode, moduleId, onBack, onNextLevel }) => {
  const { isMobile } = useDeviceLayout();
  const { 
    isLoading: isGameLoading, 
    saveGameData, 
    markLevelCompleted
  } = useLevel2Game({ moduleId, gameModeId: gameMode.id });
  
  const [terms, setTerms] = useState<Term[]>(() =>
    gameMode.terms.map(term => ({ ...term, currentCategory: undefined }))
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Initialize sounds on component mount
  useEffect(() => {
    soundManager.initSounds();
    
    // Resume audio context on first user interaction
    const handleFirstInteraction = () => {
      soundManager.resumeContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !showResults) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, showResults]);

  // Start game on first move
  useEffect(() => {
    if (moves > 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [moves, gameStarted]);

  const checkAnswers = useCallback(async () => {
    // Prevent duplicate executions
    if (hasExecuted || isGameLoading) {
      return;
    }
    
    // Set hasExecuted immediately to prevent race conditions
    setHasExecuted(true);
    
    let correct = 0;

    terms.forEach(term => {
      if (term.currentCategory === term.correctCategory) {
        correct++;
      }
    });

    setTotalCorrect(correct);

    // Calculate percentage score based on correct items
    const percentageScore = Math.round((correct / terms.length) * 100);
    setScore(percentageScore);

    // Update current score to reflect total points earned (5 points per correct item)
    const totalPointsEarned = correct * 5;
    setCurrentScore(totalPointsEarned);

    // Save game data using the hook
    const isPerfect = percentageScore === 100;
    await saveGameData({
      score: totalPointsEarned,
      isCompleted: isPerfect,
      time: timeElapsed,
      totalTerms: terms.length,
      placedTerms: terms,
    });

    setShowResults(true);
  }, [terms, timeElapsed, saveGameData, hasExecuted, isGameLoading]);

  // Auto-execute when all items are placed (only if not already executed)
  useEffect(() => {
    const unassignedTerms = terms.filter(term => !term.currentCategory);
    if (unassignedTerms.length === 0 && terms.length > 0 && !showResults && !hasExecuted && !isGameLoading) {
      // Small delay to allow the last drop animation to complete
      const timeoutId = setTimeout(() => {
        // Double-check conditions before executing
        const currentUnassigned = terms.filter(term => !term.currentCategory);
        if (currentUnassigned.length === 0 && !hasExecuted && !isGameLoading) {
          checkAnswers();
        }
      }, 500);
      
      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [terms, showResults, hasExecuted, checkAnswers, isGameLoading]);

  const handleDragStart = () => {
    playDragSound();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const termId = active.id as string;
    const categoryId = over.id as string;
    
    // Only process if dropping on a category
    if (gameMode.categories.some(cat => cat.id === categoryId)) {
      const term = terms.find(t => t.id === termId);
      if (term) {
        const isCorrect = term.correctCategory === categoryId;
        
        // Play sound based on correctness
        if (isCorrect) {
          playCorrectSound();
          // Add 5 points for correct placement
          setCurrentScore(prev => {
            const newScore = prev + 5;
            playScoreSound();
            return newScore;
          });
        } else {
          playIncorrectSound();
        }
      }
      
      setTerms(prevTerms =>
        prevTerms.map(term =>
          term.id === termId
            ? { ...term, currentCategory: categoryId }
            : term
        )
      );
      setShowResults(false);
      setMoves(prev => prev + 1);
      
      // Reset hasExecuted when user makes a new move after seeing results
      if (hasExecuted) {
        setHasExecuted(false);
      }
    }
  };

  const resetGame = () => {
    setTerms(gameMode.terms.map(term => ({ ...term, currentCategory: undefined })));
    setShowResults(false);
    setScore(0);
    setTotalCorrect(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setMoves(0);
    setCurrentScore(0);
    setHasExecuted(false);
  };

  const handleNextLevel = async () => {
    // Mark the level as completed in the database
    await markLevelCompleted();
    
    // Navigate to next level if handler is provided, otherwise go back
    if (onNextLevel) {
      onNextLevel();
    } else {
      onBack();
    }
  };

  const getTermsInCategory = (categoryId: string) => {
    return terms.filter(term => term.currentCategory === categoryId);
  };

  const getUnassignedTerms = () => {
    return terms.filter(term => !term.currentCategory);
  };

  // Real-time feedback functions - check correctness immediately
  const getCorrectTerms = () => {
    const correct = new Set<string>();
    terms.forEach(term => {
      if (term.currentCategory && term.currentCategory === term.correctCategory) {
        correct.add(term.id);
      }
    });
    return correct;
  };

  const getIncorrectTerms = () => {
    const incorrect = new Set<string>();
    terms.forEach(term => {
      if (term.currentCategory && term.currentCategory !== term.correctCategory) {
        incorrect.add(term.id);
      }
    });
    return incorrect;
  };

  const progress = ((terms.length - getUnassignedTerms().length) / terms.length) * 100;

  const layoutProps = {
    gameTitle: gameMode.title,
    onBack,
    onReset: resetGame,
    currentScore,
    correctCount: getCorrectTerms().size,
    timeElapsed,
    moves,
    unassignedTerms: getUnassignedTerms(),
    progress,
    hasExecuted,
    categories: gameMode.categories,
    getTermsInCategory,
    correctTerms: getCorrectTerms(),
    incorrectTerms: getIncorrectTerms(),
  };

  return (
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900' : 'bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900'} pixel-perfect relative overflow-hidden`}>
        {isGameLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-xl">Saving progress...</div>
          </div>
        )}
        <div className={`relative z-10 ${isMobile ? 'h-screen flex flex-col p-1' : 'max-w-7xl mx-auto p-3 md:p-6'}`}>
          {isMobile ? (
            <MobileLayout {...layoutProps} />
          ) : (
            <DesktopLayout {...layoutProps} />
          )}

          <ResultsModal
            showResults={showResults}
            score={score}
            currentScore={currentScore}
            totalCorrect={totalCorrect}
            terms={terms}
            isMobile={isMobile}
            onNextLevel={handleNextLevel}
            onReset={resetGame}
            onClose={() => setShowResults(false)}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default GameInterface;
