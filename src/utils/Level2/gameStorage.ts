// Game storage utility for managing scores and progress
import { Term } from '../../types/Level2/types';

export interface GameStats {
  highScore: number;
  totalGamesPlayed: number;
  bestTime: number;
  lastPlayedDate: string;
  perfectGames: number;
}

// Interface for individual term placement results
export interface TermPlacementResult {
  termId: string;
  termText: string;
  correctCategory: string;
  placedCategory: string;
  isCorrect: boolean;
  timestamp: number;
  moduleId: string;
  gameModeId: string;
  type: number;
}

// Interface for Level2 game state
export interface Level2GameState {
  terms: Term[];
  total_time: number;
  moves: number;
  total_score: number;
  time: number;
  gameStarted: boolean;
  hasExecuted: boolean;
  moduleId: string;
  gameModeId: string;
  type: number;
}



export class GameStorage {
  private static readonly STORAGE_KEY = 'gmp-quest-stats';
  private static readonly TERM_PLACEMENT_KEY = 'gmp-term-placements';
  private static readonly LEVEL2_GAME_STATE_KEY = 'gmp-level2-game-state';

  public static getStats(): GameStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading game stats:', error);
    }

    // Return default stats
    return {
      highScore: 0,
      totalGamesPlayed: 0,
      bestTime: 0,
      lastPlayedDate: '',
      perfectGames: 0
    };
  }

  public static saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error saving game stats:', error);
    }
  }

  public static updateScore(newScore: number, timeElapsed: number, isPerfect: boolean = false): GameStats {
    const currentStats = this.getStats();
    
    const updatedStats: GameStats = {
      highScore: Math.max(currentStats.highScore, newScore),
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      bestTime: currentStats.bestTime === 0 ? timeElapsed : Math.min(currentStats.bestTime, timeElapsed),
      lastPlayedDate: new Date().toISOString(),
      perfectGames: currentStats.perfectGames + (isPerfect ? 1 : 0)
    };

    this.saveStats(updatedStats);
    return updatedStats;
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Clear any existing Level 2 game state keys from localStorage (cleanup method)
   */
  public static clearLegacyLevel2GameStates(): void {
    try {
      const keys = Object.keys(localStorage);
      const legacyKeys = keys.filter(key =>
        key.startsWith('gmp-level2-game-state') ||
        key.startsWith('gmp-level-2-game-state')
      );

      legacyKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Error clearing legacy Level2 game states:', error);
    }
  }

  // Term Placement Results Methods

  /**
   * Generate a unique key for term placement results based on module, gameMode, and type
   */
  private static getTermPlacementKey(moduleId: string, gameModeId: string, type: number): string {
    return `${this.TERM_PLACEMENT_KEY}-${moduleId}-${gameModeId}-${type}`;
  }

  /**
   * Save a term placement result to localStorage
   */
  public static saveTermPlacementResult(result: TermPlacementResult): void {
    try {
      const key = this.getTermPlacementKey(result.moduleId, result.gameModeId, result.type);

      // Get existing results or initialize empty array
      const existingResults = this.getTermPlacementResults(result.moduleId, result.gameModeId, result.type);

      // Remove any existing result for the same term (in case of re-placement)
      const filteredResults = existingResults.filter(r => r.termId !== result.termId);

      // Add the new result
      const updatedResults = [...filteredResults, result];

      localStorage.setItem(key, JSON.stringify(updatedResults));
    } catch (error) {
      // Error saving term placement result
    }
  }

  /**
   * Get all term placement results for a specific game
   */
  public static getTermPlacementResults(moduleId: string, gameModeId: string, type: number): TermPlacementResult[] {
    try {
      const key = this.getTermPlacementKey(moduleId, gameModeId, type);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as TermPlacementResult[];
      }
    } catch (error) {
      // Error loading term placement results
    }
    return [];
  }

  /**
   * Clear term placement results for a specific game
   */
  public static clearTermPlacementResults(moduleId: string, gameModeId: string, type: number): void {
    try {
      const key = this.getTermPlacementKey(moduleId, gameModeId, type);
      localStorage.removeItem(key);
    } catch (error) {
      // Error clearing term placement results
    }
  }

  /**
   * Clear all term placement results for a specific module
   */
  public static clearAllTermPlacementResultsForModule(moduleId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const modulePrefix = `${this.TERM_PLACEMENT_KEY}-${moduleId}-`;
      const moduleKeys = keys.filter(key => key.startsWith(modulePrefix));

      moduleKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      // Error clearing term placement results for module
    }
  }

  /**
   * Clear ALL term placement results for all modules and games
   */
  public static clearAllTermPlacementResults(): void {
    try {
      const keys = Object.keys(localStorage);
      const termPlacementKeys = keys.filter(key => key.startsWith(this.TERM_PLACEMENT_KEY));

      termPlacementKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      // Error clearing all term placement results
    }
  }

  /**
   * Clear the quest stats from localStorage with enhanced debugging
   */
  public static clearQuestStats(): void {
    try {
      const questStatsValue = localStorage.getItem(this.STORAGE_KEY);
      const questStatsExists = questStatsValue !== null;

      if (questStatsExists) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      // Error in clearQuestStats
    }
  }

  /**
   * Force clear the quest stats key - removes it regardless of whether it exists
   * This is a more aggressive approach for debugging
   */
  public static forceClearQuestStats(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      // Error in forceClearQuestStats
    }
  }

  // Level2 Game State Methods

  /**
   * Generate a unique key for Level2 game state based on module, gameMode, and type
   */
  private static getLevel2GameStateKey(moduleId: string, gameModeId: string, type: number): string {
    return `${this.LEVEL2_GAME_STATE_KEY}-${moduleId}-${gameModeId}-${type}`;
  }

  /**
   * Save Level2 game state to localStorage
   */
  public static saveLevel2GameState(gameState: Level2GameState): void {
    try {
      const key = this.getLevel2GameStateKey(gameState.moduleId, gameState.gameModeId, gameState.type);
      localStorage.setItem(key, JSON.stringify(gameState));
    } catch (error) {
      // Error saving Level2 game state
    }
  }

  /**
   * Load Level2 game state from localStorage
   */
  public static loadLevel2GameState(moduleId: string, gameModeId: string, type: number): Level2GameState | null {
    try {
      const key = this.getLevel2GameStateKey(moduleId, gameModeId, type);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as Level2GameState;
      }
    } catch (error) {
      // Error loading Level2 game state
    }
    return null;
  }

  /**
   * Check if Level2 game state exists in localStorage
   */
  public static hasLevel2GameState(moduleId: string, gameModeId: string, type: number): boolean {
    try {
      const key = this.getLevel2GameStateKey(moduleId, gameModeId, type);
      return localStorage.getItem(key) !== null;
    } catch (error) {
      // Error checking Level2 game state
      return false;
    }
  }

  /**
   * Clear Level2 game state from localStorage
   */
  public static clearLevel2GameState(moduleId: string, gameModeId: string, type: number): void {
    try {
      const key = this.getLevel2GameStateKey(moduleId, gameModeId, type);
      localStorage.removeItem(key);
    } catch (error) {
      // Error clearing Level2 game state
    }
  }

  /**
   * Clear all Level2 game states for a specific module
   */
  public static clearAllLevel2GameStatesForModule(moduleId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const modulePrefix = `${this.LEVEL2_GAME_STATE_KEY}-${moduleId}-`;
      const moduleKeys = keys.filter(key => key.startsWith(modulePrefix));

      moduleKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      // Error clearing Level2 game states for module
    }
  }

  /**
   * List all Level2 game state keys in localStorage (for debugging)
   */
  public static listAllLevel2GameStateKeys(): void {
    try {
      const keys = Object.keys(localStorage);
      const level2Keys = keys.filter(key =>
        key.startsWith(this.LEVEL2_GAME_STATE_KEY) ||
        key.startsWith('gmp-level2-game-state') ||
        key.startsWith('gmp-level-2-game-state')
      );
    } catch (error) {
      // Error listing Level2 game state keys
    }
  }

  /**
   * List all relevant localStorage keys (for comprehensive debugging)
   */
  public static listAllRelevantKeys(): void {
    try {
      const keys = Object.keys(localStorage);

      // Categorize keys
      const termPlacementKeys = keys.filter(key => key.startsWith(this.TERM_PLACEMENT_KEY));
      const level2GameStateKeys = keys.filter(key =>
        key.startsWith(this.LEVEL2_GAME_STATE_KEY) ||
        key.startsWith('gmp-level2-game-state') ||
        key.startsWith('gmp-level-2-game-state')
      );
      const questStatsKeys = keys.filter(key => key === this.STORAGE_KEY);
      const otherGmpKeys = keys.filter(key =>
        key.startsWith('gmp-') &&
        !termPlacementKeys.includes(key) &&
        !level2GameStateKeys.includes(key) &&
        !questStatsKeys.includes(key)
      );

      const totalRelevantKeys = termPlacementKeys.length + level2GameStateKeys.length + questStatsKeys.length + otherGmpKeys.length;
    } catch (error) {
      // Error listing all relevant keys
    }
  }
}