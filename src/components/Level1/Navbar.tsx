import React, { useState } from 'react';
import { ArrowLeft, Menu, Home, Clock, Trophy, Target, User, HelpCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { useDeviceLayout } from '../../hooks/useOrientation'; // Import orientation hook

interface NavbarProps {
  score: number;
  rowsSolved: number;
  onBackClick: () => void;
  onHomeClick: () => void;
  onResetTutorial: () => void;
  timer: number; // <-- Accept timer as a prop
  onPlayAgain?: () => void; // <-- Add this prop
  tutorialStep?: number;
}

const Navbar: React.FC<NavbarProps> = ({ score, rowsSolved, onBackClick, onHomeClick, onResetTutorial, timer, onPlayAgain, tutorialStep }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from AuthContext
  const { isHorizontal, isMobile } = useDeviceLayout(); // Get orientation

  // Get avatar from localStorage, fallback to Intern1
  const avatar = localStorage.getItem("selectedAvatar") || "/characters/Intern1.png";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTutorialClick = () => {
    onResetTutorial();
    setIsMenuOpen(false);
  };

  // Get display name: prefer full_name from metadata, fallback to email, else "Player"
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email ||
    "Player";

  // Determine if we are in mobile landscape mode
  const isMobileLandscape = isMobile && isHorizontal;

  // Open menu automatically on tutorial step 4
  React.useEffect(() => {
    if (tutorialStep === 4) setIsMenuOpen(true);
    if (tutorialStep === 5) setIsMenuOpen(false); // Close menu when user presses Start Playing
  }, [tutorialStep]);

  return (
    <nav
      className={`bg-white/30 backdrop-blur-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.10)] border-b border-white/30 relative z-50`}
      style={{
        height: isMobileLandscape ? '38px' : undefined, // Reduce navbar height
        minHeight: isMobileLandscape ? '38px' : undefined,
      }}
    >
      <div className={`max-w-[1120px] mx-auto ${isMobileLandscape ? 'px-6' : 'px-6'}`}>
        <div
          className={`flex justify-between items-center ${isMobileLandscape ? 'h-9' : 'h-12 sm:h-12 h-10'}`}
        >
          {/* Left Section - Back and Menu Buttons */}
          <div className={`flex items-center gap-${isMobileLandscape ? '1' : '4'} sm:gap-4`}>
            <button
              onClick={() => {
                if (onBackClick) onBackClick();
                window.history.back();
              }}
              className={`flex items-center justify-center ${isMobileLandscape ? 'w-8 h-8 p-1' : 'w-10 h-10 sm:w-10 sm:h-10 w-8 h-8 p-2'} text-white bg-transparent border-none rounded-full cursor-pointer transition-all duration-300 outline-none`}
              onMouseOver={() => setHoveredBtn('back')}
              onMouseOut={() => setHoveredBtn(null)}
              style={{
                color: hoveredBtn === 'back' ? '#bfdbfe' : '#fff',
                background: hoveredBtn === 'back' ? 'rgba(255,255,255,0.20)' : 'transparent'
              }}
            >
              <ArrowLeft className={`${isMobileLandscape ? 'w-4 h-4' : 'w-6 h-6 sm:w-6 sm:h-6 w-5 h-5'} transition-all duration-300`}
                style={{
                  transform: hoveredBtn === 'back' ? 'scale(1.1) translateX(-4px)' : 'none'
                }} 
              />
            </button>
            <button
              onClick={toggleMenu}
              className={`flex items-center justify-center ${isMobileLandscape ? 'w-8 h-8 p-1' : 'w-10 h-10 sm:w-10 sm:h-10 w-8 h-8 p-2'} text-white bg-transparent border-none rounded-full cursor-pointer transition-all duration-300 outline-none`}
              onMouseOver={() => setHoveredBtn('menu')}
              onMouseOut={() => setHoveredBtn(null)}
              style={{
                color: hoveredBtn === 'menu' ? '#bfdbfe' : '#fff',
                background: hoveredBtn === 'menu' ? 'rgba(255,255,255,0.20)' : 'transparent'
              }}
            >
              <Menu className={`${isMobileLandscape ? 'w-4 h-4' : 'w-6 h-6 sm:w-6 sm:h-6 w-5 h-5'} transition-all duration-500`}
                style={{
                  transform: `scale(${hoveredBtn === 'menu' ? 1.1 : 1}) rotate(${isMenuOpen ? 180 : 0}deg)`
                }} 
              />
            </button>
          </div>

          {/* Center Section - Level */}
          <div className={`hidden sm:flex items-center`}>
            <div className={`bg-white/30 text-white ${isMobileLandscape ? 'px-3 py-0.5 text-base' : 'px-6 py-1 text-lg'} rounded-full backdrop-blur shadow-[0_4px_24px_0_rgba(59,130,246,0.10)] border border-white/30 font-bold tracking-wide`}>
              Level 1
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className={`flex items-center gap-${isMobileLandscape ? '1' : '2'} sm:gap-2`}>
            <img
              src={avatar}
              alt="Player Avatar"
              className={`${isMobileLandscape ? 'w-7 h-7' : 'w-12 h-12 sm:w-12 sm:h-12 w-8 h-8'} rounded-full border-2 border-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)] object-cover`}
            />
            <span className={`text-white ${isMobileLandscape ? 'text-base' : 'text-lg'} font-medium hidden sm:inline`}>{displayName}</span>
          </div>
        </div>
      </div>
      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className={`absolute ${isMobileLandscape ? 'top-11 left-2 min-w-[12rem]' : 'top-16 left-6 min-w-[18rem]'} bg-white/95 backdrop-blur rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 z-50 overflow-hidden animate-[slide-down_0.3s]`}>
          <div className="py-2">
            <button
              onClick={() => {
                if (onHomeClick) onHomeClick();
                window.location.href = '/';
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-gray-700 bg-none border-none cursor-pointer font-medium ${isMobileLandscape ? 'text-sm' : 'text-base'} transition-all duration-200 outline-none`}
              style={{
                background: hoveredBtn === 'home' ? 'linear-gradient(to right, #eff6ff, #ede9fe)' : 'transparent',
                color: hoveredBtn === 'home' ? '#2563eb' : '#374151',
                transform: hoveredBtn === 'home' ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={() => setHoveredBtn('home')}
              onMouseOut={() => setHoveredBtn(null)}
            >
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-blue-400 to-blue-500`}>
                <Home className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <span className="font-medium">Homepage</span>
            </button>

            <button
              onClick={() => {
                if (onPlayAgain) onPlayAgain();
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-gray-700 bg-none border-none cursor-pointer font-medium ${isMobileLandscape ? 'text-sm' : 'text-base'} transition-all duration-200 outline-none`}
              style={{
                background: hoveredBtn === 'restart' ? 'linear-gradient(to right, #fef9c3, #fde68a)' : 'transparent',
                color: hoveredBtn === 'restart' ? '#f59e42' : '#b45309',
                transform: hoveredBtn === 'restart' ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={() => setHoveredBtn('restart')}
              onMouseOut={() => setHoveredBtn(null)}
            >
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-yellow-400 to-yellow-500`}>
                <RotateCcw className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <span className="font-medium">Restart Game</span>
            </button>

            <button
              onClick={handleTutorialClick}
              className={`w-full flex items-center gap-3 px-4 py-2 text-gray-700 bg-none border-none cursor-pointer font-medium ${isMobileLandscape ? 'text-sm' : 'text-base'} transition-all duration-200 outline-none`}
              style={{
                background: hoveredBtn === 'tutorial' ? 'linear-gradient(to right, #f0fdf4, #dcfce7)' : 'transparent',
                color: hoveredBtn === 'tutorial' ? '#16a34a' : '#374151',
                transform: hoveredBtn === 'tutorial' ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={() => setHoveredBtn('tutorial')}
              onMouseOut={() => setHoveredBtn(null)}
            >
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-green-400 to-green-500`}>
                <HelpCircle className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <span className="font-medium">Show Tutorial</span>
            </button>

            <div className={`flex items-center gap-3 px-4 py-2 text-gray-700 border-t border-gray-100 transition-colors duration-200 ${tutorialStep === 4 ? 'tutorial-highlight' : ''}`}> {/* Timer highlight */}
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-blue-400 to-cyan-500`}>
                <Clock className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <div className="flex flex-col">
                <span className={`${isMobileLandscape ? 'text-xs' : 'text-[0.95rem]'} font-medium`}>Timer</span>
                <span className={`${isMobileLandscape ? 'text-base' : 'text-xl'} font-bold text-blue-600`}>{formatTime(timer)}</span>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-4 py-2 text-gray-700 border-t border-gray-100 transition-colors duration-200 ${tutorialStep === 4 ? 'tutorial-highlight' : ''}`}> {/* Rows highlight */}
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-green-400 to-emerald-500`}>
                <Target className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <div className="flex flex-col">
                <span className={`${isMobileLandscape ? 'text-xs' : 'text-[0.95rem]'} font-medium`}>Rows Solved</span>
                <span className={`${isMobileLandscape ? 'text-base' : 'text-xl'} font-bold text-green-500`}>{rowsSolved}</span>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-4 py-2 text-gray-700 border-t border-gray-100 transition-colors duration-200 ${tutorialStep === 4 ? 'tutorial-highlight' : ''}`}> {/* Score highlight */}
              <div className={`flex items-center justify-center rounded-full ${isMobileLandscape ? 'w-7 h-7' : 'w-10 h-10'} bg-gradient-to-r from-amber-200 to-amber-500`}>
                <Trophy className={`${isMobileLandscape ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
              </div>
              <div className="flex flex-col">
                <span className={`${isMobileLandscape ? 'text-xs' : 'text-[0.95rem]'} font-medium`}>Score</span>
                <span className={`${isMobileLandscape ? 'text-base' : 'text-xl'} font-bold text-amber-500`}>{score}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;