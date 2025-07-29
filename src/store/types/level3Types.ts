// src/store/types/level3Types.ts

import type { PuzzlePiece, Scenario } from '../../data/level3Scenarios';

// ===== GAME STATE INTERFACES =====

export interface PlacedPiecesState {
  violations: PuzzlePiece[];
  actions: PuzzlePiece[];
}

export interface GameStats {
  score: number;
  health: number;
  combo: number;
  timer: number;
}

export interface ScenarioResult {
  score: number;
  combo: number;
  health: number;
  scenarioIndex: number;
  timeSpent: number;
}

export interface OverallStats {
  totalScore: number;
  totalCombo: number;
  avgHealth: number;
  totalTime: number;
  scenarioCount: number;
  finalScore: number; // Calculated weighted score out of 100
}

// ===== UI STATE INTERFACES =====

export interface UIState {
  showScenario: boolean;
  showBriefing: boolean;
  showVictoryPopup: boolean;
  showFinalStats: boolean;
  feedback: string;
  isComplete: boolean;
  activeDragPiece: PuzzlePiece | null;
}

// ===== PROGRESS STATE INTERFACES =====

export interface GameProgress {
  currentScenarioIndex: number;
  scenarioResults: ScenarioResult[];
  placedPieces: PlacedPiecesState;
  isGameComplete: boolean;
  startTime: number;
  lastSaved?: number; // Timestamp of last save
}

// ===== MAIN LEVEL3 STATE INTERFACE =====

export interface Level3State {
  // Scenario Management
  scenarios: Scenario[];
  
  // Game State
  gameStats: GameStats;
  
  // UI State
  ui: UIState;
  
  // Progress State
  progress: GameProgress;
  
  // Loading and Error States
  isLoading: boolean;
  error: string | null;
}

// ===== ACTION PAYLOAD INTERFACES =====

export interface DropPiecePayload {
  containerType: 'violations' | 'actions';
  piece: PuzzlePiece;
}

export interface UpdateStatsPayload {
  score?: number;
  health?: number;
  combo?: number;
}

export interface SetFeedbackPayload {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export interface CompleteScenarioPayload {
  scenarioResult: ScenarioResult;
  isLastScenario: boolean;
}

// ===== SELECTOR RETURN TYPES =====

export interface DerivedGameState {
  availablePieces: PuzzlePiece[];
  correctViolations: PuzzlePiece[];
  correctActions: PuzzlePiece[];
  currentScenario: Scenario | null;
  isScenarioComplete: boolean;
  canProceedToNext: boolean;
}

export interface GameCompletionData {
  overallStats: OverallStats;
  scenarioResults: ScenarioResult[];
  finalScore: number;
  totalTime: number;
}

// ===== THUNK INTERFACES =====

export interface SaveGameCompletionParams {
  moduleId: string;
  scenarioIndex: number;
  finalScore: number;
  totalTime: number;
  placedPieces: any;
  isCompleted: boolean;
}

export interface LoadGameProgressParams {
  moduleId: string;
  userId: string;
}

// ===== CONSTANTS =====

export const GAME_CONSTANTS = {
  INITIAL_HEALTH: 100,
  INITIAL_SCORE: 0,
  INITIAL_COMBO: 0,
  HEALTH_PENALTY_WRONG_CATEGORY: 10,
  HEALTH_PENALTY_WRONG_PIECE: 15,
  FEEDBACK_DISPLAY_DURATION: 2500,
  TIMER_INTERVAL: 1000,
  SCORE_WEIGHTS: {
    SCORE_PERCENTAGE: 70,
    COMBO_PERCENTAGE: 20,
    HEALTH_PERCENTAGE: 10,
  },
} as const;

// ===== UTILITY TYPES =====

export type GameAction = 
  | 'DROP_PIECE'
  | 'UPDATE_STATS'
  | 'SET_FEEDBACK'
  | 'COMPLETE_SCENARIO'
  | 'RESET_GAME'
  | 'START_TIMER'
  | 'STOP_TIMER'
  | 'NEXT_SCENARIO';

export type UIAction =
  | 'SHOW_SCENARIO'
  | 'HIDE_SCENARIO'
  | 'SHOW_BRIEFING'
  | 'HIDE_BRIEFING'
  | 'SHOW_VICTORY'
  | 'HIDE_VICTORY'
  | 'SHOW_FINAL_STATS'
  | 'HIDE_FINAL_STATS'
  | 'SET_DRAG_PIECE'
  | 'CLEAR_DRAG_PIECE';

// ===== VALIDATION INTERFACES =====

export interface ValidationResult {
  isValid: boolean;
  isCorrectCategory: boolean;
  isCorrectPiece: boolean;
  isAlreadyPlaced: boolean;
  message: string;
}

export interface DropResult {
  success: boolean;
  validation: ValidationResult;
  updatedStats?: Partial<GameStats>;
  feedback?: string;
}
