import React, { useEffect, useState } from 'react';
import { ArrowRight, X, Clock, Target } from 'lucide-react';
import { Term } from '../../../types/Level2/types';
import { useAuth } from '../../../contexts/AuthContext';
import { LevelProgressService } from '../../../services/levelProgressService';
import { useLevelProgress } from '../../../hooks/useLevelProgress';
import { GameTypeResult } from '../hooks/useScoreAccumulator';
import { useLevel2Game } from '../hooks/useLevel2Game';
import { getGameModesByModuleAndType } from '../data/gameModes';
import { useDeviceLayout } from '../../../hooks/useOrientation';
import { GameStorage } from '../../../utils/Level2/gameStorage';


interface ResultsModalProps {
  showResults: boolean;
  score: number;
  currentScore: number;
  totalCorrect: number;
  terms: Term[];
  onNextLevel: () => void;
  onReset: () => void;
  onClose: () => void;
  moduleId?: number;
  levelId?: number;
  scoreHistory?: number[];
  timeHistory?: number[];
  currentType?: number;
  gameModeId?: string;
  accumulatedResults?: GameTypeResult[];
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  showResults,
  score,
  currentScore,
  totalCorrect,
  terms,
  onNextLevel,
  onReset,
  onClose,
  moduleId = 1,
  levelId = 2,
  scoreHistory = [],
  timeHistory = [],
  currentType: _currentType,
  gameModeId: _gameModeId,
  accumulatedResults = [],
}) => {
  const { user } = useAuth();
  const { isMobile } = useDeviceLayout();
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);
  const [hasRemainingTypes, setHasRemainingTypes] = useState(false);
  const [hasBatchProcessed, setHasBatchProcessed] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Use level progress hook to refresh progress after completion
  const { refreshProgress } = useLevelProgress(moduleId);

  // Initialize the Level2Game hook for batch processing and score history
  const { saveGameDataWithHistory, gameDataWithHistory: hookGameDataWithHistory, isLoading: isLoadingGameData } = useLevel2Game({
    moduleId: moduleId.toString(),
    gameModeId: _gameModeId || 'default'
  });

  // Clear localStorage immediately when ResultsModal becomes visible
  useEffect(() => {
    if (showResults) {
      // List current localStorage keys before clearing
      GameStorage.listAllRelevantKeys();

      // Clear all saved game states for this module since data will be/is saved to Supabase
      GameStorage.clearAllLevel2GameStatesForModule(moduleId.toString());

      // Clear ALL term placement results for all games (as requested)
      GameStorage.clearAllTermPlacementResults();

      // Clear quest stats (as requested) with enhanced debugging
      // First attempt with regular clear
      GameStorage.clearQuestStats();

      // Verify if the key was actually removed
      const questStatsStillExists = localStorage.getItem('gmp-quest-stats') !== null;
      if (questStatsStillExists) {
        GameStorage.forceClearQuestStats();

        // Final verification
        const finalCheck = localStorage.getItem('gmp-quest-stats') !== null;
        if (finalCheck) {
          // Quest stats key still exists even after force clear
        }
      }

      // List remaining keys after clearing
      GameStorage.listAllRelevantKeys();
    }
  }, [showResults, moduleId]);

  // Batch process all accumulated results when modal becomes visible
  useEffect(() => {
    const batchProcessResults = async () => {
      if (!showResults || !user || hasBatchProcessed || accumulatedResults.length === 0) {
        return;
      }

      setHasBatchProcessed(true);
      setIsBatchProcessing(true);

      try {
        // Calculate aggregated totals from all game types
        const totalScore = accumulatedResults.reduce((sum, result) => sum + result.currentScore, 0);
        const totalTime = accumulatedResults.reduce((sum, result) => sum + result.time, 0);
        const totalTerms = accumulatedResults.reduce((sum, result) => sum + result.totalTerms, 0);

        // Combine all placed terms from all game types
        const allPlacedTerms = accumulatedResults.reduce((allTerms, result) => {
          return [...allTerms, ...result.placedTerms];
        }, [] as Term[]);

        // Check if all game types were completed
        const allCompleted = accumulatedResults.every(result => result.isCompleted);

        // Save a single aggregated "Total" record instead of individual game type records
        await saveGameDataWithHistory({
          score: totalScore,
          isCompleted: allCompleted,
          time: totalTime,
          totalTerms: totalTerms,
          placedTerms: allPlacedTerms,
        });
      } catch (error) {
        // Error during batch processing
      } finally {
        setIsBatchProcessing(false);
      }
    };

    batchProcessResults();
  }, [showResults, user, hasBatchProcessed, accumulatedResults, saveGameDataWithHistory]);

  // The flow system now handles when to show the ResultsModal
  // This component should only be rendered when the entire module flow is complete
  useEffect(() => {
    // Always show the modal when this component is rendered
    // The parent component (GameNavigator) controls when this should be shown
    setHasRemainingTypes(false);
  }, []);

  // Update level progress when modal becomes visible and game is completed
  useEffect(() => {
    const updateLevelProgress = async () => {
      if (!showResults || !user || hasUpdatedProgress) {
        return;
      }

      setHasUpdatedProgress(true);
      try {
        const { error } = await LevelProgressService.completeLevel(
          user.id,
          moduleId,
          levelId
        );

        if (error) {
          // Failed to update level progress
        } else {
          // Refresh the level progress to update UI with newly unlocked levels
          await refreshProgress();
        }
      } catch (error) {
        // Error updating level progress
      }
    };

    updateLevelProgress();
  }, [showResults, user, moduleId, levelId, hasUpdatedProgress, score, refreshProgress]);

  // Reset the progress update flag when modal is closed
  useEffect(() => {
    if (!showResults) {
      setHasUpdatedProgress(false);
    }
  }, [showResults]);

  // Note: localStorage cleanup is now handled immediately when modal opens
  // since the data is being saved to Supabase database at that point



  const getContextualFeedback = (currentScore: number, scoreHistory: number[]) => {


    const current = currentScore;
    const previous = scoreHistory[1]; // previous score
    const lastPrevious = scoreHistory[2]; // past previous score

    // Check for contextual feedback conditions
    if (previous !== undefined && current > previous) {
      // Current score is better than previous
      return { message: "🎉 Great! You're improving!", color: "text-green-300" };
    } else if (previous !== undefined && current < previous) {
      // Check if scores have dropped two sessions in a row
      if (lastPrevious !== undefined && previous < lastPrevious) {
        // Two consecutive drops: lastPrevious > previous > current
        return { message: "⚠️ Need help? Focus on the tricky parts!", color: "text-orange-300" };
      } else {
        // Single drop
        return { message: "💪 Don't worry—try again to beat your last score!", color: "text-blue-300" };
      }
    } else {
      // Handle two distinct scenarios for same score or no previous score
      if (!scoreHistory || scoreHistory.length === 0 || previous === undefined) {
        // No previous score exists - first time completion
        return { message: "Congrats this is your first score!", color: "text-blue-300" };
      } else if (current === previous) {
        // Same score as previous attempt
        return { message: "Keep practicing to improve!", color: "text-blue-300" };
      } else {
        // Fallback for any other case
        return { message: "Keep practicing to improve!", color: "text-blue-300" };
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total accumulated scores from all game types
  const getTotalAccumulatedScore = (): number => {
    return accumulatedResults.reduce((total, result) => total + result.currentScore, 0);
  };

  const getTotalAccumulatedTime = (): number => {
    return accumulatedResults.reduce((total, result) => total + result.time, 0);
  };

  // Calculate maximum score for a game type based on number of terms (5 points per term)
  const getMaxScoreForGameType = (gameTypeId: number, moduleId: number): number => {
    const gameModes = getGameModesByModuleAndType(moduleId, gameTypeId);
    if (gameModes.length === 0) return 40; // fallback to default

    // Get the first game mode for this type and count its terms
    const gameMode = gameModes[0];
    return gameMode.terms.length * 5; // 5 points per term
  };

  // Calculate maximum score for a specific result
  const getMaxScoreForResult = (result: GameTypeResult): number => {
    return getMaxScoreForGameType(result.gameTypeId, moduleId);
  };

  // Calculate total maximum score for all accumulated results
  const getTotalMaxScore = (): number => {
    return accumulatedResults.reduce((total, result) => {
      return total + getMaxScoreForResult(result);
    }, 0);
  };



  // Safe navigation handler that waits for batch processing to complete
  const handleSafeNavigation = async (navigationCallback: () => void) => {
    // If batch processing is still in progress, wait for it to complete
    if (isBatchProcessing) {
      // Wait for batch processing to complete (with timeout)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      while (isBatchProcessing && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (attempts >= maxAttempts) {
        // Batch processing timeout, proceeding with navigation anyway
      }
    }

    navigationCallback();
  };

  // Render accumulated results from all game types
  const renderAccumulatedResults = () => {
    if (!accumulatedResults || accumulatedResults.length === 0) {
      return renderScoreHistory(); // Fallback to single game history
    }

    return (
      <div className="mt-1 p-1 bg-gray-900 bg-opacity-50 pixel-border">
        <div className="text-gray-400 text-xs font-bold mb-0.5 pixel-text text-center">ALL GAME TYPES COMPLETED</div>
        <div className="space-y-0.5">
          {accumulatedResults.map((result) => (
            <div
              key={result.gameTypeId}
              className="flex items-center justify-between text-xs pixel-text text-gray-300"
            >
              <div className="flex items-center space-x-1">
                <Target className="w-2 h-2" />
                <span>TYPE {result.gameTypeId}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-yellow-400">{result.currentScore}/{getMaxScoreForResult(result)}</span>
                <Clock className="w-2 h-2" />
                <span>{formatTime(result.time)}</span>
              </div>
            </div>
          ))}
          {/* Total Summary */}
          <div className="border-t border-gray-600 pt-0.5 mt-0.5">
            <div className="flex items-center justify-between text-xs pixel-text text-cyan-300 font-bold">
              <div className="flex items-center space-x-1">
                <Target className="w-2 h-2" />
                <span>TOTAL</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{getTotalAccumulatedScore()}/{getTotalMaxScore()}</span>
                <Clock className="w-2 h-2" />
                <span>{formatTime(getTotalAccumulatedTime())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScoreHistory = () => {
    if (!scoreHistory || scoreHistory.length === 0) return null;

    return (
      <div className="mt-1 p-1 bg-gray-900 bg-opacity-50 pixel-border">
        <div className="text-gray-400 text-xs font-bold mb-1 pixel-text">SCORE HISTORY</div>
        <div className="space-y-0.5">
          {scoreHistory.slice(0, 3).map((historyScore, index) => {
            const historyTime = timeHistory?.[index];
            const isCurrentScore = index === 0;
            return (
              <div
                key={index}
                className={`flex items-center justify-between text-xs pixel-text ${
                  isCurrentScore ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Target className="w-2 h-2" />
                  <span>{isCurrentScore ? 'High Score' : `PREV ${index}`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{historyScore}/{terms.length * 5}</span>
                  {historyTime && (
                    <>
                      <Clock className="w-2 h-2" />
                      <span>{formatTime(historyTime)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper function to render previous scores section for the right panel
  const renderPreviousScoresPanel = () => {
    // Show loader while game data is loading
    if (isLoadingGameData) {
      return (
        <div className={`${isMobile ? 'p-2' : 'p-4'} text-center`}>
          <div className="text-gray-400 text-xs font-bold mb-2 pixel-text">PREVIOUS SCORES</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Loading...
            </span>
          </div>
        </div>
      );
    }

    // Use the database score history directly from hookGameDataWithHistory
    const hasGameDataHistory = hookGameDataWithHistory && hookGameDataWithHistory.score_history && hookGameDataWithHistory.score_history.length > 0;

    if (!hasGameDataHistory) {
      return null;
    }

    // Build previous scores array from database score_history
    // score_history format: [Top Score, Past, Past_Previous]
    const previousScores = [];
    const dbScoreHistory = hookGameDataWithHistory.score_history;
    const dbTimeHistory = hookGameDataWithHistory.time_history || [];

    // Add Top Score (1st element)
    if (dbScoreHistory.length > 0 && dbScoreHistory[0] !== undefined && dbScoreHistory[0] !== null) {
      previousScores.push({
        score: dbScoreHistory[0],
        time: dbTimeHistory[0],
        label: 'Top Score'
      });
    }

    // Add Past (2nd element)
    if (dbScoreHistory.length > 1 && dbScoreHistory[1] !== undefined && dbScoreHistory[1] !== null) {
      previousScores.push({
        score: dbScoreHistory[1],
        time: dbTimeHistory[1],
        label: 'Past'
      });
    }

    // Add Past Previous (3rd element)
    if (dbScoreHistory.length > 2 && dbScoreHistory[2] !== undefined && dbScoreHistory[2] !== null) {
      previousScores.push({
        score: dbScoreHistory[2],
        time: dbTimeHistory[2],
        label: 'Past Previous'
      });
    }

    return (
      <div className={`${isMobile ? 'p-1' : 'p-4'}`}>
        <div className="text-gray-400 text-xs font-bold mb-1 pixel-text text-center">PREVIOUS SCORES</div>
        <div className={`${isMobile ? 'space-y-0.5' : 'space-y-2'}`}>
          {previousScores.map((scoreData, index) => (
            <div
              key={index}
              className={`flex items-center justify-between ${isMobile ? 'p-1 text-xs' : 'p-2'} rounded-lg bg-slate-700/30 border border-slate-600/30`}
            >
              <div className="flex items-center space-x-1">
                <Target className={`text-slate-400 ${isMobile ? 'w-2 h-2' : 'w-4 h-4'}`} />
                <span className={`font-semibold text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}
                      style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {isMobile ? (
                    index === 0 ? 'Top' :
                    index === 1 ? 'Past' :
                    'Past Prev'
                  ) : scoreData.label}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={`font-bold text-slate-300 ${isMobile ? 'text-xs' : 'text-sm'}`}
                      style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {scoreData.score}/{getTotalMaxScore() || 60}
                </span>
                {scoreData.time && (
                  <>
                    <Clock className={`text-slate-400 ${isMobile ? 'w-2 h-2' : 'w-4 h-4'}`} />
                    <span className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                          style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      {formatTime(scoreData.time)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}

          {previousScores.length === 0 && (
            <div className={`${isMobile ? 'p-1' : 'p-3'} text-center rounded-lg bg-slate-700/20 border border-slate-600/20`}>
              <p className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? 'No previous scores' : 'Complete more games to see previous scores'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!showResults) return null;

  // If there are remaining types in the current module, don't render the modal
  if (hasRemainingTypes) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-1 z-50">
      <div className={`pixel-border-thick bg-gray-800 relative overflow-hidden ${
        isMobile
          ? 'w-[95%] h-auto max-w-4xl p-1'
          : 'p-6 max-w-4xl w-full'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute z-20 pixel-border bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center ${
            isMobile ? 'top-1 right-1 w-6 h-6' : 'top-2 right-2 w-8 h-8'
          }`}
          aria-label="Close"
        >
          <X className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
        </button>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

        <div className={`relative z-10 h-full ${isMobile ? 'flex flex-col justify-between' : ''}`}>
          {/* Two-column layout for both desktop and mobile */}
          <div className={`${isMobile ? 'space-y-1' : 'flex space-x-6'}`}>
            {/* Left Column - Main Results */}
            <div className={`${isMobile ? 'w-full' : 'flex-1'} ${isMobile ? 'space-y-1' : 'space-y-4'}`}>
              {/* Mission Status */}
              <div className={`${isMobile ? 'text-center' : 'mb-4 text-center'}`}>
                {!isMobile && (
                  <div className="text-gray-400 text-sm font-bold mb-1 pixel-text">MISSION STATUS</div>
                )}
                <div className={`font-black pixel-text ${getContextualFeedback(currentScore, scoreHistory).color} ${
                  isMobile ? 'text-xs' : 'text-2xl mb-1'
                }`}>
                  {getContextualFeedback(currentScore, scoreHistory).message}
                </div>
              </div>

              {/* Main Score Display */}
              <div className={`${isMobile ? 'text-center' : 'mb-4 text-center'}`}>
                {accumulatedResults.length > 0 ? (
                  <>
                    <div className={`font-black text-yellow-400 pixel-text ${
                      isMobile ? 'text-xl' : 'text-4xl mb-1'
                    }`}>
                      {getTotalAccumulatedScore()}/{getTotalMaxScore()}
                    </div>
                    <div className={`font-black text-cyan-300 pixel-text ${
                      isMobile ? 'text-lg' : 'text-3xl mb-1'
                    }`}>
                      {Math.round((getTotalAccumulatedScore() / getTotalMaxScore()) * 100)}%
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`font-black text-yellow-400 pixel-text ${
                      isMobile ? 'text-xl' : 'text-4xl mb-1'
                    }`}>
                      {currentScore}/{terms.length * 5}
                    </div>
                    <div className={`font-black text-cyan-300 pixel-text ${
                      isMobile ? 'text-lg' : 'text-3xl mb-1'
                    }`}>
                      {score}%
                    </div>
                    <p className={`text-gray-300 font-bold pixel-text ${
                      isMobile ? 'text-xs' : 'text-base'
                    }`}>
                      {totalCorrect}/{terms.length} TARGETS HIT
                    </p>
                  </>
                )}

                {/* Score History - Two column layout for mobile */}
                {isMobile ? (
                  <div className="flex space-x-2 mt-2">
                    {/* Left: Types Completed */}
                    <div className="flex-1">
                      {renderAccumulatedResults()}
                    </div>
                    {/* Right: Previous Scores */}
                    <div className="flex-1">
                      <div className="bg-slate-800/50 rounded-lg border border-slate-600/30 h-full">
                        {renderPreviousScoresPanel()}
                      </div>
                    </div>
                  </div>
                ) : (
                  renderAccumulatedResults()
                )}
              </div>

              {/* Action Buttons */}
              <div className={isMobile ? "flex space-x-2" : "space-y-2"}>
                <button
                  onClick={() => handleSafeNavigation(onNextLevel)}
                  disabled={isBatchProcessing}
                  className={`pixel-border-thick ${
                    isBatchProcessing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                  } text-white font-black pixel-text transition-all duration-300 ${
                    isMobile
                      ? 'flex-1 px-2 py-1 text-xs'
                      : 'w-full px-6 py-3 text-base hover:scale-105'
                  }`}
                >
                  <div className={`flex items-center justify-center ${
                    isMobile ? 'space-x-1' : 'space-x-2'
                  }`}>
                    <span>{isBatchProcessing ? 'SAVING...' : 'NEXT LEVEL'}</span>
                    <ArrowRight className={isMobile ? "w-3 h-3" : "w-5 h-5"} />
                  </div>
                </button>

                <button
                  onClick={onReset}
                  className={`pixel-border bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-bold pixel-text transition-all duration-200 ${
                    isMobile
                      ? 'flex-1 px-2 py-1 text-xs'
                      : 'w-full px-6 py-3 text-base hover:scale-105'
                  }`}
                >
                  RETRY MISSION
                </button>
              </div>
            </div>

            {/* Right Column - Previous Scores (Desktop only) */}
            {!isMobile && (
              <div className="w-80 bg-slate-800/50 rounded-lg border border-slate-600/30">
                {renderPreviousScoresPanel()}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
