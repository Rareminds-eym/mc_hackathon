import React, { useEffect, useState } from 'react';

interface TimerProps {
  initialSeconds?: number;
  isMobileHorizontal?: boolean;
  stopped?: boolean;
}


const THREE_HOURS = 3 * 60 * 60; // 10800 seconds

const Timer: React.FC<TimerProps> = ({ initialSeconds = THREE_HOURS, isMobileHorizontal, stopped = false }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0 || stopped) return;
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, stopped]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div
      className={`font-bold flex items-center justify-center ${isMobileHorizontal ? 'px-2 py-0.5 text-xs' : 'px-4 py-1 text-lg'} animate-pulse`}
      style={{ minWidth: isMobileHorizontal ? 80 : 110 }}
      title="Time Remaining"
    >
      <svg className={isMobileHorizontal ? 'w-3 h-3 mr-1' : 'w-5 h-5 mr-2'} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
      {pad(hrs)}:{pad(mins)}:{pad(secs)}
    </div>
  );
};

export default Timer;
