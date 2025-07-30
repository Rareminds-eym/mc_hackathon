import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Scenario, PuzzlePiece } from '../../data/level3Scenarios';
import { level3Scenarios } from '../../data/level3Scenarios';
import {
  Level3State,
  DropPiecePayload,
  UpdateStatsPayload,
  SetFeedbackPayload,
  CompleteScenarioPayload,
  ValidationResult,
  GameStats,
  GameProgress,
  UIState,
  GAME_CONSTANTS
} from '../types/level3Types';

// ===== INITIAL STATE =====

const initialState: Level3State = {
  scenarios: level3Scenarios,
  gameStats: {
    score: GAME_CONSTANTS.INITIAL_SCORE,
    health: GAME_CONSTANTS.INITIAL_HEALTH,
    combo: GAME_CONSTANTS.INITIAL_COMBO,
    timer: 0,
  },
  ui: {
    showScenario: true,
    showBriefing: false,
    showVictoryPopup: false,
    showFinalStats: false,
    feedback: '',
    isComplete: false,
    activeDragPiece: null,
  },
  progress: {
    currentScenarioIndex: 0,
    scenarioResults: [],
    placedPieces: {
      violations: [],
      actions: [],
    },
    isGameComplete: false,
    startTime: Date.now(),
  },
  isLoading: false,
  error: null,
};

// ===== HELPER FUNCTIONS =====

const validatePieceDrop = (
  containerType: 'violations' | 'actions',
  piece: PuzzlePiece,
  placedPieces: { violations: PuzzlePiece[]; actions: PuzzlePiece[] }
): ValidationResult => {
  const isCorrectCategory =
    (containerType === 'violations' && piece.category === 'violation') ||
    (containerType === 'actions' && piece.category === 'action');

  const isAlreadyPlaced =
    placedPieces.violations.some((p) => p.id === piece.id) ||
    placedPieces.actions.some((p) => p.id === piece.id);

  let message = '';
  if (!isCorrectCategory) {
    message = 'WRONG CATEGORY! Try the other container, Agent!';
  } else if (isAlreadyPlaced) {
    message = 'Already placed! Try another piece!';
  } else if (piece.isCorrect) {
    message = 'CRITICAL HIT! Perfect placement!';
  } else {
    message = '💥 MISS! Analyze the scenario more carefully!';
  }

  return {
    isValid: isCorrectCategory && !isAlreadyPlaced,
    isCorrectCategory,
    isCorrectPiece: piece.isCorrect,
    isAlreadyPlaced,
    message,
  };
};

const calculatePointsPerPiece = (correctViolations: number, correctActions: number): number => {
  const totalCorrectPieces = correctViolations + correctActions;
  return totalCorrectPieces > 0 ? Math.floor(100 / totalCorrectPieces) : 0;
};

// ===== ASYNC THUNKS =====

export const startTimer = createAsyncThunk(
  'level3/startTimer',
  async (_, { dispatch }) => {
    const interval = setInterval(() => {
      dispatch(incrementTimer());
    }, GAME_CONSTANTS.TIMER_INTERVAL);
    return interval;
  }
);

export const clearFeedbackAfterDelay = createAsyncThunk(
  'level3/clearFeedbackAfterDelay',
  async (_, { dispatch }) => {
    setTimeout(() => {
      dispatch(clearFeedback());
    }, GAME_CONSTANTS.FEEDBACK_DISPLAY_DURATION);
  }
);

// ===== SLICE DEFINITION =====

