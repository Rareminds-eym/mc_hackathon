import Dexie from 'dexie';

// Configure Dexie database with the 4 Supabase tables
export class OfflineDatabase extends Dexie {
  constructor() {
    super('GMPOfflineDB');
    
    // Define schemas matching Supabase table structures exactly
    this.version(1).stores({
      // level_progress table
      level_progress: 'id, user_id, module_id, level_id, is_completed, created_at, updated_at, [user_id+module_id+level_id]',

      // level_1 table
      level_1: 'id, user_id, username, session_id, game_start_time, game_end_time, total_time_seconds, score, score_history, timer_history, rows_solved, cells_selected, completed_lines, board_state, is_completed, current_definition, module_number, level_number, [user_id+module_number+level_number+session_id]',

      // level2_game_data table
      level2_game_data: 'id, user_id, module_id, level_number, game_mode_ids, score, is_completed, time, total_terms, placed_terms, score_history, time_history, created_at, updated_at, [user_id+module_id+level_number]',

      // level3_progress table
      level3_progress: 'id, user_id, module, level, scenario_index, score, placed_pieces, is_completed, current_score, time_taken, total_attempts, score_history, time_history, created_at, updated_at, [user_id+module+level+scenario_index]',

      // level_4 table
      level_4: 'id, user_id, module, level, score, time_history, score_history, cases, is_completed, created_at, updated_at, time, [user_id+module]'
    });

    // Define table references for easy access
    this.levelProgress = this.table('level_progress');
    this.level1 = this.table('level_1');
    this.level2GameData = this.table('level2_game_data');
    this.level3Progress = this.table('level3_progress');
    this.level4 = this.table('level_4');
  }
}

// Create and export database instance
export const db = new OfflineDatabase();

// Helper function to get all table names
export const getTableNames = () => ['level_progress', 'level_1', 'level2_game_data', 'level3_progress', 'level_4'];

// Helper function to clear all offline data
export const clearOfflineData = async () => {
  try {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
      }
    });
    console.log('All offline data cleared');
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
};

// Helper function to get database stats
export const getDatabaseStats = async () => {
  try {
    const stats = {};
    for (const tableName of getTableNames()) {
      const count = await db.table(tableName).count();
      stats[tableName] = count;
    }
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {};
  }
};
