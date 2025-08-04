import { supabase } from '../lib/supabase';

export interface GameUnlockStatus {
  id: number;
  created_at: string;
  is_lock: boolean;
}

export class GameUnlockService {
  /**
   * Check if the game is locked by querying the game_unlock table
   * Special case: user_id "5c4e1afc-35af-46fb-8f90-d77170f5ac9a" is always unlocked
   * @param userId - Optional user ID to check for special unlock conditions
   * @returns Promise<boolean> - true if game is locked, false if unlocked
   */
  static async isGameLocked(userId?: string): Promise<boolean> {
    try {
      console.log('🔍 Checking game unlock status...', { userId });
      
      // Special case: unlock for specific user_id
      if (userId === "5c4e1afc-35af-46fb-8f90-d77170f5ac9a") {
        console.log('🔓 Special unlock for user:', userId);
        return false;
      }
      
      const { data, error } = await supabase
        .from('game_unlock')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('📊 Game unlock query result:', { data, error });

      if (error) {
        console.error('❌ Error checking game unlock status:', error);
        // Default to locked if there's an error
        return true;
      }

      const isLocked = data?.is_lock ?? true;
      console.log(`🎮 Game status: ${isLocked ? 'LOCKED' : 'UNLOCKED'} (is_lock: ${data?.is_lock})`);
      
      return isLocked;
    } catch (error) {
      console.error('❌ Error in isGameLocked:', error);
      // Default to locked if there's an error
      return true;
    }
  }

  /**
   * Get the full game unlock status record
   * @returns Promise<GameUnlockStatus | null>
   */
  static async getGameUnlockStatus(): Promise<GameUnlockStatus | null> {
    try {
      const { data, error } = await supabase
        .from('game_unlock')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching game unlock status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getGameUnlockStatus:', error);
      return null;
    }
  }

  /**
   * Update the game lock status (admin function)
   * @param isLocked - true to lock the game, false to unlock
   * @returns Promise<boolean> - success status
   */
  static async updateGameLockStatus(isLocked: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('game_unlock')
        .insert({
          is_lock: isLocked,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating game lock status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateGameLockStatus:', error);
      return false;
    }
  }
}