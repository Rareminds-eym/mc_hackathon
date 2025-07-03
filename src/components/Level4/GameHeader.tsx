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
      <div className="flex flex-col items-center w-full bg-black/10">
        <h2 className="text-sm font-bold text-red-600 lg:text-2xl xl:text-3xl">Deviation Investigation Game</h2>
        <div className="flex space-x-4 text-[10px] mt-1 lg:text-lg xl:text-xl text-white ">
          <span>Case: {currentCase} / {totalCases}</span>
          <span>Score: {score}</span>
          <span>Questions: {totalQuestions}</span>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
export { GameHeader };