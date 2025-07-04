import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  showNext?: boolean;
  hideClose?: boolean;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  showNext,
  hideClose = false,
  children,
}) => {
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
            className={`relative overflow-visible max-w-md w-full shadow-2xl rounded-2xl ${
              isMobileHorizontal
                ? "py-1 px-2 rounded-lg max-w-[90vw] w-[320px] min-h-[120px] border-4 border-cyan-300/80"
                : "p-6 border-4 border-cyan-300/80"
            }`}
            style={{
              background: `url('/backgrounds/BingoBg3.jpg'), linear-gradient(135deg, rgba(255,255,255,0.18) 60%, rgba(200,240,255,0.10) 100%)`,
              backgroundSize: isMobileHorizontal
                ? "cover, cover"
                : "cover, cover",
              backgroundPosition: "center, center",
              backgroundRepeat: "no-repeat, no-repeat",
              borderRadius: isMobileHorizontal ? "0.75rem" : "1rem",
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
              padding: isMobileHorizontal ? "0.5rem 0.75rem" : undefined,
              maxWidth: isMobileHorizontal ? "90vw" : undefined,
              width: isMobileHorizontal ? "320px" : undefined,
              minHeight: isMobileHorizontal ? "120px" : undefined,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4,
            }}
          >
            {/* Optional: Soft overlay for extra contrast */}
            <div
              className="absolute inset-0 z-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.12) 60%, rgba(200,240,255,0.10) 100%)",
                borderRadius: isMobileHorizontal ? "0.75rem" : "1rem",
                mixBlendMode: "lighten",
              }}
            />
            {/* Hide close button if hideClose is true */}
            {!hideClose && (
              <button
                onClick={onClose}
                className={`absolute ${
                  isMobileHorizontal
                    ? "top-1.5 right-1.5 p-0.5"
                    : "top-2 right-2 p-1"
                } z-10 rounded-full transition-all duration-200 bg-gradient-to-br from-cyan-200 via-blue-200 to-teal-100 hover:from-pink-200 hover:to-yellow-100 shadow-lg border-2 border-cyan-300/70 hover:border-pink-400/70 focus:outline-none group`}
                aria-label="Close"
                style={isMobileHorizontal ? { width: 28, height: 28 } : {}}
              >
                <span className="relative flex items-center justify-center">
                  {/* Animated ring */}
                  <span
                    className={`absolute ${
                      isMobileHorizontal ? "w-6 h-6" : "w-9 h-9"
                    } rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-300/20 to-yellow-200/10 blur-md animate-pulse-slow z-0`}
                  ></span>
                  {/* Main icon with pop and shine */}
                  <span className="relative z-10 animate-pop-scale">
                    <Icon
                      icon="mdi:close-circle"
                      className={`$${
                        isMobileHorizontal ? "w-4 h-4" : "w-7 h-7"
                      } text-cyan-700 group-hover:text-pink-500 drop-shadow-glow`}
                      style={{
                        filter:
                          "drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 16px #f472b6)",
                      }}
                    />
                  </span>
                  {/* Sparkle */}
                  <span className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-bounce select-none pointer-events-none">
                    ✦
                  </span>
                </span>
              </button>
            )}
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
  showNext?: boolean;
  showGoToModules?: boolean;
  showReset?: boolean;
  onReset?: () => void;
  moduleId?: string;
}

