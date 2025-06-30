import React from 'react';
import { Trophy, Star, RotateCcw } from 'lucide-react';

interface GameCompleteModalProps {
  isVisible: boolean;
  onPlayAgain: () => void;
  score: number;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({ isVisible, onPlayAgain, score }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-xl mx-4 scale-100 animate-[scale-in_0.2s_cubic-bezier(0.4,0,0.2,1)]">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-yellow-700 mb-2">Congratulations!</h2>
          <p className="text-xl text-slate-700 mb-4">You've completed all 24 terms!</p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-semibold text-slate-800">Final Score</span>
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{score} Points</div>
          </div>
          <p className="text-slate-600 mb-6">
            You've mastered all the quality control terms! Great job on your learning journey.
          </p>
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-full font-semibold text-base border-none cursor-pointer transition-all mx-auto scale-100 hover:from-blue-600 hover:to-blue-800"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCompleteModal;