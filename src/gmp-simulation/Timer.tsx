import React, { useEffect } from 'react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  setTimeRemaining: (time: number) => void;
  initialTime: number;
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

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / initialTime) * 100;

  const getTextColor = () => {
    if (percentage > 25) return 'text-white';
    return 'text-red-400';
  };

  return (
    <div className={`text-xs font-mono ${getTextColor()}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};