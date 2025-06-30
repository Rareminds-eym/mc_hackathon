import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import AvatarSelector from "../components/AvatarSelector";

// Avatar options for modal
const AVATAR_OPTIONS = [
  {
    label: "Intern 1",
    src: "/characters/Intern1.png",
  },
  {
    label: "Intern 2",
    src: "/characters/Intern2.png",
  },
  {
    label: "Intern 3",
    src: "/characters/Intern3.png",
  },
];

const HomeScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout
  const [profileOpen, setProfileOpen] = useState(false);

  // Avatar selection state, default to Intern 1, load from localStorage if available
  const [avatar, setAvatar] = useState<string>(() =>
    localStorage.getItem("selectedAvatar") || "/characters/Intern1.png"
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("selectedAvatar", avatar);
  }, [avatar]);

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
      className="homepage-bg min-h-screen w-screen relative overflow-x-hidden overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url('/backgrounds/Homepagebg.jpg')` }}
    >
      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center relative backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-white drop-shadow">
              Choose Your Avatar
            </h2>
            <div className="grid grid-cols-3 gap-8 w-full mb-2">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all bg-white/80 hover:bg-white ${
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
                    className="w-24 h-24 rounded-full object-cover border border-gray-200 mb-2"
                  />
                  <span className="font-semibold text-base text-blue-900">
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
      <div className="absolute top-6 right-10 z-30">
        <div className="relative">
          <img
            src={avatar}
            alt="Player Avatar"
            className="w-16 h-16 rounded-full border-4 border-green-400 shadow-[0_0_16px_4px_rgba(34,197,94,0.7)] cursor-pointer transition-all duration-300"
            onClick={() => setProfileOpen((v) => !v)}
            tabIndex={0}
            onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
          />
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-green-200 rounded-xl shadow-lg py-4 px-5 flex flex-col items-center animate-fade-in z-40 backdrop-blur-md">
              <span className="font-bold text-lg text-blue-900 mb-3 text-center tracking-wide">
                {user?.user_metadata?.full_name || user?.email || "Player"}
              </span>
              {/* Avatars button */}
              <Button
                size="sm"
                className="w-full mb-3"
                onClick={() => setShowAvatarModal(true)}
              >
                Avatars
              </Button>
              <Button size="sm" variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Lab game sound */}
      <audio ref={audioRef} src="/lab-game-sound.mp3" loop />
      <div className="absolute top-8 left-0 w-full flex justify-center z-20">
        <div className="animate-title-glow">
          <img
            src="/logos/Gametitle.png"
            alt="Game Title"
            className="h-[150px] object-contain drop-shadow-[0_0_8px_black] drop-shadow-[0_2px_0_#222]"
          />
        </div>
      </div>
      <div className="flex flex-row justify-center items-center h-screen">
        <div className="w-[340px]"></div>
        <div className="flex flex-col items-center gap-5 z-20 pt-[100px] ml-[120px]">
          <Button onClick={startGame}>Start Game</Button>
          <Button onClick={continueGame}>Continue</Button>
          <Button onClick={viewScores}>View Scores</Button>
          <Button onClick={viewInstructions}>Instructions</Button>
          <Button onClick={quitGame} variant="danger">
            Quit Game
          </Button>
        </div>
        <div className="w-20"></div>
        <div className="flex items-end h-[500px] z-20">
          <img
            src="/characters/intern.png"
            alt="Scientist Character"
            className="h-[380px] mb-0"
          />
        </div>
      </div>
    </div>
  );
};

export { HomeScreen };
