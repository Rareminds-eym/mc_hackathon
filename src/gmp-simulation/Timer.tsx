import React, { useEffect, useRef } from 'react';

interface TimerProps {
  timeRemaining: number;
  onTimeUp: () => void;
  setTimeRemaining: (timeOrUpdater: number | ((prev: number) => number)) => void;
  initialTime: number;
  isActive?: boolean; // Add optional prop to control if timer should run
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, onTimeUp, setTimeRemaining, initialTime, isActive = true }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isActive) {
      return;
    }

    const tick = () => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;

        if (newTime <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    };

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onTimeUp, setTimeRemaining, isActive]);

  // Validate timeRemaining to prevent NaN display
  const validTimeRemaining = isNaN(timeRemaining) || timeRemaining < 0 ? 0 : timeRemaining;

  const minutes = Math.floor(validTimeRemaining / 60);
  const seconds = validTimeRemaining % 60;
  const percentage = (validTimeRemaining / initialTime) * 100;

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