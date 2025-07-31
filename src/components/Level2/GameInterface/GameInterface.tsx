import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { GameMode, Term } from '../../../types/Level2/types';
import { useDeviceLayout } from '../../../hooks/useOrientation';
import { useLevel2Game } from '../hooks/useLevel2Game';
import DndProvider from '../DndProvider';
import { soundManager, playDragSound, playCorrectSound, playIncorrectSound, playScoreSound } from '../../../utils/Level2/sounds';
import { GameStorage, TermPlacementResult } from '../../../utils/Level2/gameStorage';

import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

import '../index.css';

interface GameInterfaceProps {
  gameMode: GameMode;
  moduleId: string;
  onBack: () => void;
  onNextLevel?: (score: number, currentScore: number, totalCorrect: number, terms: Term[], scoreHistory: number[], timeHistory: number[]) => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameMode, moduleId, onBack, onNextLevel }) => {
  const { isMobile } = useDeviceLayout();
  const {
    isLoading: isGameLoading,
    gameDataWithHistory
  } = useLevel2Game({ moduleId, gameModeId: gameMode.id });
  
  // Initialize state with default values
  const [terms, setTerms] = useState<Term[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [dataRestored, setDataRestored] = useState(false);
  const [restoredCount, setRestoredCount] = useState(0);

  // Initialize game state on component mount or when game mode changes
  useEffect(() => {
    // Check for existing term placement results in localStorage and restore them
    const existingPlacements = GameStorage.getTermPlacementResults(moduleId, gameMode.id, gameMode.type);

    // Validate that original gameMode.terms don't have currentCategory set
    const termsWithCurrentCategory = gameMode.terms.filter(term => term.currentCategory !== undefined);
    if (termsWithCurrentCategory.length > 0) {
      // Log critical errors in production for debugging
      console.error('CRITICAL ERROR: Original gameMode.terms have currentCategory set:', termsWithCurrentCategory);
      console.error('This will cause premature auto-completion. Terms should only have currentCategory set after user interaction.');
    }

    // Initialize terms and restore placements from localStorage if they exist
    let initializedTerms: Term[] = gameMode.terms.map(term => ({ ...term, currentCategory: undefined }));

    if (existingPlacements.length > 0) {
      initializedTerms = initializedTerms.map(term => {
        const placement = existingPlacements.find(p => p.termId === term.id);
        if (placement) {
          return { ...term, currentCategory: placement.placedCategory };
        }
        return term;
      });

      // Calculate initial score based on restored placements
      const correctPlacements = existingPlacements.filter(p => p.isCorrect);
      const initialScore = correctPlacements.length * 5;
      setCurrentScore(initialScore);
      setDataRestored(true);
      setRestoredCount(existingPlacements.length);
    } else {
      setDataRestored(false);
      setRestoredCount(0);
    }

    setTerms(initializedTerms);
    setTimeElapsed(0);
    setGameStarted(existingPlacements.length > 0); // Start game if we have existing placements
    setMoves(existingPlacements.length); // Set moves to number of existing placements
    setHasExecuted(false);

    // Clear any legacy game state keys on initialization
    GameStorage.clearLegacyLevel2GameStates();
  }, [moduleId, gameMode.id, gameMode.type, gameMode.terms]);

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
    if (gameStarted && !hasExecuted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, hasExecuted]);

  // Start game on first move
  useEffect(() => {
    if (moves > 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [moves, gameStarted]);

  // Note: Game state is no longer persisted to localStorage
  // The game will reset on page refresh, which is the intended behavior

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

    // Calculate percentage score based on correct items
    const percentageScore = Math.round((correct / terms.length) * 100);

    // Update current score to reflect total points earned (5 points per correct item)
    const totalPointsEarned = correct * 5;
    setCurrentScore(totalPointsEarned);

    // NOTE: Database saving is now deferred to the ResultsModal for batch processing
    // This allows all game types to be completed before any database operations occur

    // Use existing data for history, since we're not saving to database yet
    const updatedScoreHistory = gameDataWithHistory?.score_history || [];
    const updatedTimeHistory = gameDataWithHistory?.time_history || [];

    // Add current score and time to the history arrays for display purposes
    const currentScoreHistory = [totalPointsEarned, ...updatedScoreHistory.slice(0, 2)];
    const currentTimeHistory = [timeElapsed, ...updatedTimeHistory.slice(0, 2)];

    // Instead of showing results modal directly, call the next level handler
    // This will be handled by the GameNavigator based on the flow state
    if (onNextLevel) {
      onNextLevel(
        percentageScore,
        totalPointsEarned,
        correct,
        terms,
        currentScoreHistory,
        currentTimeHistory
      );
    }
  }, [terms, timeElapsed, hasExecuted, isGameLoading, gameDataWithHistory, onNextLevel]);

  // Auto-execute when all items are placed (only if not already executed)
  useEffect(() => {
    // Only proceed if we have terms
    if (terms.length === 0) {
      return;
    }

    const unassignedTerms = terms.filter(term => !term.currentCategory);

    // Only auto-complete if:
    // 1. All terms are assigned (unassignedTerms.length === 0)
    // 2. User has made at least one move (moves > 0) - ensures user interaction
    // 3. Game hasn't been executed yet (!hasExecuted)
    // 4. Game is not currently loading (!isGameLoading)
    if (unassignedTerms.length === 0 && moves > 0 && !hasExecuted && !isGameLoading) {
      // Small delay to allow the last drop animation to complete
      const timeoutId = setTimeout(() => {
        // Double-check conditions before executing to prevent race conditions
        const currentUnassigned = terms.filter(term => !term.currentCategory);

        if (currentUnassigned.length === 0 && moves > 0 && !hasExecuted && !isGameLoading) {
          checkAnswers();
        }
      }, 500);

      // Cleanup timeout if component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [terms, hasExecuted, checkAnswers, isGameLoading, moves]);

  const handleDragStart = useCallback(() => {
    try {
      playDragSound();
    } catch (error) {
      // Silently handle sound errors in production
      console.error('Sound error:', error);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    try {
      const { active, over } = event;

      if (!over) return;

      const termId = active.id as string;
      const categoryId = over.id as string;

      // Only process if dropping on a category
      if (gameMode.categories.some(cat => cat.id === categoryId)) {
        const term = terms.find(t => t.id === termId);
        if (term) {
          const isCorrect = term.correctCategory === categoryId;

          // Store individual term placement result to localStorage
          const placementResult: TermPlacementResult = {
            termId: term.id,
            termText: term.text,
            correctCategory: term.correctCategory,
            placedCategory: categoryId,
            isCorrect,
            timestamp: Date.now(),
            moduleId,
            gameModeId: gameMode.id,
            type: gameMode.type
          };

          try {
            GameStorage.saveTermPlacementResult(placementResult);
          } catch (error) {
            console.error('Failed to save term placement:', error);
          }

          // Play sound based on correctness
          try {
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
          } catch (error) {
            // Silently handle sound errors in production
            console.error('Sound error:', error);
          }
        }

        setTerms(prevTerms =>
          prevTerms.map(term =>
            term.id === termId
              ? { ...term, currentCategory: categoryId }
              : term
          )
        );

        setMoves(prev => prev + 1);

        // Reset hasExecuted when user makes a new move after seeing results
        if (hasExecuted) {
          setHasExecuted(false);
        }
      }
    } catch (error) {
      console.error('Drag end error:', error);
    }
  }, [gameMode.categories, terms, moduleId, gameMode.id, gameMode.type, hasExecuted]);

  const resetGame = useCallback(() => {
    try {
      // Clear term placement results from localStorage
      GameStorage.clearTermPlacementResults(moduleId, gameMode.id, gameMode.type);

      // Clear any legacy game state keys
      GameStorage.clearLegacyLevel2GameStates();

      // Reset all state
      setTerms(gameMode.terms.map(term => ({ ...term, currentCategory: undefined })));
      setTimeElapsed(0);
      setGameStarted(false);
      setMoves(0);
      setCurrentScore(0);
      setHasExecuted(false);
      setDataRestored(false);
      setRestoredCount(0);
    } catch (error) {
      console.error('Reset game error:', error);
      // Still attempt to reset state even if localStorage operations fail
      setTerms(gameMode.terms.map(term => ({ ...term, currentCategory: undefined })));
      setTimeElapsed(0);
      setGameStarted(false);
      setMoves(0);
      setCurrentScore(0);
      setHasExecuted(false);
      setDataRestored(false);
      setRestoredCount(0);
    }
  }, [moduleId, gameMode.id, gameMode.type, gameMode.terms]);



  const getTermsInCategory = useCallback((categoryId: string) => {
    return terms.filter(term => term.currentCategory === categoryId);
  }, [terms]);

  const getUnassignedTerms = useMemo(() => {
    return terms.filter(term => !term.currentCategory);
  }, [terms]);

  // Real-time feedback functions - check correctness immediately
  const getCorrectTerms = useMemo(() => {
    const correct = new Set<string>();
    terms.forEach(term => {
      if (term.currentCategory && term.currentCategory === term.correctCategory) {
        correct.add(term.id);
      }
    });
    return correct;
  }, [terms]);

  const getIncorrectTerms = useMemo(() => {
    const incorrect = new Set<string>();
    terms.forEach(term => {
      if (term.currentCategory && term.currentCategory !== term.correctCategory) {
        incorrect.add(term.id);
      }
    });
    return incorrect;
  }, [terms]);

  // Show loading state until terms are initialized
  if (terms.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 bg-cover bg-center bg-no-repeat relative overflow-hidden pixel-perfect ${isMobile ? 'p-2' : 'p-6'}`}
        style={{ backgroundImage: 'url("/Level2/level3bg.webp")' }}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-transparent opacity-80 pixel-glow"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 blur-lg"></div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

  const progress = ((terms.length - getUnassignedTerms.length) / terms.length) * 100;

  const layoutProps = {
    gameTitle: gameMode.title,
    onBack,
    onReset: resetGame,
    currentScore,
    correctCount: getCorrectTerms.size,
    timeElapsed,
    moves,
    unassignedTerms: getUnassignedTerms,
    progress,
    hasExecuted,
    categories: gameMode.categories,
    getTermsInCategory,
    correctTerms: getCorrectTerms,
    incorrectTerms: getIncorrectTerms,
    moduleId: gameMode.moduleId,
    type: gameMode.type,
  };

  return (
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 bg-cover bg-center bg-no-repeat relative overflow-hidden pixel-perfect ${isMobile ? 'p-2' : 'p-6'}`}
        style={{ backgroundImage: 'url("/Level2/level3bg.webp")' }}>
        {/* Gamified Overlay - matches Level2 HomePage */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Slightly darkened base overlay for gamified look */}
          <div className="absolute inset-0 bg-black opacity-40"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-transparent opacity-80 pixel-glow"></div>
          {/* Scan Lines Overlay */}
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
          {/* Glow Overlay */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 blur-lg"></div>
        </div>
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

          {/* ResultsModal is now handled by GameNavigator based on flow state */}
        </div>
      </div>
    </DndProvider>
  );
};

export default GameInterface;
