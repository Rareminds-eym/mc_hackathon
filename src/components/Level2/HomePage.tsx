import React from 'react';
import { useNavigate } from 'react-router-dom';
import { gameModes } from '../../data/Level2/gameModes';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { useLevel2GameStats } from './hooks/useLevel2GameStats';
import { Play, Filter, Zap, Crown, Gamepad2, ArrowLeft, Database, HardDrive } from 'lucide-react';
import './index.css';

interface HomePageProps {
  onGameModeSelect?: (modeId: string) => void;
  onExit?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGameModeSelect, onExit }) => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceLayout();
  const { stats: gameStats, loading: statsLoading, error: statsError } = useLevel2GameStats('1', 'gmp-vs-non-gmp');

  const getIcon = (modeId: string) => {
    switch (modeId) {
      case 'gmp-vs-non-gmp':
        return <Filter className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />;
      default:
        return <Play className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />;
    }
  };

  const handleGameModeClick = (modeId: string) => {
    if (onGameModeSelect) {
      onGameModeSelect(modeId);
    } else {
      // Fallback to navigation if no callback provided
      navigate(`/modules/1/levels/2`);
    }
  };

  const getDifficulty = (modeId: string) => {
    switch (modeId) {
      case 'gmp-vs-non-gmp':
        return { level: 'ROOKIE', stars: 1, color: 'text-green-400', bgColor: 'bg-green-900' };
      default:
        return { level: 'ROOKIE', stars: 1, color: 'text-green-400', bgColor: 'bg-green-900' };
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden pixel-perfect ${
      isMobile ? 'p-2' : 'p-6'
    }`}>
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-pattern"></div>
      </div>

      {/* Floating Pixel Particles - Reduced for mobile */}
      <div className="absolute inset-0">
        {[...Array(isMobile ? 8 : 15)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-cyan-400 pixel-particle animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className={`relative z-10 ${isMobile ? 'max-w-full h-screen flex flex-col' : 'max-w-6xl mx-auto'}`}>
        {/* Mobile Landscape Layout */}
        {isMobile ? (
          <div className="h-full flex flex-col justify-between py-2">
            {/* Compact Header for Mobile Landscape */}
            <div className="text-center mb-4 relative">
              {/* EXIT Button - Mobile */}
              <button
                onClick={() => onExit ? onExit() : navigate('/modules/1')}
                className="absolute top-0 left-0 bg-red-600 hover:bg-red-700 text-white px-3 py-2 pixel-border flex items-center space-x-2 font-bold shadow-lg transition-all duration-200 text-sm z-10 hover:shadow-xl"
                style={{
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>EXIT</span>
              </button>

              {/* Compact Game Stats HUD - Top Right for Mobile */}
              <div className="absolute top-0 right-0 flex space-x-2 z-10">
                <div className="pixel-border bg-green-600 px-2 py-1">
                  <div className="text-green-100 text-xs font-bold">LVL</div>
                  <div className="text-white text-sm font-black">02</div>
                </div>
                <div className="pixel-border bg-blue-600 px-2 py-1 relative group">
                  <div className="text-blue-100 text-xs font-bold flex items-center">
                    SCORE
                    {statsError ? (
                      <HardDrive className="w-2 h-2 ml-1 text-yellow-300" />
                    ) : (
                      <Database className="w-2 h-2 ml-1 text-green-300" />
                    )}
                  </div>
                  <div className="text-white text-sm font-black">
                    {statsLoading ? '----' : gameStats.highScore.toString().padStart(4, '0')}
                  </div>
                  {/* Tooltip */}
                  {statsError && (
                    <div className="absolute bottom-full right-0 mb-1 bg-gray-800 text-white text-xs px-2 py-1 pixel-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      Using local data
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Game Logo */}
              <div className="inline-block relative mb-3">
                <div className="pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 p-2 relative">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-300 pixel-border flex items-center justify-center">
                      <Crown className="w-4 h-4 text-yellow-800" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-lg font-black text-white pixel-text tracking-wider">
                        GMP QUEST
                      </h1>
                      <div className="text-yellow-200 text-xs font-bold tracking-widest">
                        CLASSIFICATION ADVENTURE
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-orange-300 pixel-border flex items-center justify-center">
                      <Gamepad2 className="w-4 h-4 text-orange-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Horizontal Layout for Landscape */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                {gameModes.map((mode, index) => {
                  const difficulty = getDifficulty(mode.id);
                  return (
                    <div
                      key={mode.id}
                      className="group relative transform transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <button
                        onClick={() => handleGameModeClick(mode.id)}
                        className="relative w-full text-left overflow-hidden game-card-hover"
                      >
                        {/* Compact Mobile Card */}
                        <div className="pixel-border-thick bg-gray-800 p-4 relative overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-50"></div>
                          <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500 opacity-10 pixel-corner"></div>
                          
                          {/* Horizontal Layout for Mobile Landscape */}
                          <div className="flex items-center space-x-4">
                            {/* Mission Icon */}
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 pixel-border flex items-center justify-center group-hover:animate-bounce">
                                <div className="text-white">
                                  {getIcon(mode.id)}
                                </div>
                              </div>
                              {/* Power indicator */}
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 pixel-border animate-pulse">
                                <Zap className="w-2 h-2 text-yellow-800" />
                              </div>
                            </div>

                            {/* Mission Info - Horizontal Layout */}
                            <div className="flex-1 relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-black text-cyan-300 pixel-text tracking-wide group-hover:text-yellow-300 transition-colors">
                                  {mode.title.replace(/🧩|📂|📋/g, '').trim()}
                                </h3>
                                
                                {/* Difficulty Badge */}
                                <div className={`pixel-border ${difficulty.bgColor} px-2 py-1`}>
                                  <div className={`text-xs font-bold ${difficulty.color} tracking-wider`}>
                                    {difficulty.level}
                                  </div>
                                  <div className="flex justify-center mt-1">
                                    {[...Array(3)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-1 h-1 mx-0.5 ${
                                          i < difficulty.stars
                                            ? 'bg-yellow-400'
                                            : 'bg-gray-600'
                                        } pixel-dot`}
                                      ></div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-gray-300 text-sm leading-relaxed mb-3 font-medium">
                                {mode.description}
                              </p>

                              {/* Mission Stats - Horizontal */}
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <div className="pixel-border bg-blue-900 px-2 py-1 text-center">
                                    <div className="text-blue-300 text-xs font-bold">TARGETS</div>
                                    <div className="text-white text-sm font-black">{mode.terms.length}</div>
                                  </div>
                                  <div className="pixel-border bg-purple-900 px-2 py-1 text-center">
                                    <div className="text-purple-300 text-xs font-bold">ZONES</div>
                                    <div className="text-white text-sm font-black">{mode.categories.length}</div>
                                  </div>
                                </div>

                                {/* Start Mission Button - Compact */}
                                <div className="flex-1">
                                  <div className="pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 p-2 group-hover:from-green-400 group-hover:to-blue-500 transition-all duration-300">
                                    <div className="flex items-center justify-center text-white font-black text-sm pixel-text">
                                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                      START MISSION
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Scan Lines Effect */}
                          <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
                        </div>

                        {/* Glow Effect on Hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pixel-glow"></div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        ) : (
          /* Desktop Layout - Updated */
          <>
            {/* EXIT Button - Desktop */}
            <div className="absolute top-6 left-6 z-20">
              <button
                onClick={() => onExit ? onExit() : navigate('/modules/1')}
                className="pixel-border bg-red-700 hover:bg-red-600 text-red-300 hover:text-white py-2 px-4 font-bold pixel-text transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">EXIT</span>
                </div>
              </button>
            </div>

            {/* Retro Game Header */}
            <div className="text-center mb-12 pt-8">
              {/* Game Logo with Pixel Border */}
              <div className="inline-block relative mb-6">
                <div className="pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 p-4 relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-yellow-300 pixel-border flex items-center justify-center">
                      <Crown className="w-8 h-8 text-yellow-800" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-4xl font-black text-white pixel-text tracking-wider">
                        GMP QUEST
                      </h1>
                      <div className="text-yellow-200 text-sm font-bold tracking-widest">
                        CLASSIFICATION ADVENTURE
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-orange-300 pixel-border flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-orange-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Stats HUD - Updated with stored scores */}
              <div className="flex justify-center space-x-4 mb-8">
                <div className="pixel-border bg-green-600 px-4 py-2">
                  <div className="text-green-100 text-xs font-bold">LEVEL</div>
                  <div className="text-white text-lg font-black">02</div>
                </div>
                <div className="pixel-border bg-blue-600 px-4 py-2 relative group">
                  <div className="text-blue-100 text-xs font-bold flex items-center justify-center">
                    SCORE
                    {statsError ? (
                      <HardDrive className="w-3 h-3 ml-1 text-yellow-300" />
                    ) : (
                      <Database className="w-3 h-3 ml-1 text-green-300" />
                    )}
                  </div>
                  <div className="text-white text-lg font-black">
                    {statsLoading ? '----' : gameStats.highScore.toString().padStart(4, '0')}
                  </div>
                  {/* Enhanced Tooltip for Desktop */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-3 py-2 pixel-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {statsError ? (
                      <>
                        <div className="text-yellow-300 font-bold">📱 Local Data</div>
                        <div>Stored on this device</div>
                      </>
                    ) : (
                      <>
                        <div className="text-green-300 font-bold">☁️ Online Data</div>
                        <div>Synced across devices</div>
                        {'averageScore' in gameStats && (
                          <div className="mt-1 pt-1 border-t border-gray-600">
                            <div>Games: {gameStats.totalGamesPlayed}</div>
                            <div>Average: {gameStats.averageScore}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Mode Selection Cards */}
            <div className="flex justify-center">
              <div className="max-w-md">
                {gameModes.map((mode, index) => {
                  const difficulty = getDifficulty(mode.id);
                  return (
                    <div
                      key={mode.id}
                      className="group relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <button
                        onClick={() => handleGameModeClick(mode.id)}
                        className="relative w-full text-left overflow-hidden game-card-hover"
                      >
                        {/* Main Card with Pixel Border */}
                        <div className="pixel-border-thick bg-gray-800 p-6 relative overflow-hidden">
                          {/* Animated Background Pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-50"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500 opacity-10 pixel-corner"></div>
                          
                          {/* Difficulty Badge */}
                          <div className="absolute top-4 right-4">
                            <div className={`pixel-border ${difficulty.bgColor} px-2 py-1`}>
                              <div className={`text-xs font-bold ${difficulty.color} tracking-wider`}>
                                {difficulty.level}
                              </div>
                              <div className="flex justify-center mt-1">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 mx-0.5 ${
                                      i < difficulty.stars
                                        ? 'bg-yellow-400'
                                        : 'bg-gray-600'
                                    } pixel-dot`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Mission Icon */}
                          <div className="relative mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 pixel-border flex items-center justify-center group-hover:animate-bounce">
                              <div className="text-white">
                                {getIcon(mode.id)}
                              </div>
                            </div>
                            {/* Power indicator */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 pixel-border animate-pulse">
                              <Zap className="w-3 h-3 text-yellow-800" />
                            </div>
                          </div>

                          {/* Mission Info */}
                          <div className="relative z-10">
                            <h3 className="text-xl font-black text-cyan-300 mb-3 pixel-text tracking-wide group-hover:text-yellow-300 transition-colors">
                              {mode.title.replace(/🧩|📂|📋/g, '').trim()}
                            </h3>
                            
                            <p className="text-gray-300 text-sm leading-relaxed mb-4 font-medium">
                              {mode.description}
                            </p>

                            {/* Mission Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              <div className="pixel-border bg-blue-900 p-2 text-center">
                                <div className="text-blue-300 text-xs font-bold">TARGETS</div>
                                <div className="text-white font-black">{mode.terms.length}</div>
                              </div>
                              <div className="pixel-border bg-purple-900 p-2 text-center">
                                <div className="text-purple-300 text-xs font-bold">ZONES</div>
                                <div className="text-white font-black">{mode.categories.length}</div>
                              </div>
                            </div>

                            {/* Start Mission Button */}
                            <div className="pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 p-3 group-hover:from-green-400 group-hover:to-blue-500 transition-all duration-300">
                              <div className="flex items-center justify-center text-white font-black text-lg pixel-text">
                                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                START MISSION
                              </div>
                            </div>
                          </div>

                          {/* Scan Lines Effect */}
                          <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
                        </div>

                        {/* Glow Effect on Hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pixel-glow"></div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;