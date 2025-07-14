import React, { RefObject } from "react";
import { Zap, Play } from "lucide-react";
import { DraggablePiece } from "../DraggablePiece";
import type { PuzzlePiece } from "../../../data/level3Scenarios";
import '../../Level2/index.css';

interface ArsenalProps {
  availablePieces: PuzzlePiece[];
  arsenalRef: RefObject<HTMLDivElement>;
  isMobile: boolean;
  isHorizontal: boolean;
}

export const Arsenal: React.FC<ArsenalProps> = ({
  availablePieces,
  arsenalRef,
  isMobile,
  isHorizontal
}) => {
  // Pixel/retro card style for arsenal, inspired by HomePage.tsx
  return (
    <div
      className={`w-full max-w-md mx-auto relative z-10 h-full flex flex-col`}
      style={{ minHeight: isMobile ? 180 : 260 }}
    >
      <div className="pixel-border-thick bg-gray-800 p-4 relative overflow-hidden flex-1 flex flex-col">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-50"></div>
        <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500 opacity-10 pixel-corner"></div>

        {/* Arsenal Title */}
        <div className="flex items-center space-x-3 mb-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 pixel-border flex items-center justify-center">
            <Zap className="w-6 h-6 text-yellow-300 animate-flicker" />
          </div>
          <h3 className="text-lg font-black text-cyan-200 pixel-text tracking-wider">ARSENAL</h3>
        </div>

        {/* Pieces List */}
        <div
          ref={arsenalRef}
          className="space-y-2 overflow-y-auto flex-1 min-h-0 flex flex-col items-center custom-scrollbar relative z-10 w-full px-2 py-2"
          style={{ maxHeight: isMobile ? 180 : 260 }}
        >
          {availablePieces.length === 0 ? (
            <div className="text-gray-400 text-center text-sm py-8 opacity-70">No pieces left!</div>
          ) : (
            availablePieces.map((piece: PuzzlePiece) => (
              <DraggablePiece key={piece.id} piece={piece} />
            ))
          )}
        </div>

        {/* Start Mission Button (if empty, for style) */}
        {availablePieces.length === 0 && (
          <div className="mt-4 flex justify-center">
            <div className="pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 p-2">
              <div className="flex items-center justify-center text-white font-black text-sm pixel-text">
                <Play className="w-4 h-4 mr-2" />
                ALL PLACED!
              </div>
            </div>
          </div>
        )}

        {/* Scan Lines Effect */}
        <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>

        {/* Glow Effect on Hover (optional) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 hover:opacity-30 transition-opacity duration-300 pixel-glow"></div>
      </div>
    </div>
  );
};
