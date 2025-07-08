import React, { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Term } from '../../../types/Level2/types';
import { useAuth } from '../../../contexts/AuthContext';
import { LevelProgressService } from '../../../services/levelProgressService';

interface ResultsModalProps {
  showResults: boolean;
  score: number;
  currentScore: number;
  totalCorrect: number;
  terms: Term[];
  isMobile: boolean;
  onNextLevel: () => void;
  onReset: () => void;
  onClose: () => void;
  moduleId?: number;
  levelId?: number;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  showResults,
  score,
  currentScore,
  totalCorrect,
  terms,
  isMobile,
  onNextLevel,
  onReset,
  onClose,
  moduleId = 1,
  levelId = 2,
}) => {
  const { user } = useAuth();
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

  // Update level progress when modal becomes visible and game is completed
  useEffect(() => {
    const updateLevelProgress = async () => {
      console.log('ResultsModal: useEffect triggered', {
        showResults,
        user: user?.id,
        moduleId,
        levelId,
        score,
        hasUpdatedProgress
      });

      if (!showResults || !user || hasUpdatedProgress) {
        console.log('ResultsModal: Skipping update due to conditions:', {
          showResults,
          hasUser: !!user,
          hasUpdatedProgress,
          score
        });
        return;
      }

      console.log('ResultsModal: Starting level progress update...');
      setHasUpdatedProgress(true);
      try {
        const { data, error } = await LevelProgressService.completeLevel(
          user.id,
          moduleId,
          levelId
        );

        if (error) {
          console.error('ResultsModal: Failed to update level progress:', error);
        } else {
          console.log('ResultsModal: Successfully updated level progress:', {
            moduleId,
            levelId,
            userId: user.id,
            data
          });
        }
      } catch (error) {
        console.error('ResultsModal: Error updating level progress:', error);
      }
    };

    updateLevelProgress();
  }, [showResults, user, moduleId, levelId, hasUpdatedProgress, score]);

  // Reset the progress update flag when modal is closed
  useEffect(() => {
    if (!showResults) {
      setHasUpdatedProgress(false);
    }
  }, [showResults]);

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

  if (!showResults) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-2 z-50">
      <div className={`pixel-border-thick bg-gray-800 relative overflow-hidden ${
        isMobile
          ? 'w-11/12 h-4/5 max-w-md p-3'
          : 'p-6 max-w-md w-full'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 w-8 h-8 pixel-border bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onNextLevel}
                    className="pixel-border-thick bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-2 py-2 font-black text-xs pixel-text transition-all duration-300"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>NEXT LEVEL</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                  
                  <button
                    onClick={onReset}
                    className="pixel-border bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-2 py-2 font-bold text-xs pixel-text transition-all duration-200"
                  >
                    RETRY MISSION
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Desktop Results Layout */
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
                  onClick={onNextLevel}
                  className="w-full pixel-border-thick bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-3 font-black text-base pixel-text transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>NEXT LEVEL</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>

                <button
                  onClick={onReset}
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
  );
};

export default ResultsModal;
