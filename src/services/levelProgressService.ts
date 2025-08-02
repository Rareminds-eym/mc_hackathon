import { supabase } from '../lib/supabase';

export interface LevelProgress {
  id: string;
  user_id: string;
  module_id: number;
  level_id: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  level_id: number;
  is_completed: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserProgressSummary {
  module_id: number;
  total_levels: number;
  completed_levels: number;
  progress_percentage: number;
}

export class LevelProgressService {
  /**
   * Test database connection and function availability
   */
  static async testDatabaseConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Testing database connection...');

      // Test basic connection by querying auth.users
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth test:', { authData, authError });

      // Test if level_progress table exists
      const { data: tableData, error: tableError } = await supabase
        .from('level_progress')
        .select('*')
        .limit(1);

      console.log('Table test:', { tableData, tableError });

      return { success: !tableError, error: tableError };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error };
    }
  }
  /**
   * Mark a level as completed for a user
   */
  static async completeLevel(
    userId: string,
    moduleId: number,
    levelId: number
  ): Promise<{ data: any; error: any }> {
    try {
      console.log('LevelProgressService: Calling complete_level RPC with params:', {
        p_user_id: userId,
        p_module_id: moduleId,
        p_level_id: levelId
      });

      const { data, error } = await supabase.rpc('complete_level', {
        p_user_id: userId,
        p_module_id: moduleId,
        p_level_id: levelId
      });

      console.log('LevelProgressService: RPC response:', { data, error });

      if (error) {
        console.error('Error completing level:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in completeLevel:', error);
      return { data: null, error };
    }
  }

  /**
   * Start a level for a user (creates record if doesn't exist)
   */
  static async startLevel(
    userId: string,
    moduleId: number,
    levelId: number
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.rpc('start_level', {
        p_user_id: userId,
        p_module_id: moduleId,
        p_level_id: levelId
      });

      if (error) {
        console.error('Error starting level:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in startLevel:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a level is unlocked for a user
   */
  static async isLevelUnlocked(
    userId: string,
    moduleId: number,
    levelId: number
  ): Promise<{ data: boolean; error: any }> {
    try {
      const { data, error } = await supabase.rpc('is_level_unlocked', {
        p_user_id: userId,
        p_module_id: moduleId,
        p_level_id: levelId
      });

      if (error) {
        console.error('Error checking if level is unlocked:', error);
        return { data: false, error };
      }

      return { data: data || false, error: null };
    } catch (error) {
      console.error('Error in isLevelUnlocked:', error);
      return { data: false, error };
    }
  }

  /**
   * Get user's progress for a specific module
   */
  static async getModuleProgress(
    userId: string,
    moduleId: number
  ): Promise<{ data: ModuleProgress[] | null; error: any }> {
    try {
      const { data, error } = await supabase.rpc('get_module_progress', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      if (error) {
        console.error('Error getting module progress:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getModuleProgress:', error);
      return { data: null, error };
    }
  }

  /**
   * Get overall user progress summary (Frontend implementation)
   */
  static async getUserProgressSummary(
    userId: string
  ): Promise<{ data: UserProgressSummary[] | null; error: any }> {
    try {
      // Query the level3_progress table directly instead of using the database function
      const { data, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user progress summary:', error);
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Group data by module_id and calculate summary statistics
      const moduleGroups = data.reduce((groups: any, record: any) => {
        const moduleId = record.module_id || 'unknown';
        if (!groups[moduleId]) {
          groups[moduleId] = [];
        }
        groups[moduleId].push(record);
        return groups;
      }, {});

      // Calculate summary for each module
      const summaries: UserProgressSummary[] = Object.entries(moduleGroups).map(([moduleId, records]: [string, any[]]) => {
        const totalScenarios = records.length;
        const completedScenarios = records.filter(r => r.is_completed).length;
        const bestScore = Math.max(...records.map(r => r.final_score || r.score || 0));
        const totalTime = records.reduce((sum, r) => sum + (r.total_time || 0), 0);
        const completionRate = totalScenarios > 0 ? (completedScenarios / totalScenarios) * 100 : 0;
        const lastPlayed = records.reduce((latest, r) => {
          const recordDate = new Date(r.created_at || 0);
          return recordDate > latest ? recordDate : latest;
        }, new Date(0));

        return {
          module_id: moduleId,
          level_id: 3, // Level 3 is hardcoded since this is level3_progress table
          total_scenarios: totalScenarios,
          completed_scenarios: completedScenarios,
          best_score: bestScore,
          total_time: totalTime,
          completion_rate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
          last_played: lastPlayed.toISOString()
        };
      });

      return { data: summaries, error: null };
    } catch (error) {
      console.error('Error in getUserProgressSummary:', error);
      return { data: null, error };
    }
  }

  /**
   * Get level progress directly from the table
   */
  static async getLevelProgress(
    userId: string,
    moduleId?: number,
    levelId?: number
  ): Promise<{ data: LevelProgress[] | null; error: any }> {
    try {
      let query = supabase
        .from('level_progress')
        .select('*')
        .eq('user_id', userId);

      if (moduleId !== undefined) {
        query = query.eq('module_id', moduleId);
      }

      if (levelId !== undefined) {
        query = query.eq('level_id', levelId);
      }

      const { data, error } = await query.order('module_id', { ascending: true })
        .order('level_id', { ascending: true });

      if (error) {
        console.error('Error getting level progress:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getLevelProgress:', error);
      return { data: null, error };
    }
  }

  /**
   * Reset user progress (for debugging/testing)
   */
  static async resetUserProgress(userId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.rpc('reset_user_progress', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error resetting user progress:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in resetUserProgress:', error);
      return { data: null, error };
    }
  }

  /**
   * Initialize user with only level 1 unlocked for a module
   */
  static async initializeUserProgress(
    userId: string,
    moduleId: number
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.rpc('initialize_user_progress', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      if (error) {
        console.error('Error initializing user progress:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in initializeUserProgress:', error);
      return { data: null, error };
    }
  }
}
