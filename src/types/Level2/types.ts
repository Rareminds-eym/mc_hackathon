export interface Term {
  id: string;
  text: string;
  correctCategory: string;
  currentCategory?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface GameMode {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  terms: Term[];
}

export interface Level2GameData {
  id?: string;
  user_id?: string;
  module_id: string;
  level_number: number;
  game_mode_id: string;
  score: number;
  is_completed: boolean;
  time?: number;
  total_terms: number;
  placed_terms: Term[];
  created_at?: string;
  updated_at?: string;
}

export interface Level2GameStats {
  highScore: number;
  totalGamesPlayed: number;
  bestTime: number;
  lastPlayedDate: string;
  perfectGames: number;
  averageScore: number;
}