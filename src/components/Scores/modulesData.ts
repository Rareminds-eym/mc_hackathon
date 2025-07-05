import { Module } from './types/GameData';

// Helper function to calculate module score based on levels
export const getModuleScore = (module: Module): number => {
  const totalScore = module.levels.reduce((sum, level) => sum + level.score, 0);
  return Math.round(totalScore / module.levels.length);
};

export const modules: Module[] = [
  {
    id: 1,
    status: 'completed',
    levels: [
      { id: 1, name: 'Desert Dawn', score: 95 },
      { id: 2, name: 'Sandy Steps', score: 88 },
      { id: 3, name: 'Cactus Challenge', score: 92 },
      { id: 4, name: 'Oasis Quest', score: 97 }
    ]
  },
  {
    id: 2,
    status: 'completed',
    levels: [
      { id: 1, name: 'Mirage Mystery', score: 78 },
      { id: 2, name: 'Dune Drift', score: 85 },
      { id: 3, name: 'Rock Formation', score: 72 },
      { id: 4, name: 'Desert Wind', score: 0 }
    ]
  },
  {
    id: 3,
    status: 'completed',
    levels: [
      { id: 1, name: 'Scorpion Trail', score: 65 },
      { id: 2, name: 'Heat Wave', score: 0 },
      { id: 3, name: 'Sand Storm', score: 0 },
      { id: 4, name: 'Vulture Peak', score: 0 }
    ]
  },
  {
    id: 4,
    status: 'completed',
    levels: [
      { id: 1, name: 'Lizard Leap', score: 0 },
      { id: 2, name: 'Crystal Cave', score: 0 },
      { id: 3, name: 'Ancient Ruins', score: 0 },
      { id: 4, name: 'Sacred Symbol', score: 0 }
    ]
  },
  {
    id: 5,
    status: 'unlocked',
    levels: [
      { id: 1, name: 'Pyramid Path', score: 0 },
      { id: 2, name: 'Sphinx Riddle', score: 0 },
      { id: 3, name: 'Treasure Hunt', score: 0 },
      { id: 4, name: 'Golden Sands', score: 0 }
    ]
  },
  {
    id: 6,
    status: 'locked',
    levels: [
      { id: 1, name: 'Treasure Hunt A', score: 0 },
      { id: 2, name: 'Treasure Hunt B', score: 0 },
      { id: 3, name: 'Treasure Hunt C', score: 0 },
      { id: 4, name: 'Treasure Hunt D', score: 0 }
    ]
  },
  {
    id: 7,
    status: 'locked',
    levels: [
      { id: 1, name: 'Nomad Journey', score: 0 },
      { id: 2, name: 'Camel Caravan', score: 0 },
      { id: 3, name: 'Desert Market', score: 0 },
      { id: 4, name: 'Night Camp', score: 0 }
    ]
  },
  {
    id: 8,
    status: 'locked',
    levels: [
      { id: 1, name: 'Star Navigation', score: 0 },
      { id: 2, name: 'Moon Valley', score: 0 },
      { id: 3, name: 'Cosmic Dust', score: 0 },
      { id: 4, name: 'Galaxy Gate', score: 0 }
    ]
  },
  {
    id: 9,
    status: 'locked',
    levels: [
      { id: 1, name: 'Phoenix Fire', score: 0 },
      { id: 2, name: 'Dragon Scales', score: 0 },
      { id: 3, name: 'Magic Carpet', score: 0 },
      { id: 4, name: 'Genie Lamp', score: 0 }
    ]
  },
  {
    id: 10,
    status: 'locked',
    levels: [
      { id: 1, name: 'Sandstorm Survival', score: 0 },
      { id: 2, name: 'Mirage Master', score: 0 },
      { id: 3, name: 'Desert King', score: 0 },
      { id: 4, name: 'Oasis Guardian', score: 0 }
    ]
  },
  {
    id: 11,
    status: 'locked',
    levels: [
      { id: 1, name: 'Final Trial A', score: 0 },
      { id: 2, name: 'Final Trial B', score: 0 },
      { id: 3, name: 'Final Trial C', score: 0 },
      { id: 4, name: 'Final Trial D', score: 0 }
    ]
  },
  {
    id: 12,
    status: 'locked',
    levels: [
      { id: 1, name: 'Ultimate Challenge', score: 0 },
      { id: 2, name: 'Master Quest', score: 0 },
      { id: 3, name: 'Legend Born', score: 0 },
      { id: 4, name: 'Desert Champion', score: 0 }
    ]
  }
];

