import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Sparkles } from 'lucide-react';

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

  // Use a single color for all pieces in ARSENAL
  const categoryGradient = 'from-blue-500 via-cyan-500 to-teal-500';
  const categoryBorder = 'border-cyan-400';

  return (
    <div
      ref={drag}
      className={`
        puzzle-piece cursor-grab active:cursor-grabbing relative
        bg-gradient-to-r ${categoryGradient} text-white p-4 rounded-lg
        font-bold text-center shadow-2xl transition-all duration-300
        hover:scale-110 hover:shadow-cyan-500/25 border-2 ${categoryBorder}
        transform hover:rotate-1 game-font
        ${isDragging ? 'opacity-50 scale-95 rotate-12' : 'opacity-100'}
      `}
      style={{
        clipPath: 'polygon(0% 20%, 10% 20%, 15% 0%, 25% 0%, 30% 20%, 70% 20%, 75% 0%, 85% 0%, 90% 20%, 100% 20%, 100% 80%, 90% 80%, 85% 100%, 75% 100%, 70% 80%, 30% 80%, 25% 100%, 15% 100%, 10% 80%, 0% 80%)',
        filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))'
      }}
    >
      <div className="absolute top-1 right-1">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
      </div>
      <div className="relative z-10 pointer-events-none">
        {piece.text}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-lg"></div>
    </div>
  );
};
