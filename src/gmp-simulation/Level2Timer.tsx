import React, { useEffect, useRef, useState } from 'react';

interface Level2TimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTick?: (time: number) => void;
  savedTime?: number; // Allow resuming from a saved time
  autoSave?: boolean; // Whether to periodically save timer state
  onSaveTimer?: (time: number) => void; // Callback to save timer state
  isMobileHorizontal?: boolean; // For mobile responsive styling
}

const Level2Timer: React.FC<Level2TimerProps> = ({ 
  initialTime, 
  isActive, 
  onTimeUp, 
  onTick, 
  savedTime, 
  autoSave = false, 
  onSaveTimer,
  isMobileHorizontal = false
}) => {
  // Initialize with savedTime if available, otherwise use initialTime
  const getInitialTime = () => {
    if (typeof savedTime === 'number' && savedTime > 0) {
      console.log('[Level2Timer] Initializing with savedTime:', savedTime);
      return savedTime;
    }
    console.log('[Level2Timer] Initializing with initialTime:', initialTime);
    return initialTime;
  };
  
  const [timeRemaining, setTimeRemaining] = useState(getInitialTime());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(getInitialTime());

  // Initialize timer with saved time if available
  useEffect(() => {
    if (savedTime !== undefined) {
      console.log('[Level2Timer] Resuming from saved time:', savedTime);
      setTimeRemaining(savedTime);
      lastSavedTimeRef.current = savedTime;
    } else {
      console.log('[Level2Timer] Starting with initial time:', initialTime);
      setTimeRemaining(initialTime);
      lastSavedTimeRef.current = initialTime;
    }
  }, [savedTime, initialTime]);

  // Auto-save timer state periodically if enabled
  useEffect(() => {
    if (autoSave && onSaveTimer && isActive && timeRemaining > 0) {
      // Save every 30 seconds if time has changed by at least 30 seconds
      saveIntervalRef.current = setInterval(() => {
        const timeDifference = Math.abs(timeRemaining - lastSavedTimeRef.current);
        if (timeDifference >= 30 && timeRemaining > 0) {
          console.log('[Level2Timer] Auto-saving timer state:', timeRemaining, `(${timeDifference}s elapsed)`);
          onSaveTimer(timeRemaining);
          lastSavedTimeRef.current = timeRemaining;
        }
      }, 30000); // Check every 30 seconds
      
      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
          saveIntervalRef.current = null;
        }
      };
    }
  }, [autoSave, onSaveTimer, isActive, timeRemaining]);

  useEffect(() => {
    if (typeof onTick === 'function') {
      onTick(timeRemaining);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, onTimeUp]);

  // Save timer state when component unmounts to prevent data loss
  useEffect(() => {
    return () => {
      if (autoSave && onSaveTimer && timeRemaining > 0 && timeRemaining !== lastSavedTimeRef.current) {
        console.log('[Level2Timer] Final save on unmount:', timeRemaining);
        onSaveTimer(timeRemaining);
      }
    };
  }, [autoSave, onSaveTimer, timeRemaining]);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / initialTime) * 100;
  const getTextColor = () => {
    // Always use a strong white color for visibility
    return 'text-white';
  };

  // Blinking animation if 5 minutes or less left
  const isBlinking = timeRemaining <= 300;

  return (
    <div
      className={`text-xs font-mono ${getTextColor()}${isBlinking ? ' animate-blink-timer' : ''}`}
      style={isBlinking ? { animation: 'blink-timer 2s ease-in-out infinite', color: '#fff', textShadow: '0 0 8px #fff, 0 0 16px #fff' } : { color: '#fff', textShadow: '0 0 8px #fff, 0 0 16px #fff' }}
    >
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      <style>{`
        @keyframes blink-timer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-blink-timer {
          animation: blink-timer 2s ease-in-out infinite !important;
        }
      `}</style>
    </div>
  );
};

export default Level2Timer;
