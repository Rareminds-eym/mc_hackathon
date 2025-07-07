import React, { useState } from "react";
import logo from "../../public/logos/bulb.png";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useDeviceLayout } from '../hooks/useOrientation';

// Mock images for levels
const levelImages = [
  "/backgrounds/Bingo.png",
  "/levels/level2.png",
  "/levels/level3.png",
  "/levels/level4.png",
  "/levels/level5.png",
  "/levels/level6.png",
];

const levels = [
  {
    title: "Level 1: Memory Challenge",
    objective: "Identify and recall key terms",
    bloom: "Remembering",
    format: "Bingo / Taboo / Flashcard Race",
    interface: "Interactive Games",
    description: "Get familiar with essential terminology through fast-paced memory games. Match terms, shout out answers, and race against time to build your foundational knowledge.",
    icon: "🧠"
  },
  {
    title: "Level 2: Sorting Challenge",
    objective: "Group terms by function",
    bloom: "Understanding",
    format: "Category Matching",
    interface: "Drag & Drop",
    description: "Test your comprehension by organizing terms into their proper categories. Think fast and sort accurately to unlock the next level!",
    icon: "🗂️"
  },
  {
    title: "Level 3: Process Puzzle",
    objective: "Arrange steps in order",
    bloom: "Applying",
    format: "Flow Chart Builder",
    interface: "Jigsaw Puzzle",
    description: "Put processes in motion by arranging steps in the correct sequence. Solve the puzzle to demonstrate you can apply what you've learned.",
    icon: "🧩"
  },
  {
    title: "Level 4: Detective Mode",
    objective: "Spot problems in scenarios",
    bloom: "Analyzing",
    format: "Gap Identification",
    interface: "Document Review",
    description: "Put on your detective hat! Examine scenarios closely to identify what's missing or incorrect. Your sharp eyes will uncover hidden issues.",
    icon: "🔍"
  },
  {
    title: "Level 5: Design Challenge",
    objective: "Create quality solutions",
    bloom: "Evaluating",
    format: "Process Design",
    interface: "Interactive Builder",
    description: "Design and evaluate quality systems from scratch. Build comprehensive solutions that meet regulatory standards and optimize manufacturing processes.",
    icon: "⚙️"
  },
  {
    title: "Level 6: Innovation Lab",
    objective: "Develop new methodologies",
    bloom: "Creating",
    format: "Research & Development",
    interface: "Simulation Platform",
    description: "Push the boundaries of quality management! Create innovative approaches, develop new methodologies, and pioneer the future of manufacturing excellence.",
    icon: "🚀"
  },
];

// Color arrays for level backgrounds and borders
const levelColors = [
  'bg-cyan-700/60', // Level 1 (core)
  'bg-cyan-700/60', // Level 2 (core)
  'bg-cyan-700/60', // Level 3 (core)
  'bg-purple-800/60', // Level 4 (advanced)
  'bg-purple-800/60', // Level 5 (advanced, if added)
  'bg-purple-800/60', // Level 6 (advanced, if added)
];
const levelBorderColors = [
  'border-cyan-300', // Level 1 (core)
  'border-cyan-300', // Level 2 (core)
  'border-cyan-300', // Level 3 (core)
  'border-purple-300', // Level 4 (advanced)
  'border-purple-300', // Level 5 (advanced, if added)
  'border-purple-300', // Level 6 (advanced, if added)
];

