import { Module } from './types/GameData';

// Helper function to calculate module score based on levels
export const getModuleScore = (module: Module): number => {
  // Return 0 if module has no levels or levels is undefined
  if (!module.levels || module.levels.length === 0) {
    return 0;
  }

  const totalScore = module.levels.reduce((sum, level) => sum + level.score, 0);
  return Math.round(totalScore / module.levels.length);
};

export const modules: Module[] = [
  {
    id: 1,
    status: 'completed'
  },
  {
    id: 2,
    status: 'completed'
  },
  {
    id: 3,
    status: 'completed'
  },
  {
    id: 4,
    status: 'completed'
  },
  {
    id: 5,
    status: 'unlocked'
  },
  {
    id: 6,
    status: 'unlocked'
  }
];

