import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Sparkles, Zap, Shield, Target, Star } from 'lucide-react';

interface PuzzlePiece {
  id: string;
  text: string;
  category: 'violation' | 'action';
  isCorrect: boolean;
}

interface DraggablePieceProps {
  piece: PuzzlePiece;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece }) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'puzzle-piece',
    item: piece,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  // Use a consistent Arsenal color for all pieces, including hover
  const arsenalGradient = 'from-blue-500 via-cyan-500 to-teal-500';
  const arsenalBorder = 'border-cyan-400';

  return (
    <div
      ref={drag}
      className={`
        group relative cursor-grab active:cursor-grabbing
        bg-gradient-to-br ${arsenalGradient} text-white p-4 font-bold text-center 
        shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl 
        border-2 ${arsenalBorder} transform hover:rotate-1 game-font overflow-hidden
        ${isDragging ? 'opacity-50 scale-95 rotate-6' : 'opacity-100'}
      `}
      style={{
        minHeight: '80px',
        filter: isDragging ? 'brightness(0.8)' : 'brightness(1)',
        // JIGSAW PIECE SHAPE
        clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
        borderRadius: '8px'
      }}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse opacity-50" />
      
      {/* Category Icon */}
      <div className="absolute top-2 left-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-cyan-600/80 border border-white/30`}>
          <Target className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Sparkle Effect */}
      <div className="absolute top-2 right-2">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse group-hover:animate-spin" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pointer-events-none pt-2">
        <div className="text-sm leading-tight">{piece.text}</div>
      </div>

      {/* Power Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 ${piece.isCorrect ? 'text-yellow-400 fill-current' : 'text-gray-400'} animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Hover Glow Effect - Arsenal color only */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-400/20 shadow-lg shadow-cyan-500/25" 
        style={{
          clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
          borderRadius: '8px'
        }} />

      {/* Drag State Overlay */}
      {isDragging && (
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center"
          style={{
            clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
            borderRadius: '8px'
          }}
        >
          <Zap className="w-6 h-6 text-yellow-400 animate-bounce" />
        </div>
      )}

      {/* Jigsaw Piece Connectors (Visual Enhancement) */}
      <div className="absolute top-0 left-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
      <div className="absolute top-0 right-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
      <div className="absolute bottom-0 left-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
      <div className="absolute bottom-0 right-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
    </div>
  );
};