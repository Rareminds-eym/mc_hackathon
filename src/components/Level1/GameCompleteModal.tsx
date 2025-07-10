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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-3xl shadow-2xl mx-2 scale-100 animate-[scale-in_0.2s_cubic-bezier(0.4,0,0.2,1)] ${
          isMobileLandscape ? 'p-3 max-w-xs' : 'p-8 max-w-xl mx-4'
        }`}
      >
        <div className="text-center">
          <div className={`flex justify-center ${isMobileLandscape ? 'mb-2' : 'mb-4'}`}>
            <div
              className={`${
                isMobileLandscape ? 'w-12 h-12' : 'w-20 h-20'
              } bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce`}
            >
              <Trophy className={`${isMobileLandscape ? 'w-6 h-6' : 'w-10 h-10'} text-white`} />
            </div>
          </div>
          <h2 className={`${isMobileLandscape ? 'text-2xl' : 'text-4xl'} font-bold text-yellow-700 mb-2`}>
            Congratulations!
          </h2>
          <p className={`${isMobileLandscape ? 'text-base' : 'text-xl'} text-slate-700 mb-4`}>
            You've completed all 24 terms!
          </p>
          <div
            className={`bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl ${
              isMobileLandscape ? 'p-3 mb-4' : 'p-6 mb-6'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${isMobileLandscape ? 'mb-1' : 'mb-3'}`}>
              <Star className={`${isMobileLandscape ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-400`} />
              <span className={`${isMobileLandscape ? 'text-base' : 'text-lg'} font-semibold text-slate-800`}>
                Final Score
              </span>
              <Star className={`${isMobileLandscape ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-400`} />
            </div>
            <div className={`${isMobileLandscape ? 'text-xl' : 'text-3xl'} font-bold text-blue-600`}>
              {score} Points
            </div>
          </div>
          <p className={`${isMobileLandscape ? 'text-sm mb-4' : 'text-slate-600 mb-6'}`}>
            You've mastered all the quality control terms! Great job on your learning journey.
          </p>
          {/* Play Again button (uncommented and fixed) */}
          <button
            onClick={onPlayAgain}
            className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold border-none cursor-pointer transition-all mx-auto scale-100 ${
              isMobileLandscape ? 'py-2 px-4 text-sm' : 'py-3 px-8 text-base'
            } hover:from-blue-600 hover:to-blue-800`}
          >
            <RotateCcw className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <span>Play Again</span>
          </button>
          <button
            onClick={() => window.location.href = '/level2'}
            className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold border-none cursor-pointer transition-all mx-auto mt-4 scale-100 ${
              isMobileLandscape ? 'py-2 px-4 text-sm' : 'py-3 px-8 text-base'
            } hover:from-green-600 hover:to-green-800`}
          >
            <span>Continue to Level 2</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;