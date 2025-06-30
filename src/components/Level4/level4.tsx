import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, X } from 'lucide-react';

const Detective = ({ moduleId = 1 }) => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 min-h-screen min-w-full bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center"
      style={{ zIndex: 1000 }}
    >
      {/* Simple grid background for 2D feel with blur */}
      <div className="absolute inset-0 opacity-10 backdrop-blur-sm pointer-events-none select-none">
        <div
          className="w-full h-full blur-sm"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div
        className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-[420px] md:max-w-[520px] lg:max-w-[600px] max-h-[100dvh] p-1 md:p-6"
        style={{ minHeight: '100dvh' }}
      >
        {/* 2D Style Title */}
        <div className="text-center mb-4 md:mb-8 scale-90 md:scale-100">
          <h1
            className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-1 md:mb-3 tracking-wider"
            style={{
              textShadow: '2px 2px 0px #1e40af, 4px 4px 0px #1e3a8a',
              fontFamily: 'monospace',
            }}
          >
            🔍 DEVIATION
          </h1>
          <h2
            className="text-base xs:text-lg sm:text-xl md:text-3xl lg:text-5xl font-bold text-yellow-300 tracking-wider"
            style={{
              textShadow: '1.5px 1.5px 0px #b45309, 3px 3px 0px #92400e',
              fontFamily: 'monospace',
            }}
          >
            DETECTIVE
          </h2>
          <div className="mt-1 md:mt-4 w-12 md:w-32 h-[3px] md:h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto border border-yellow-600 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.5)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]"></div>
        </div>

        {/* Enhanced 2D Style Game Menu */}
        <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-4 md:border-6 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-1 md:p-4 w-full max-w-xs md:max-w-md rounded-lg">
          <div className="space-y-2 md:space-y-4">
            {/* PLAY Button */}
            <button
              onClick={() => navigate('/modules/1/levels/4/gameboard2d')}
              className="w-full flex items-center justify-between px-2 md:px-6 py-2 md:py-4 bg-gradient-to-b from-green-400 to-green-600 text-white font-black text-sm md:text-xl tracking-widest border-4 md:border-6 border-green-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all duration-150 transform hover:scale-[0.98] rounded-lg"
              style={{ fontFamily: 'monospace' }}
            >
              <Play className="w-4 h-4 md:w-6 md:h-6 drop-shadow-lg" />
              <span className="drop-shadow-lg">PLAY</span>
              <div className="w-4 md:w-6"></div>
            </button>

            {/* SCORE Button */}
            <button
              className="w-full flex items-center justify-between px-2 md:px-6 py-2 md:py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 text-white font-black text-sm md:text-xl tracking-widest border-4 md:border-6 border-yellow-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all duration-150 transform hover:scale-[0.98] rounded-lg"
              style={{ fontFamily: 'monospace' }}
            >
              <Trophy className="w-4 h-4 md:w-6 md:h-6 drop-shadow-lg" />
              <span className="drop-shadow-lg">SCORE</span>
              <div className="w-4 md:w-6"></div>
            </button>

            {/* QUIT Button */}
            <button
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="w-full flex items-center justify-between px-2 md:px-6 py-2 md:py-4 bg-gradient-to-b from-red-500 to-red-700 text-white font-black text-sm md:text-xl tracking-widest border-4 md:border-6 border-red-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all duration-150 transform hover:scale-[0.98] rounded-lg"
              style={{ fontFamily: 'monospace' }}
            >
              <X className="w-4 h-4 md:w-6 md:h-6 drop-shadow-lg" />
              <span className="drop-shadow-lg">QUIT</span>
              <div className="w-4 md:w-6"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-2 md:mt-8 text-center">
          <p className="text-white text-[10px] md:text-base tracking-widest font-bold drop-shadow-lg" style={{ fontFamily: 'monospace' }}>
            🎮 2D GAME STYLE: 🔍 DEVIATION DETECTIVE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Detective;