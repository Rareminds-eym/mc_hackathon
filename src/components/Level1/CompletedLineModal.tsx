import React from 'react';

interface CompletedLineModalProps {
  isVisible: boolean;
  onClose: () => void;
  timer: number;
  rowsSolved: number;
  score: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CompletedLineModal: React.FC<CompletedLineModalProps> = ({ isVisible, onClose, timer, rowsSolved, score }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center animate-scale-in">
        <div className="flex flex-col items-center mb-4">
          <span className="text-3xl font-bold text-yellow-500 mb-2">Bingo!</span>
          <span className="text-lg font-semibold text-gray-700">You completed a line!</span>
        </div>
        <div className="flex flex-col gap-2 w-full mb-4">
          <div className="flex justify-between w-full">
            <span className="font-medium text-gray-600">Timer:</span>
            <span className="font-mono text-blue-600">{formatTime(timer)}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="font-medium text-gray-600">Rows Matched:</span>
            <span className="font-mono text-green-600">{rowsSolved}</span>
          </div>
          <div className="flex justify-between w-full">
            <span className="font-medium text-gray-600">Score:</span>
            <span className="font-mono text-purple-600">{score}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 rounded-xl bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CompletedLineModal;
