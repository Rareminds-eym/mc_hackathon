import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileInfo from "../components/ProfileInfo";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useGameUnlock } from "../hooks/useGameUnlock";
import { useDeviceLayout } from "../hooks/useOrientation";

// Avatar options for modal
const AVATAR_OPTIONS = [
  {
    label: "Aman",
    src: "/characters/Intern1.png",
  },
  {
    label: "Mike",
    src: "/characters/Intern2.png",
  },
  {
    label: "Joel",
    src: "/characters/Intern3.png",
  },
  {
    label: "Pranav",
    src: "/characters/Intern4.png",
  },
  {
    label: "Lakshya",
    src: "/characters/Intern5.png",
  },
  {
    label: "Faisal",
    src: "/characters/Intern6.png",
  },
  {
    label: "Lalit",
    src: "/characters/Intern7.png",
  },
  {
    label: "Tejas",
    src: "/characters/Intern8.png",
  },
  {
    label: "Niharika",
    src: "/characters/Intern9.png",
  },
  {
    label: "Shiney",
    src: "/characters/Intern10.png",
  },
];

const HomeScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout
  const [profileOpen, setProfileOpen] = useState(false);
  const layout = useDeviceLayout();

  // Game unlock functionality
  const { isGameLocked, isLoading } = useGameUnlock();

  // Avatar selection state, default to Intern 1, load from localStorage if available
  const [avatar, setAvatar] = useState<string>(
    () => localStorage.getItem("selectedAvatar") || "/characters/Intern1.png"
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showGameLocked, setShowGameLocked] = useState(false);
  // Remove teamInfo state, only use user context
  // Get collegeCode from user context if available
  // (moved to below)

  useEffect(() => {
    localStorage.setItem("selectedAvatar", avatar);
  }, [avatar]);

  const startGame = () => {
    if (isGameLocked) {
      setShowGameLocked(true);
      return;
    }
    navigate("/modules");
  };

  const continueGame = () => {
    if (isGameLocked) {
      setShowGameLocked(true);
      return;
    }
    navigate("/modules");
  };

  const viewScores = () => {
    if (isGameLocked) {
      setShowGameLocked(true);
      return;
    }
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

  // Removed team info fetch logic, only using user context

  return (
    <div
      className={`min-h-screen max-h-screen relative bg-cover bg-center flex flex-col overflow-y-auto${
        layout.isMobile && layout.isHorizontal ? " px-2 py-2" : ""
      }`}
      style={{ backgroundImage: `url('/backgrounds/Homepagebg.webp')` }}
    >
      {/* Social Media Vertical Bar */}
      <div className="fixed top-1/2 left-0 z-40 -translate-y-1/2 flex flex-col gap-3 p-2 bg-white/10 rounded-r-2xl shadow-lg backdrop-blur-md border-l-4 border-blue-500">
        {[
          {
            label: "RareMinds",
            icon: (
              <img
                src="/logos/bulb.png"
                alt="RareMinds Bulb"
                width={28}
                height={28}
              />
            ),
            url: "https://www.rareminds.in/",
            color: "hover:bg-yellow-200",
          },
          {
            label: "Instagram",
            icon: <Icon icon="mdi:instagram" width={28} height={28} />, // color handled below
            url: "https://www.instagram.com/rareminds_eym/?hl=en",
            color:
              "hover:bg-gradient-to-tr hover:from-pink-500 hover:to-yellow-400",
          },
          {
            label: "Facebook",
            icon: <Icon icon="mdi:facebook" width={28} height={28} />,
            url: "https://www.facebook.com/profile.php?id=61576552526095",
            color: "hover:bg-blue-700",
          },
          {
            label: "LinkedIn",
            icon: <Icon icon="mdi:linkedin" width={28} height={28} />,
            url: "https://www.linkedin.com/company/rareminds/",
            color: "hover:bg-blue-800",
          },
        ].map((item, idx) => (
          <motion.a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 bg-white/80 border-2 border-blue-500 shadow-md mb-1 hover:scale-110 ${item.color}`}
            title={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1 + idx * 0.08,
              type: "spring",
            }}
            whileHover={{ scale: 1.18, rotate: 6 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="transition-colors duration-200 group-hover:text-white text-gray-700">
              {item.icon}
            </span>
          </motion.a>
        ))}
      </div>
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`bg-gradient-to-br from-blue-300 to-cyan-500 rounded-2xl shadow-2xl p-8 sm:p-6 w-full flex flex-col items-center relative backdrop-blur-md transition-all duration-300
              ${
                layout.isMobile && layout.isHorizontal
                  ? "max-w-md min-w-[340px] p-2"
                  : "max-w-3xl"
              }`}
          >
            <h2
              className={`font-bold mb-6 text-white drop-shadow ${
                layout.isMobile && layout.isHorizontal ? "text-lg" : "text-2xl"
              }`}
            >
              Choose Your Avatar
            </h2>
            <div
              className={`grid grid-cols-4 w-full mb-2 ${
                layout.isMobile && layout.isHorizontal ? "gap-4" : "gap-12"
              }`}
            >
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 transition-all bg-white/80 hover:bg-white ${
                    layout.isMobile && layout.isHorizontal
                      ? "p-2 min-w-[60px] min-h-[60px]"
                      : "p-4"
                  } ${
                    avatar === option.src
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-transparent"
                  }`}
                  onClick={() => {
                    setAvatar(option.src);
                    setShowAvatarModal(false);
                  }}
                  type="button"
                >
                  <img
                    src={option.src}
                    alt={option.label}
                    className={`${
                      layout.isMobile && layout.isHorizontal
                        ? "w-14 h-14"
                        : "w-24 h-24"
                    } rounded-full object-cover border border-gray-200 mb-2`}
                  />
                  <span
                    className={`font-semibold text-blue-900 ${
                      layout.isMobile && layout.isHorizontal
                        ? "text-xs"
                        : "text-base"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="absolute top-3 right-5 text-white hover:text-gray-200 text-3xl font-bold"
              onClick={() => setShowAvatarModal(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Player avatar top right with dropdown */}
      <div
        className={`absolute top-4 right-4 z-30${
          layout.isMobile && layout.isHorizontal ? " scale-90" : ""
        }`}
      >
        <div className="relative flex flex-col items-center gap-3">
          <img
            src={avatar}
            alt="Player Avatar"
            className="w-16 h-16 rounded-full border-4 border-blue-500 shadow-[0_0_32px_8px_rgba(59,130,246,0.55)] cursor-pointer transition-all duration-300"
            onClick={() => setProfileOpen((v) => !v)}
            tabIndex={0}
          />
          {profileOpen && (
            <div 
              className="absolute top-[4.5rem] right-0 w-52 from-blue-300 to-cyan-100 rounded-xl shadow-lg py-4 px-5 flex flex-col items-center animate-fade-in z-40 backdrop-blur-md"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <span className="font-bold text-lg text-blue-900 mb-3 text-center tracking-wide break-words break-all">
                {user?.user_metadata?.full_name || user?.email || "Player"}
              </span>
              {/* Avatars button */}
              <Button
                size="sm"
                className="w-full mb-3"
                onClick={() => {
                  setShowAvatarModal(true);
                  setProfileOpen(false);
                }}
              >
                Avatars
              </Button>
              <Button
                size="sm"
                className="w-full mb-3"
                onClick={() => {
                  console.log("Information button clicked");
                  setShowInfoModal(true);
                  setProfileOpen(false);
                }}
              >
                Information
              </Button>
              {/* Logout button removed from profile dropdown */}
            </div>
          )}
          {/* Extra logos below avatar */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <a
              href="https://us06web.zoom.us/j/86412214284?pwd=I8U47ItobcPBHvKgzmwsDAckIPBFYY.1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/80 border-2 border-blue-500 shadow-md hover:bg-blue-200 transition-all"
              title="Help Desk"
            >
              <img
                src="/logos/helpdesk.png"
                alt="Help Desk"
                width={32}
                height={32}
              />
            </a>
            <a
              href="https://naanmudhalvan.tn.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/80 border-2 p-1 border-blue-500 shadow-md hover:bg-green-200 transition-all"
              title="RareMinds Website"
            >
              <img
                src="/logos/nmlogo.png"
                alt="RareMinds Logo"
                className="w-auto"
                height={32}
              />
            </a>
          </div>
        </div>
      </div>
      {/* Profile Info Modal */}
      {showInfoModal && (
        <ProfileInfo
          email={user?.email || ""}
          onClose={() => setShowInfoModal(false)}
        />
      )}
      {/* Lab game sound */}
      <audio ref={audioRef} src="/lab-game-sound.mp3" loop />
      {/* Title & Main content aligned */}
      <div
        className={`flex flex-col items-center justify-center flex-1 z-20${
          layout.isMobile && layout.isHorizontal ? " mt-2" : " mt-8"
        }`}
      >
        <motion.h1
          className={`relative text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300 drop-shadow-lg text-center tracking-widest select-none${
            layout.isMobile && layout.isHorizontal ? " text-2xl mb-2" : " mb-10"
          }`}
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
        >
          <span className="flex items-center justify-center gap-2 w-full">
            <span className="inline-block animate-bounce text-cyan-300 drop-shadow-lg mr-2">
              <Icon icon="mdi:code-tags" width={38} height={38} />
            </span>
            <span
              className="bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-600 bg-clip-text text-transparent drop-shadow-lg shadow-blue-200 px-1 rounded-lg"
              style={{
                WebkitTextStroke: '2px #2563eb',
                filter: 'drop-shadow(0 2px 4px #38bdf8)'
              }}
            >
              CODECare 2.0
            </span>
            <span className="inline-block animate-bounce text-cyan-300 drop-shadow-lg ml-2" style={{ animationDelay: '0.2s' }}>
              <Icon icon="mdi:clipboard-check-outline" width={38} height={38} />
            </span>
          </span>
          <span className="flex justify-center w-full mt-1">
            <svg width="260" height="18" viewBox="0 0 260 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="heartbeat-line">
              <polyline
                points="0,9 20,9 30,3 40,15 50,3 60,15 70,9 90,9 100,3 110,15 120,3 130,15 140,9 260,9"
                stroke="#38bdf8"
                strokeWidth="3.5"
                fill="none"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: 0,
                  animation: 'heartbeat-move 2.5s linear infinite'
                }}
              />
              <style>{`
                @keyframes heartbeat-move {
                  0% { stroke-dashoffset: 300; }
                  40% { stroke-dashoffset: 120; }
                  60% { stroke-dashoffset: 60; }
                  80% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: 0; }
                }
              `}</style>
            </svg>
          </span>
          <span className="block text-base md:text-lg font-semibold text-cyan-200 mt-2 tracking-normal animate-fade-in-slow">
            ACE IN CODING!
          </span>
        </motion.h1>
        {/* items list */}
        <motion.div
          className={`relative flex flex-row justify-center items-center w-max max-w-3xl${
            layout.isMobile && layout.isHorizontal ? " gap-2" : ""
          }`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
        >
          <motion.ul
            className={`flex flex-col items-center z-20 list-none p-0 m-0${
              layout.isMobile && layout.isHorizontal ? " gap-1" : " gap-3"
            }`}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {[
              { label: "Start Hackathon", onClick: startGame, shouldDisable: true },
              {
                label: "View Scores",
                onClick: viewScores,
                shouldDisable: true,
              },
              {
                label: "Instructions",
                onClick: viewInstructions,
                shouldDisable: false,
              },
              {
                label: "Logout",
                onClick: handleLogout,
                variant: "danger" as const,
                shouldDisable: false,
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
                  <div className="flex items-center justify-center gap-2">
                    {btn.shouldDisable && isGameLocked && (
                      <Icon icon="mdi:lock" className="w-4 h-4" />
                    )}
                    {btn.label}
                  </div>
                </Button>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            className={`absolute z-20 w-max right-0 bottom-[-48px] translate-x-[100%]${
              layout.isMobile && layout.isHorizontal ? "" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.0, delay: 0, type: "spring" }}
          >
            <img
              src="/characters/Intern.webp"
              alt="Scientist Character"
              className={
                layout.isMobile && layout.isHorizontal
                  ? "h-[280px] mb-0"
                  : "h-[420px] mb-0"
              }
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Game Lock Overlay */}
      {!isLoading && isGameLocked && showGameLocked && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center p-8  rounded-2xl shadow-xl max-w-md mx-4 backdrop-blur-lg border border-white/50 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 rounded-full p-1 h-10 w-10 right-5 bg-white text-black hover:text-gray-700 transition-colors duration-200 flex items-center justify-center"
              onClick={() => setShowGameLocked(false)}
              aria-label="Close"
              type="button"
            >
              <X size={20} />
            </button>

            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                type: "spring",
                bounce: 0.6,
              }}
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Icon icon="mdi:lock" className="w-12 h-12 text-white" />
              </div>
              <motion.h1
                className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Game Locked
              </motion.h1>
              <motion.p
                className="text-white/90 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                The game is currently locked. Please wait for it to be unlocked.
              </motion.p>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export { HomeScreen };