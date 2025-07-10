import React, { useEffect, useState } from 'react';
import { Trophy, Star, RotateCcw } from 'lucide-react';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { useAuth } from '../../contexts/AuthContext';
import { LevelProgressService } from '../../services/levelProgressService';

interface GameCompleteModalProps {
  isVisible: boolean;
  onPlayAgain: () => void;
  score: number;
  moduleId?: number;
  levelId?: number;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isVisible,
  onPlayAgain,
  score,
  moduleId = 1,
  levelId = 1
}) => {
  const { isHorizontal, isMobile } = useDeviceLayout();
  const { user } = useAuth();
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const isMobileLandscape = isMobile && isHorizontal;

  // Update level progress when modal becomes visible
  useEffect(() => {
    const updateLevelProgress = async () => {
      if (!isVisible || !user || isUpdatingProgress) return;

      setIsUpdatingProgress(true);
      try {
        const { error } = await LevelProgressService.completeLevel(
          user.id,
          moduleId,
          levelId
        );

        if (error) {
          console.error('Failed to update level progress:', error);
        } else {
          console.log(`Level ${levelId} of Module ${moduleId} marked as completed`);
        }
      } catch (error) {
        console.error('Error updating level progress:', error);
      } finally {
        setIsUpdatingProgress(false);
      }
    };

    updateLevelProgress();
  }, [isVisible, user, moduleId, levelId, isUpdatingProgress]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className={`pixel-border-thick bg-gradient-to-br from-yellow-50 via-blue-100 to-purple-100 rounded-2xl shadow-2xl mx-2 scale-100 animate-[scale-in_0.2s_cubic-bezier(0.4,0,0.2,1)] transition-all duration-300 ${
          isMobileLandscape ? 'p-2 max-w-[260px] min-h-[180px]' : 'p-8 max-w-xl mx-4'
        }`}
      >
        <div className="text-center">
          <div className={`flex justify-center ${isMobileLandscape ? 'mb-1' : 'mb-4'}`}>
            <div
              className={`pixel-border bg-gradient-to-r from-yellow-400 to-orange-400 ${
                isMobileLandscape ? 'w-10 h-10' : 'w-24 h-24'
              } rounded-xl flex items-center justify-center animate-bounce shadow-xl`}
            >
              <Trophy className={`${isMobileLandscape ? 'w-5 h-5' : 'w-12 h-12'} text-white drop-shadow-lg`} />
            </div>
          </div>
          <h2 className={`${isMobileLandscape ? 'text-lg' : 'text-4xl'} font-extrabold text-yellow-700 mb-1 pixel-text drop-shadow`}>🎉 Congratulations! 🎉</h2>
          <p className={`${isMobileLandscape ? 'text-xs' : 'text-xl'} text-slate-700 mb-2 font-semibold pixel-text`}>You've completed all 24 terms!</p>
          <div
            className={`pixel-border bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl ${
              isMobileLandscape ? 'p-2 mb-2' : 'p-6 mb-6'
            } shadow`}
          >
            <div className={`flex items-center justify-center gap-2 ${isMobileLandscape ? 'mb-1' : 'mb-3'}`}>
              <Star className={`${isMobileLandscape ? 'w-3 h-3' : 'w-6 h-6'} text-yellow-400 drop-shadow`} />
              <span className={`${isMobileLandscape ? 'text-xs' : 'text-lg'} font-bold text-slate-800 pixel-text`}>Final Score</span>
              <Star className={`${isMobileLandscape ? 'w-3 h-3' : 'w-6 h-6'} text-yellow-400 drop-shadow`} />
            </div>
            <div className={`${isMobileLandscape ? 'text-lg' : 'text-4xl'} font-extrabold text-blue-600 pixel-text drop-shadow`}>{score} Points</div>
          </div>
          <p className={`${isMobileLandscape ? 'text-xs mb-2' : 'text-slate-600 mb-6'} font-semibold pixel-text`}>You've mastered all the quality control terms!<br/>Great job on your learning journey.</p>
          <div className="flex flex-col gap-2 items-center w-full">
            <button
              onClick={onPlayAgain}
              className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold border-none cursor-pointer transition-all mx-auto scale-100 pixel-border shadow-md ${
                isMobileLandscape ? 'py-1 px-2 text-xs' : 'py-3 px-8 text-base'
              } hover:from-blue-600 hover:to-blue-800`}
            >
              <RotateCcw className={`${isMobileLandscape ? 'w-3 h-3' : 'w-5 h-5'}`} />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => window.location.href = '/level2'}
              className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold border-none cursor-pointer transition-all mx-auto pixel-border shadow-md ${
                isMobileLandscape ? 'py-1 px-2 text-xs' : 'py-3 px-8 text-base'
              } hover:from-green-600 hover:to-green-800`}
            >
              <span>Continue to Level 2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;