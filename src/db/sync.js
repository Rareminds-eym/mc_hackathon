import { supabase } from '../lib/supabase';
import { db, getTableNames } from './dexie';

/**
 * Pull all data from Supabase and store in Dexie
 * Fetches every row from each table and uses bulkPut to store locally
 */
export const pullFromSupabase = async () => {
  try {
    console.log('Starting data pull from Supabase...');
    const results = {};
    
    // Get current user to filter data
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Pull data from each table
    for (const tableName of getTableNames()) {
      try {
        console.log(`Pulling data from ${tableName}...`);
        
        // Fetch all rows for the current user from Supabase
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          results[tableName] = { success: false, error, count: 0 };
          continue;
        }

        // Store in Dexie using bulkPut (upsert operation)
        const table = db.table(tableName);
        await table.bulkPut(data || []);
        
        const count = data?.length || 0;
        console.log(`Successfully pulled ${count} records from ${tableName}`);
        results[tableName] = { success: true, count };
        
      } catch (tableError) {
        console.error(`Error processing ${tableName}:`, tableError);
        results[tableName] = { success: false, error: tableError, count: 0 };
      }
    }

    console.log('Data pull completed:', results);
    return { success: true, results };
    
  } catch (error) {
    console.error('Error pulling data from Supabase:', error);
    return { success: false, error };
  }
};

/**
 * Push all local data to Supabase
 * Reads local rows and upserts them back (overwrites server rows, no conflict resolution)
 */
export const pushToSupabase = async () => {
  try {
    console.log('Starting data push to Supabase...');
    const results = {};
    
    // Get current user to ensure we only push user's data
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Push data from each table
    for (const tableName of getTableNames()) {
      try {
        console.log(`Pushing data to ${tableName}...`);
        
        // Get all local data for this user
        const table = db.table(tableName);
        const localData = await table.where('user_id').equals(user.id).toArray();
        
        if (!localData || localData.length === 0) {
          console.log(`No local data found for ${tableName}`);
          results[tableName] = { success: true, count: 0 };
          continue;
        }

        // Upsert to Supabase (this will overwrite existing records)
        const { error } = await supabase
          .from(tableName)
          .upsert(localData, { 
            onConflict: getUpsertConflictColumns(tableName),
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Error pushing to ${tableName}:`, error);
          results[tableName] = { success: false, error, count: 0 };
          continue;
        }

        console.log(`Successfully pushed ${localData.length} records to ${tableName}`);
        results[tableName] = { success: true, count: localData.length };
        
      } catch (tableError) {
        console.error(`Error processing ${tableName}:`, tableError);
        results[tableName] = { success: false, error: tableError, count: 0 };
      }
    }

    console.log('Data push completed:', results);
    return { success: true, results };
    
  } catch (error) {
    console.error('Error pushing data to Supabase:', error);
    return { success: false, error };
  }
};

/**
 * Get the conflict resolution columns for upsert operations
 * Based on the unique constraints defined in the Supabase schema
 */
const getUpsertConflictColumns = (tableName) => {
  const conflictColumns = {
    'level_progress': 'user_id,module_id,level_id',
    'level_1': 'user_id,module_number,level_number,session_id',
    'level2_game_data': 'user_id,module_id,level_number',
    'level3_progress': 'user_id,module,level,scenario_index',
    'level_4': 'user_id,module'
  };

  return conflictColumns[tableName] || 'id';
};

/**
 * Sync helper that pulls then pushes data
 * Useful for ensuring local and remote data are in sync
 */
export const fullSync = async () => {
  try {
    console.log('Starting full sync...');

    // First pull latest data from server
    const pullResult = await pullFromSupabase();
    if (!pullResult.success) {
      return { success: false, error: 'Pull failed', pullResult };
    }

    // Then push any local changes
    const pushResult = await pushToSupabase();
    if (!pushResult.success) {
      return { success: false, error: 'Push failed', pullResult, pushResult };
    }

    console.log('Full sync completed successfully');
    return {
      success: true,
      pullResult,
      pushResult
    };

  } catch (error) {
    console.error('Error during full sync:', error);
    return { success: false, error };
  }
};

/**
 * Check if there are any local changes that need to be synced
 * Useful for determining if sync is necessary
 */
export const hasLocalChanges = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return false;
    }

    // Check if any table has local data
    for (const tableName of getTableNames()) {
      const table = db.table(tableName);
      const count = await table.where('user_id').equals(user.id).count();
      if (count > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking for local changes:', error);
    return false;
  }
};

/**
 * Smart sync that only syncs if there are local changes or if enough time has passed
 */
export const smartSync = async (forceSync = false, lastSyncTime = null) => {
  try {
    // Check if we need to sync
    if (!forceSync) {
      const hasChanges = await hasLocalChanges();
      const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity;

      // Skip if no changes and recent sync (within 5 minutes)
      if (!hasChanges && timeSinceLastSync < 5 * 60 * 1000) {
        console.log('Smart sync: No changes detected and recent sync, skipping');
        return { success: true, skipped: true };
      }
    }

    // Perform the sync
    return await fullSync();
  } catch (error) {
    console.error('Error during smart sync:', error);
    return { success: false, error };
  }
};
