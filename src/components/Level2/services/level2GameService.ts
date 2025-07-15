import { supabase } from '../../../lib/supabase';
import { Level2GameData, Level2GameStats, Level2ScoreHistory, Level2GameDataWithHistory } from '../../../types/Level2/types';

/**
 * Level2GameService - Handles all database operations for Level 2 game data
 * 
 * Key Features:
 * - UPSERT functionality: If user data exists for a module/game mode, it updates; otherwise inserts
 * - Duplicate save prevention with debouncing
 * - Comprehensive error handling
 * - Statistics calculation and completion tracking
 * 
 * The service uses the upsert_level2_game_data database function to ensure
 * that only one record exists per user, module, level, and game mode combination.
 */
export class Level2GameService {
  private static readonly LEVEL_NUMBER = 2;
  private static lastSaveTimestamp: Map<string, number> = new Map();
  private static readonly SAVE_DEBOUNCE_MS = 1000; // Prevent saves within 1 second of each other

  /**
   * Save game progress to the database (UPSERT: insert or update if exists)
   */
  static async saveGameData(gameData: Omit<Level2GameData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Level2GameData | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create a unique key for this save operation
      const saveKey = `${userData.user.id}-${gameData.module_id}-${gameData.game_mode_id}`;
      const now = Date.now();
      const lastSave = this.lastSaveTimestamp.get(saveKey) || 0;

      // Check if we're trying to save too quickly (potential duplicate)
      if (now - lastSave < this.SAVE_DEBOUNCE_MS) {
        console.warn('Duplicate save attempt detected, skipping save');
        return { data: null, error: new Error('Duplicate save prevented') };
      }

      // Update the timestamp
      this.lastSaveTimestamp.set(saveKey, now);

      // Use the UPSERT function to insert or update existing data
      const { data, error } = await supabase.rpc('upsert_level2_game_data', {
        p_user_id: userData.user.id,
        p_module_id: gameData.module_id,
        p_level_number: gameData.level_number || this.LEVEL_NUMBER,
        p_game_mode_id: gameData.game_mode_id,
        p_score: gameData.score,
        p_is_completed: gameData.is_completed,
        p_time: gameData.time,
        p_total_terms: gameData.total_terms,
        p_placed_terms: gameData.placed_terms
      });

      if (error) {
        return { data: null, error };
      }

      // Fetch the updated/inserted record to return full data
      const { data: fullData, error: fetchError } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('id', data)
        .single();

      return { data: fullData, error: fetchError };
    } catch (error) {
      console.error('Error saving Level2 game data:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update existing game progress
   */
  static async updateGameData(id: string, gameData: Partial<Level2GameData>): Promise<{ data: Level2GameData | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('level2_game_data')
        .update(gameData)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating Level2 game data:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Upsert game data using the database function (more reliable for concurrent access)
   * This method specifically uses the upsert_level2_game_data database function
   */
  static async upsertGameData(gameData: Omit<Level2GameData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Level2GameData | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Use the database UPSERT function directly
      const { data: recordId, error } = await supabase.rpc('upsert_level2_game_data', {
        p_user_id: userData.user.id,
        p_module_id: gameData.module_id,
        p_level_number: gameData.level_number || this.LEVEL_NUMBER,
        p_game_mode_id: gameData.game_mode_id,
        p_score: gameData.score,
        p_is_completed: gameData.is_completed,
        p_time: gameData.time,
        p_total_terms: gameData.total_terms,
        p_placed_terms: gameData.placed_terms
      });

      if (error) {
        return { data: null, error };
      }

      // Fetch the complete record
      const { data: fullData, error: fetchError } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('id', recordId)
        .single();

      return { data: fullData, error: fetchError };
    } catch (error) {
      console.error('Error upserting Level2 game data:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user's game progress for a specific module and game mode
   */
  static async getUserGameData(moduleId: string, gameModeId: string): Promise<{ data: Level2GameData[] | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching Level2 game data:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user's best score for a specific module and game mode
   */
  static async getBestScore(moduleId: string, gameModeId: string): Promise<{ data: Level2GameData | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching best score:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get comprehensive game statistics for the user
   */
  static async getGameStats(moduleId: string, gameModeId: string): Promise<{ data: Level2GameStats | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data: games, error } = await supabase
        .from('level2_game_data')
        .select('score, time, is_completed, created_at')
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId);

      if (error || !games || games.length === 0) {
        return {
          data: {
            highScore: 0,
            totalGamesPlayed: 0,
            bestTime: 0,
            lastPlayedDate: '',
            perfectGames: 0,
            averageScore: 0,
          },
          error,
        };
      }

      const stats: Level2GameStats = {
        highScore: Math.max(...games.map(g => g.score)),
        totalGamesPlayed: games.length,
        bestTime: Math.min(...games.filter(g => g.time).map(g => g.time!)),
        lastPlayedDate: games[0].created_at || '',
        perfectGames: games.filter(g => g.score === 100).length,
        averageScore: Math.round(games.reduce((sum, g) => sum + g.score, 0) / games.length),
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error calculating game stats:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Check if user has completed this level for a specific module and game mode
   */
  static async hasCompletedLevel(moduleId: string, gameModeId: string): Promise<{ data: boolean; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('level2_game_data')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId)
        .eq('is_completed', true)
        .limit(1);

      return { data: !!(data && data.length > 0), error };
    } catch (error) {
      console.error('Error checking completion status:', error);
      return { data: false, error: error as Error };
    }
  }

  /**
   * Delete all game data for a user (for testing or reset purposes)
   */
  static async deleteUserGameData(moduleId?: string, gameModeId?: string): Promise<{ error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('level2_game_data')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('level_number', this.LEVEL_NUMBER);

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      if (gameModeId) {
        query = query.eq('game_mode_id', gameModeId);
      }

      const { error } = await query;
      return { error };
    } catch (error) {
      console.error('Error deleting game data:', error);
      return { error: error as Error };
    }
  }

  /**
   * Mark a level as completed for a specific module and game mode
   */
  static async markLevelCompleted(moduleId: string, gameModeId: string): Promise<{ error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Update all game records for this user, module, and game mode to mark as completed
      const { error } = await supabase
        .from('level2_game_data')
        .update({ is_completed: true })
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId);

      return { error };
    } catch (error) {
      console.error('Error marking level as completed:', error);
      return { error: error as Error };
    }
  }

  /**
   * Save game data with score history management using the enhanced UPSERT function
   * This method uses the upsert_level2_game_data_with_history function that manages score arrays
   */
  static async saveGameDataWithHistory(gameData: Omit<Level2GameData, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Level2GameData | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Create a unique key for this save operation
      const saveKey = `${userData.user.id}-${gameData.module_id}-${gameData.game_mode_id}`;
      const now = Date.now();
      const lastSave = this.lastSaveTimestamp.get(saveKey) || 0;

      // Check if we're trying to save too quickly (potential duplicate)
      if (now - lastSave < this.SAVE_DEBOUNCE_MS) {
        console.warn('Duplicate save attempt detected, skipping save');
        return { data: null, error: new Error('Duplicate save prevented') };
      }

      // Update the timestamp
      this.lastSaveTimestamp.set(saveKey, now);

      // Use the enhanced UPSERT function with history management
      const { data, error } = await supabase.rpc('upsert_level2_game_data_with_history', {
        p_user_id: userData.user.id,
        p_module_id: gameData.module_id,
        p_level_number: gameData.level_number || this.LEVEL_NUMBER,
        p_game_mode_id: gameData.game_mode_id,
        p_score: gameData.score,
        p_is_completed: gameData.is_completed,
        p_time: gameData.time || 0,
        p_total_terms: gameData.total_terms,
        p_placed_terms: gameData.placed_terms
      });

      if (error) {
        return { data: null, error };
      }

      // Fetch the updated/inserted record to return full data
      const { data: fullData, error: fetchError } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('id', data)
        .single();

      return { data: fullData, error: fetchError };
    } catch (error) {
      console.error('Error saving Level2 game data with history:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get the past three scores for a user, module, level, and game mode
   * Uses the get_level2_past_three_scores database function
   */
  static async getPastThreeScores(moduleId: string, gameModeId: string): Promise<{ data: Level2ScoreHistory | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_level2_past_three_scores', {
        p_user_id: userData.user.id,
        p_module_id: moduleId,
        p_level_number: this.LEVEL_NUMBER,
        p_game_mode_id: gameModeId
      });

      if (error) {
        return { data: null, error };
      }

      // The function returns an array, but we expect only one result
      const scoreHistory = data && data.length > 0 ? data[0] : null;
      return { data: scoreHistory, error: null };
    } catch (error) {
      console.error('Error fetching past three scores:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user's game data with score history arrays
   */
  static async getUserGameDataWithHistory(moduleId: string, gameModeId: string): Promise<{ data: Level2GameDataWithHistory | null; error: Error | null }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('level2_game_data')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module_id', moduleId)
        .eq('level_number', this.LEVEL_NUMBER)
        .eq('game_mode_id', gameModeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching Level2 game data with history:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Clear save debounce cache (useful for testing or when starting a new game session)
   */
  static clearSaveCache(): void {
    this.lastSaveTimestamp.clear();
  }

  /**
   * Test the UPSERT functionality (for development/testing purposes)
   */
  static async testUpsert(moduleId: string, gameModeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, message: 'User not authenticated' };
      }

      // First save
      const gameData1 = {
        module_id: moduleId,
        level_number: this.LEVEL_NUMBER,
        game_mode_id: gameModeId,
        score: 50,
        is_completed: false,
        time: 120,
        total_terms: 10,
        placed_terms: []
      };

      const { error: error1 } = await this.saveGameData(gameData1);
      if (error1) {
        return { success: false, message: `First save failed: ${error1.message}` };
      }

      // Second save (should update, not create new record)
      const gameData2 = {
        ...gameData1,
        score: 85,
        is_completed: true,
        time: 90
      };

      const { error: error2 } = await this.saveGameData(gameData2);
      if (error2) {
        return { success: false, message: `Second save failed: ${error2.message}` };
      }

      // Verify only one record exists
      const { data: allRecords, error: fetchError } = await this.getUserGameData(moduleId, gameModeId);
      if (fetchError) {
        return { success: false, message: `Fetch verification failed: ${fetchError.message}` };
      }

      if (!allRecords || allRecords.length !== 1) {
        return { success: false, message: `Expected 1 record, found ${allRecords?.length || 0}` };
      }

      const record = allRecords[0];
      if (record.score !== 85 || !record.is_completed) {
        return { success: false, message: 'Record was not updated correctly' };
      }

      return {
        success: true,
        message: `UPSERT test passed! Record ID: ${record.id}, Score updated from 50 to 85`
      };
    } catch (error) {
      return { success: false, message: `Test failed with error: ${error}` };
    }
  }

  /**
   * Test the UPSERT with history functionality (for development/testing purposes)
   */
  static async testUpsertWithHistory(moduleId: string, gameModeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Clear any existing data for clean test
      await this.deleteUserGameData(moduleId, gameModeId);

      // First save - score 50
      const gameData1 = {
        module_id: moduleId,
        level_number: this.LEVEL_NUMBER,
        game_mode_id: gameModeId,
        score: 50,
        is_completed: false,
        time: 120,
        total_terms: 10,
        placed_terms: []
      };

      const { error: error1 } = await this.saveGameDataWithHistory(gameData1);
      if (error1) {
        return { success: false, message: `First save failed: ${error1.message}` };
      }

      // Second save - score 75
      const gameData2 = {
        ...gameData1,
        score: 75,
        time: 100
      };

      const { error: error2 } = await this.saveGameDataWithHistory(gameData2);
      if (error2) {
        return { success: false, message: `Second save failed: ${error2.message}` };
      }

      // Third save - score 90
      const gameData3 = {
        ...gameData1,
        score: 90,
        is_completed: true,
        time: 80
      };

      const { error: error3 } = await this.saveGameDataWithHistory(gameData3);
      if (error3) {
        return { success: false, message: `Third save failed: ${error3.message}` };
      }

      // Test the score history retrieval
      const { data: scoreHistory, error: historyError } = await this.getPastThreeScores(moduleId, gameModeId);
      if (historyError) {
        return { success: false, message: `Score history fetch failed: ${historyError.message}` };
      }

      if (!scoreHistory) {
        return { success: false, message: 'No score history returned' };
      }

      // Verify the scores are in descending order (highest first)
      const expectedScores = [90, 75, 50]; // Should be sorted by score DESC
      const actualScores = [
        scoreHistory.current_score,
        scoreHistory.previous_score,
        scoreHistory.past_previous_score
      ].filter(score => score !== null && score !== undefined);

      if (actualScores.length !== 3) {
        return { success: false, message: `Expected 3 scores in history, got ${actualScores.length}` };
      }

      const scoresMatch = actualScores.every((score, index) => score === expectedScores[index]);
      if (!scoresMatch) {
        return {
          success: false,
          message: `Score history mismatch. Expected: [${expectedScores.join(', ')}], Got: [${actualScores.join(', ')}]`
        };
      }

      return {
        success: true,
        message: `History UPSERT test passed! Score history: [${actualScores.join(', ')}]`
      };
    } catch (error) {
      return { success: false, message: `History test failed with error: ${error}` };
    }
  }

}