const InstructionsPage: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isMobile, isHorizontal } = useDeviceLayout();
  // Detect mobile (simple check, can be improved)
  // Determine which levels to show
  const visibleLevels = showAdvanced ? levels.slice(3, 6) : levels.slice(0, 3);
  const visibleLevelImages = showAdvanced ? levelImages.slice(3, 6) : levelImages.slice(0, 3);
  // Map selected index to correct level in visibleLevels
  const selectedIdx = showAdvanced ? selected - 3 : selected;
  // Only allow selection of visible levels
  const handleSelect = (i: number) => {
    if (showAdvanced) setSelected(i + 3);
    else setSelected(i);
  };

  // Landscape mode for mobile: stack images horizontally, instructions below
  if (isMobile && isHorizontal) {
    return (
      <div className="relative min-h-screen w-full text-white overflow-hidden p-4">
        {/* Cosmic Planets & Stars Background from ModuleMap */}
        <div className="absolute inset-0 z-0">
          {/* Dark base gradient for space */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-800" />
          {/* Large planet */}
          <div
            className="absolute rounded-full opacity-30 blur-md bg-gradient-to-br from-cyan-400 to-blue-600"
            style={{ width: "24rem", height: "24rem", right: "10%", top: "20%", transform: "translate(50%, -50%)" }}
          />
          {/* Smaller celestial body */}
          <div
            className="absolute rounded-full opacity-40 bg-gradient-to-br from-purple-400 to-pink-500"
            style={{ width: "8rem", height: "8rem", left: "15%", top: "15%" }}
          />
          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  opacity: 1,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`,
                }}
              />
            ))}
          </div>
          {/* Floating space particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-cyan-300 rounded-full opacity-60"
                style={{
                  width: "4px",
                  height: "4px",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 15 + 15}s infinite linear`,
                  animationDelay: `${Math.random() * 15}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 flex flex-row w-full min-h-screen">
          {/* Left Vertical Bar - sticky from the very top */}
          <div className="flex flex-col justify-between items-center bg-slate-800/60 w-16 py-4 min-h-screen fixed left-0 top-0 z-20 backdrop-blur-sm" style={{height: '100vh'}}>
            <img src={logo} alt="Logo" className="w-8 h-8 mb-6" />
            <div className="flex flex-col gap-4 flex-1">
              {visibleLevels.map((_, i) => (
                <button
                  key={i}
                  className={`font-bold text-base rounded-full px-1 py-1 transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedIdx === i ? 'text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 shadow-lg scale-110' : 'text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 opacity-70 hover:opacity-100'}`}
                  onClick={() => handleSelect(i)}
                  aria-label={`Show Level 0${showAdvanced ? i + 4 : i + 1}`}
                  style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(0deg)', letterSpacing: '0.2em', minHeight: '60px', minWidth: '24px' }}
                >
                  {`0${showAdvanced ? i + 4 : i + 1}`}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-white bg-gradient-to-r from-cyan-600 to-emerald-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200 p-1 rounded-full"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? "▲" : "▼"}
            </button>
          </div>
          {/* Main Content shifted right to accommodate fixed navbar */}
          <div className="flex-1 ml-16 flex flex-col min-h-screen">
            {/* Header */}
            <motion.h1
              className={`relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center tracking-widest select-none ${
                isMobile ? " text-2xl mb-2" : "mb-10"
              }`}
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
            >
              <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg mr-2">
                <Icon icon="mdi:cube-outline" width={38} height={38} />
              </span>
              <span
                className="bg-gradient-to-r from-green-300 via-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg shadow-green-200 px-2 rounded-lg border-b-4 border-green-400"
                style={{
                  WebkitTextStroke: '2px #064e3b',
                  filter: 'drop-shadow(0 2px 4px #34d399)'
                }}
              >
                GMP QUEST
              </span>
              <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg ml-2" style={{ animationDelay: '0.2s' }}>
                <Icon icon="mdi:clipboard-check-outline" width={38} height={38} />
              </span>
              <span className="block text-base md:text-lg font-semibold text-emerald-200 mt-2 tracking-normal animate-fade-in-slow">
                Embark on your adventure!
              </span>
            </motion.h1>
            <div className="flex flex-col items-center w-full gap-4 mt-4">
              {/* Horizontal Images Row */}
              <div className="flex flex-row gap-4 w-full justify-center">
                {visibleLevels.map((level, i) => (
                  <div
                    key={level.title}
                    className={`${i === 0 ? 'w-36 h-28' : 'w-32 h-24'} flex-shrink-0 rounded-lg overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer \
                      ${levelBorderColors[showAdvanced ? i + 3 : i]} \
                      ${levelColors[showAdvanced ? i + 3 : i]} \
                      ${selectedIdx === i ? 'ring-4 scale-105 z-10 bg-white/10' : 'opacity-50 blur-[2px]'}
                    `}
                    onClick={() => handleSelect(i)}
                  >
                    <img
                      src={visibleLevelImages[i]}
                      alt={level.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Instructions below */}
              <div className="max-w-lg w-full bg-white/5 rounded-lg p-4 border-l-4 border-yellow-200/40 shadow-lg backdrop-blur-md mt-2 mx-auto">
                <h2 className="text-lg font-bold text-yellow-100 mb-1">{levels[selected].title}</h2>
                <p className="text-xs text-slate-100 mb-1">
                  <span className="font-semibold">Bloom:</span> {levels[selected].bloom}
                </p>
                <p className="text-xs text-slate-200 mb-2">
                  <span className="font-semibold">Objective:</span> {levels[selected].objective}
                </p>
                <p className="text-xs text-slate-200 italic mb-4">{levels[selected].description}</p>
                {selected === 0 && (
                  <div className="mt-2 text-xs text-yellow-100 space-y-2">
                    <div>
                      <span className="font-bold text-yellow-200">Score:</span> Earn points for each correct answer. Your score increases as you correctly identify terms on the bingo grid.
                    </div>
                    <div>
                      <span className="font-bold text-yellow-200">Timer:</span> Complete the game before the timer runs out! The faster you finish, the higher your bonus.
                    </div>
                    <div>
                      <span className="font-bold text-yellow-200">Completed Lines:</span> Form a line (horizontal, vertical, or diagonal) by marking correct answers. Each completed line brings you closer to Bingo!
                    </div>
                    <div>
                      <span className="font-bold text-yellow-200">Bingo Grid:</span> The grid contains key terms. Listen to the definition or clue, then click the matching term on your grid.
                    </div>
                    <div>
                      <span className="font-bold text-yellow-200">Definitions:</span> Each round, a definition or clue is read aloud. Match it to the correct term to mark your grid.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative text-center">
          <p className="text-sm text-slate-300 opacity-75">
            <span className="block text-xs sm:text-sm">
              © 2025 Rareminds. All rights reserved.
            </span>
          </p>
        </div>
        
        <style>{`
          @keyframes float {
            from { transform: translateY(100vh) rotate(0deg); }
            to { transform: translateY(-100px) rotate(360deg); }
          }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden p-16">
      {/* Cosmic Planets & Stars Background from ModuleMap */}
      <div className="absolute inset-0 z-0">
        {/* Dark base gradient for space */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-800" />
        {/* Large planet */}
        <div
          className="absolute rounded-full opacity-30 blur-md bg-gradient-to-br from-cyan-400 to-blue-600"
          style={{ width: "24rem", height: "24rem", right: "10%", top: "20%", transform: "translate(50%, -50%)" }}
        />
        {/* Smaller celestial body */}
        <div
          className="absolute rounded-full opacity-40 bg-gradient-to-br from-purple-400 to-pink-500"
          style={{ width: "8rem", height: "8rem", left: "15%", top: "15%" }}
        />
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                opacity: 1,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
        {/* Floating space particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-cyan-300 rounded-full opacity-60"
              style={{
                width: "4px",
                height: "4px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 15}s infinite linear`,
                animationDelay: `${Math.random() * 15}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Main Content (above background) */}
      <div className="relative z-10 flex flex-1 w-full pl-4">
        {/* Left Vertical Bar - sticky from the very top */}
        <div className="flex flex-col justify-between items-center bg-slate-800/60 w-20 py-8 min-h-screen fixed left-0 top-0 z-20 backdrop-blur-sm " style={{height: '100vh' }}>
          <img src={logo} alt="Logo" className="w-10 h-10 mb-8" />
          <div className="flex flex-col gap-6 flex-1">
            {visibleLevels.map((_, i) => (
              <button
                key={i}
                className={`font-bold text-lg rounded-full px-2 py-1 transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedIdx === i ? 'text-white bg-gradient-to-r from-green-400 to-emerald-600 shadow-lg scale-110' : 'text-white bg-gradient-to-r from-green-400 to-emerald-600 hover:from-blue-700 hover:to-purple-700 opacity-70 hover:opacity-100'}`}
                onClick={() => handleSelect(i)}
                aria-label={`Show Level 0${showAdvanced ? i + 4 : i + 1}`}
                style={!isMobile ? { writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(0deg)', letterSpacing: '0.2em', minHeight: '90px', minWidth: '32px' } : {}}
              >
                {!isMobile ? `LEVEL 0${showAdvanced ? i + 4 : i + 1}` : `0${showAdvanced ? i + 4 : i + 1}`}
              </button>
            ))}
          </div>
          <button
            className="mt-6 text-white bg-gradient-to-r from-green-400 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200 p-2 rounded-full"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "▲" : "▼"}
          </button>
        </div>
        {/* Main Content shifted right to accommodate fixed navbar */}
        <div className="flex-1 ml-20 flex flex-col min-h-screen">
          {/* Horizontal Header */}
          <motion.h1
            className={`relative text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center tracking-widest select-none ${
              isMobile ? " text-2xl mb-2" : "mb-10"
            }`}
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
          >
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg mr-2">
              <Icon icon="mdi:cube-outline" width={38} height={38} />
            </span>
            <span
              className="bg-gradient-to-r from-green-300 via-emerald-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg shadow-green-200 px-2 rounded-lg border-b-4 border-green-400"
              style={{
                WebkitTextStroke: '2px #064e3b',
                filter: 'drop-shadow(0 2px 4px #34d399)'
              }}
            >
              Instructions
            </span>
            <span className="inline-block animate-bounce text-emerald-300 drop-shadow-lg ml-2" style={{ animationDelay: '0.2s' }}>
              <Icon icon="mdi:clipboard-check-outline" width={38} height={38} />
            </span>
            <span className="block text-base md:text-lg font-semibold text-emerald-200 mt-2 tracking-normal animate-fade-in-slow">
              Embark on your adventure!
            </span>
          </motion.h1>
          {/* Main Content: Vertical Images + Instructions */}
          <div className="flex flex-row justify-start items-start gap-16 w-full pl-8">
            {/* Vertical Images Column */}
            <div className="flex flex-col gap-8 items-center mt-0">
              {visibleLevels.map((level, i) => (
                <div
                  key={level.title}
                  className={`${selectedIdx === i ? 'w-72 h-48' : (i === 0 ? 'w-72 h-48' : 'w-64 h-40')} flex-shrink-0 rounded-lg overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer 
                    ${levelBorderColors[showAdvanced ? i + 3 : i]} 
                    ${levelColors[showAdvanced ? i + 3 : i]} 
                    ${selectedIdx === i ? 'ring-4 scale-105 z-10 bg-white/10' : 'opacity-50 blur-[2px]'}
                  `}
                  onClick={() => handleSelect(i)}
                >
                  <img
                    src={visibleLevelImages[i]}
                    alt={level.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Single Instructions Container */}
            <div className="max-w-3xl w-full bg-white/5 rounded-lg p-6 border-l-4 border-yellow-200/40 shadow-lg backdrop-blur-md mt-4 min-h-[500px]">
              <h2 className="text-xl font-bold text-yellow-100 mb-1">{levels[selected].title}</h2>
              <p className="text-sm text-slate-100 mb-1">
                <span className="font-semibold">Bloom:</span> {levels[selected].bloom}
              </p>
              <p className="text-sm text-slate-200 mb-2">
                <span className="font-semibold">Objective:</span> {levels[selected].objective}
              </p>
              <p className="text-xs text-slate-200 italic mb-4">{levels[selected].description}</p>
              {selected === 0 && (
                <div className="mt-2 text-sm text-yellow-100 space-y-2">
                  <div>
                    <span className="font-bold text-yellow-200">Score:</span> Earn points for each correct answer. Your score increases as you correctly identify terms on the bingo grid.
                  </div>
                  <div>
                    <span className="font-bold text-yellow-200">Timer:</span> Complete the game before the timer runs out! The faster you finish, the higher your bonus.
                  </div>
                  <div>
                    <span className="font-bold text-yellow-200">Completed Lines:</span> Form a line (horizontal, vertical, or diagonal) by marking correct answers. Each completed line brings you closer to Bingo!
                  </div>
                  <div>
                    <span className="font-bold text-yellow-200">Bingo Grid:</span> The grid contains key terms. Listen to the definition or clue, then click the matching term on your grid.
                  </div>
                  <div>
                    <span className="font-bold text-yellow-200">Definitions:</span> Each round, a definition or clue is read aloud. Match it to the correct term to mark your grid.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-center mt-8 pb-6">
        <p className="text-sm text-slate-300 opacity-75">
          <span className="block text-xs sm:text-sm">
            © 2025 Rareminds. All rights reserved.
          </span>
        </p>
      </div>
      
      <style>{`
        @keyframes float {
          from { transform: translateY(100vh) rotate(0deg); }
          to { transform: translateY(-100px) rotate(360deg); }
        }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default InstructionsPage;
