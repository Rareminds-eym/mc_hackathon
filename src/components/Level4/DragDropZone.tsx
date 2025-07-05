import React, { useState } from 'react';
import { Case } from '../types';

interface DragDropZoneProps {
  case: Case;
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number) => void;
  showFeedback: boolean;
  disabled: boolean;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({
  case: currentCase,
  selectedAnswer,
  onAnswerSelect,
  disabled
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const onDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (draggedIdx !== null) {
      onAnswerSelect(draggedIdx);
      setDraggedIdx(null);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto text-[8px] sm:text-[9px] md:text-xs min-h-0 flex flex-col flex-nowrap p-0.5 sm:p-1 lg:px-4 lg:py-2 xl:px-6 xl:py-3 lg:text-base xl:text-lg" style={{ minHeight: '0', minWidth: 0, width: '100%' }}>
      {/* <h3 className="text-[10px] sm:text-xs  font-bold mb-0.5 sm:mb-1 lg:text-lg xl:text-xl">Step 2: Root Cause Analysis</h3> */}
      {/* <p className="mb-0.5 sm:mb-1 text-[8px] sm:text-xs lg:text-base xl:text-lg">{currentCase.questions.rootCause.question}</p> */}
      <div className="flex flex-row gap-0.5 sm:gap-1 min-h-0 w-full items-start flex-wrap lg:flex-col lg:items-stretch" style={{ minHeight: '0', minWidth: 0, width: '100%' }}>
        <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 min-h-0" style={{ minHeight: '0', minWidth: 0, width: '100%' }}>
          {currentCase.questions.rootCause.options.map((option, idx) => (
            <div
              key={idx}
              className={`flex items-center p-0.5 sm:p-1 lg:px-4 lg:py-2 xl:px-6 xl:py-3 rounded-lg border cursor-move bg-white/30 shadow-sm text-[7px] sm:text-[10px] lg:text-base xl:text-lg  ${selectedAnswer === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ minWidth: 0, width: '100%' }}
              draggable={!disabled}
              onDragStart={() => onDragStart(idx)}
            >
              <span className="font-bold mr-1 lg:text-base xl:text-lg">{String.fromCharCode(65 + idx)}</span>
              <span className="truncate max-w-full lg:text-base xl:text-lg">{option}</span>
            </div>
          ))}
          {/* Drop zone below options on desktop */}
          <div
            className="hidden lg:flex flex-shrink-0 mt-2 p-2 border-2 border-dashed rounded-lg text-center transition-colors duration-200 text-xs lg:text-base xl:text-lg flex-col justify-end items-center min-h-[60px] lg:w-[140px] xl:w-[180px] bg-white/30 mx-auto"
            style={{ minWidth: 0, width: '80%', maxWidth: '220px' }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {selectedAnswer === null ? (
              <span className="w-full">Drop root cause here.</span>
            ) : (
              <span className="w-full ">Selected: {currentCase.questions.rootCause.options[selectedAnswer]}</span>
            )}
          </div>
        </div>
        {/* Drop zone to the right for mobile/tablet */}
        <div
          className="flex-shrink-0 ml-0.5 sm:ml-1 p-1 sm:p-2 border-2 border-dashed rounded-lg text-center transition-colors duration-200 text-[8px] sm:text-xs mt-0.5 sm:mt-1 align-top lg:hidden flex flex-col justify-end items-center min-h-[60px] bg-white/30"
          style={{ minWidth: 0, width: '80px', maxWidth: '30vw' }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {selectedAnswer === null ? (
            <span className="w-full">Drop root cause here.</span>
          ) : (
            <span className="w-full ">Selected: {currentCase.questions.rootCause.options[selectedAnswer]}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;
export { DragDropZone };
