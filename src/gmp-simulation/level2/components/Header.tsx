import { FileText } from 'lucide-react';
import React from 'react';
import { HeaderProps } from '../types';
import Level2Timer from '../../Level2Timer';
import { useEffect, useState } from 'react';
import { getLevel2TimerState } from '../level2ProgressHelpers';
import { supabase } from '../../../lib/supabase';


interface HeaderWithTitleProps extends HeaderProps {
  titleText?: string;
  onProceed?: () => void;
  canProceed?: boolean;
  autoSave?: boolean;
  onSaveTimer?: (time: number) => void;
}

const Header: React.FC<HeaderWithTitleProps> = ({ 
  currentStageData, 
  isMobileHorizontal, 
  selectedCase, 
  onShowBrief, 
  progress, 
  timerStopped = false, 
  savedTimer = null, // will be ignored, replaced by DB fetch
  onTimerTick,
  onTimerTimeUp,
  titleText,
  onProceed,
  canProceed,
  autoSave = false,
  onSaveTimer
}) => {
  const [dbTimer, setDbTimer] = useState<number | null>(null);
  useEffect(() => {
    async function fetchTimer() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || !user.id) return;
      const timer = await getLevel2TimerState(user.id);
      if (typeof timer === 'number') {
        console.log('[Header] Timer value fetched from DB:', timer);
        setDbTimer(timer);
      }
    }
    fetchTimer();
  }, []);
  return (
    <div className={isMobileHorizontal ? 'mb-1' : 'mb-3'}>
        {/* <div 
          className={`pixel-border-thick bg-gradient-to-br ${currentStageData.bgColor} relative overflow-hidden ${isMobileHorizontal ? 'p-1.5' : 'p-6'}`}
          style={{
            background: `linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(37,99,235,0.15) 100%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
          }}
        > */}
          {/* <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div> */}
          {/* <div className="absolute inset-0 bg-scan-lines opacity-10"></div> */}
          
          {/* Animated Background Effects */}
          {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div> */}

          <div className={
            `flex items-center justify-between pixel-border bg-gradient-to-r from-gray-700 to-gray-600 px-2 py-1 mb-4`
          }>
            {/* Left: Icon and Title */}
            <div className={`flex items-center ${isMobileHorizontal ? 'space-x-0.5' : 'space-x-4'}`}>
              <div 
                className={`pixel-border-thick bg-gradient-to-br ${currentStageData.color} flex items-center justify-center ${isMobileHorizontal ? 'p-0.5' : 'p-4'} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <currentStageData.icon className={`${isMobileHorizontal ? 'w-4 h-4' : 'w-10 h-10'} text-white relative z-10 drop-shadow-lg`} />
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentStageData.color} blur-sm opacity-50 -z-10`}></div>
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-1 mb-0.5">
                  <h1 className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-2xl'} font-black text-white`} 
                      style={{ textShadow: isMobileHorizontal ? '1.5px 1.5px 0px rgba(0,0,0,0.7), 0 0 6px rgba(6,182,212,0.3)' : '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(6,182,212,0.3)' }}>
                    {titleText || 'INNOVATION QUEST'}
                  </h1>
                </div>
                {/* No stage number or review message for screens 1 and 2 */}
                {([1,2].includes(currentStageData.caseNumber)) ? null : (
                  <span className={"text-white text-xs font-bold bg-violet-600 px-3 py-1 rounded-lg"}>
                    {currentStageData && currentStageData.caseNumber ? `Stage : ${currentStageData.caseNumber}/10` : ''}
                  </span>
                )}
              </div>
            </div>
            {/* Right: Progress, Timer (red pill), and Brief */}
            <div className="flex items-center space-x-2">
            {/* Progress Bar + percent */}
            {/* <div className="hidden sm:flex items-center gap-1 mr-1">
              <div className="w-16 h-2 bg-gray-800 pixel-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${Math.round(progress ?? 0)}%` }}
                />
              </div>
              <span className="text-white text-xs font-black min-w-[2rem] pixel-text">
                {Math.round(progress ?? 0)}%
              </span>
              <div className="w-3 h-3 bg-yellow-600 pixel-border flex items-center justify-center">
                <svg className="w-2 h-2 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 17.75L18.2 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.44 4.73L5.8 21z" /></svg>
              </div>
            </div> */}
            {/* Red timer pill replicating top header style */}
            <div className={`flex items-center gap-1 pixel-border bg-gradient-to-r from-red-700 to-red-600 ${isMobileHorizontal ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
              <div className="w-3 h-3 bg-gray-800 pixel-border flex items-center justify-center">
                <svg className="w-2 h-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 2" /></svg>
              </div>
              <Level2Timer 
                initialTime={10800} // 3 hours initial time
                savedTime={dbTimer !== null ? dbTimer : undefined} // Use DB timer value
                isActive={!timerStopped}
                isMobileHorizontal={isMobileHorizontal}
                onTick={onTimerTick || (() => {})}
                onTimeUp={onTimerTimeUp || (() => {})}
                autoSave={autoSave}
                onSaveTimer={onSaveTimer}
              />
            </div>
            {/* Show Brief and Proceed buttons for screen 2 in both mobile and desktop modes */}
            {currentStageData.caseNumber === 2 && (
              <>
                {onShowBrief && (
                  <button
                    className={
                      `ml-2 flex items-center justify-center gap-1 pixel-border-thick bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 relative group ` +
                      (isMobileHorizontal
                        ? 'px-1.5 py-0.5 text-[10px] min-h-0 h-6'
                        : 'px-3 py-1.5 text-xs')
                    }
                    onClick={onShowBrief}
                    title="Show case question"
                    style={isMobileHorizontal
                      ? { minWidth: 0, minHeight: 0, height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                      : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                    <span className="flex items-center justify-center">
                      <FileText className={isMobileHorizontal ? 'w-3 h-3 text-cyan-200 drop-shadow-sm' : 'w-4 h-4 text-cyan-200 drop-shadow-sm'} />
                    </span>
                    <span className={`pixel-text tracking-wider text-cyan-100 drop-shadow flex items-center ${isMobileHorizontal ? 'text-[10px]' : 'text-sm'}`}>Brief</span>
                  </button>
                )}
                {onProceed && canProceed && (
                  <button
                    className={
                      `ml-2 flex items-center justify-center gap-1 pixel-border-thick bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 relative group ` +
                      (isMobileHorizontal
                        ? 'px-1.5 py-0.5 text-[10px] min-h-0 h-6'
                        : 'px-3 py-1.5 text-xs')
                    }
                    onClick={onProceed}
                    title="Proceed"
                    style={isMobileHorizontal
                      ? { minWidth: 0, minHeight: 0, height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }
                      : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span className={`pixel-text tracking-wider text-green-100 drop-shadow flex items-center ${isMobileHorizontal ? 'text-[10px]' : 'text-sm'}`}>Proceed</span>
                  </button>
                )}
              </>
            )}
            {/* Original Brief button for other screens or desktop, but NOT for screen 2 (handled above) */}
            {selectedCase && onShowBrief && currentStageData.caseNumber !== 2 && (
              <button
                className={
                  `ml-2 flex items-center justify-center gap-1 pixel-border-thick bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 relative group ` +
                  (isMobileHorizontal
                    ? 'px-1.5 py-0.5 text-[10px] min-h-0 h-6'
                    : 'px-3 py-1.5 text-xs')
                }
                onClick={onShowBrief}
                title="Show previously selected question"
                style={isMobileHorizontal ? { minWidth: 0, minHeight: 0, height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' } : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                <span className="flex items-center justify-center">
                  <FileText className={isMobileHorizontal ? 'w-3 h-3 text-cyan-200 drop-shadow-sm' : 'w-4 h-4 text-cyan-200 drop-shadow-sm'} />
                </span>
                <span className={`pixel-text tracking-wider text-cyan-100 drop-shadow flex items-center ${isMobileHorizontal ? 'text-[10px]' : 'text-sm'}`}>Brief</span>
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

export default Header;
