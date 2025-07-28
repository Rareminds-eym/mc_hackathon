import { supabase } from '../../../lib/supabase';

/**
 * Level3Service - Handles all database operations for Level 3 jigsaw game data
 * 
 * Key Features:
 * - UPSERT functionality with score history management
 * - Comprehensive error handling and logging
 * - Statistics calculation and completion tracking
 * - Integration with the simplified Level 3 database schema
 * 
 * Database Schema:
 * - module: TEXT (module identifier)
 * - level: INTEGER (level number, default 3)
 * - scenario_index: INTEGER (scenario within the level)
 * - current_score: INTEGER (best score achieved)
 * - time_taken: INTEGER (time for best score in seconds)
 * - score_history: INTEGER[] (top 3 scores)
 * - time_history: INTEGER[] (times corresponding to score_history)
 * - placed_pieces: JSONB (final piece placement data)
 * - is_completed: BOOLEAN (completion status)
 * - total_attempts: INTEGER (number of attempts)
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Level3GameData {
  id?: string;
  user_id: string;
  module: string;
  level: number;
  scenario_index: number;
  score: number[];
  placed_pieces?: any;
  is_completed: boolean;
  current_score: number;
  time_taken?: number;
  total_attempts: number;
  score_history: number[];
  time_history: number[];
  created_at?: string;
  updated_at?: string;
}

export interface Level3CompletionData {
  userId: string;
  module: string;
  level: number;
  scenario_index: number;
  finalScore: number;
  finalTime: number;
  placedPieces: any;
  isCompleted: boolean;
}

export interface Level3Stats {
  total_scenarios: number;
  completed_scenarios: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_playtime: number;
  improvement_rate: number;
  completion_rate: number;
}

export interface Level3ScoreHistory {
  current_score: number;
  previous_score: number;
  past_previous_score: number;
  current_time_value: number;
  previous_time: number;
  past_previous_time: number;
}

export interface Level3LeaderboardEntry {
  user_id: string;
  best_score: number;
  best_time: number;
  total_attempts: number;
  last_played: string;
}

export interface Level3LevelSummary {
  scenario_index: number;
  best_score: number;
  total_attempts: number;
  is_completed: boolean;
  last_played: string;
}

// =====================================================
// MAIN SERVICE CLASS
// =====================================================

export class Level3Service {
  private static readonly LEVEL_NUMBER = 3;
  private static lastSaveTimestamp: Map<string, number> = new Map();
  private static readonly SAVE_DEBOUNCE_MS = 1000; // Prevent saves within 1 second

  /**
   * Save game completion data with score history management
   */
  static async saveGameCompletion(completionData: Level3CompletionData): Promise<{ 
    data: any; 
    error: Error | null; 
    isNewHighScore: boolean;
  }> {
    try {
      console.log('Level3Service: Saving game completion:', completionData);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create save key for debouncing
      const saveKey = `${userData.user.id}-${completionData.module}-${completionData.scenario_index}`;
      const now = Date.now();
      const lastSave = this.lastSaveTimestamp.get(saveKey) || 0;

      if (now - lastSave < this.SAVE_DEBOUNCE_MS) {
        console.log('Level3Service: Skipping save due to debouncing');
        return { data: null, error: null, isNewHighScore: false };
      }

      this.lastSaveTimestamp.set(saveKey, now);

      // Get current best score to check for high score
      const { data: currentData } = await this.getBestScore(
        completionData.module, 
        completionData.scenario_index
      );
      
      const currentBestScore = currentData?.current_score || 0;
      const isNewHighScore = completionData.finalScore > currentBestScore;

      // Use the enhanced upsert function with history tracking
      const { data, error } = await supabase.rpc('upsert_level3_progress_with_history', {
        p_user_id: userData.user.id,
        p_module: completionData.module,
        p_level: this.LEVEL_NUMBER,
        p_scenario_index: completionData.scenario_index,
        p_score: completionData.finalScore,
        p_placed_pieces: completionData.placedPieces,
        p_is_completed: completionData.isCompleted,
        p_time_taken: completionData.finalTime
      });

      if (error) {
        console.error('Level3Service: Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Level3Service: Game completion saved successfully', { 
        data, 
        isNewHighScore 
      });

      return { data, error: null, isNewHighScore };

    } catch (error) {
      console.error('Level3Service: Error saving game completion:', error);
      return { 
        data: null, 
        error: error as Error, 
        isNewHighScore: false 
      };
    }
  }

  /**
   * Get user's best score for a specific module and scenario
   */
  static async getBestScore(module: string, scenarioIndex: number): Promise<{ 
    data: Level3GameData | null; 
    error: Error | null; 
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level3_best_performance', {
        p_user_id: userData.user.id,
        p_module: module,
        p_level: this.LEVEL_NUMBER,
        p_scenario_index: scenarioIndex
      });

      if (error) {
        console.error('Level3Service: Error fetching best score:', error);
        throw new Error(`Error fetching best score: ${error.message}`);
      }

      return { data: data?.[0] || null, error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching best score:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get past three attempts with score and time history
   */
  static async getPastThreeAttempts(module: string, scenarioIndex: number): Promise<{ 
    data: Level3ScoreHistory | null; 
    error: Error | null; 
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level3_past_three_attempts', {
        p_user_id: userData.user.id,
        p_module: module,
        p_level: this.LEVEL_NUMBER,
        p_scenario_index: scenarioIndex
      });

      if (error) {
        console.error('Level3Service: Error fetching score history:', error);
        throw new Error(`Error fetching score history: ${error.message}`);
      }

      return { data: data?.[0] || null, error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching score history:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get comprehensive game statistics for the user
   */
  static async getGameStats(module?: string): Promise<{ 
    data: Level3Stats | null; 
    error: Error | null; 
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level3_user_analytics', {
        p_user_id: userData.user.id,
        p_module: module || null
      });

      if (error) {
        console.error('Level3Service: Error fetching game stats:', error);
        throw new Error(`Error fetching game stats: ${error.message}`);
      }

      return { data: data?.[0] || null, error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching game stats:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get leaderboard for a specific module and scenario
   */
  static async getLeaderboard(
    module: string,
    scenarioIndex: number,
    limit: number = 10
  ): Promise<{
    data: Level3LeaderboardEntry[] | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_level3_leaderboard', {
        p_module: module,
        p_level: this.LEVEL_NUMBER,
        p_scenario_index: scenarioIndex,
        p_limit: limit
      });

      if (error) {
        console.error('Level3Service: Error fetching leaderboard:', error);
        throw new Error(`Error fetching leaderboard: ${error.message}`);
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching leaderboard:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get level summary for all scenarios in a module
   */
  static async getLevelSummary(module: string): Promise<{
    data: Level3LevelSummary[] | null;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level3_level_summary', {
        p_user_id: userData.user.id,
        p_module: module,
        p_level: this.LEVEL_NUMBER
      });

      if (error) {
        console.error('Level3Service: Error fetching level summary:', error);
        throw new Error(`Error fetching level summary: ${error.message}`);
      }

      return { data: data || [], error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching level summary:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update completion status for a specific scenario
   */
  static async updateCompletionStatus(
    module: string,
    scenarioIndex: number,
    isCompleted: boolean
  ): Promise<{
    data: any;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('update_level3_completion_status', {
        p_user_id: userData.user.id,
        p_module: module,
        p_level: this.LEVEL_NUMBER,
        p_scenario_index: scenarioIndex,
        p_is_completed: isCompleted
      });

      if (error) {
        console.error('Level3Service: Error updating completion status:', error);
        throw new Error(`Error updating completion status: ${error.message}`);
      }

      return { data, error: null };

    } catch (error) {
      console.error('Level3Service: Error updating completion status:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Check if a specific scenario is completed
   */
  static async isScenarioCompleted(module: string, scenarioIndex: number): Promise<boolean> {
    try {
      const { data } = await this.getBestScore(module, scenarioIndex);
      return data?.is_completed || false;
    } catch (error) {
      console.error('Level3Service: Error checking completion status:', error);
      return false;
    }
  }

  /**
   * Get overall completion rate for the user
   */
  static async getOverallCompletionRate(module?: string): Promise<number> {
    try {
      const { data } = await this.getGameStats(module);
      return data?.completion_rate || 0;
    } catch (error) {
      console.error('Level3Service: Error getting completion rate:', error);
      return 0;
    }
  }

  /**
   * Get top 3 best scores for a module (for final statistics display)
   */
  static async getTopThreeBestScores(module: string): Promise<{
    data: any[] | null;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level3_top_scores', {
        p_user_id: userData.user.id,
        p_module: module,
        p_level: this.LEVEL_NUMBER,
        p_limit: 3
      });

      if (error) {
        console.error('Level3Service: Error fetching top scores:', error);
        throw new Error(`Error fetching top scores: ${error.message}`);
      }

      // Transform the data to match the expected format
      const transformedData = data?.map((score: any) => ({
        scenario_index: score.scenario_index,
        best_score: score.best_score,
        best_time: score.best_time,
        total_attempts: score.total_attempts,
        is_completed: score.is_completed,
        placed_pieces: score.placed_pieces,
        created_at: score.created_at
      })) || [];

      return { data: transformedData, error: null };

    } catch (error) {
      console.error('Level3Service: Error fetching top scores:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Test database connection and function availability
   */
  static async testDatabaseConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Level3Service: Testing database connection...');

      // Test basic connection
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User not authenticated');
      }

      // Test if level3_progress table exists and functions work
      const { error } = await supabase.rpc('get_level3_user_analytics', {
        p_user_id: authData.user.id,
        p_module: null
      });

      if (error) {
        throw new Error(`Database function error: ${error.message}`);
      }

      console.log('Level3Service: Database connection test successful');
      return { success: true };

    } catch (error) {
      console.error('Level3Service: Database connection test failed:', error);
      return { success: false, error };
    }
  }
}

export default Level3Service;
