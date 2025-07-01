import React, { useState } from 'react';
import { UserProfileHeader } from './UserProfileHeader';
import { ModuleCard } from './ModuleCard';
import { LevelDetailsModal } from './LevelDetailsModel';
import { userProfile, modules } from './gameData';
import { Module } from './types/GameData';

// Animated SVG Star
const AnimatedStar = () => (
  <svg className="absolute top-10 left-10 w-16 h-16 animate-bounce-slow opacity-60" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" fill="#fff176" filter="url(#glow1)" />
    <defs>
      <filter id="glow1" x="-10" y="-10" width="84" height="84" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

// Animated SVG Polygon
const AnimatedPolygon = () => (
  <svg className="absolute bottom-16 right-16 w-12 h-12 animate-float opacity-50" viewBox="0 0 48 48" fill="none">
    <polygon points="24,2 29,18 46,18 32,28 37,44 24,34 11,44 16,28 2,18 19,18" fill="#fffde4" filter="url(#glow2)" />
    <defs>
      <filter id="glow2" x="-10" y="-10" width="68" height="68" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

// Sparkle Effect
const SparkleEffect = () => (
  <div className="absolute w-full h-full overflow-hidden">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-ping rounded-full bg-white opacity-30 blur-sm"
        style={{
          width: `${8 + Math.random() * 10}px`,
          height: `${8 + Math.random() * 10}px`,
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
          animationDuration: `${1.5 + Math.random()}s`,
        }}
      />
    ))}
  </div>
);

// Animation Styles
const AnimationStyles = () => (
  <style>{`
    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    .animate-bounce-slow { animation: bounce-slow 4s infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.1); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .module-card-scroll > div { min-width: 25%; max-width: 25%; }
    .module-card-scroll > .first-module { scroll-margin-left: 8px; }
    .module-card-scroll > .last-module { scroll-margin-right: 8px; }
  `}</style>
);

function Score() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModule(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative
      bg-gradient-to-br from-[#c1e7bf] via-[#4fb3a8] to-[#2193b0]
      border-2 border-[#4fb3a8]/60 shadow-xl rounded-2xl
      mobile-portrait:min-h-screen mobile-portrait:w-full
      mobile-landscape:min-h-screen mobile-landscape:w-full overflow-hidden">
      {/* Gamified Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Radial overlay for depth */}
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-[#c1e7bf]/30 to-transparent opacity-60"></div>
        <AnimatedStar />
        <AnimatedPolygon />
        <SparkleEffect />
        <AnimationStyles />
      </div>
      <div className="relative flex-1 flex flex-col justify-start overflow-y-visible mx-auto px-2 py-4 sm:px-4 sm:py-8 w-full
                      mobile-portrait:px-1 mobile-portrait:py-2
                      mobile-landscape:px-1 mobile-landscape:py-2 z-10">
        {/* User Profile Header */}
        <UserProfileHeader profile={userProfile} />

        {/* Modules Horizontal Scroll */}
        <div className="mb-8 mobile-portrait:mb-4 mobile-landscape:mb-4">
          <h2 className="font-bold text-white text-center mb-3 md:mb-4 text-sm md:text-2xl mobile-portrait:text-md mobile-portrait:mb-2 mobile-landscape:text-base mobile-landscape:mb-2 drop-shadow-[0_0_8px_#c2f9f3] animate-glow">
            Learning Modules
          </h2>
          {/* Horizontal Scrolling Container */}
          <div className="min-h-[150px] mobile-portrait:min-h-[100px] mobile-landscape:min-h-[90px] px-4">
            <div
              className="flex gap-3 overflow-x-auto overflow-y-hidden w-full max-w-full pb-4 scrollbar-hide snap-x snap-mandatory module-card-scroll justify-start"
              style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollPaddingLeft: '8px', scrollPaddingRight: '8px' }}
            >
              {modules.slice(0, 12).map((module, idx, arr) => (
                <div
                  key={module.id}
                  className={`flex-shrink-0 w-1/4 max-w-[25%] h-32 sm:h-40 md:h-48 lg:h-64 snap-start${idx === 0 ? ' first-module' : ''}${idx === arr.length - 1 ? ' last-module' : ''}`}
                >
                  <ModuleCard
                    module={module}
                    onClick={() => handleModuleClick(module)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level Details Modal */}
        <LevelDetailsModal
          module={selectedModule}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}

export default Score;