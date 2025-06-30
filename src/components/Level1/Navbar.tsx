import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Home, Clock, Trophy, Target, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

interface NavbarProps {
  score: number;
  rowsSolved: number;
  onBackClick: () => void;
  onHomeClick: () => void;
  onResetTutorial: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ score, rowsSolved, onBackClick, onHomeClick, onResetTutorial }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from AuthContext

  // Get avatar from localStorage, fallback to Intern1
  const avatar = localStorage.getItem("selectedAvatar") || "/characters/Intern1.png";

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <nav className="bg-white/30 backdrop-blur-xl shadow-[0_4px_24px_0_rgba(0,0,0,0.10)] border-b border-white/30 relative z-50">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="flex justify-between items-center h-12">
          {/* Left Section - Back and Menu Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onBackClick) onBackClick();
                window.history.back();
              }}
              className="flex items-center justify-center w-10 h-10 text-white bg-transparent border-none rounded-full p-2 cursor-pointer transition-all duration-300 outline-none"
              onMouseOver={() => setHoveredBtn('back')}
              onMouseOut={() => setHoveredBtn(null)}
              style={{
                color: hoveredBtn === 'back' ? '#bfdbfe' : '#fff',
                background: hoveredBtn === 'back' ? 'rgba(255,255,255,0.20)' : 'transparent'
              }}
            >
              <ArrowLeft className="w-6 h-6 transition-all duration-300" 
                style={{
                  transform: hoveredBtn === 'back' ? 'scale(1.1) translateX(-4px)' : 'none'
                }} 
              />
            </button>
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center w-10 h-10 text-white bg-transparent border-none rounded-full p-2 cursor-pointer transition-all duration-300 outline-none"
              onMouseOver={() => setHoveredBtn('menu')}
              onMouseOut={() => setHoveredBtn(null)}
              style={{
                color: hoveredBtn === 'menu' ? '#bfdbfe' : '#fff',
                background: hoveredBtn === 'menu' ? 'rgba(255,255,255,0.20)' : 'transparent'
              }}
            >
              <Menu className="w-6 h-6 transition-all duration-500" 
                style={{
                  transform: `scale(${hoveredBtn === 'menu' ? 1.1 : 1}) rotate(${isMenuOpen ? 180 : 0}deg)`
                }} 
              />
            </button>
          </div>

          {/* Center Section - Level */}
          <div className="flex items-center">
            <div className="bg-white/30 text-white px-6 py-1 rounded-full backdrop-blur shadow-[0_4px_24px_0_rgba(59,130,246,0.10)] border border-white/30 font-bold text-lg tracking-wide">
              Level 1
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex items-center gap-2">
              <img
                src={avatar}
                alt="Player Avatar"
                className="w-12 h-12 rounded-full border-2 border-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)] object-cover"
              />
              <span className="text-white text-lg font-medium">{displayName}</span>
            </div>
          </div>
        </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-6 bg-white/95 backdrop-blur rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 z-50 overflow-hidden min-w-[18rem] animate-[slide-down_0.3s]">
          <div className="py-3">
            <button
              onClick={() => {
                if (onHomeClick) onHomeClick();
                window.location.href = '/';
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 bg-none border-none cursor-pointer font-medium text-base transition-all duration-200 outline-none"
              style={{
                background: hoveredBtn === 'home' ? 'linear-gradient(to right, #eff6ff, #ede9fe)' : 'transparent',
                color: hoveredBtn === 'home' ? '#2563eb' : '#374151',
                transform: hoveredBtn === 'home' ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={() => setHoveredBtn('home')}
              onMouseOut={() => setHoveredBtn(null)}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Homepage</span>
            </button>

            <button
              onClick={handleTutorialClick}
              className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 bg-none border-none cursor-pointer font-medium text-base transition-all duration-200 outline-none"
              style={{
                background: hoveredBtn === 'tutorial' ? 'linear-gradient(to right, #f0fdf4, #dcfce7)' : 'transparent',
                color: hoveredBtn === 'tutorial' ? '#16a34a' : '#374151',
                transform: hoveredBtn === 'tutorial' ? 'translateX(8px)' : 'none'
              }}
              onMouseOver={() => setHoveredBtn('tutorial')}
              onMouseOut={() => setHoveredBtn(null)}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">Show Tutorial</span>
            </button>

            <div className="flex items-center gap-4 px-6 py-4 text-gray-700 border-t border-gray-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.95rem] font-medium">Timer</span>
                <span className="text-xl font-bold text-blue-600">{formatTime(timer)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 text-gray-700 border-t border-gray-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.95rem] font-medium">Rows Solved</span>
                <span className="text-xl font-bold text-green-500">{rowsSolved}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 text-gray-700 border-t border-gray-100 transition-colors duration-200">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-200 to-amber-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.95rem] font-medium">Score</span>
                <span className="text-xl font-bold text-amber-500">{score}</span>
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