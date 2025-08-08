import { supabase } from '../lib/supabase';
import type { Module } from '../types/module';

export interface ModuleProgress {
  module_id: number;
  is_unlocked: boolean;
  is_completed: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ModuleSummary {
  module_id: number;
  total_levels: number;
  completed_levels: number;
  unlocked_levels: number;
  progress_percentage: number;
}

export interface ModuleProgressRecord {
  id: string;
  user_id: string;
  module_id: number;
  is_unlocked: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export class ModuleProgressService {
  /**
   * Test database connection and module functions availability
   */
  static async testDatabaseConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Testing module database connection...');

      // Test basic connection by querying auth.users
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('Auth test:', { authData, authError });

      // Test if module_progress table exists
      const { data: tableData, error: tableError } = await supabase
        .from('module_progress')
        .select('*')
        .limit(1);

      console.log('Module progress table test:', { tableData, tableError });

      return { success: !tableError, error: tableError };
    } catch (error) {
      console.error('Module database connection test failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Initialize modules for a new user (Module 1 unlocked, others locked)
   */
  static async initializeUserModules(userId: string): Promise<{ data: any; error: any }> {
    try {
      console.log('ModuleProgressService: Initializing modules for user:', userId);

      const { data, error } = await supabase.rpc('initialize_user_modules', {
        p_user_id: userId
      });

      console.log('ModuleProgressService: Initialize modules response:', { data, error });

      if (error) {
        console.error('Error initializing user modules:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in initializeUserModules:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all module progress for a user
   */
  static async getAllModuleProgress(userId: string): Promise<{ data: ModuleProgress[] | null; error: any }> {
    try {
      console.log('ModuleProgressService: Getting all module progress for user:', userId);

      const { data, error } = await supabase.rpc('get_all_module_progress', {
        p_user_id: userId
      });

      console.log('ModuleProgressService: Get all module progress response:', { data, error });

      if (error) {
        console.error('Error getting all module progress:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getAllModuleProgress:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a specific module is unlocked for a user
   */
  static async isModuleUnlocked(
    userId: string,
    moduleId: number
  ): Promise<{ data: boolean; error: any }> {
    try {
      console.log('ModuleProgressService: Checking if module is unlocked:', { userId, moduleId });

      const { data, error } = await supabase.rpc('is_module_unlocked', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      console.log('ModuleProgressService: Is module unlocked response:', { data, error });

      if (error) {
        console.error('Error checking if module is unlocked:', error);
        return { data: false, error };
      }

      return { data: data || false, error: null };
    } catch (error) {
      console.error('Error in isModuleUnlocked:', error);
      return { data: false, error };
    }
  }

  /**
   * Start a module for a user (creates record if doesn't exist)
   */
  static async startModule(
    userId: string,
    moduleId: number
  ): Promise<{ data: any; error: any }> {
    try {
      console.log('ModuleProgressService: Starting module:', { userId, moduleId });

      const { data, error } = await supabase.rpc('start_module', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      console.log('ModuleProgressService: Start module response:', { data, error });

      if (error) {
        console.error('Error starting module:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in startModule:', error);
      return { data: null, error };
    }
  }

  /**
   * Mark a module as completed for a user
   */
  static async completeModule(
    userId: string,
    moduleId: number
  ): Promise<{ data: any; error: any }> {
    try {
      console.log('ModuleProgressService: Completing module:', { userId, moduleId });

      const { data, error } = await supabase.rpc('complete_module', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      console.log('ModuleProgressService: Complete module response:', { data, error });

      if (error) {
        console.error('Error completing module:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in completeModule:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's module summary with level statistics
   */
  static async getUserModuleSummary(userId: string): Promise<{ data: ModuleSummary[] | null; error: any }> {
    try {
      console.log('ModuleProgressService: Getting user module summary for:', userId);

      const { data, error } = await supabase.rpc('get_user_module_summary', {
        p_user_id: userId
      });

      console.log('ModuleProgressService: Get user module summary response:', { data, error });

      if (error) {
        console.error('Error getting user module summary:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getUserModuleSummary:', error);
      return { data: null, error };
    }
  }

  /**
   * Get module progress directly from the table
   */
  static async getModuleProgressRecords(
    userId: string,
    moduleId?: number
  ): Promise<{ data: ModuleProgressRecord[] | null; error: any }> {
    try {
      let query = supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', userId);

      if (moduleId !== undefined) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query.order('module_id', { ascending: true });

      if (error) {
        console.error('Error getting module progress records:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getModuleProgressRecords:', error);
      return { data: null, error };
    }
  }

  /**
   * Reset user module progress (for debugging/testing)
   */
  static async resetUserModuleProgress(userId: string): Promise<{ data: any; error: any }> {
    try {
      console.log('ModuleProgressService: Resetting user module progress for:', userId);

      const { data, error } = await supabase.rpc('reset_user_module_progress', {
        p_user_id: userId
      });

      console.log('ModuleProgressService: Reset user module progress response:', { data, error });

      if (error) {
        console.error('Error resetting user module progress:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in resetUserModuleProgress:', error);
      return { data: null, error };
    }
  }

  /**
   * Convert ModuleProgress data to Module format for UI components
   */
  static convertToModuleFormat(
    moduleProgress: ModuleProgress[],
    moduleSummary?: ModuleSummary[]
  ): Module[] {
    const moduleNames = {
      1: 'Foundation Module',
      2: 'Intermediate Module', 
      3: 'Advanced Module',
      4: 'Expert Module'
    };

    return moduleProgress.map((progress) => {
      const summary = moduleSummary?.find(s => s.module_id === progress.module_id);
      
      let status: 'completed' | 'available' | 'locked' = 'locked';
      if (progress.is_completed) {
        status = 'completed';
      } else if (progress.is_unlocked) {
        status = 'available';
      }

      return {
        id: progress.module_id.toString(),
        status,
        title: moduleNames[progress.module_id as keyof typeof moduleNames] || `Module ${progress.module_id}`,
        progress: summary?.progress_percentage || 0
      };
    });
  }

  /**
   * Get modules formatted for UI components
   */
  static async getModulesForUI(userId: string): Promise<{ data: Module[] | null; error: any }> {
    try {
      // Get both module progress and summary
      const [progressResult, summaryResult] = await Promise.all([
        this.getAllModuleProgress(userId),
        this.getUserModuleSummary(userId)
      ]);

      if (progressResult.error) {
        return { data: null, error: progressResult.error };
      }

      if (summaryResult.error) {
        console.warn('Could not get module summary, proceeding without it:', summaryResult.error);
      }

      const modules = this.convertToModuleFormat(
        progressResult.data || [],
        summaryResult.data || []
      );

      return { data: modules, error: null };
    } catch (error) {
      console.error('Error in getModulesForUI:', error);
      return { data: null, error };
    }
  }

  /**
   * Handle module selection (start module if not started)
   */
  static async selectModule(
    userId: string,
    moduleId: number
  ): Promise<{ data: any; error: any }> {
    try {
      // First check if module is unlocked
      const { data: isUnlocked, error: unlockError } = await this.isModuleUnlocked(userId, moduleId);
      
      if (unlockError) {
        return { data: null, error: unlockError };
      }

      if (!isUnlocked) {
        return { 
          data: null, 
          error: { message: `Module ${moduleId} is locked and cannot be selected` }
        };
      }

      // Start the module (this will create a record if it doesn't exist)
      return await this.startModule(userId, moduleId);
    } catch (error) {
      console.error('Error in selectModule:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if module should be completed based on level completion
   */
  static async checkAndUpdateModuleCompletion(
    userId: string,
    moduleId: number
  ): Promise<{ data: any; error: any }> {
    try {
      console.log('ModuleProgressService: Checking and updating module completion:', { userId, moduleId });

      const { data, error } = await supabase.rpc('update_module_progress_on_level_completion', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      console.log('ModuleProgressService: Update module progress response:', { data, error });

      if (error) {
        console.error('Error updating module progress on level completion:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in checkAndUpdateModuleCompletion:', error);
      return { data: null, error };
    }
  }

  /**
   * Get module level count for a specific module
   */
  static getModuleLevelCount(moduleId: number): number {
    const levelCounts = {
      1: 4, // Module 1: 4 levels
      2: 3, // Module 2: 3 levels  
      3: 3, // Module 3: 3 levels
      4: 4  // Module 4: 4 levels
    };
    
    return levelCounts[moduleId as keyof typeof levelCounts] || 0;
  }

  /**
   * Utility method to ensure user has module records initialized
   */
  static async ensureUserModulesInitialized(userId: string): Promise<{ data: any; error: any }> {
    try {
      // Check if user has any module progress records
      const { data: existingProgress, error: checkError } = await this.getModuleProgressRecords(userId);
      
      if (checkError) {
        return { data: null, error: checkError };
      }

      // If no records exist, initialize them
      if (!existingProgress || existingProgress.length === 0) {
        console.log('No module progress found for user, initializing...');
        return await this.initializeUserModules(userId);
      }

      return { data: existingProgress, error: null };
    } catch (error) {
      console.error('Error in ensureUserModulesInitialized:', error);
      return { data: null, error };
    }
  }
}