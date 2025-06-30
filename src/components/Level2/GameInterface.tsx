import React, { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { GameMode, Term } from '../../types/Level2/types';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { GameStorage } from '../../utils/Level2/gameStorage';
import CategoryBox from './CategoryBox';
import DraggableTerm from './DraggableTerm';
import DndProvider from './DndProvider';
import { soundManager, playDragSound, playCorrectSound, playIncorrectSound, playScoreSound } from '../../utils/Level2/sounds';
import {
  CheckCircle, RotateCcw, ArrowLeft, Crown, Gamepad2, ArrowRight
} from 'lucide-react';
import './index.css';

interface GameInterfaceProps {
  gameMode: GameMode;
  onBack: () => void;
  onNextLevel?: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ gameMode, onBack, onNextLevel }) => {
  const { isMobile } = useDeviceLayout();
  const [terms, setTerms] = useState<Term[]>(() =>
    gameMode.terms.map(term => ({ ...term, currentCategory: undefined }))
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [streak, setStreak] = useState(0);
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

  const checkAnswers = useCallback(() => {
    let correct = 0;
    let consecutiveCorrect = 0;
    let maxStreak = 0;

    terms.forEach(term => {
      if (term.currentCategory === term.correctCategory) {
        correct++;
        consecutiveCorrect++;
        maxStreak = Math.max(maxStreak, consecutiveCorrect);
      } else {
        consecutiveCorrect = 0;
      }
    });

    setTotalCorrect(correct);
    setStreak(maxStreak);

    // Calculate percentage score based on correct items
    const percentageScore = Math.round((correct / terms.length) * 100);
    setScore(percentageScore);

    // Update current score to reflect total points earned (5 points per correct item)
    const totalPointsEarned = correct * 5;
    setCurrentScore(totalPointsEarned);

    // Save to localStorage
    const isPerfect = percentageScore === 100;
    GameStorage.updateScore(totalPointsEarned, timeElapsed, isPerfect);

    setShowResults(true);
    setHasExecuted(true);
  }, [terms, timeElapsed, setScore, setTotalCorrect, setStreak, setShowResults, setHasExecuted]);

  // Auto-execute when all items are placed (only if not already executed)
  useEffect(() => {
    const unassignedTerms = terms.filter(term => !term.currentCategory);
    if (unassignedTerms.length === 0 && terms.length > 0 && !showResults && !hasExecuted) {
      // Small delay to allow the last drop animation to complete
      setTimeout(() => {
        checkAnswers();
      }, 500);
    }
  }, [terms, showResults, hasExecuted, checkAnswers]);

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
    setStreak(0);
    setMoves(0);
    setCurrentScore(0);
    setHasExecuted(false);
  };

  const handleNextLevel = () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreRank = (score: number) => {
    if (score >= 95) return { rank: "S+", color: "text-yellow-300", bg: "bg-yellow-600" };
    if (score >= 90) return { rank: "S", color: "text-yellow-400", bg: "bg-yellow-700" };
    if (score >= 80) return { rank: "A", color: "text-green-400", bg: "bg-green-700" };
    if (score >= 70) return { rank: "B", color: "text-blue-400", bg: "bg-blue-700" };
    if (score >= 60) return { rank: "C", color: "text-purple-400", bg: "bg-purple-700" };
    return { rank: "D", color: "text-red-400", bg: "bg-red-700" };
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 95) return { message: "LEGENDARY MASTER!", color: "text-yellow-300" };
    if (score >= 90) return { message: "EXPERT LEVEL!", color: "text-green-300" };
    if (score >= 80) return { message: "GREAT SUCCESS!", color: "text-blue-300" };
    if (score >= 70) return { message: "GOOD WORK!", color: "text-purple-300" };
    if (score >= 60) return { message: "KEEP TRAINING!", color: "text-orange-300" };
    return { message: "KEEP TRAINING!", color: "text-orange-300" };
  };

  return (
    <DndProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900' : 'bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900'} pixel-perfect relative overflow-hidden`}>
        <div className={`relative z-10 ${isMobile ? 'h-screen flex flex-col p-1' : 'max-w-7xl mx-auto p-3 md:p-6'}`}>
          {/* Mobile Landscape Layout */}
          {isMobile ? (
            <div className="h-full flex flex-col">
              {/* Top Header - Much smaller fonts */}
              <div className="bg-slate-800 rounded-lg p-1.5 mb-1 flex items-center justify-between shadow-lg border border-slate-600">
                <button
                  onClick={onBack}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md flex items-center space-x-1 font-bold shadow-md transition-all duration-200 text-xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>EXIT</span>
                </button>
                
                <div className="text-center flex-1 mx-2">
                  <h1 className="text-xs font-black text-cyan-300 pixel-text">
                    {gameMode.title.replace(/🧩|📂|📋/g, '').trim()}
                  </h1>
                  <div className="text-slate-400 text-xs font-bold">MISSION ACTIVE</div>
                </div>

                <div className="flex items-center space-x-1">
                  <div className="bg-orange-600 text-white px-1.5 py-0.5 rounded-md font-bold shadow-md">
                    <div className="text-xs">SCORE</div>
                    <div className="text-xs font-black">{currentScore}</div>
                  </div>
                  
                  <div className="bg-green-600 text-white px-1.5 py-0.5 rounded-md font-bold shadow-md">
                    <div className="text-xs">CORRECT</div>
                    <div className="text-xs font-black">{getCorrectTerms().size}</div>
                  </div>

                  <button
                    onClick={resetGame}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-1.5 py-1 rounded-md font-bold shadow-md transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Main Game Area - Items Left, Categories Right */}
              <div className="flex-1 flex space-x-1 min-h-0">
                {/* Left Side - Items Panel - Much smaller */}
                <div className="w-48 bg-slate-800 rounded-lg p-2 flex flex-col shadow-lg border border-slate-600">
                  {/* Items Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black text-cyan-300 pixel-text">ITEMS</h3>
                    <div className="text-slate-400 text-xs font-bold">
                      {getUnassignedTerms().length} remaining
                    </div>
                  </div>

                  <div className="text-cyan-400 text-xs font-bold mb-1">Drag to Categories</div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-xs font-bold">PROGRESS</span>
                      <span className="text-white text-xs font-black">{Math.round(progress)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden shadow-inner border border-slate-600">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                      {getUnassignedTerms().map((term) => (
                        <div key={term.id}>
                          <DraggableTerm
                            term={term}
                            showResults={false} // Never show results in items panel
                          />
                        </div>
                      ))}
                      {getUnassignedTerms().length === 0 && !hasExecuted && (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 bg-green-600 rounded-lg mx-auto mb-1 flex items-center justify-center animate-bounce shadow-lg">
                            <Crown className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-green-400 font-black pixel-text text-xs">ALL DEPLOYED!</p>
                          <p className="text-slate-400 text-xs">Auto-executing...</p>
                        </div>
                      )}
                      {getUnassignedTerms().length === 0 && hasExecuted && (
                        <div className="text-center py-4">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-1 flex items-center justify-center animate-pulse shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-blue-400 font-black pixel-text text-xs">MISSION COMPLETE!</p>
                          <p className="text-slate-400 text-xs">Ready for review</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Drop Zones - HORIZONTAL LAYOUT */}
                <div className="flex-1 grid grid-cols-2 gap-1">
                  {gameMode.categories.map((category) => (
                    <div key={category.id} className="min-h-0">
                      <CategoryBox
                        category={category}
                        terms={getTermsInCategory(category.id)}
                        showResults={false} // Always show real-time feedback
                        correctTerms={getCorrectTerms()} // Real-time correct terms
                        incorrectTerms={getIncorrectTerms()} // Real-time incorrect terms
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout - Single Screen Layout */
            <div className="h-screen flex flex-col">
              {/* Desktop Header - Compact */}
              <div className="bg-gray-800 pixel-border-thick p-3 mb-3 relative overflow-hidden flex-shrink-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
                <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

                <div className="relative z-10 flex items-center justify-between">
                  {/* Left Side - Exit Button */}
                  <button
                    onClick={onBack}
                    className="pixel-border bg-red-700 hover:bg-red-600 text-red-300 hover:text-white px-4 py-2 font-bold pixel-text transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center space-x-2">
                      <ArrowLeft className="w-4 h-4" />
                      <span>EXIT</span>
                    </div>
                  </button>

                  {/* Center - Game Title */}
                  <div className="text-center">
                    <h1 className="text-xl font-black text-cyan-300 pixel-text mb-1">
                      {gameMode.title.replace(/🧩|📂|📋/g, '').trim()}
                    </h1>
                    <div className="text-gray-400 text-xs font-bold pixel-text">MISSION ACTIVE</div>
                  </div>

                  {/* Right Side - Stats and Restart */}
                  <div className="flex items-center space-x-3">
                    {/* Time */}
                    <div className="pixel-border bg-blue-900 px-3 py-1.5 text-center">
                      <div className="text-blue-300 text-xs font-bold pixel-text">TIME</div>
                      <div className="text-white text-sm font-black pixel-text">{formatTime(timeElapsed)}</div>
                    </div>

                    {/* Moves */}
                    <div className="pixel-border bg-purple-900 px-3 py-1.5 text-center">
                      <div className="text-purple-300 text-xs font-bold pixel-text">MOVES</div>
                      <div className="text-white text-sm font-black pixel-text">{moves}</div>
                    </div>

                    {/* Score */}
                    <div className="pixel-border bg-orange-600 px-3 py-1.5 text-center">
                      <div className="text-orange-100 text-xs font-bold pixel-text">SCORE</div>
                      <div className="text-white text-sm font-black pixel-text">{currentScore}</div>
                    </div>

                    {/* Restart Button */}
                    <button
                      onClick={resetGame}
                      className="pixel-border bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 font-bold pixel-text transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4" />
                        <span>RESTART</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Game Grid - Flex Layout for Single Screen */}
              <div className="flex-1 flex gap-4 min-h-0">
                {/* Command Center / Terms Pool - Compact for Single Screen */}
                <div className="w-80 flex-shrink-0">
                  <div className="pixel-border-thick bg-gray-800 p-4 h-full overflow-hidden flex flex-col">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
                    <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

                    <div className="relative z-10 flex flex-col h-full">
                      {/* Command Center Header */}
                      <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
                        <div className="w-6 h-6 bg-cyan-500 pixel-border flex items-center justify-center">
                          <Gamepad2 className="w-4 h-4 text-cyan-900" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-cyan-300 pixel-text">COMMAND CENTER</h2>
                          <div className="text-xs text-gray-400 font-bold">
                            ITEMS: {getUnassignedTerms().length}
                          </div>
                        </div>
                      </div>

                      {/* Score Display */}
                      <div className="mb-3 pixel-border bg-gradient-to-r from-yellow-600 to-orange-600 p-2 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-yellow-100 text-xs font-bold mb-1">CURRENT SCORE</div>
                          <div className="text-white text-lg font-black pixel-text">{currentScore.toString().padStart(2, '0')}/40</div>
                          <div className="text-yellow-200 text-xs font-bold">+5 per correct item</div>
                        </div>
                      </div>

                      {/* Items Pool - Flexible Height */}
                      <div className="flex-1 overflow-y-auto mb-3">
                        <div className="space-y-2">
                          {getUnassignedTerms().map((term, index) => (
                            <div
                              key={term.id}
                              className="animate-slideIn"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <DraggableTerm
                                term={term}
                                showResults={false}
                              />
                            </div>
                          ))}
                          {getUnassignedTerms().length === 0 && !hasExecuted && (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 bg-green-500 pixel-border mx-auto mb-2 flex items-center justify-center animate-bounce">
                                <Crown className="w-6 h-6 text-green-900" />
                              </div>
                              <p className="text-green-300 font-black pixel-text text-xs">ALL DEPLOYED!</p>
                              <p className="text-xs text-gray-400">Auto-executing mission...</p>
                            </div>
                          )}
                          {getUnassignedTerms().length === 0 && hasExecuted && (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 bg-blue-500 pixel-border mx-auto mb-2 flex items-center justify-center animate-pulse">
                                <CheckCircle className="w-6 h-6 text-blue-900" />
                              </div>
                              <p className="text-blue-300 font-black pixel-text text-xs">MISSION COMPLETE!</p>
                              <p className="text-xs text-gray-400">Ready for review</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mission Progress */}
                      <div className="flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-cyan-300 text-xs font-bold pixel-text">PROGRESS</span>
                          <span className="text-white text-xs font-black">{Math.round(progress)}%</span>
                        </div>
                        <div className="pixel-border bg-gray-900 h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out pixel-fill"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Zones - Horizontal Layout for Single Screen */}
                <div className="flex-1 flex gap-3 min-h-0">
                  {gameMode.categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="animate-slideIn category-box flex-1"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <CategoryBox
                        category={category}
                        terms={getTermsInCategory(category.id)}
                        showResults={false} // Always show real-time feedback
                        correctTerms={getCorrectTerms()} // Real-time correct terms
                        incorrectTerms={getIncorrectTerms()} // Real-time incorrect terms
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile-Optimized Results Screen */}
          {showResults && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 z-50">
              <div className={`pixel-border-thick bg-gray-800 relative overflow-hidden ${
                isMobile
                  ? 'w-11/12 h-4/5 max-w-md p-3'
                  : 'p-6 max-w-md w-full'
              }`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
                <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
                
                <div className={`relative z-10 text-center h-full ${isMobile ? 'flex flex-col justify-between' : ''}`}>
                  {/* Mobile Landscape Results Layout */}
                  {isMobile ? (
                    <>
                      {/* Top Section - Mission Status */}
                      <div className="flex-shrink-0">
                        <div className="text-gray-400 text-xs font-bold mb-1 pixel-text">MISSION STATUS</div>
                        <div className={`text-lg font-black pixel-text ${getPerformanceMessage(score).color} mb-2`}>
                          {getPerformanceMessage(score).message}
                        </div>
                      </div>

                      {/* Middle Section - Scores and Stats in Horizontal Layout */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full">
                          {/* Rank and Scores - Horizontal Layout */}
                          <div className="flex items-center justify-center space-x-4 mb-3">
                            {/* Rank Badge - Smaller */}
                            <div className={`w-12 h-12 ${getScoreRank(score).bg} pixel-border flex items-center justify-center animate-bounce flex-shrink-0`}>
                              <span className={`text-lg font-black pixel-text ${getScoreRank(score).color}`}>
                                {getScoreRank(score).rank}
                              </span>
                            </div>
                            
                            {/* Scores */}
                            <div className="text-center">
                              <div className="text-2xl font-black text-yellow-400 pixel-text">
                                {currentScore}/40
                              </div>
                              <div className="text-xl font-black text-cyan-300 pixel-text">
                                {score}%
                              </div>
                              <p className="text-gray-300 text-xs font-bold pixel-text">
                                {totalCorrect}/{terms.length} TARGETS HIT
                              </p>
                            </div>
                          </div>


                        </div>
                      </div>

                      {/* Bottom Section - Action Buttons with Flex Layout */}
                      <div className="flex-shrink-0">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setShowResults(false)}
                            className="pixel-border-thick bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-2 py-2 font-black text-xs pixel-text transition-all duration-300"
                          >
                            CONTINUE MISSION
                          </button>
                          
                          <button
                            onClick={handleNextLevel}
                            className="pixel-border-thick bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-2 py-2 font-black text-xs pixel-text transition-all duration-300"
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <span>NEXT LEVEL</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </button>
                          
                          <button
                            onClick={resetGame}
                            className="pixel-border bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-2 py-2 font-bold text-xs pixel-text transition-all duration-200"
                          >
                            RETRY MISSION
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Desktop Results Layout - Keep Original */
                    <>
                      {/* Mission Status */}
                      <div className="mb-4">
                        <div className="text-gray-400 text-sm font-bold mb-1 pixel-text">MISSION STATUS</div>
                        <div className={`text-2xl font-black mb-1 pixel-text ${getPerformanceMessage(score).color}`}>
                          {getPerformanceMessage(score).message}
                        </div>
                      </div>

                      {/* Rank Badge */}
                      <div className="mb-4">
                        <div className={`inline-block w-16 h-16 ${getScoreRank(score).bg} pixel-border flex items-center justify-center animate-bounce`}>
                          <span className={`text-2xl font-black pixel-text ${getScoreRank(score).color}`}>
                            {getScoreRank(score).rank}
                          </span>
                        </div>
                      </div>

                      {/* Score Display */}
                      <div className="mb-4">
                        <div className="text-4xl font-black text-yellow-400 mb-1 pixel-text">
                          {currentScore}/40
                        </div>
                        <div className="text-3xl font-black text-cyan-300 mb-1 pixel-text">
                          {score}%
                        </div>
                        <p className="text-gray-300 text-base font-bold pixel-text">
                          {totalCorrect}/{terms.length} TARGETS HIT
                        </p>
                      </div>


                      
                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowResults(false)}
                          className="w-full pixel-border-thick bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-3 font-black text-base pixel-text transition-all duration-300 hover:scale-105"
                        >
                          CONTINUE MISSION
                        </button>

                        <button
                          onClick={handleNextLevel}
                          className="w-full pixel-border-thick bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 font-black text-base pixel-text transition-all duration-300 hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span>NEXT LEVEL</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </button>

                        <button
                          onClick={resetGame}
                          className="w-full pixel-border bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 font-bold text-base pixel-text transition-all duration-200 hover:scale-105"
                        >
                          RETRY MISSION
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default GameInterface;