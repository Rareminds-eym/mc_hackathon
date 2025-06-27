import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext"; // Add this import

const HomeScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout
  const [profileOpen, setProfileOpen] = useState(false);

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
      {/* Player avatar top right with dropdown */}
      <div className="absolute top-6 right-10 z-30">
        <div className="relative">
          <img
            src={user?.avatarUrl || "/avatars/default.png"}
            alt="Player Avatar"
            className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
            onClick={() => setProfileOpen((v) => !v)}
            tabIndex={0}
            onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
          />
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white/80 rounded-xl shadow-lg py-4 px-5 flex flex-col items-center animate-fade-in z-40 backdrop-blur-md">
              <span className="font-bold text-lg text-blue-900 mb-3 text-center tracking-wide">
                {user?.user_metadata?.full_name || user?.email || "Player"}
              </span>
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
