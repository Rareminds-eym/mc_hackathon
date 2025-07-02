import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useNavigate } from "react-router-dom";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  showNext?: boolean;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({
  open,
  onClose,
  showNext,
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
            {showNext && (
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
  moduleId?: string;
}

export const VictoryPopup: React.FC<VictoryPopupProps> = ({
  open,
  onClose,
  showNext = false,
  showGoToModules = true,
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

  return (
    <Popup open={open} onClose={onClose} showNext={showNext}>
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
          {/* <svg
            width="100%"
            height={isMobileHorizontal ? 110 : 150}
            viewBox="0 0 300 110"
            style={{ display: "block", margin: "0 auto" }}
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Well Done!"
          >
            <defs>
              <linearGradient id="wellDoneGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f472b6" />
              </linearGradient>
              <filter id="wellDoneShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25" />
              </filter>
            </defs>
            <path
              id="arcPath"
              d="M 40 70 Q 150 -40 260 70"
              fill="transparent"
            />
            <text
              fontFamily="inherit"
              fontWeight="500"
              fontSize={isMobileHorizontal ? 13 : 18}
              fill="url(#wellDoneGradient)"
              stroke="#fff"
              strokeWidth="1"
              filter="url(#wellDoneShadow)"
              letterSpacing="0.04em"
            >
              <textPath
                href="#arcPath"
                startOffset="50%"
                textAnchor="middle"
                alignmentBaseline="middle"
                dominantBaseline="middle"
              >
                Well Done!
              </textPath>
            </text>
            <path
              id="arcPath"
              d="M 40 50 Q 150 10 260 50"
              fill="transparent"
            />
          </svg> */}
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
        {/* 🔘 Buttons */}
        <motion.div
          className={`flex justify-center gap-3 w-full mt-1${
            isMobileHorizontal ? " gap-1 mt-0 justify-center" : ""
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
            <button
              className={`bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center gap-1 border border-green-200/60 px-2 py-1 text-sm min-h-0 min-w-0${
                isMobileHorizontal ? " px-1 py-0.5 text-xs" : ""
              }`}
              style={{
                boxShadow: "0 2px 8px 0 rgba(34,197,94,0.10)",
                background: undefined,
                lineHeight: 1.1,
              }}
              onClick={handleGoToLevels}
              aria-label="Back to Levels"
              type="button"
            >
              <Icon
                icon="mdi:home-map-marker"
                className={`w-5 h-5${isMobileHorizontal ? " w-4 h-4" : ""}`}
              />
              <span className="whitespace-nowrap">Back to Levels</span>
            </button>
          )}
          {showNext && (
            <button
              className={`bg-gradient-to-r from-blue-400 via-cyan-500 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center gap-1 border border-blue-200/60 px-2 py-1 text-sm min-h-0 min-w-0${
                isMobileHorizontal ? " px-1 py-0.5 text-xs" : ""
              }`}
              style={{
                boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)",
                background: undefined,
                lineHeight: 1.1,
              }}
              onClick={handleNext}
              aria-label="Next"
              type="button"
            >
              <Icon
                icon="mdi:arrow-right-bold"
                className={`w-5 h-5${isMobileHorizontal ? " w-4 h-4" : ""}`}
              />
              <span className="whitespace-nowrap">Next</span>
            </button>
          )}
        </motion.div>
      </motion.div>
    </Popup>
  );
};
