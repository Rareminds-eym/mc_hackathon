import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Sparkles, Zap, Target } from 'lucide-react';
import { useDeviceLayout } from '../../hooks/useOrientation';

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
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'puzzle-piece',
    item: piece,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Always suppress the default drag preview so only CustomDragLayer is visible
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const arsenalGradient = 'from-blue-500 via-cyan-500 to-teal-500';
  const arsenalBorder = 'border-cyan-400';
  const { isMobile: mobile } = useDeviceLayout();
  // console.log('Device Layout:', { isMobile, isHorizontal });
  return (
    <div
      ref={drag}
      className={`
        group relative cursor-grab active:cursor-grabbing select-none
        bg-gradient-to-br ${arsenalGradient} text-white p-4 font-bold text-center 
        shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl 
        border-2 ${arsenalBorder} transform hover:rotate-1 game-font overflow-hidden
        ${isDragging ? 'opacity-50 scale-95 rotate-6' : 'opacity-100'}
        ${mobile ? ' arsenal-piece-mobile-horizontal' : ''}
      `}
      style={{
        minHeight: mobile ? '58px' : '80px',
        height: mobile ? '58px' : undefined,
        maxWidth: mobile ? '220px' : '260px', // Added max width for puzzle piece
        filter: isDragging ? 'brightness(0.8)' : 'brightness(1)',
        // JIGSAW PIECE SHAPE
        clipPath: 'polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)',
        borderRadius: '8px'
      }}
    >
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse opacity-50" />
      
      {/* Category Icon */}
      <div className="absolute top-2 left-2 opacity-20">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-cyan-600/80 border border-white/30`}>
          <Target className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Sparkle Effect */}
      <div className="absolute top-2 right-2">
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse group-hover:animate-spin" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pointer-events-none h-full flex items-center justify-center">
        <div className="text-sm leading-tight">{piece.text}</div>
      </div>

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

/* Arsenal Mobile Horizontal Styles */
// Add this class to your global CSS or tailwind config if not present:
// .arsenal-piece-mobile-horizontal { min-height: 38px !important; height: 38px !important; padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; font-size: 0.95rem !important; }