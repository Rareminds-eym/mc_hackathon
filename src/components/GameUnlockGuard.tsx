import React from 'react';

interface GameUnlockGuardProps {
  children: React.ReactNode;
}

/**
 * Component that guards access to the game based on the game_unlock table
 * Now the lock functionality is handled directly in HomeScreen component
 */
const GameUnlockGuard: React.FC<GameUnlockGuardProps> = ({ children }) => {
  // Simply render children as lock functionality is now handled in HomeScreen
  return <>{children}</>;
};

export default GameUnlockGuard;