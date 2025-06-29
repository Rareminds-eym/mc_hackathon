import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useDeviceLayout } from '../../hooks/useOrientation';

interface PopupProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ open, onClose, children }) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
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
            className={`relative bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-300 rounded-2xl shadow-2xl border-4 border-cyan-300 max-w-md w-full ${isMobileHorizontal ? 'py-2 px-4 rounded-lg' : 'p-6'}`}
            style={isMobileHorizontal ? { minHeight: 0, borderRadius: '0.75rem' } : {}}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }}
          >
            <button
              onClick={onClose}
              className={`absolute ${isMobileHorizontal ? 'top-1.5 right-1.5 p-0.5' : 'top-2 right-2 p-1'} z-10 rounded-full transition-all duration-200 bg-gradient-to-br from-cyan-200 via-blue-200 to-teal-100 hover:from-pink-200 hover:to-yellow-100 shadow-lg border-2 border-cyan-300/70 hover:border-pink-400/70 focus:outline-none group`}
              aria-label="Close"
              style={isMobileHorizontal ? { width: 28, height: 28 } : {}}
            >
              <span className="relative flex items-center justify-center">
                {/* Animated ring */}
                <span className={`absolute ${isMobileHorizontal ? 'w-6 h-6' : 'w-9 h-9'} rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-yellow-200/10 blur-md animate-pulse-slow z-0`}></span>
                {/* Main icon with pop and shine */}
                <span className="relative z-10 animate-pop-scale">
                  <Icon icon="mdi:close-circle" className={`${isMobileHorizontal ? 'w-4 h-4' : 'w-7 h-7'} text-cyan-700 group-hover:text-pink-500 drop-shadow-glow`} style={{filter: 'drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 16px #f472b6)'}} />
                </span>
                {/* Sparkle */}
                <span className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-bounce select-none pointer-events-none">✦</span>
              </span>
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
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  return (
    <Popup open={open} onClose={onClose}>
      <motion.div
        className={`flex flex-col items-center mx-auto justify-center text-center text-gray-900${isMobileHorizontal ? ' scale-90 max-w-[320px] px-1' : ''}`}
        style={isMobileHorizontal ? { fontSize: '0.92rem', padding: '0.5rem', alignItems: 'center', textAlign: 'center', justifyContent: 'center' } : {}}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22, duration: 0.5 }}
      >
        {/* ⭐ Stars */}
        <motion.div
          className={`relative flex items-center justify-center ${isMobileHorizontal ? ' w-[260px] h-10 mb-2 justify-center' : 'w-[600px] h-16 mb-4'}`}
          style={isMobileHorizontal ? { marginLeft: 0, justifyContent: 'center' } : {}}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 18 }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            // Arc math: angle from 120deg to 60deg (flatter upside-down arc)
            const angle = -(120 - i * 15) * (Math.PI / 180); // 120, 105, 90, 75, 60
            const radius = isMobileHorizontal ? 140 : 200;
            const centerX = isMobileHorizontal ? 130 : 300;
            const centerY = isMobileHorizontal ? 160 : 240;
            const x = centerX + radius * Math.cos(angle) - (isMobileHorizontal ? 12 : 20);
            const y = centerY + radius * Math.sin(angle) - (isMobileHorizontal ? 12 : 20);
            return (
              <motion.span
                key={i}
                className={`absolute text-yellow-400${isMobileHorizontal ? ' text-2xl' : ' text-4xl'}`}
                style={{ left: `${x}px`, top: `${y}px` }}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
              >
                ⭐
              </motion.span>
            );
          })}
        </motion.div>
        {/* 🎉 Message */}
        <motion.h2
          className={`text-3xl font-extrabold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] mb-1${isMobileHorizontal ? ' text-xl mb-0 w-full' : ''}`}
          style={isMobileHorizontal ? { textAlign: 'center', width: '100%' } : {}}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 18 }}
        >
          Well Done!
        </motion.h2>
        {/* 🧑‍🔬 Character + 🦜 Bird */}
        <motion.div
          className={`relative w-full flex justify-center items-center mb-3 py-5${isMobileHorizontal ? ' py-2 mb-1 justify-center' : ''}`}
          style={isMobileHorizontal ? { justifyContent: 'center' } : {}}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
        >
          <motion.img
            src="/characters/worker.webp"
            alt="Worker Character"
            className={`object-contain${isMobileHorizontal ? ' w-[180px]' : ' w-[200px]'}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 18 }}
          />
        </motion.div>
        {/* 🔘 Buttons */}
        <motion.div
          className={`flex justify-center gap-4 w-full mt-2${isMobileHorizontal ? ' gap-2 mt-1 justify-center' : ''}`}
          style={isMobileHorizontal ? { justifyContent: 'center' } : {}}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, type: 'spring', stiffness: 180, damping: 18 }}
        >
          <button
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 flex items-center gap-2${isMobileHorizontal ? ' py-1 px-2 text-xs' : ''}`}
            onClick={() => alert('Retry Level')}
          >
            <Icon icon="mdi:restart" className={`w-6 h-6${isMobileHorizontal ? ' w-4 h-4' : ''}`} />
            Retry
          </button>
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-transform transform hover:scale-105 flex items-center gap-2${isMobileHorizontal ? ' py-1 px-3 text-xs' : ''}`}
            onClick={onClose}
          >
            <Icon icon="mdi:arrow-right-bold-circle" className={`w-6 h-6${isMobileHorizontal ? ' w-4 h-4' : ''}`} />
            Next
          </button>
          <button
            className={`bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform transform hover:scale-105 flex items-center gap-2${isMobileHorizontal ? ' py-1 px-2 text-xs' : ''}`}
            onClick={() => alert('Open Map')}
          >
            <Icon icon="mdi:map-marker-radius" className={`w-6 h-6${isMobileHorizontal ? ' w-4 h-4' : ''}`} />
            Map
          </button>
        </motion.div>
      </motion.div>
    </Popup>
  );
};
