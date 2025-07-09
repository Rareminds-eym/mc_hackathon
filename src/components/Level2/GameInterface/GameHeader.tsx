import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface GameHeaderProps {
  gameTitle: string;
  onBack: () => void;
  onReset: () => void;
  currentScore: number;
  correctCount: number;
  timeElapsed: number;
  moves: number;
  isMobile: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameTitle,
  onBack,
  onReset,
  currentScore,
  correctCount,
  timeElapsed,
  moves,
  isMobile,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMobile) {
    return (
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
            {gameTitle.replace(/🧩|📂|📋/g, '').trim()}
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
            <div className="text-xs font-black">{correctCount}</div>
          </div>

          <button
            onClick={onReset}
            className="bg-slate-600 hover:bg-slate-700 text-white px-1.5 py-1 rounded-md font-bold shadow-md transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
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
            {gameTitle.replace(/🧩|📂|📋/g, '').trim()}
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
            onClick={onReset}
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
  );
};

export default GameHeader;
