import React, { useRef, useEffect } from 'react';

interface BingoCell {
  id: number;
  term: string;
  definition: string;
  selected: boolean;
}

interface BingoGridProps {
  cells: BingoCell[];
  completedLines: number[][];
  gameComplete: boolean;
  onCellClick: (id: number) => void;
  isInCompletedLine: (cellId: number) => boolean;
}

const BingoGrid: React.FC<BingoGridProps> = ({ 
  cells, 
  completedLines,
  gameComplete, 
  onCellClick, 
  isInCompletedLine 
}) => {
  // Ref to track previous completed lines
  const prevCompletedLinesRef = useRef<number>(0);

  useEffect(() => {
    // Play Bingo sound if a new line (horizontal, vertical, or diagonal) is completed
    if (completedLines && completedLines.length > prevCompletedLinesRef.current) {
      const bingoAudio = new Audio('/Bingo.mp3');
      bingoAudio.volume = 0.5;
      bingoAudio.play().catch(() => {});
    }
    prevCompletedLinesRef.current = completedLines ? completedLines.length : 0;
  }, [completedLines]);

  // Helper for cell button classes
  const getCellClasses = (cell: BingoCell) => {
    const inCompletedLine = isInCompletedLine(cell.id);
    
    // Base classes
    let classes = [
      'aspect-[1.2/1]', // aspect ratio
      'min-w-[90px]',   // min width
      'flex',
      'items-center',
      'justify-center',
      'p-0',
      'font-semibold',
      'text-base',
      'transition-all',
      'duration-200',
      'ease-[cubic-bezier(.4,2,.6,1)]',
      'border-[0.5px]',
      'border-black',
      'bg-white',
      'text-gray-800',
      'box-border',
    ];

    // Corner radius
    if (cell.id === 0) classes.push('rounded-tl-lg');
    if (cell.id === 4) classes.push('rounded-tr-lg');
    if (cell.id === 20) classes.push('rounded-bl-lg');
    if (cell.id === 24) classes.push('rounded-br-lg');

    // Selected state
    if (cell.selected) {
      if (inCompletedLine) {
        classes = classes.filter(c => !c.includes('bg-') && !c.includes('text-') && !c.includes('border-'));
        classes.push(
          'bg-gradient-to-br',
          'from-yellow-400',
          'to-yellow-500',
          'text-white',
          'border-[0.5px]',
          'border-black',
          'shadow-[0_4px_16px_rgba(251,191,36,0.3)]',
        );
      } else {
        classes = classes.filter(c => !c.includes('bg-') && !c.includes('text-') && !c.includes('border-'));
        classes.push(
          'bg-white',
          'text-green-800',
          'border-2',
          'border-emerald-300',
          'shadow-[0_4px_16px_rgba(16,185,129,0.2)]'
        );
      }
    }

    // Special styling for cell 24
    if (cell.id === 24) {
      classes.push('border-2 border-emerald-400 shadow-[0_0_0_2px_#4ade80]');
    }

    // Disabled state
    if (gameComplete || cell.selected) {
      classes.push('cursor-not-allowed');
    } else {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  };

  // Hover effect classes
  const hoverClasses = (cell: BingoCell) => {
    if (cell.selected || gameComplete) return '';
    return 'hover:shadow-[0_8px_24px_0_rgba(37,99,235,0.25)] hover:text-blue-600 hover:border-2 hover:border-blue-600 hover:-translate-y-1 hover:scale-[1.05]';
  };

  return (
    <div className="rounded-[8rem] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-2 transition-[box-shadow,transform] duration-300">
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .bingo-grid-container {
            padding: 0.2rem !important;
            border-radius: 3rem !important;
          }
          .bingo-grid-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
          .bingo-grid-cell {
            min-width: 60px !important;
            font-size: 0.9rem !important;
          }
          .bingo-grid-cell-text {
            font-size: 0.72rem !important;
          }
        }
        @media (max-width: 600px) {
          .bingo-grid-container {
            padding: 0.1rem !important;
            border-radius: 1.2rem !important;
          }
          .bingo-grid-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 0.5px !important;
          }
          .bingo-grid-cell {
            min-width: 38px !important;
            font-size: 0.7rem !important;
            aspect-ratio: 1 / 1 !important;
          }
          .bingo-grid-cell-text {
            font-size: 0.62rem !important;
          }
        }
        @media (max-width: 400px) {
          .bingo-grid-cell {
            min-width: 28px !important;
            font-size: 0.6rem !important;
          }
          .bingo-grid-cell-text {
            font-size: 0.5rem !important;
          }
        }
      `}</style>

      <div 
        className="bingo-grid-grid grid grid-cols-5 gap-px border border-black bg-black rounded-lg shadow-[0_0_32px_8px_rgba(255,255,255,0.5),0_0_32px_16px_rgba(255,255,255,0.25)]"
      >
        {cells.map((cell) => (
          <button
            key={cell.id}
            className={`bingo-grid-cell ${getCellClasses(cell)} ${hoverClasses(cell)}`}
            onClick={() => onCellClick(cell.id)}
            disabled={gameComplete || cell.selected}
            title={cell.definition}
          >
            <span className="bingo-grid-cell-text text-center leading-tight text-[14px] w-full break-words">
              {cell.term}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BingoGrid;