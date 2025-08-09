import React from 'react';
import { CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface ModuleCompleteModalProps {
  level1CompletionTime: number;
  onProceed: () => void;
}

export const ModuleCompleteModal: React.FC<ModuleCompleteModalProps> = ({
  level1CompletionTime,
  onProceed
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 lg:p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 lg:w-20 lg:h-20 text-green-500" />
        </div>
        
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
          Level 1 Complete!
        </h2>
        
        <p className="text-gray-600 mb-6 text-sm lg:text-base">
          Excellent work identifying violations and root causes for all 5 cases! 
          Now let's move to Level 2 where you'll select the best solutions.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Time Taken</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(level1CompletionTime)}
          </div>
        </div>
        
        <button
          onClick={onProceed}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <span>Proceed to Level 2</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};