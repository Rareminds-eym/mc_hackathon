import React, { useEffect } from 'react';
import { Timer as TimerIcon, AlertTriangle } from 'lucide-react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  setTimeRemaining: (time: number) => void;
  initialTime: number; // new prop for initial time
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, onTimeUp, setTimeRemaining, initialTime }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
      if (timeRemaining <= 1) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onTimeUp, setTimeRemaining]);

  // Use initialTime for calculations
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / initialTime) * 100;

  const getTimerColor = () => {
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-1 lg:space-x-2 mb-2">
        {percentage <= 10 && <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 animate-pulse" />}
        <TimerIcon className={`w-4 h-4 lg:w-5 lg:h-5 ${getTimerColor()}`} />
      </div>
      <div className={`text-lg lg:text-2xl font-bold ${getTimerColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="text-xs lg:text-sm text-gray-600 mb-2">Time Left</div>
      <div className="w-16 lg:w-20 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};