import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePage from '../../components/Level2/HomePage';
import GameInterface from '../../components/Level2/GameInterface';
import { gameModes } from '../../data/Level2/gameModes';
import { GameMode } from '../../types/Level2/types';
import '../../components/Level2/index.css';

const Level2: React.FC = () => {
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const navigate = useNavigate();

  const handleGameModeSelect = (modeId: string) => {
    const gameMode = gameModes.find(mode => mode.id === modeId);
    if (gameMode) {
      setSelectedGameMode(gameMode);
    }
  };

  const handleBackToHome = () => {
    setSelectedGameMode(null);
  };

  const handleExitToModules = () => {
    navigate('/modules/1');
  };

  if (selectedGameMode) {
    return (
      <GameInterface
        gameMode={selectedGameMode}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <HomePage
      onGameModeSelect={handleGameModeSelect}
      onExit={handleExitToModules}
    />
  );
};

export default Level2;
