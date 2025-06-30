import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceLayout } from "../hooks/useOrientation";

const HomeScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const layout = useDeviceLayout();

  const startGame = () => {
    navigate("/modules");
  };

  const continueGame = () => {
    navigate("/modules");
  };

  const viewScores = () => {
    navigate("/scores");
  };

  const viewInstructions = () => {
    navigate("/instructions");
  };

  const quitGame = () => {
    window.close();
  };

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      // fallback: clear token and reload
      localStorage.removeItem("authToken");
    }
    navigate("/auth", { replace: true });
  };

  return (
    <div
      className={`min-h-screen w-screen relative bg-cover bg-center flex flex-col${
        layout.isMobile && layout.isHorizontal ? " px-2 py-2" : ""
      }`}
      style={{ backgroundImage: `url('/backgrounds/Homepagebg.jpg')` }}
    >
      {/* Player avatar top right with dropdown */}
      <div
        className={`absolute top-4 right-4 z-30${
          layout.isMobile && layout.isHorizontal ? " scale-90" : ""
        }`}
      >
        <div className="relative">
          {/* Gamified profile icon - User profile icon */}
          <motion.div
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-400 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 ring-1 ring-yellow-300${
              layout.isMobile && layout.isHorizontal ? " w-8 h-8" : ""
            }`}
            onClick={() => setProfileOpen((v) => !v)}
            tabIndex={0}
            onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
            role="button"
            aria-label="Open profile menu"
            whileHover={{ scale: 1.15, rotate: 6 }}
            whileTap={{ scale: 0.95, rotate: -6 }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* User profile icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className={`w-6 h-6 text-yellow-500 drop-shadow${
                layout.isMobile && layout.isHorizontal ? " w-5 h-5" : ""
              }`}
            >
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          </motion.div>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                key="profile-dropdown"
                className={`absolute right-0 mt-2 w-52 bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 border-2 border-yellow-300 rounded-2xl shadow-2xl py-4 px-5 flex flex-col items-center animate-fade-in z-40 backdrop-blur-md ring-2 ring-yellow-200${
                  layout.isMobile && layout.isHorizontal
                    ? " w-40 py-2 px-2 text-sm"
                    : ""
                }`}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, type: "spring" }}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#facc15"
                      viewBox="0 0 24 24"
                      className="w-7 h-7 drop-shadow-lg"
                    >
                      <path d="M12 2.25l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.38l-5-4.87 6.91-1L12 2.25z" />
                    </svg>
                    <span className="font-bold text-lg text-yellow-700 tracking-wide text-center w-full">
                      {user?.user_metadata?.full_name || user?.email || "Player"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    // variant="secondary"
                    variant= "danger"
                    onClick={handleLogout}
                    className="w-full mt-1 "
                  >
                    Logout
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Lab game sound */}
      <audio ref={audioRef} src="/lab-game-sound.mp3" loop />
      {/* Title & Main content aligned */}
      <div
        className={`flex flex-col items-center justify-center flex-1 z-20${
          layout.isMobile && layout.isHorizontal ? " mt-2" : " mt-8"
        }`}
      >
        <motion.h1
          className={`text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center ${
            layout.isMobile && layout.isHorizontal ? " text-2xl mb-2" : "mb-10"
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        >
          Good Manufacturing Quest
        </motion.h1>
        {/* items list */}
        <motion.div
          className={`relative flex flex-row justify-center items-center w-max max-w-3xl${layout.isMobile && layout.isHorizontal ? ' gap-2' : ''}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        >
          <motion.ul
            className={`flex flex-col items-center z-20 list-none p-0 m-0${layout.isMobile && layout.isHorizontal ? ' gap-1' : ' gap-3'}`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.10,
                },
              },
            }}
          >
            {[
              { label: "Start Game", onClick: startGame },
              { label: "Continue", onClick: continueGame },
              { label: "View Scores", onClick: viewScores },
              { label: "Instructions", onClick: viewInstructions },
              {
                label: "Quit Game",
                onClick: quitGame,
                variant: "danger" as const,
              },
            ].map((btn, idx) => (
              <motion.li
                key={btn.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.5 + idx * 0.07 }}
                className={`w-full ${
                  layout.isMobile && layout.isHorizontal ? " mb-1" : " mb-2"
                }`}
              >
                <Button
                  onClick={btn.onClick}
                  {...(btn.variant ? { variant: btn.variant } : {})}
                  className={
                    layout.isMobile && layout.isHorizontal
                      ? "px-0.5 py-0 !text-[14px] min-w-[60px] !h-9 !mb-2 rounded"
                      : "px-3 py-2 text-base min-w-[120px] !h-12 rounded-lg"
                  }
                >
                  {btn.label}
                </Button>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className={`absolute z-20 w-max right-0 bottom-0 translate-x-[100%]${
              layout.isMobile && layout.isHorizontal
                ? ""
                : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
          >
            <img
              src="/characters/intern.png"
              alt="Scientist Character"
              className={
                layout.isMobile && layout.isHorizontal
                  ? "h-[220px] mb-0"
                  : "h-[380px] mb-0"
              }
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export { HomeScreen };
