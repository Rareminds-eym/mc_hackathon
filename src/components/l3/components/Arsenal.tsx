import React, { RefObject } from "react";
import { Zap } from "lucide-react";
import { DraggablePiece } from "../DraggablePiece";
import type { PuzzlePiece } from "../../../data/level3Scenarios";

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
  return (
    <div
      className={`flex flex-col my-auto items-center justify-center w-max relative z-20${
        isMobile && isHorizontal ? " arsenal-mobile-horizontal" : ""
      }`}
      style={{
        height: isMobile && isHorizontal ? "220px" : "300px",
        minHeight: isMobile && isHorizontal ? "220px" : "300px",
        maxHeight: "100%",
      }}
    >
      <div
        className={`relative flex flex-col h-full w-max p-2 rounded-2xl shadow-2xl border-2 border-cyan-400/80 arsenal-glass-container items-center justify-between${
          isMobile && isHorizontal
            ? " arsenal-glass-mobile-horizontal"
            : ""
        }`}
        style={{
          background: "rgba(20, 30, 60, 0.35)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 24px 4px #22d3ee55, 0 2px 16px 0 #0008",
          border: "2.5px solid #22d3ee",
          overflow: "hidden",
          width: "max-content",
          padding:
            isMobile && isHorizontal ? "0.5rem" : "0.5rem 1rem",
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 z-0">
          <Zap
            className={`w-24 h-24 text-cyan-300 animate-pulse-slow${
              isMobile && isHorizontal ? " w-14 h-14" : ""
            }`}
          />
        </div>

        {/* Arsenal Title */}
        <div
          className={`flex flex-row items-center justify-center gap-2 mb-2 relative z-10 w-full whitespace-nowrap${
            isMobile && isHorizontal ? " text-base" : ""
          }`}
        >
          <Zap
            className={`w-6 h-6 text-yellow-300 drop-shadow-glow animate-flicker flex-shrink-0${
              isMobile && isHorizontal ? " w-4 h-4" : ""
            }`}
          />
          <h3
            className={`text-lg font-extrabold text-cyan-100 game-font tracking-widest neon-text drop-shadow-glow animate-gradient-move text-center whitespace-nowrap${
              isMobile && isHorizontal ? " text-base" : ""
            }`}
            style={{
              letterSpacing: "0.12em",
              textShadow: "0 0 8px #22d3ee, 0 0 16px #fde68a",
            }}
          >
            ARSENAL
          </h3>
        </div>

        {/* Pieces List */}
        <div
          ref={arsenalRef}
          className={`space-y-1 overflow-y-auto flex-1 min-h-0 flex flex-col items-center custom-scrollbar relative z-10 w-full px-2 py-2${
            isMobile && isHorizontal ? " text-xs px-1 py-1" : ""
          }`}
        >
          {availablePieces.map((piece: PuzzlePiece) => (
            <DraggablePiece key={piece.id} piece={piece} />
          ))}
        </div>

        {/* Animated Glow Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-cyan-400/60 animate-glow-border"
          style={{ boxShadow: "0 0 32px 8px #22d3ee55" }}
        ></div>
      </div>
    </div>
  );
};
