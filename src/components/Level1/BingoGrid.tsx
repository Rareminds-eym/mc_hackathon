import React, { useRef, useEffect } from 'react';
import { useDeviceLayout } from '../../hooks/useOrientation'; // Adjust the import path as needed

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
  disabled?: boolean; // <-- Add disabled prop
  tutorialStep?: number;
}

const BingoGrid: React.FC<BingoGridProps> = ({ 
  cells, 
  completedLines,
  gameComplete, 
  onCellClick, 
  isInCompletedLine,
  disabled = false, // <-- Default to false
  tutorialStep
}) => {
  const { isHorizontal, isMobile } = useDeviceLayout();
  const prevCompletedLinesRef = useRef<number>(0);

  useEffect(() => {
    if (completedLines && completedLines.length > prevCompletedLinesRef.current) {
      const bingoAudio = new Audio('/Bingo.mp3');
      bingoAudio.volume = 0.5;
      bingoAudio.play().catch(() => {});
    }
    prevCompletedLinesRef.current = completedLines ? completedLines.length : 0;
  }, [completedLines]);

  // Helper for cell button classes - now includes landscape-specific classes
  const getCellClasses = (cell: BingoCell) => {
    const inCompletedLine = isInCompletedLine(cell.id);

    let classes = [
      'flex',
      'items-center',
      'justify-center',
      'p-0',
      'font-semibold',
      'transition-all',
      'duration-200',
      'ease-[cubic-bezier(.4,2,.6,1)]',
      'border-[0.5px]',
      'border-black',
      'bg-white',
      'text-gray-800',
      'box-border',
      'text-small'
    ];

    // Only use horizontal mode for mobile devices in landscape
    if (isMobile && isHorizontal) {
      classes.push(
        'min-w-[40px]',
        'text-[0.5rem]',
        'aspect-[1.2/0.64]', 
      );
    } else {
      classes.push(
        'aspect-[2.2/1.8]',
        'min-w-[20px]',
        'text-small', 
        'text-[0.6rem]',
      );
    }

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
      // Always re-apply the correct text size class for selected cells
      if (isMobile && isHorizontal) {
        classes.push('text-[0.65rem]');
      } else {
        classes.push('text-[0.6rem]');
      }
    }

    if (cell.id === 24) {
      classes.push('border-2 border-emerald-400 shadow-[0_0_0_2px_#4ade80]');
    }

    if (gameComplete || cell.selected) {
      classes.push('cursor-not-allowed');
    } else {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  };

  // Hover/touch effect classes
  const hoverClasses = (cell: BingoCell) => {
    if (cell.selected || gameComplete) return '';
    // Use both hover and active for seamless pop-out on touch devices
    return `
      hover:shadow-[0_8px_24px_0_rgba(37,99,235,0.25)]
      hover:text-blue-600
      hover:border-2
      hover:border-blue-600
      hover:-translate-y-1
      hover:scale-[1.05]
      active:shadow-[0_8px_24px_0_rgba(37,99,235,0.25)]
      active:text-blue-600
      active:border-2
      active:border-blue-600
      active:-translate-y-1
      active:scale-[1.05]
      transition-all duration-150
    `;
  };

  // Container classes based on orientation
  const containerClasses = `rounded-[8rem] shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-2 transition-[box-shadow,transform] duration-300 ${
    isHorizontal ? 'p-1 rounded-[3rem]' : ''
  } ${tutorialStep === 3 ? 'tutorial-highlight' : ''}`;

  // Grid classes based on orientation
  const gridClasses = `bingo-grid-grid grid grid-cols-5 gap-px border border-black bg-black rounded-lg shadow-[0_0_32px_8px_rgba(255,255,255,0.5),0_0_32px_16px_rgba(255,255,255,0.25)] ${
    isHorizontal ? 'gap-0.5' : ''
  }`;

  return (
    <div className={containerClasses} data-tutorial-highlight="bingogrid">
      <div className={gridClasses}>
        {cells.map((cell) => (
          <button
            key={cell.id}
            className={`${getCellClasses(cell)} ${hoverClasses(cell)}`}
            onClick={() => onCellClick(cell.id)}
            disabled={gameComplete || cell.selected || disabled} // <-- Disable if prop is true
            title={cell.definition}
          >
            <span className="text-center leading-tight w-full break-words">
              {cell.term}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BingoGrid;