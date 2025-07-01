export interface Level {
  id: number;
  score: number;
  stars: number;
  completed: boolean;
  timeSpent: string;
}

export interface Module {
  id: number;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  levels: Level[];
  completedLevels: number;
  totalScore: number;
  category: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  totalScore: number;
  rank: string;
  level: number;
  completedModules: number;
  totalModules: number;
}