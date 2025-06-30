import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ open, onClose, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl shadow-2xl p-6 max-w-md w-full border-4 border-yellow-300"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-yellow-700 hover:text-red-500 text-2xl font-bold focus:outline-none z-10"
              aria-label="Close"
            >
              ×
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface VictoryPopupProps {
  open: boolean;
  onClose: () => void;
  score: number;
  combo: number;
  health: number;
}

export const VictoryPopup: React.FC<VictoryPopupProps> = ({ open, onClose, score }) => {
  return (
    <Popup open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center text-gray-900">
        {/* ⭐ Stars */}
        <div className="relative w-[600px] h-36 mb-4 flex items-center justify-center">
          {[0, 1, 2, 3, 4].map((i) => {
            // Arc math: angle from 120deg to 60deg (flatter upside-down arc)
            const angle = -(120 - i * 15) * (Math.PI / 180); // 120, 105, 90, 75, 60
            const radius = 200; // px, even larger for more spacing
            const centerX = 300; // half of w-600px
            const centerY = 240; // vertical center
            const x = centerX + radius * Math.cos(angle) - 20;
            const y = centerY + radius * Math.sin(angle) - 20;
            return (
              <span
                key={i}
                className="absolute text-yellow-400 text-4xl"
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                ⭐
              </span>
            );
          })}
        </div>

        {/* 🎉 Message */}
        <h2 className="text-3xl font-extrabold text-orange-500 drop-shadow-lg mb-1 animate-fade-in">
          Well Done!
        </h2>

        {/* 🧑‍🔬 Character + 🦜 Bird */}
        <div className="relative w-full h-32 flex justify-center items-center mb-3">
          <img
            src="/assets/character.png" // Replace with correct path or character render
            alt="Scientist Character"
            className="w-24 h-24 object-contain"
          />
          <img
            src="/assets/parrot.png" // Replace with correct path or bird render
            alt="Blue Parrot"
            className="w-24 h-24 object-contain -ml-6"
          />
        </div>

        {/* 💰 Coins */}
        <div className="bg-yellow-100 rounded-full px-6 py-2 text-xl font-bold text-yellow-700 flex items-center justify-center shadow-md mb-4 animate-pop-in">
          <span className="mr-2 text-2xl">🪙</span> {score}
        </div>

        {/* 🔘 Buttons */}
        <div className="flex justify-center gap-4 w-full mt-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105"
            onClick={() => alert('Retry Level')}
          >
            🔄 Retry
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-transform transform hover:scale-105"
            onClick={onClose}
          >
            ▶️ Next
          </button>
          <button
            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105"
            onClick={() => alert('Open Map')}
          >
            🗺️ Map
          </button>
        </div>
      </div>
    </Popup>
  );
};
