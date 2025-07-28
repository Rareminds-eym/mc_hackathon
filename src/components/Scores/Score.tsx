import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
import { Icon } from '@iconify/react';
import { modules } from './modulesData';
import ModuleStone from './ModuleStone';
import ModuleDetailModal from './ModuleDetailModal';
import { Module } from './types/GameData';
import { useDeviceLayout } from '../../hooks/useOrientation';
import AnimatedBackground from './AnimatedBackground';


const Score: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { isMobile } = useDeviceLayout();

  // Responsive map sizing
  const viewBoxWidth = 1200;
  const viewBoxHeight = 600;
  const scaledViewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;

  // Responsive stroke widths
  const strokeWidths = {
    shadow: isMobile ? 65 : 55,
    outer: isMobile ? 58 : 49,
    main: isMobile ? 48 : 41,
    inner: isMobile ? 38 : 32,
    center: isMobile ? 28 : 24,
    dashed: isMobile ? 4 : 3.5
  };

  const handleModuleClick = (module: Module): void => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  const handleBackToHome = (): void => {
    navigate('/home');
  };

  // Updated module positions for only 6 levels, spaced for a visually pleasing path
  const modulePositions = [
    { x: 120, y: 500 },   // Level 1 - Start (bottom left)
    { x: 300, y: 400 },   // Level 2 - Ascend left
    { x: 400, y: 270 },   // Level 3 - Curve up
    { x: 600, y: 200 },   // Level 4 - Mid right
    { x: 850, y: 300 },   // Level 5 - Curve down right
    { x: 1050, y: 150 },  // Level 6 - End (top right)
  ];

  // Generate the exact winding path style from the reference image
  const generateContinuousPath = () => {
    let pathString = `M ${modulePositions[0].x} ${modulePositions[0].y}`;

    for (let i = 1; i < modulePositions.length; i++) {
      const current = modulePositions[i];
      const previous = modulePositions[i - 1];

      // Calculate smooth control points for natural S-curves
      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Create pronounced curves like the reference - alternating S-pattern
      const curvature = distance * 0.4;
      const perpX = -dy / distance * curvature;
      const perpY = dx / distance * curvature;

      // Alternate curve direction for S-pattern
      const direction = i % 2 === 0 ? 1 : -1;

      const cp1x = previous.x + dx * 0.3 + perpX * direction;
      const cp1y = previous.y + dy * 0.6 + perpY * direction;
      const cp2x = current.x - dx * 0.9 + perpX * direction;
      const cp2y = current.y - dy * 0.9 + perpY * direction;

      pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }

    return pathString;
  };

  const pathData = generateContinuousPath();

  const getPathPositions = () => modulePositions;

  const calculatedPositions = getPathPositions();



  return (
    <AnimatedBackground className="h-screen overflow-hidden game-roadmap-container roadmap-entrance landscape:h-screen">
      {/* Enhanced atmospheric overlay with game-like depth */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(30, 27, 58, 0.2) 50%, rgba(15, 10, 30, 0.3) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
      />

      {/* Additional atmospheric effects */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        {/* Subtle vignette effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)',
          }}
        />

        {/* Dynamic light rays */}
        <div
          className="absolute top-0 left-1/4 w-1 h-full opacity-10 bg-gradient-to-b from-yellow-200 via-transparent to-transparent transform rotate-12"
          style={{
            background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.3) 0%, transparent 60%)',
            filter: 'blur(3px)',
          }}
        />
        <div
          className="absolute top-0 right-1/3 w-1 h-full opacity-8 bg-gradient-to-b from-purple-200 via-transparent to-transparent transform -rotate-6"
          style={{
            background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.2) 0%, transparent 50%)',
            filter: 'blur(4px)',
          }}
        />
      </div>
      {/* Responsive Scoreboard Header for landscape and portrait */}
      {isMobile && window.innerWidth > window.innerHeight ? (
        <div className="w-full flex flex-col items-center z-20 pt-2">
          <motion.h1
            className="relative text-lg font-extrabold text-white drop-shadow-lg text-center tracking-wide select-none mb-2"
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring' }}
          >
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg mr-1">
              <Icon icon="mdi:cube-outline" width={20} height={20} />
            </span>
            <span
              className="bg-gradient-to-r from-green-300 via-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg shadow-green-200 px-1 rounded-lg border-b-2 border-green-400"
              style={{
                WebkitTextStroke: '1px #064e3b',
                filter: 'drop-shadow(0 1px 2px #34d399)'
              }}
            >
              Scoreboard
            </span>
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg ml-1" style={{ animationDelay: '0.2s' }}>
              <Icon icon="mdi:clipboard-check-outline" width={20} height={20} />
            </span>
            <span className="block text-xs font-semibold text-emerald-200 mt-1 tracking-normal animate-fade-in-slow">
              Track your progress and achievements!
            </span>
          </motion.h1>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center z-20 pt-4">
          <motion.h1
            className={`relative text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg text-center tracking-widest select-none mb-10`}
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: 'spring' }}
          >
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg mr-2">
              <Icon icon="mdi:cube-outline" width={32} height={32} />
            </span>
            <span
              className="bg-gradient-to-r from-green-300 via-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg shadow-green-200 px-2 rounded-lg border-b-4 border-green-400"
              style={{
                WebkitTextStroke: '2px #064e3b',
                filter: 'drop-shadow(0 2px 4px #34d399)'
              }}
            >
              Scoreboard
            </span>
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg ml-2" style={{ animationDelay: '0.2s' }}>
              <Icon icon="mdi:clipboard-check-outline" width={32} height={32} />
            </span>
            <span className="block text-sm md:text-md font-semibold text-emerald-200 mt-6 tracking-normal animate-fade-in-slow">
              Track your progress and achievements!
            </span>
          </motion.h1>
        </div>
      )}
      <div
        className="relative w-full h-full flex items-center justify-center z-10"
        style={{ marginTop: isMobile ? '-3rem' : '-9rem' }}
      >
        <motion.svg
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          width={isMobile ? "100%" : "105%"}
          height={isMobile ? "100%" : "105%"}
          viewBox={scaledViewBox}
          className="game-roadmap-svg"
          preserveAspectRatio="xMidYMid meet"
          style={{
            minHeight: isMobile ? '350px' : '900px',
            maxWidth: isMobile ? '100vw' : '100vw',
            maxHeight: isMobile ? '100vh' : '100vh'
          }}
        >
          {/* Enhanced game roadmap background with realistic textures */}
          <defs>
            {/* Realistic mountain stone path texture pattern */}
            <pattern id="stonePattern" patternUnits="userSpaceOnUse" width="45" height="45">
              <rect width="45" height="45" fill="#1E293B" opacity="0.15"/>
              <circle cx="10" cy="8" r="2.5" fill="#475569" opacity="0.2" />
              <circle cx="28" cy="18" r="1.8" fill="#64748B" opacity="0.18" />
              <circle cx="38" cy="28" r="2.2" fill="#334155" opacity="0.16" />
              <circle cx="18" cy="35" r="1.5" fill="#475569" opacity="0.14" />
              <circle cx="35" cy="8" r="1.2" fill="#64748B" opacity="0.12" />
              <ellipse cx="15" cy="22" rx="3" ry="1.5" fill="#1E293B" opacity="0.25" />
              <ellipse cx="32" cy="40" rx="2.5" ry="1.8" fill="#0F172A" opacity="0.2" />
            </pattern>

            {/* Enhanced mountain stone path shadow with multiple layers */}
            <filter id="pathShadow">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.7" />
              <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.4" />
              <feDropShadow dx="6" dy="12" stdDeviation="9" floodColor="#000000" floodOpacity="0.2" />
            </filter>

            {/* Magical glow effect for the path */}
            <filter id="magicalGlow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Realistic stone path gradient - matching mountain environment */}
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="20%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="80%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Path border gradient - darker mountain stone */}
            <linearGradient id="pathBorderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="30%" stopColor="#0F172A" />
              <stop offset="70%" stopColor="#020617" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>

            {/* Single white energy gradient for center line */}
            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
            </linearGradient>
          </defs>

         
          {/* Enhanced realistic game path with multiple layers */}
          {/* Path shadow (deepest layer) - darker mountain shadow */}
          <path
            d={pathData}
            fill="none"
            stroke="#020617"
            strokeWidth={strokeWidths.shadow}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
            transform="translate(3, 6)"
            filter="url(#pathShadow)"
          />

          {/* Path outer border (dark stone) */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#pathBorderGradient)"
            strokeWidth={strokeWidths.outer}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          />

          {/* Path main body (stone texture) */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth={strokeWidths.main}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          />

          {/* Stone texture overlay */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#stonePattern)"
            strokeWidth={strokeWidths.inner}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* Inner path highlight - subtle mountain stone highlight */}
          <path
            d={pathData}
            fill="none"
            stroke="#64748B"
            strokeWidth={strokeWidths.center}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />

          {/* Single animated energy line */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#energyGradient)"
            strokeWidth={strokeWidths.dashed}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="20,25"
            opacity="0.7" 
            filter="url(#magicalGlow)"
            className="path-energy-animation"
          />


          {/* Module stones: Always show 6 stones, even if some are locked or missing */}
          {[...Array(6)].map((_, i) => {
            const module = modules[i] || {
              id: i + 1,
              name: `Level ${i + 1}`,
              status: 'locked',
              // Add any other required fallback properties for ModuleStone
            };
            return (
              <ModuleStone
                key={module.id}
                module={module}
                position={calculatedPositions[i]}
                onClick={() => handleModuleClick(module)}
              />
            );
          })}
        </motion.svg>

        {/* Back Button from InstructionsPage (restored) */}
        <button
          className="fixed top-3 left-16 z-30 flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-1 px-3 rounded-full shadow-lg backdrop-blur-md border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          onClick={handleBackToHome}
          aria-label="Back"
        >
          <Icon icon="mdi:arrow-left" width={18} height={18} />
          <span className="text-xs font-semibold">Back</span>
        </button>


        {/* Enhanced Game-Style Progress Panel - moved to right bottom */}
        {/* Redesigned Progress Modal */}
        <motion.div
          initial={{ opacity: 0, x: 60, y: 60 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
        >
          <div
            className={`rounded-2xl shadow-2xl border-2 border-emerald-400 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center relative ${isMobile ? 'p-2 min-w-[150px] max-w-[180px]' : 'p-5 min-w-[260px] max-w-xs'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isMobile ? '' : ''}`}>
              <Icon icon="mdi:chart-timeline-variant" width={isMobile ? 15 : 22} height={isMobile ? 15 : 22} className="text-emerald-300 drop-shadow" />
              <span className={`${isMobile ? 'text-xs' : 'text-lg'} font-extrabold text-emerald-200 tracking-wide drop-shadow`}>Overall Progress</span>
            </div>
            <div className={`flex items-center gap-2 mb-3`}>
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className={`${isMobile ? 'w-2.5 h-2.5' : 'w-4 h-4'} rounded-full border-2 ${modules[i]?.status === 'completed' ? 'bg-emerald-400 border-emerald-300 shadow-emerald-200/50 animate-pulse' : modules[i]?.status === 'unlocked' ? 'bg-yellow-400 border-yellow-300 animate-pulse' : 'bg-slate-600 border-slate-400'}`}
                  title={modules[i]?.status === 'completed' ? 'Completed' : modules[i]?.status === 'unlocked' ? 'Unlocked' : 'Locked'}
                />
              ))}
            </div>
            <div className={`flex items-center gap-2 mb-2`}>
              <Icon icon="mdi:check-circle-outline" width={isMobile ? 12 : 18} height={isMobile ? 12 : 18} className="text-emerald-300" />
              <span className={`${isMobile ? 'text-xs' : 'text-base'} font-bold text-white drop-shadow`}>{modules.slice(0, 6).filter(m => m.status === 'completed').length} / 6 completed</span>
            </div>
            <div className={`w-full bg-slate-700/60 rounded-full ${isMobile ? 'h-1' : 'h-2'} border border-slate-600/50 overflow-hidden mb-1`}>
              <div
                className={`bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 h-full rounded-full transition-all duration-500 relative`}
                style={{
                  width: `${(modules.slice(0, 6).filter(m => m.status === 'completed').length / 6) * 100}%`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <ModuleDetailModal
        isOpen={isModalOpen}
        module={selectedModule}
        onClose={closeModal}
      />
    </AnimatedBackground>
  );
};

export default Score;