const level3Slice = createSlice({
  name: 'level3',
  initialState,
  reducers: {
    // ===== SCENARIO MANAGEMENT =====
    setScenarios: (state, action: PayloadAction<Scenario[]>) => {
      state.scenarios = action.payload;
    },

    nextScenario: (state) => {
      if (state.progress.currentScenarioIndex < state.scenarios.length - 1) {
        state.progress.currentScenarioIndex += 1;
        state.progress.placedPieces = { violations: [], actions: [] };
        state.ui.isComplete = false;
        state.ui.showScenario = true;
        state.gameStats.combo = GAME_CONSTANTS.INITIAL_COMBO;
        state.gameStats.health = GAME_CONSTANTS.INITIAL_HEALTH;
        state.gameStats.score = GAME_CONSTANTS.INITIAL_SCORE;
      }
    },

    // ===== GAME STATS MANAGEMENT =====
    updateGameStats: (state, action: PayloadAction<UpdateStatsPayload>) => {
      const { score, health, combo } = action.payload;
      if (score !== undefined) state.gameStats.score = score;
      if (health !== undefined) state.gameStats.health = Math.max(0, health);
      if (combo !== undefined) state.gameStats.combo = combo;
    },

    incrementScore: (state, action: PayloadAction<number>) => {
      state.gameStats.score += action.payload;
    },

    decreaseHealth: (state, action: PayloadAction<number>) => {
      state.gameStats.health = Math.max(0, state.gameStats.health - action.payload);
    },

    incrementCombo: (state) => {
      state.gameStats.combo += 1;
    },

    resetCombo: (state) => {
      state.gameStats.combo = 0;
    },

    incrementTimer: (state) => {
      state.gameStats.timer += 1;
    },

    resetTimer: (state) => {
      state.gameStats.timer = 0;
    },

    // ===== UI STATE MANAGEMENT =====
    showScenario: (state) => {
      state.ui.showScenario = true;
    },

    hideScenario: (state) => {
      state.ui.showScenario = false;
    },

    showBriefing: (state) => {
      state.ui.showBriefing = true;
    },

    hideBriefing: (state) => {
      state.ui.showBriefing = false;
    },

    showVictoryPopup: (state) => {
      state.ui.showVictoryPopup = true;
      state.ui.isComplete = true;
    },

    hideVictoryPopup: (state) => {
      state.ui.showVictoryPopup = false;
    },

    showFinalStats: (state) => {
      state.ui.showFinalStats = true;
      state.progress.isGameComplete = true;
    },

    hideFinalStats: (state) => {
      state.ui.showFinalStats = false;
    },

    setFeedback: (state, action: PayloadAction<SetFeedbackPayload>) => {
      state.ui.feedback = action.payload.message;
    },

    clearFeedback: (state) => {
      state.ui.feedback = '';
    },

    setActiveDragPiece: (state, action: PayloadAction<PuzzlePiece | null>) => {
      state.ui.activeDragPiece = action.payload;
    },

    // ===== PIECE PLACEMENT MANAGEMENT =====
    dropPiece: (state, action: PayloadAction<DropPiecePayload>) => {
      const { containerType, piece } = action.payload;
      const currentScenario = state.scenarios[state.progress.currentScenarioIndex];

      if (!currentScenario) return;

      const correctViolations = currentScenario.pieces.filter(
        (p: PuzzlePiece) => p.category === 'violation' && p.isCorrect
      );
      const correctActions = currentScenario.pieces.filter(
        (p: PuzzlePiece) => p.category === 'action' && p.isCorrect
      );

      const validation = validatePieceDrop(containerType, piece, state.progress.placedPieces);

      if (!validation.isValid) {
        state.ui.feedback = validation.message;

        if (!validation.isCorrectCategory) {
          state.gameStats.health = Math.max(0, state.gameStats.health - GAME_CONSTANTS.HEALTH_PENALTY_WRONG_CATEGORY);
          state.gameStats.combo = 0;
        }
        return;
      }

      // Valid drop - update placed pieces
      state.progress.placedPieces[containerType].push(piece);
      state.ui.feedback = validation.message;

      if (validation.isCorrectPiece) {
        // Correct piece placed
        const pointsPerPiece = calculatePointsPerPiece(correctViolations.length, correctActions.length);
        state.gameStats.score += pointsPerPiece;
        state.gameStats.combo += 1;

        // Check for scenario completion
        const totalViolations = correctViolations.length;
        const totalActions = correctActions.length;
        const placedViolations = state.progress.placedPieces.violations.length;
        const placedActions = state.progress.placedPieces.actions.length;

        if (placedViolations === totalViolations && placedActions === totalActions) {
          state.ui.isComplete = true;
        }
      } else {
        // Wrong piece placed
        state.gameStats.health = Math.max(0, state.gameStats.health - GAME_CONSTANTS.HEALTH_PENALTY_WRONG_PIECE);
        state.gameStats.combo = 0;
      }
    },

    // ===== SCENARIO COMPLETION =====
    completeScenario: (state, action: PayloadAction<CompleteScenarioPayload>) => {
      const { scenarioResult, isLastScenario } = action.payload;

      // Add scenario result
      state.progress.scenarioResults.push(scenarioResult);

      if (isLastScenario) {
        // Game complete
        state.progress.isGameComplete = true;
        state.ui.showFinalStats = true;
        state.ui.isComplete = false;
      } else {
        // Move to next scenario
        state.progress.currentScenarioIndex += 1;
        state.progress.placedPieces = { violations: [], actions: [] };
        state.ui.isComplete = false;
        state.ui.showScenario = true;
        state.gameStats.combo = GAME_CONSTANTS.INITIAL_COMBO;
        state.gameStats.health = GAME_CONSTANTS.INITIAL_HEALTH;
        state.gameStats.score = GAME_CONSTANTS.INITIAL_SCORE;
      }

      state.ui.showVictoryPopup = false;
    },

    // ===== GAME RESET =====
    resetGame: (state) => {
      state.gameStats = {
        score: GAME_CONSTANTS.INITIAL_SCORE,
        health: GAME_CONSTANTS.INITIAL_HEALTH,
        combo: GAME_CONSTANTS.INITIAL_COMBO,
        timer: 0,
      };
      state.ui = {
        showScenario: true,
        showBriefing: false,
        showVictoryPopup: false,
        showFinalStats: false,
        feedback: '',
        isComplete: false,
        activeDragPiece: null,
      };
      state.progress = {
        currentScenarioIndex: 0,
        scenarioResults: [],
        placedPieces: { violations: [], actions: [] },
        isGameComplete: false,
        startTime: Date.now(),
      };
      state.error = null;
    },

    // ===== LOADING AND ERROR STATES =====
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // ===== PROGRESS PERSISTENCE =====
    saveGameProgress: (state, action: PayloadAction<{
      moduleId: string;
      userId: string;
      timestamp: number;
    }>) => {
      // Mark that progress has been saved
      state.progress.lastSaved = action.payload.timestamp;
    },

    loadGameProgress: (state, action: PayloadAction<{
      gameStats: GameStats;
      progress: Partial<GameProgress>;
      ui?: Partial<UIState>;
    }>) => {
      const { gameStats, progress, ui } = action.payload;

      // Restore game stats
      state.gameStats = { ...state.gameStats, ...gameStats };

      // Restore progress
      if (progress.currentScenarioIndex !== undefined) {
        state.progress.currentScenarioIndex = progress.currentScenarioIndex;
      }
      if (progress.scenarioResults) {
        state.progress.scenarioResults = progress.scenarioResults;
      }
      if (progress.placedPieces) {
        state.progress.placedPieces = progress.placedPieces;
      }
      if (progress.isGameComplete !== undefined) {
        state.progress.isGameComplete = progress.isGameComplete;
      }

      // Restore UI state if provided
      if (ui) {
        state.ui = { ...state.ui, ...ui };
      }
    },

    // ===== CONTINUE GAME =====
    continueGame: (state, action: PayloadAction<{
      fromScenarioIndex: number;
      preserveStats?: boolean;
    }>) => {
      const { fromScenarioIndex, preserveStats = true } = action.payload;

      // Set the scenario index
      state.progress.currentScenarioIndex = fromScenarioIndex;

      // Reset UI state for continuation
      state.ui.showScenario = true;
      state.ui.showVictoryPopup = false;
      state.ui.showFinalStats = false;
      state.ui.isComplete = false;
      state.ui.feedback = '';

      // Optionally preserve or reset stats
      if (!preserveStats) {
        state.gameStats.score = GAME_CONSTANTS.INITIAL_SCORE;
        state.gameStats.health = GAME_CONSTANTS.INITIAL_HEALTH;
        state.gameStats.combo = GAME_CONSTANTS.INITIAL_COMBO;
      }
    },
  },
});

// ===== EXPORTS =====
export const {
  // Scenario management
  setScenarios,
  nextScenario,

  // Game stats
  updateGameStats,
  incrementScore,
  decreaseHealth,
  incrementCombo,
  resetCombo,
  incrementTimer,
  resetTimer,

  // UI state
  showScenario,
  hideScenario,
  showBriefing,
  hideBriefing,
  showVictoryPopup,
  hideVictoryPopup,
  showFinalStats,
  hideFinalStats,
  setFeedback,
  clearFeedback,
  setActiveDragPiece,

  // Piece placement
  dropPiece,

  // Scenario completion
  completeScenario,

  // Game reset
  resetGame,

  // Loading and error
  setLoading,
  setError,
  clearError,

  // Progress persistence
  saveGameProgress,
  loadGameProgress,
  continueGame,
} = level3Slice.actions;

export default level3Slice.reducer;
