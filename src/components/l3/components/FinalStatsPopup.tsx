// src/components/l3/components/FinalStatsPopup.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Crown } from 'lucide-react';
import { useLevel3Statistics, useLevel3Progress } from '../../../store/hooks';
import { useDeviceLayout } from '../../../hooks/useOrientation';
import useLevel3Service from '../hooks/useLevel3Service';

interface FinalStatsPopupProps {
  onClose: () => void;
  className?: string;
}

interface TopScore {
  best_score: number;
  best_time: number;
  placed_pieces?: any;
  scenario_index?: number;
}

/**
 * Final Stats Popup Component
 * Displays overall statistics when all scenarios are completed
 */
export const FinalStatsPopup: React.FC<FinalStatsPopupProps> = ({
  onClose,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isMobile, isHorizontal } = useDeviceLayout();
  const level3Service = useLevel3Service();
  const { getTopThreeBestScores } = level3Service;

  // Redux hooks
  const { overallStats, scenarioResults } = useLevel3Statistics();
  const { prepareGameCompletionData } = useLevel3Progress();

  // Local state for top scores
  const [topScores, setTopScores] = useState<TopScore[]>([]);
  const [loadingTopScores, setLoadingTopScores] = useState(true);

  const isMobileHorizontal = isMobile && isHorizontal;

  // Fetch top 3 best scores when component mounts
  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        setLoadingTopScores(true);
        
        // For now, use a default module ID - this should come from Redux state
        const moduleId = "1";
        
        if (getTopThreeBestScores) {
          const result = await getTopThreeBestScores(moduleId);
          setTopScores(result || []);
        } else {
          setTopScores([]);
        }
      } catch (error) {
        console.error('Error fetching top scores:', error);
        setTopScores([]);
      } finally {
        setLoadingTopScores(false);
      }
    };

    fetchTopScores();
  }, [getTopThreeBestScores]);

  const handleGoToModules = () => {
    navigate("/modules");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`pixel-border-thick bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-cyan-100 shadow-2xl relative overflow-hidden ${
        isMobileHorizontal
          ? "w-[98vw] max-w-[500px] p-2 max-h-[85vh] overflow-y-auto"
          : isMobile
          ? "w-[95vw] max-w-[380px] p-3 max-h-[90vh] overflow-y-auto"
          : "w-[600px] max-w-[90vw] p-6"
      } ${className}`}
      style={{ borderRadius: 0 }}
    >
      {/* Scan Lines Effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <div className={`relative z-10 text-center ${isMobile ? "mb-3" : "mb-6"}`}>
        <div className={`flex items-center justify-center gap-2 ${isMobile ? "mb-2" : "mb-3"}`}>
          <Crown className={`text-yellow-300 ${isMobile ? "w-5 h-5" : "w-8 h-8"}`} />
          <h2 className={`pixel-text font-black text-yellow-200 tracking-wider ${
            isMobile ? "text-lg" : "text-2xl"
          }`}>
            LEVEL COMPLETE!
          </h2>
          <Crown className={`text-yellow-300 ${isMobile ? "w-5 h-5" : "w-8 h-8"}`} />
        </div>
        <p className={`text-cyan-200 font-bold ${isMobile ? "text-sm" : ""}`}>
          All scenarios completed successfully!
        </p>
      </div>

      {/* Overall Stats */}
      <div className={`relative z-10 ${isMobile ? "mb-3" : "mb-6"}`}>
        <h3 className={`pixel-text font-bold text-yellow-200 text-center ${
          isMobile ? "text-base mb-2" : "text-lg mb-4"
        }`}>
          FINAL STATISTICS
        </h3>
        <div className={`grid ${isMobile ? "grid-cols-2 gap-3 mb-3" : "grid-cols-2 gap-4 mb-4"}`}>
          <div className={`pixel-border bg-purple-800/80 text-center ${isMobile ? "p-2" : "p-3"}`}>
            <div className={`text-purple-200 font-bold mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>FINAL SCORE</div>
            <div className={`text-purple-100 font-black ${isMobile ? "text-lg" : "text-xl"}`}>
              {overallStats.finalScore} / 100
            </div>
          </div>
          <div className={`pixel-border bg-green-800/80 text-center ${isMobile ? "p-2" : "p-3"}`}>
            <div className={`text-green-200 font-bold mb-1 ${isMobile ? "text-xs" : "text-sm"}`}>TOTAL TIME</div>
            <div className={`text-green-100 font-black ${isMobile ? "text-lg" : "text-xl"}`}>
              {formatTime(overallStats.totalTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Best Scores */}
      <div className={`relative z-10 ${isMobile ? "mb-3" : "mb-6"}`}>
        <h3 className={`pixel-text font-bold text-yellow-200 text-center ${
          isMobile ? "text-base mb-2" : "text-lg mb-3"
        }`}>
          BEST SCORES
        </h3>
        <div className={`space-y-1 overflow-y-auto ${
          isMobile ? "max-h-24" : "max-h-32"
        }`}>
          {loadingTopScores ? (
            <div className="text-center text-gray-400 py-4">
              <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading best scores...
            </div>
          ) : topScores.length > 0 ? (
            topScores.map((score, index) => (
              <div
                key={index}
                className={`pixel-border bg-gray-800/60 ${
                  isMobile
                    ? "p-1.5 flex flex-col gap-1"
                    : "p-2 flex items-center justify-between"
                }`}
              >
                <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                    index === 0 ? "bg-yellow-500" :
                    index === 1 ? "bg-gray-400" :
                    "bg-orange-600"
                  } text-black font-bold ${isMobile ? "text-xs" : "text-sm"}`}>
                    {index + 1}
                  </div>
                  <span className={`font-bold text-cyan-200 ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}>
                    {score.best_score > 0 ? `${score.best_score}` : '--'}
                  </span>
                </div>
                <div className={`flex items-center ${
                  isMobile
                    ? "gap-2 text-xs justify-between"
                    : "gap-4 text-xs"
                }`}>
                  {score.best_time > 0 && (
                    <span className="text-green-200">
                      Time: <span className="font-bold text-green-100">
                        {Math.floor(score.best_time / 60)}:{(score.best_time % 60).toString().padStart(2, '0')}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              <span className={isMobile ? "text-xs" : "text-sm"}>
                No previous scores found
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`relative z-10 flex gap-2 justify-center ${
        isMobile ? "flex-col" : "flex-col sm:flex-row gap-3"
      }`}>
        <button
          className={`pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 text-white font-black pixel-text hover:from-green-400 hover:to-blue-500 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 ${
            isMobile ? "px-4 py-2 text-sm" : "px-6 py-3"
          }`}
          onClick={handleGoToModules}
          aria-label="Back to Modules"
        >
          <Icon icon="mdi:home-map-marker" className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
          Back to Modules
        </button>
        <button
          className={`pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-black pixel-text hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-2 ${
            isMobile ? "px-4 py-2 text-sm" : "px-6 py-3"
          }`}
          onClick={onClose}
          aria-label="Play Again"
        >
          <Icon icon="mdi:refresh" className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
          Play Again
        </button>
      </div>
    </div>
  );
};
