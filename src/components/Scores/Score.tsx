import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { modules } from './modulesData';
import ModuleStone from './ModuleStone';
import ModuleDetailModal from './ModuleDetailModal';
import { Module } from './types/GameData';
import { useDeviceLayout } from '../../hooks/useOrientation';


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

  // Enhanced module positions for better desktop spacing and game roadmap feel
  const modulePositions = [
    { x: 100, y: 480 },   // Module 1 - Start (bottom left)
    { x: 250, y: 430 },   // Module 2 - First ascending curve
    { x: 250, y: 300 },   // Module 3 - Continuing upward
    { x: 190, y: 190 },   // Module 4 - Sharp switchback left
    { x: 350, y: 100 },   // Module 5 - Peak of the mountain
    { x: 450, y: 220 },   // Module 6 - Descending right
    { x: 550, y: 300 },   // Module 7 - Mid-level curve
    { x: 650, y: 200 },   // Module 8 - Lower right section
    { x: 750, y: 290 },   // Module 9 - Dip down
    { x: 900, y: 400 },   // Module 10 - Rising back up
    { x: 980, y: 300 },   // Module 11 - Final ascent
    { x: 1080, y: 200 },  // Module 12 - End destination (top right)
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
      const cp1y = previous.y + dy * 0.3 + perpY * direction;
      const cp2x = current.x - dx * 0.3 + perpX * direction;
      const cp2y = current.y - dy * 0.3 + perpY * direction;

      pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }

    return pathString;
  };

  const pathData = generateContinuousPath();

  const getPathPositions = () => modulePositions;

  const calculatedPositions = getPathPositions();



  return (
    <div className=" h-screen bg-gradient-to-br from-yellow-200 via-orange-200 to-amber-300 overflow-hidden game-roadmap-container roadmap-entrance landscape:h-screen">
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
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
          {/* Enhanced game roadmap background */}
          <defs>
            <pattern id="sandPattern" patternUnits="userSpaceOnUse" width="60" height="60">
              <circle cx="8" cy="8" r="1.5" fill="#F59E0B" opacity="0.08" />
              <circle cx="25" cy="20" r="1" fill="#EA580C" opacity="0.06" />
              <circle cx="40" cy="12" r="1.8" fill="#F97316" opacity="0.07" />
              <circle cx="50" cy="35" r="1.2" fill="#FB923C" opacity="0.08" />
              <circle cx="15" cy="45" r="0.8" fill="#D97706" opacity="0.05" />
            </pattern>

            <filter id="pathShadow">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#92400E" floodOpacity="0.4"/>
            </filter>

            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A574" />
              <stop offset="50%" stopColor="#E8C4A0" />
              <stop offset="100%" stopColor="#D4A574" />
            </linearGradient>

            <radialGradient id="mountainGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#654321" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          
          {/* Background with enhanced sand pattern */}
          <rect width="100%" height="100%" fill="url(#sandPattern)" />

          {/* Distant mountain silhouettes for depth */}
          <polygon
            points="0,400 200,300 400,350 600,280 800,320 1000,260 1200,300 1200,600 0,600"
            fill="url(#mountainGradient)"
          />
          <polygon
            points="100,450 300,380 500,420 700,360 900,400 1100,340 1200,380 1200,600 0,600"
            fill="url(#mountainGradient)"
            opacity="0.5"
          />

          {/* Strategic landscape elements (removed bottom ellipses) */}
          <ellipse cx="150" cy="520" rx="60" ry="15" fill="#D2691E" opacity="0.15" />
          <ellipse cx="1050" cy="540" rx="70" ry="18" fill="#CD853F" opacity="0.12" />

          {/* Enhanced decorative elements with better spacing */}
          <circle cx="60" cy="450" r="3" fill="#8B4513" opacity="0.25" />
          <circle cx="300" cy="380" r="2" fill="#A0522D" opacity="0.2" />
          <circle cx="550" cy="420" r="3" fill="#8B4513" opacity="0.25" />
          <circle cx="800" cy="350" r="2" fill="#A0522D" opacity="0.2" />
          <circle cx="1100" cy="280" r="3" fill="#8B4513" opacity="0.25" />

          {/* Scattered small rocks for authentic desert feel */}
          <circle cx="40" cy="380" r="1.5" fill="#A0522D" opacity="0.2" />
          <circle cx="1150" cy="420" r="2" fill="#8B4513" opacity="0.2" />
          <circle cx="450" cy="100" r="1.5" fill="#A0522D" opacity="0.2" />
          <circle cx="750" cy="150" r="2" fill="#8B4513" opacity="0.2" />
          
          {/* Enhanced path with game-style depth */}
          {/* Path shadow (bottom layer) */}
          <path
            d={pathData}
            fill="none"
            stroke="#6B4423"
            strokeWidth={strokeWidths.shadow}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
            transform="translate(4, 8)"
            filter="url(#pathShadow)"
          />

          {/* Path outer border (dark brown) */}
          <path
            d={pathData}
            fill="none"
            stroke="#8B4513"
            strokeWidth={strokeWidths.outer}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Path main body (enhanced tan/beige) */}
          <path
            d={pathData}
            fill="none"
            stroke="#DEB887"
            strokeWidth={strokeWidths.main}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          />

          {/* Path inner highlight (lighter tan) */}
          <path
            d={pathData}
            fill="none"
            stroke="#F5DEB3"
            strokeWidth={strokeWidths.inner}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* White center highlight */}
          <path
            d={pathData}
            fill="none"
            stroke="#000000"
            strokeWidth={strokeWidths.center}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
          />

          {/* Game-style dashed center line */}
          <path
            d={pathData}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={strokeWidths.dashed}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="15,10"
            opacity="1"
            className="path-glow-animation"
          />

          {/* Subtle glow effect for the path */}
          {/* <path
            d={pathData}
            fill="none"
            stroke="#FFE4B5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="1"
            filter="url(#glowEffect)"
          /> */}
          
          
          {/* Module stones */}
          {modules.map((module: Module) => (
            <ModuleStone
              key={module.id}
              module={module}
              position={calculatedPositions[module.id - 1]}
              onClick={() => handleModuleClick(module)}
            />
          ))}
        </svg>

        {/* Enhanced Back Button - Responsive sizing */}
        <div className="absolute top-0 left-2 landscape:top-1 landscape:left-3 md:top-6 md:left-6 z-20">
          <button
            onClick={handleBackToHome}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-amber-900 font-bold py-1 px-2 landscape:py-1.5 landscape:px-3 md:py-3 md:px-6 rounded landscape:rounded-lg md:rounded-xl shadow-md md:shadow-xl transition-all duration-300 hover:scale-105 md:hover:scale-110 hover:shadow-lg md:hover:shadow-2xl flex items-center space-x-1 landscape:space-x-2 md:space-x-3 border border-amber-200 md:border-2 roadmap-blur-backdrop roadmap-text text-xs landscape:text-sm md:text-lg back-button-mobile"
          >
            <ArrowLeft className="w-3 h-3 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>


        {/* Enhanced Progress indicator - Mobile landscape optimized */}
        <div className="absolute top-1 right-2 landscape:top-2 landscape:right-4 md:top-8 md:right-8 z-10 bg-white bg-opacity-95 rounded landscape:rounded-lg md:rounded-xl p-1.5 landscape:p-2 md:p-6 shadow-md md:shadow-xl border border-amber-200 md:border-2 roadmap-blur-backdrop progress-indicator-desktop">
          <div className="text-xs landscape:text-sm md:text-lg font-bold text-gray-800 mb-1 landscape:mb-1.5 md:mb-3 roadmap-text">Overall Progress</div>
          <div className="flex space-x-0.5 landscape:space-x-1 md:space-x-2 mb-1 landscape:mb-1.5 md:mb-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`w-1.5 h-1.5 landscape:w-2.5 landscape:h-2.5 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                  module.status === 'completed' ? 'bg-green-500 shadow-sm md:shadow-lg shadow-green-200' :
                  module.status === 'unlocked' ? 'bg-yellow-500 shadow-sm md:shadow-lg shadow-yellow-200 module-pulse-animation' :
                  'bg-gray-300 shadow-sm md:shadow-md'
                }`}
                title={`Module ${module.id} - ${module.status}`}
              />
            ))}
          </div>
          <div className="text-xs landscape:text-xs md:text-sm text-gray-700 font-medium roadmap-text">
            {modules.filter(m => m.status === 'completed').length} / {modules.length} completed
          </div>
          <div className="w-full bg-gray-200 rounded-full h-0.5 landscape:h-1 md:h-2 mt-1 landscape:mt-1 md:mt-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-0.5 landscape:h-1 md:h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(modules.filter(m => m.status === 'completed').length / modules.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModuleDetailModal
        isOpen={isModalOpen}
        module={selectedModule}
        onClose={closeModal}
      />
    </div>
  );
};

export default Score;