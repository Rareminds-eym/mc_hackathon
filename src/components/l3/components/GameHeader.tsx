import React from "react";
import { 
  ArrowLeftCircle, 
  Menu, 
  X 
} from "lucide-react";
import { PlacedPiecesState } from "../types/gameTypes";
import { GameMenu } from "./GameMenu";

interface GameHeaderProps {
  isComplete: boolean;
  placedPieces: PlacedPiecesState;
  correctViolations: any[];
  correctActions: any[];
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  displayName: string;
  score: number;
  health: number;
  combo: number;
  setShowScenario: (show: boolean) => void;
  isMobile: boolean;
  isHorizontal: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  isComplete,
  placedPieces,
  correctViolations,
  correctActions,
  isMenuOpen,
  setIsMenuOpen,
  displayName,
  score,
  health,
  combo,
  setShowScenario,
  isMobile,
  isHorizontal
}) => {
  return (
    <header className="relative w-full flex flex-row items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-900/90 to-blue-900/90 rounded-xl border border-cyan-500/50 shadow-lg backdrop-blur-sm z-50">
      {/* Left: Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-800 transition-all duration-200 shadow border border-cyan-400/50 flex items-center justify-center focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeftCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Mission Title & Progress */}
      <div className="flex flex-col items-center flex-1 px-4">
        <h1 className="text-xl font-extrabold text-white game-font tracking-wide mb-1 flex items-center gap-2">
          <span className="text-white">LEVEL 3: FIX THE VIOLATION</span>
        </h1>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden border border-cyan-400/50">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500"
            style={{
              width: isComplete
                ? "100%"
                : `${Math.min(
                    100,
                    ((placedPieces.violations.length +
                      placedPieces.actions.length) /
                      (correctViolations.length +
                        correctActions.length)) *
                      100
                  )}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Right: Menu Button */}
      <div className="relative z-[900]">
        <button
          onClick={() => {
            const newMenuState = !isMenuOpen;
            console.log("Menu button clicked, isMenuOpen:", isMenuOpen, "-> new state:", newMenuState);
            setIsMenuOpen(newMenuState);
          }}
          className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow border border-cyan-300/50 flex items-center justify-center focus:outline-none"
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        
        {/* Menu Dropdown */}
        <GameMenu 
          displayName={displayName}
          score={score}
          health={health}
          combo={combo}
          isMobile={isMobile}
          isHorizontal={isHorizontal}
          isMenuOpen={isMenuOpen}
          setShowScenario={setShowScenario}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>
    </header>
  );
};