export const VictoryPopup: React.FC<VictoryPopupProps> = ({
  open,
  onClose,
  showNext = false,
  showGoToModules = true,
  showReset = false,
  onReset,
  moduleId,
}) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const navigate = useNavigate();

  // Handler for Go to Levels
  const handleGoToLevels = useCallback(() => {
    let id = moduleId;
    if (!id) {
      const match = window.location.pathname.match(/modules\/(\w+)/);
      id = match ? match[1] : "";
    }
    if (id) {
      navigate(`/modules/${id}`);
    } else {
      navigate("/modules");
    }
  }, [moduleId, navigate]);

  // Handler for Next
  const handleNext = useCallback(() => {
    onClose(); // Parent handles scenario change
  }, [onClose]);
  
  // Handler for Reset
  const handleReset = useCallback(() => {
    if (onReset) onReset();
  }, [onReset]);

  return (
    <Popup open={open} onClose={onClose} showNext={showNext} hideClose={showReset}>
      <motion.div
        className={`flex flex-col items-center mx-auto justify-center text-center text-gray-900${
          isMobileHorizontal ? " scale-90 max-w-[320px] px-1" : ""
        }`}
        style={
          isMobileHorizontal
            ? {
                fontSize: "0.92rem",
                padding: "0.5rem",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }
            : { gap: "0.7rem" }
        }
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 22,
          duration: 0.5,
        }}
      >
        {/* ⭐ Stars */}
        <motion.div
          className={`relative flex items-center justify-center w-full ${
            isMobileHorizontal
              ? " w-[260px] h-8 mb-1 justify-center"
              : " h-14 mb-2"
          }`}
          style={
            isMobileHorizontal
              ? { marginLeft: 0, justifyContent: "center" }
              : { margin: "0 auto", justifyContent: "center" }
          }
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            // Arc math: angle from 120deg to 60deg (flatter upside-down arc)
            const angle = -(120 - i * 15) * (Math.PI / 180); // 120, 105, 90, 75, 60
            const radius = isMobileHorizontal ? 140 : 200;
            const centerX = isMobileHorizontal ? 130 : 300;
            const centerY = isMobileHorizontal ? 160 : 240;
            const x =
              centerX +
              radius * Math.cos(angle) -
              (isMobileHorizontal ? 12 : 20);
            const y =
              centerY +
              radius * Math.sin(angle) -
              (isMobileHorizontal ? 12 : 20);
            return (
              <motion.span
                key={i}
                className={`absolute text-yellow-400${
                  isMobileHorizontal ? " text-2xl" : " text-4xl"
                }`}
                style={{
                  left: isMobileHorizontal
                    ? `${x}px`
                    : `calc(50% + ${x - 300}px)`,
                  top: `${y}px`,
                  filter:
                    "drop-shadow(0 0 3px #fde68a) drop-shadow(0 0 6px #fbbf24)",
                }}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2 + i * 0.07,
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
              >
                ⭐
              </motion.span>
            );
          })}
        </motion.div>
        {/* 🎉 Message */}
        <motion.h2
          className={`text-xl font-extrabold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] mb-1 mt-2 ${
            isMobileHorizontal ? " text-sm mb-0 w-full" : ""
          }`}
          style={{
            ...(isMobileHorizontal
              ? { textAlign: "center", width: "100%", marginBottom: 0 }
              : { marginBottom: "0.2rem" }),
            display: "block",
            width: "100%",
            position: "relative",
            pointerEvents: "none",
            overflow: "visible",
          }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.45,
            type: "spring",
            stiffness: 200,
            damping: 18,
          }}
        >
          <svg
            style={{
              maxHeight: isMobileHorizontal ? "60px" : "110px",
              marginLeft: "auto",
              marginRight: "auto",
              width: isMobileHorizontal ? "120px" : "170.99999999999997px",
              height: isMobileHorizontal ? "26px" : "36.86648501362398px",
            }}
            aria-label="Well Done!"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="62.099999999999994 0 170.99999999999997 36.86648501362398"
            width={isMobileHorizontal ? 120 : 170.99999999999997}
            height={isMobileHorizontal ? 26 : 36.86648501362398}
          >
            <defs>
              <linearGradient y2="0" x2="1" y1="0" x1="0" id="wellDoneGradient">
                <stop stopColor="#fbbf24" offset="30%" />
                <stop stopColor="#f472b6" offset="70%" />
              </linearGradient>
              <filter
                height="140%"
                width="140%"
                y="-20%"
                x="-20%"
                id="wellDoneShadow"
              >
                <feDropShadow
                  floodOpacity="0.25"
                  floodColor="#000"
                  stdDeviation="3"
                  dy="2"
                  dx="0"
                />
              </filter>
            </defs>
            <path
              fill="transparent"
              d="M 40 70 Q 150 -40 260 70"
              id="arcPath"
            />
            <text
              letterSpacing="0.04em"
              filter="url(#wellDoneShadow)"
              strokeWidth="1"
              stroke="#fff"
              fill="url(#wellDoneGradient)"
              fontSize="18"
              fontWeight="500"
              fontFamily="inherit"
            >
              <textPath
                alignmentBaseline="middle"
                textAnchor="middle"
                startOffset="50%"
                href="#arcPath"
              >
                Well Done!
              </textPath>
            </text>
            <path fill="transparent" d="M 40 50 Q 150 10 260 50" id="arcPath" />
          </svg>
        </motion.h2>
        {/* 🧑‍🔬 Character */}
        <motion.div
          className={`relative w-full flex justify-center items-center mb-2 py-3${
            isMobileHorizontal ? " py-1 mb-0 justify-center" : ""
          }`}
          style={isMobileHorizontal ? { justifyContent: "center" } : {}}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        >
          <motion.img
            src="/characters/worker.webp"
            alt="Worker Character"
            className={`object-contain${
              isMobileHorizontal ? " w-[180px]" : " w-[200px]"
            }`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.7,
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
          />
        </motion.div>
        {/* 🔘 Gamified Buttons */}
        <motion.div
          className={`flex justify-center gap-4 w-full mt-2${
            isMobileHorizontal ? " gap-2 mt-1 justify-center" : ""
          }`}
          style={isMobileHorizontal ? { justifyContent: "center" } : {}}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 1.0,
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
        >
          {showGoToModules && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-[6px] opacity-80 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[4px]" : ""
                }`} 
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2s infinite ease-in-out",
                }}
              />
              
              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(0,100,0,0.5),0_0_12px_rgba(34,197,94,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(0,100,0,0.5)] ${
                  isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                }`}
                onClick={handleGoToLevels}
                aria-label="Back to Levels"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>
                
                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}></div>
                    <Icon
                      icon="mdi:home-map-marker"
                      className={`w-5 h-5 drop-shadow-glow${isMobileHorizontal ? " w-4 h-4" : ""}`}
                    />
                  </div>
                  <span className="whitespace-nowrap">Back to Levels</span>
                </div>
                
                {/* Particle effects - only shown on hover */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`particle-${i}`}
                      className="absolute w-1 h-1 rounded-full bg-white opacity-0 group-hover:animate-particle-float"
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        top: "100%",
                        animationDelay: `${Math.random() * 1.5}s`
                      }}
                    ></div>
                  ))}
                </div>
              </button>
            </motion.div>
          )}
          
          {showNext && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-[6px] opacity-80 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[4px]" : ""
                }`} 
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2s infinite ease-in-out alternate-reverse",
                }}
              />
              
              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(0,42,100,0.5),0_0_12px_rgba(59,130,246,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(0,42,100,0.5)] ${
                  isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                }`}
                onClick={handleNext}
                aria-label="Next"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>
                
                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  <span className="whitespace-nowrap">Next</span>
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}></div>
                    <Icon
                      icon="mdi:arrow-right-bold"
                      className={`w-5 h-5 drop-shadow-glow${isMobileHorizontal ? " w-4 h-4" : ""}`}
                    />
                  </div>
                </div>
                
                {/* Arrow trail effect - only shown on hover */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`arrow-${i}`}
                      className="absolute h-2 w-4 right-0 bg-white opacity-0 group-hover:animate-arrow-trail"
                      style={{ 
                        top: '50%',
                        transform: 'translateY(-50%)',
                        animationDelay: `${i * 0.15}s`
                      }}
                    ></div>
                  ))}
                </div>
              </button>
            </motion.div>
          )}
          
          {showReset && onReset && (
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button shadow/glow effect */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur-[6px] opacity-80 -z-10 scale-105${
                  isMobileHorizontal ? " blur-[4px]" : ""
                }`} 
                style={{
                  transform: "translateY(2px)",
                  animation: "pulse-subtle 2.5s infinite ease-in-out",
                }}
              />
              
              {/* Main button */}
              <button
                className={`group relative bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-white font-bold rounded-lg 
                  flex items-center gap-1 px-3 py-2 overflow-hidden transition-all duration-200 active:translate-y-[2px] 
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.2),0_4px_0_rgba(100,45,0,0.5),0_0_12px_rgba(245,158,11,0.2)]
                  active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_0_rgba(0,0,0,0.3),0_0px_0_rgba(100,45,0,0.5)] ${
                  isMobileHorizontal ? " px-2 py-1.5 text-xs" : " text-sm"
                }`}
                onClick={handleReset}
                aria-label="Reset Level"
                type="button"
              >
                {/* Shimmering overlay */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent_70%)] group-hover:opacity-30"></div>
                
                {/* Button content */}
                <div className="relative flex items-center gap-1 z-10">
                  {/* Icon with animated glow */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full bg-white/30 blur-[3px] scale-125 animate-pulse-slow opacity-0 group-hover:opacity-80`}></div>
                    <Icon
                      icon="mdi:refresh"
                      className={`w-5 h-5 drop-shadow-glow group-hover:animate-spin-slow${isMobileHorizontal ? " w-4 h-4" : ""}`}
                    />
                  </div>
                  <span className="whitespace-nowrap">Reset Level</span>
                </div>
                
                {/* Circular reset animation - only shown on hover */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 rounded-full border-2 border-white/0 group-hover:border-white/20 group-hover:animate-circle-expand opacity-0 group-hover:opacity-100"></div>
                </div>
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </Popup>
  );
};
