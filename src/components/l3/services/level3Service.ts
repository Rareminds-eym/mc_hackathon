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
   * Get top 3 best scores for a module (Frontend implementation)
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

      // Query the level3_progress table directly instead of using the database function
      const { data, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', module)
        .eq('is_completed', true)
        .order('final_score', { ascending: false })
        .order('total_time', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Level3Service: Error fetching top scores:', error);
        throw new Error(`Error fetching top scores: ${error.message}`);
      }

      // Transform the data to match the expected format using correct column names
      const transformedData = data?.map((score: any) => ({
        user_id: score.user_id,
        scenario_index: score.scenario_index,
        best_score: score.final_score || score.score || 0,
        final_score: score.final_score || score.score || 0,
        best_time: score.total_time || 0,
        total_time: score.total_time || 0,
        total_attempts: 1, // Simplified since we don't track attempts in current schema
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
   * Get last 3 module attempts for a user (using modified table structure)
   */
  static async getLast3Attempts(module: string): Promise<{
    data: any[] | null;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Query the modified level3_progress table for module completion records
      const { data, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', module)
        .eq('is_module_complete', true)
        .order('attempt_created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Level3Service: Error fetching last 3 attempts:', error);
        throw new Error(`Error fetching attempts: ${error.message}`);
      }

      // Transform data to match expected format
      const transformedData = (data || []).map((attempt: any) => ({
        id: attempt.id,
        total_score: attempt.module_total_score,
        total_time: attempt.module_total_time,
        avg_health: attempt.module_avg_health,
        total_combo: attempt.module_total_combo,
        scenario_results: attempt.module_scenario_results,
        created_at: attempt.attempt_created_at,
        attempt_number: attempt.attempt_number,
        is_top_performance: attempt.is_top_performance
      }));

      return {
        data: transformedData,
        error: null
      };
    } catch (error) {
      console.error('Level3Service: Exception in getLast3Attempts:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get top performance for a user and module (using modified table structure)
   */
  static async getTopPerformance(module: string): Promise<{
    data: any | null;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Query the modified level3_progress table for top performance record
      const { data, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', module)
        .eq('is_module_complete', true)
        .eq('is_top_performance', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Level3Service: Error fetching top performance:', error);
        throw new Error(`Error fetching top performance: ${error.message}`);
      }

      if (!data) {
        return { data: null, error: null };
      }

      // Transform data to match expected format
      const transformedData = {
        best_total_score: data.module_total_score,
        best_total_time: data.module_total_time,
        best_avg_health: data.module_avg_health,
        best_total_combo: data.module_total_combo,
        best_scenario_results: data.module_scenario_results,
        achieved_at: data.attempt_created_at,
        attempt_number: data.attempt_number
      };

      return {
        data: transformedData,
        error: null
      };
    } catch (error) {
      console.error('Level3Service: Exception in getTopPerformance:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get module performance history (last 3 attempts with performance indicators)
   */
  static async getModulePerformanceHistory(module: string): Promise<{
    data: any[] | null;
    error: Error | null;
  }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Query the modified level3_progress table for all module completion records
      const { data, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', module)
        .eq('is_module_complete', true)
        .order('attempt_number', { ascending: true });

      if (error) {
        console.error('Level3Service: Error fetching performance history:', error);
        throw new Error(`Error fetching performance history: ${error.message}`);
      }

      // Transform data to match expected format with attempt numbering
      const transformedData = (data || []).map((attempt: any, index: number) => ({
        attempt_number: attempt.attempt_number,
        total_score: attempt.module_total_score,
        total_time: attempt.module_total_time,
        avg_health: attempt.module_avg_health,
        total_combo: attempt.module_total_combo,
        created_at: attempt.attempt_created_at,
        is_top_performance: attempt.is_top_performance,
        scenario_results: attempt.module_scenario_results
      }));

      return {
        data: transformedData,
        error: null
      };
    } catch (error) {
      console.error('Level3Service: Exception in getModulePerformanceHistory:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
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
