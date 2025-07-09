import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface GameHeaderProps {
  currentCase: number;
  totalCases: number;
  score: number;
  totalQuestions: number;
  onBack?: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ currentCase, totalCases, score, totalQuestions, onBack }) => {
  return (
    <header className="game-header flex flex-col  items-center justify-center py-1 text-center w-full">
      {onBack && (
        <div className="w-full flex justify-start mb-2">
          <button
            onClick={onBack}
            className="px-1 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold flex items-center space-x-1 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      )}
      <div className="flex flex-col items-center w-full ">
        <h2 className="text-xl md:text-2xl font-bold text-cyan-400 glow-cyan animate-pulse-text mb-1 text-center w-full">Deviation Investigation Game</h2>
        <div className="flex flex-row items-center justify-center gap-2 mt-2 w-full">
          <span className="px-2 py-1 rounded-lg bg-black/30 text-cyan-300 font-bold text-xs md:text-base shadow-md border border-cyan-400/30 animate-fade-in-scale glow-cyan">Case: {currentCase} / {totalCases}</span>
          <span className="px-2 py-1 rounded-lg bg-black/30 text-green-400 font-bold text-xs md:text-base shadow-md border border-green-400/30 animate-fade-in-scale glow-green">Score: {score}</span>
          <span className="px-2 py-1 rounded-lg bg-black/30 text-yellow-300 font-bold text-xs md:text-base shadow-md border border-yellow-400/30 animate-fade-in-scale glow-yellow">Questions: {totalQuestions}</span>
        </div>
      </div>
      <style>{`
  .glow-cyan {
    text-shadow: 0 0 8px #22d3ee, 0 0 16px #38bdf8, 0 0 24px #0ea5e9;
  }
  .glow-green {
    text-shadow: 0 0 8px #4ade80, 0 0 16px #22c55e;
  }
  .glow-yellow {
    text-shadow: 0 0 8px #fde68a, 0 0 16px #facc15;
  }
  .animate-pulse-text {
    animation: pulse-text 2s ease-in-out infinite;
  }
  @keyframes pulse-text {
    0%, 100% {
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
    }
    50% {
      color: rgba(59, 130, 246, 0.9);
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
    }
  }
  .animate-fade-in-scale {
    opacity: 0;
    animation: fade-in-scale 0.6s ease-out forwards;
  }
  @keyframes fade-in-scale {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`}</style>
    </header>
  );
};

export default GameHeader;
export { GameHeader };