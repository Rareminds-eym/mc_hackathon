import React from "react";
import { DragOverlay } from "@dnd-kit/core";
import type { PuzzlePiece } from "../../../data/level3Scenarios";

interface DragPieceOverlayProps {
  activeDragPiece: PuzzlePiece | null;
  isMobile: boolean;
}

export const DragPieceOverlay: React.FC<DragPieceOverlayProps> = ({ 
  activeDragPiece, 
  isMobile 
}) => {
  if (!activeDragPiece) return null;
  
  return (
    <DragOverlay 
      adjustScale={false}
      zIndex={9999} 
      dropAnimation={{
        duration: 300,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}
    >
      <div
        className={`pointer-events-none opacity-95 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white p-4 font-bold text-center shadow-2xl border-2 border-cyan-400 game-font flex items-center justify-center select-none overflow-hidden${
          isMobile ? " arsenal-piece-mobile-horizontal" : ""
        }`}
      style={{
        minHeight: isMobile ? "58px" : "80px",
        height: isMobile ? "58px" : undefined,
        maxWidth: isMobile ? "220px" : "260px",
        width: isMobile ? "max-content" : "max-content",
        filter:
          "brightness(0.95) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))",
        clipPath:
          "polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)",
        borderRadius: "8px",
        fontSize: isMobile ? "0.95rem" : "1rem",
        paddingTop: isMobile ? "0.25rem" : "1rem",
        paddingBottom: isMobile ? "0.25rem" : "1rem",
        touchAction: "none",
      }}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse opacity-50" />

      {/* Category Icon */}
      <div className="absolute top-2 left-2 opacity-20">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-cyan-600/80 border border-white/30">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
      </div>

      {/* Sparkle Effect */}
      <div className="absolute top-2 right-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fde68a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 animate-pulse"
        >
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pointer-events-none h-full flex items-center justify-center">
        <div className="text-sm leading-tight">{activeDragPiece.text}</div>
      </div>

      {/* Jigsaw Piece Connectors */}
      <div className="absolute top-0 left-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
      <div className="absolute top-0 right-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
      <div className="absolute bottom-0 left-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
      <div className="absolute bottom-0 right-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
    </div>
    </DragOverlay>
  );
};
