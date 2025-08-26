
import type { Dispatch, SetStateAction } from "react";
import type { GameState } from "../GmpSimulation";
import Level2SolutionCard from "./Level2SolutionCard";

interface Level2GameProps {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  hasSavedProgress: boolean;
  isHackathonCompleted: () => boolean;
  showCompletionModal: () => void;
  continueGame: () => void;
  startGame: () => Promise<void>;
  showWalkthroughVideo: () => void;
}

const Level2Game: React.FC<Level2GameProps> = ({
  gameState,
  setGameState,
  hasSavedProgress,
  isHackathonCompleted,
  showCompletionModal,
  continueGame,
  startGame,
  showWalkthroughVideo,
}) => {
  // Render current Level 2 question and handle solution selection
  const currentQuestion = gameState.questions[gameState.currentQuestion];

  const handleSelectSolution = (solution: string) => {
    setGameState(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestion] = {
        ...newAnswers[prev.currentQuestion],
        solution,
      };
      return { ...prev, answers: newAnswers };
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (gameState.currentQuestion < gameState.questions.length - 1) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else if (isHackathonCompleted()) {
      showCompletionModal();
    }
  };
  const handlePrev = () => {
    if (gameState.currentQuestion > 0) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center relative">
      {/* Header and info */}
      <div className="pixel-border-thick bg-gradient-to-r from-purple-600 to-purple-700 p-4 max-w-xl w-full text-center relative z-10 mb-4">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-purple-500 pixel-border flex items-center justify-center">
            <span role="img" aria-label="trophy" className="text-purple-900 text-3xl">🏆</span>
          </div>
        </div>
        <h1 className="text-xl font-black text-purple-100 mb-3 pixel-text">GMP SOLUTION ROUND</h1>
        <p className="text-purple-100 mb-4 text-sm font-bold">Select the best solutions for each GMP case scenario</p>
        <button
          onClick={showWalkthroughVideo}
          className="pixel-border bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm flex items-center gap-2 mt-2"
        >
          <span role="img" aria-label="play" className="text-white text-lg">▶️</span>
          WALKTHROUGH VIDEO
        </button>
      </div>

      {/* Main question card */}
      {currentQuestion && (
        <Level2SolutionCard
          question={currentQuestion}
          onSelectSolution={handleSelectSolution}
          selectedSolution={gameState.answers[gameState.currentQuestion]?.solution}
        />
      )}

      {/* Navigation buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={gameState.currentQuestion === 0}
          className={`pixel-border py-2 px-4 font-bold text-sm ${gameState.currentQuestion === 0 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'}`}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className={`pixel-border py-2 px-4 font-bold text-sm ${gameState.currentQuestion === gameState.questions.length - 1 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500'}`}
        >
          {gameState.currentQuestion === gameState.questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Level2Game;
