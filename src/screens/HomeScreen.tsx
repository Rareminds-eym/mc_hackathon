import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";

const HomeScreen: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

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

  return (
    <div
      className="homepage-bg min-h-screen w-screen relative overflow-x-hidden overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url('/backgrounds/Homepagebg.jpg')` }}
    >
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
