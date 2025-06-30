import React from 'react';
import { useNavigate } from 'react-router-dom';
import { gameModes } from '../../data/Level2/gameModes';
import GameInterface from './GameInterface';
import './index.css';

const GMPSortPage: React.FC = () => {
  const navigate = useNavigate();
  const gameMode = gameModes.find(mode => mode.id === 'gmp-vs-non-gmp');

  if (!gameMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Game Mode Not Found</h1>
          <button
            onClick={() => navigate('/modules/1')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameInterface
      gameMode={gameMode}
      onBack={() => navigate('/modules/1')}
    />
  );
};

export default GMPSortPage;