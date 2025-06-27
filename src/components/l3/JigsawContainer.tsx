
import React from 'react';
import { useDrop } from 'react-dnd';
import { Target, CheckCircle, Puzzle } from 'lucide-react';

interface PuzzlePiece {
  id: string;
  text: string;
  category: 'violation' | 'action';
  isCorrect: boolean;
}

interface JigsawContainerProps {
  type: 'violations' | 'actions';
  title: string;
  pieces: PuzzlePiece[];
  maxPieces: number;
  onDrop: (containerType: 'violations' | 'actions', piece: PuzzlePiece) => { success: boolean };
}

export const JigsawContainer: React.FC<JigsawContainerProps> = ({ 
  type, 
  title, 
  pieces, 
  maxPieces, 
  onDrop 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'puzzle-piece',
    drop: (item: PuzzlePiece) => {
      const result = onDrop(type, item);
      return result;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  const isComplete = pieces.length === maxPieces;
  const containerColor = type === 'violations' ? 'border-red-400' : 'border-cyan-400';
  const gradientColor = type === 'violations' ? 'from-red-900 to-pink-900' : 'from-blue-900 to-cyan-900';

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 border-2 ${containerColor} glow-border`}>
      <div className="flex items-center gap-2 mb-4">
        {isComplete ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <Puzzle className="w-6 h-6 text-cyan-400" />
        )}
        <h3 className="text-sm font-bold text-white game-font">{title}</h3>
        <span className="text-sm text-gray-400">({pieces.length}/{maxPieces})</span>
      </div>
      
      <div
        ref={drop}
        className={`
          min-h-48 border-2 border-dashed rounded-lg p-6 transition-all duration-300 relative overflow-hidden
          ${isComplete ? 'border-green-500 bg-green-900/30' : 'border-gray-500 bg-gray-800/50'}
          ${isActive ? 'border-cyan-400 bg-cyan-900/30 scale-105 glow-border-cyan' : ''}
        `}
        style={{
          clipPath: 'polygon(0% 10%, 5% 10%, 10% 0%, 15% 0%, 20% 10%, 25% 10%, 30% 5%, 35% 5%, 40% 10%, 60% 10%, 65% 5%, 70% 5%, 75% 10%, 80% 10%, 85% 0%, 90% 0%, 95% 10%, 100% 10%, 100% 90%, 95% 90%, 90% 100%, 85% 100%, 80% 90%, 75% 90%, 70% 95%, 65% 95%, 60% 90%, 40% 90%, 35% 95%, 30% 95%, 25% 90%, 20% 90%, 15% 100%, 10% 100%, 5% 90%, 0% 90%)',
        }}
      >
        {/* Animated background effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-20 animate-pulse`}></div>
        
        {pieces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
            {pieces.map((piece, index) => (
              <div 
                key={piece.id}
                className="puzzle-piece-placed bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg font-bold text-center shadow-2xl border-2 border-green-400 game-font relative transform hover:scale-105 transition-all duration-300"
                style={{
                  clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
                }}
              >
                <div className="absolute top-1 right-1">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                </div>
                <div className="text-sm">{piece.text}</div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-lg"></div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: maxPieces - pieces.length }, (_, index) => (
              <div 
                key={`empty-${index}`}
                className="border-2 border-dashed border-gray-600 rounded-lg p-3 min-h-16 flex items-center justify-center text-gray-500 text-sm relative"
                style={{
                  clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
                }}
              >
                <Target className="w-6 h-6 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12 relative z-10">
            <Puzzle className="w-16 h-16 mx-auto animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
