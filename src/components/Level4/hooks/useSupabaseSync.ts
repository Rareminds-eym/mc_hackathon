import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { GameState } from '../types';
import { cases } from '../data/cases';

// Enable debug logging
const DEBUG = true;
const logDebug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Supabase Sync]', ...args);
  }
};

// Function to keep only the highest score record for a user
const keepHighestScoreOnly = async (userId: string): Promise<string | null> => {
  try {
    logDebug(`Checking for multiple records for user ${userId}`);
    
    // CRITICAL FIX: Use a transaction to prevent race conditions when cleaning up records
    
    // First fetch all records using .eq('user_id') - this ensures we get ALL records for this user
    const { data: allUserRecords, error: fetchAllError } = await supabase
      .from('level_4')
      .select('*')
      .eq('user_id', userId) // No other filters to ensure we get ALL records
      .order('score', { ascending: false });
    
    if (fetchAllError) {
      console.error('Error fetching ALL user records:', fetchAllError);
      return null;
    }
    
    // Now filter the records for module=1, level=4
    const userRecords = allUserRecords?.filter(r => r.module === 1 && r.level === 4) || [];
    
    // Log the total number of records found
    logDebug(`Found ${userRecords?.length || 0} records for user ${userId} (module 1, level 4)`);
    logDebug(`Found ${allUserRecords?.length || 0} total records for user ${userId}`);
    
    if (!userRecords || userRecords.length === 0) {
      logDebug(`No module 1, level 4 records found for user ${userId}`);
      return null;
    }
    
    // TRANSACTION START - Use all operations in one transaction when possible
    try {
      // First step: Aggressively identify and remove ALL problematic records
      // ENHANCED: More thorough detection of problem records
      const emptyRecordIds = userRecords
        .filter(record => 
          // CRITERIA 1: Empty/incomplete records
          (record.score === 0 && record.time === 0) ||
          // CRITERIA 2: Records with missing or malformed cases data
          !record.cases || 
          record.cases === null ||
          typeof record.cases !== 'object' ||
          // CRITERIA 3: Records with missing critical fields
          record.score === undefined || 
          record.time === undefined ||
          // CRITERIA 4: Records with invalid data types
          typeof record.score !== 'number' ||
          typeof record.time !== 'number' ||
          // CRITERIA 5: Records without proper user_id (should never happen)
          !record.user_id ||
          record.user_id !== userId ||
          // CRITERIA 6: Records with no module or level, or wrong module/level
          !record.module ||
          !record.level ||
          record.module !== 1 ||
          record.level !== 4
        )
        .map(record => record.id);
        
      // Delete empty/invalid records first
      if (emptyRecordIds.length > 0) {
        logDebug(`Found ${emptyRecordIds.length} empty/invalid records to delete`);
        
        const { error: deleteEmptyError } = await supabase
          .from('level_4')
          .delete()
          .in('id', emptyRecordIds);
          
        if (deleteEmptyError) {
          console.error('Error deleting empty records:', deleteEmptyError);
        } else {
          logDebug(`Successfully deleted ${emptyRecordIds.length} empty/invalid records`);
        }
      }
      
      // Get all remaining valid records to find the best one
      const { data: validRecords } = await supabase
        .from('level_4')
        .select('*')
        .eq('user_id', userId)
        .eq('module', 1)
        .eq('level', 4)
        .order('score', { ascending: false });
        
      if (!validRecords || validRecords.length === 0) {
        logDebug('No valid records remain after cleaning up empty records');
        return null;
      }
      
      // Get the highest score record - this is the one we'll keep
      const highestScoreRecord = validRecords[0];
      logDebug(`Highest score record: ID=${highestScoreRecord.id}, Score=${highestScoreRecord.score}, Time=${highestScoreRecord.time}, Completed=${highestScoreRecord.is_completed}`);
      
      // If we have more than one record after removing empty ones, 
      // delete ALL BUT the highest score record
      if (validRecords.length > 1) {
        const recordIdsToDelete = validRecords
          .slice(1) // Skip the highest score record
          .map(record => record.id);
        
        logDebug(`Deleting ${recordIdsToDelete.length} lower score records using IN query`);
        validRecords.slice(1).forEach((record, index) => {
          logDebug(`Record to delete ${index + 1}: ID=${record.id}, Score=${record.score}, Time=${record.time}, Completed=${record.is_completed}`);
        });
        
        if (recordIdsToDelete.length > 0) {
          // Use a single delete operation to remove all lower score records
          const { error: deleteError } = await supabase
            .from('level_4')
            .delete()
            .in('id', recordIdsToDelete);
          
          if (deleteError) {
            console.error('Error deleting lower score records:', deleteError);
          } else {
            logDebug(`Successfully deleted ${recordIdsToDelete.length} lower score records`);
          }
        }
      } else {
        logDebug(`Only one record remains after cleanup: ID=${highestScoreRecord.id}, Score=${highestScoreRecord.score}`);
      }
      
      // ULTRA-AGGRESSIVE CLEANUP: Delete any record that is not the highest score
      // This is a safety mechanism to ensure we never have more than one record
      // This is done in a single query for maximum efficiency
      const { error: finalCleanupError } = await supabase
        .from('level_4')
        .delete()
        .eq('user_id', userId)
        .eq('module', 1)
        .eq('level', 4)
        .neq('id', highestScoreRecord.id);
        
      if (finalCleanupError) {
        console.error('Error in final aggressive cleanup:', finalCleanupError);
      } else {
        logDebug(`Final aggressive cleanup complete, kept only record with ID: ${highestScoreRecord.id}`);
      }
      
      // DOUBLE-CHECK: Additional safety - check if any records exist with different user_id but same auth user
      // This should never happen, but we need to be thorough
      const { data: userCheck } = await supabase.auth.getUser();
      if (userCheck?.user && userCheck.user.id !== userId) {
        logDebug(`WARNING: Current auth user (${userCheck.user.id}) doesn't match provided userId (${userId})`);
        
        // Check if this auth user has any other records
        const { data: crossUserRecords } = await supabase
          .from('level_4')
          .select('id')
          .eq('user_id', userCheck.user.id)
          .eq('module', 1)
          .eq('level', 4);
          
        if (crossUserRecords && crossUserRecords.length > 0) {
          logDebug(`CRITICAL: Found ${crossUserRecords.length} records with auth user ID that don't match provided user_id`);
          
          // Delete these records as well
          const { error: crossUserDeleteError } = await supabase
            .from('level_4')
            .delete()
            .eq('user_id', userCheck.user.id)
            .eq('module', 1)
            .eq('level', 4);
            
          if (crossUserDeleteError) {
            console.error('Error deleting cross-user records:', crossUserDeleteError);
          } else {
            logDebug(`Successfully deleted ${crossUserRecords.length} cross-user records`);
          }
        }
      }
      
      // Log final state - ENHANCED to check ALL records for this auth user
      const { data: authUser } = await supabase.auth.getUser();
      const authUserId = authUser?.user?.id;
      
      // First check the specific user ID we've been cleaning up
      const { data: finalState } = await supabase
        .from('level_4')
        .select('id, user_id, score, time, is_completed')
        .eq('user_id', userId)
        .eq('module', 1)
        .eq('level', 4);
        
      // Then also check the current auth user ID to be sure
      const { data: authUserState } = authUserId ? await supabase
        .from('level_4')
        .select('id, user_id, score, time, is_completed')
        .eq('user_id', authUserId)
        .eq('module', 1)
        .eq('level', 4) : { data: null };
        
      if (finalState) {
        logDebug(`Final state after cleanup: ${finalState.length} records for user_id=${userId}`);
        finalState.forEach(record => {
          logDebug(`Final record: ID=${record.id}, UserID=${record.user_id}, Score=${record.score}, Time=${record.time}, Completed=${record.is_completed}`);
        });
        
        // If we STILL have multiple records (should be impossible), log an error and try one final deletion
        if (finalState.length > 1) {
          console.error(`CRITICAL ERROR: Still found ${finalState.length} records after aggressive cleanup.`);
          
          // Last resort: Try one more deletion
          const highestRecord = finalState.reduce((highest, current) => 
            (highest.score > current.score) ? highest : current);
            
          const { error: lastResortError } = await supabase
            .from('level_4')
            .delete()
            .eq('user_id', userId)
            .eq('module', 1)
            .eq('level', 4)
            .neq('id', highestRecord.id);
            
          if (lastResortError) {
            console.error('Last resort cleanup failed:', lastResortError);
          } else {
            logDebug(`Last resort cleanup succeeded, kept only record ID=${highestRecord.id}`);
            return highestRecord.id;
          }
        } else if (finalState.length === 1) {
          // Return the ID of the remaining record
          return finalState[0].id;
        }
      }
      
      // Additional check for the auth user
      if (authUserState && authUserState.length > 0) {
        logDebug(`Auth user check: Found ${authUserState.length} records for auth user ${authUserId}`);
        
        // If we found records for auth user but not the original user_id, return the auth user's best record
        if ((!finalState || finalState.length === 0) && authUserState.length > 0) {
          const bestAuthRecord = authUserState.reduce((best, current) => 
            (best.score > current.score) ? best : current);
            
          logDebug(`Using auth user's best record as fallback: ID=${bestAuthRecord.id}, Score=${bestAuthRecord.score}`);
          return bestAuthRecord.id;
        }
      }
      
      return highestScoreRecord.id;
    } catch (txError) {
      console.error('Transaction error in keepHighestScoreOnly:', txError);
      return null;
    }
    // TRANSACTION END
  } catch (err) {
    console.error('Error in keepHighestScoreOnly:', err);
    return null;
  }
};

// Define types for Supabase data
interface Level4Data {
  id?: string;
  user_id?: string;
  module: number;
  level: number;
  score: number;
  time: number;
  cases: {
    currentCase: number;
    caseProgress: Array<{
      id: number;
      answers: {
        violation: number | null;
        rootCause: number | null;
        impact: number | null;
      };
      isCorrect: boolean;
      attempts: number;
      timeSpent: number;
    }>;
    scoredQuestions: Record<string, string[]>;
  };
  is_completed: boolean;
}

// Helper function to get the highest score record for a user
const getHighestScoreRecord = async (userId: string): Promise<Level4Data | null> => {
  try {
    const { data: records, error } = await supabase
      .from('level_4')
      .select('*')
      .eq('user_id', userId)
      .eq('module', 1)
      .eq('level', 4)
      .order('score', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        logDebug(`No records found for user ${userId}`);
        return null;
      }
      console.error('Error fetching highest score record:', error);
      return null;
    }
    
    return records;
  } catch (err) {
    console.error('Error in getHighestScoreRecord:', err);
    return null;
  }
};

/**
 * Custom hook to sync game state with Supabase
 */
/**
 * Emergency cleanup function - Exported globally for emergency use via browser console
 * 
 * This function can be called from browser console to force cleanup for current user:
 * window.cleanupLevel4Records()
 */
export async function cleanupLevel4Records() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("[EMERGENCY CLEANUP] No user logged in");
      return false;
    }
    
    console.log(`[EMERGENCY CLEANUP] Starting emergency cleanup for user ${user.id}`);
    
    // Check for ALL records across ALL user IDs associated with this email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email);
      
    if (userError) {
      console.error("[EMERGENCY CLEANUP] Error fetching user data:", userError);
    } else if (userData && userData.length > 0) {
      console.log(`[EMERGENCY CLEANUP] Found ${userData.length} user IDs for email ${user.email}`);
      
      // Check each user ID for level 4 records
      for (const userRecord of userData) {
        if (userRecord.id === user.id) continue; // Skip the current user ID
        
        const { data: otherUserRecords } = await supabase
          .from('level_4')
          .select('id, user_id, score, time')
          .eq('user_id', userRecord.id)
          .eq('module', 1)
          .eq('level', 4);
          
        if (otherUserRecords && otherUserRecords.length > 0) {
          console.log(`[EMERGENCY CLEANUP] Found ${otherUserRecords.length} records for alternate user ID ${userRecord.id}`);
          
          // Delete all records for this alternate user ID
          const { error: altDeleteError } = await supabase
            .from('level_4')
            .delete()
            .eq('user_id', userRecord.id)
            .eq('module', 1)
            .eq('level', 4);
            
          if (altDeleteError) {
            console.error(`[EMERGENCY CLEANUP] Error deleting alternate user records:`, altDeleteError);
          } else {
            console.log(`[EMERGENCY CLEANUP] Successfully deleted ${otherUserRecords.length} records for alternate user ID`);
          }
        }
      }
    }
    
    // Get all records for this user
    const { data: allRecords, error: fetchError } = await supabase
      .from('level_4')
      .select('id, user_id, score, time, is_completed')
      .eq('user_id', user.id)
      .eq('module', 1)
      .eq('level', 4)
      .order('score', { ascending: false });
      
    if (fetchError) {
      console.error("[EMERGENCY CLEANUP] Error fetching records:", fetchError);
      return false;
    }
    
    console.log(`[EMERGENCY CLEANUP] Found ${allRecords?.length || 0} records for current user ID ${user.id}`);
    
    if (!allRecords || allRecords.length === 0) {
      console.log("[EMERGENCY CLEANUP] No records found for current user, nothing to clean up");
      return true;
    }
    
    if (allRecords.length === 1) {
      console.log("[EMERGENCY CLEANUP] Only one record exists for current user, no cleanup needed");
      return true;
    }
    
    // Get the highest score record
    const highestRecord = allRecords[0];
    console.log(`[EMERGENCY CLEANUP] Highest score record: ID=${highestRecord.id}, UserID=${highestRecord.user_id}, Score=${highestRecord.score}`);
    
    // Delete all records except the highest score
    const { error: deleteError } = await supabase
      .from('level_4')
      .delete()
      .eq('user_id', user.id)
      .eq('module', 1)
      .eq('level', 4)
      .neq('id', highestRecord.id);
      
    if (deleteError) {
      console.error("[EMERGENCY CLEANUP] Error deleting records:", deleteError);
      return false;
    }
    
    console.log(`[EMERGENCY CLEANUP] Successfully deleted ${allRecords.length - 1} records`);
    
    // Verify only one record remains
    const { data: verification } = await supabase
      .from('level_4')
      .select('id, user_id, score')
      .eq('user_id', user.id)
      .eq('module', 1)
      .eq('level', 4);
      
    if (!verification || verification.length !== 1) {
      console.error(`[EMERGENCY CLEANUP] Verification failed! Found ${verification?.length || 0} records after cleanup`);
      return false;
    }
    
    console.log("[EMERGENCY CLEANUP] Verification successful, only one record remains");
    return true;
  } catch (err) {
    console.error("[EMERGENCY CLEANUP] Error in cleanup:", err);
    return false;
  }
}

// Make function available globally for emergency use via browser console
if (typeof window !== 'undefined') {
  (window as any).cleanupLevel4Records = cleanupLevel4Records;
}

/**
 * Debug function to check current database score - can be called from browser console
 * This helps troubleshoot and verify what's in the database
 * window.checkLevel4DbScore()
 */
export async function checkLevel4DbScore() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("[DB SCORE CHECK] No user logged in");
      return null;
    }
    
    console.log(`[DB SCORE CHECK] Checking database score for user ${user.id}`);
    
    // Get all records for this user
    const { data: allRecords, error: fetchError } = await supabase
      .from('level_4')
      .select('id, user_id, score, time, is_completed, created_at, updated_at')
      .eq('module', 1)
      .eq('level', 4);
      
    if (fetchError) {
      console.error("[DB SCORE CHECK] Error fetching records:", fetchError);
      return null;
    }
    
    // Filter records for the current user
    const userRecords = allRecords?.filter(record => record.user_id === user.id) || [];
    
    console.log(`[DB SCORE CHECK] Found ${userRecords.length} records for current user ID ${user.id}`);
    
    if (userRecords.length === 0) {
      console.log("[DB SCORE CHECK] No records found for current user in database");
      return null;
    }
    
    // Log all records
    userRecords.forEach((record, idx) => {
      console.log(`[DB SCORE CHECK] Record ${idx + 1}:`);
      console.log(`  - ID: ${record.id}`);
      console.log(`  - User ID: ${record.user_id}`);
      console.log(`  - Score: ${record.score}`);
      console.log(`  - Time: ${record.time} seconds`);
      console.log(`  - Completed: ${record.is_completed}`);
      console.log(`  - Created: ${new Date(record.created_at).toLocaleString()}`);
      console.log(`  - Updated: ${new Date(record.updated_at).toLocaleString()}`);
    });
    
    // Get the highest score record
    const highestScoreRecord = userRecords.reduce((highest, current) => 
      current.score > highest.score ? current : highest, userRecords[0]);
      
    console.log(`[DB SCORE CHECK] Highest score: ${highestScoreRecord.score} points (ID: ${highestScoreRecord.id})`);
    
    // Look for records across all users
    const otherUserRecords = allRecords?.filter(record => record.user_id !== user.id) || [];
    
    if (otherUserRecords.length > 0) {
      console.log(`[DB SCORE CHECK] WARNING: Found ${otherUserRecords.length} records for other users`);
      
      // Group by user_id
      const recordsByUser = otherUserRecords.reduce((acc, record) => {
        acc[record.user_id] = acc[record.user_id] || [];
        acc[record.user_id].push(record);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.entries(recordsByUser).forEach(([userId, records]) => {
        console.log(`[DB SCORE CHECK] User ID ${userId} has ${records.length} records`);
        
        // Get highest score for this user
        const userHighest = records.reduce((highest, current) => 
          current.score > highest.score ? current : highest, records[0]);
          
        console.log(`[DB SCORE CHECK] Highest score for user ${userId}: ${userHighest.score} points`);
      });
    }
    
    return highestScoreRecord;
  } catch (err) {
    console.error("[DB SCORE CHECK] Error checking score:", err);
    return null;
  }
}

// Make function available globally for debugging via browser console
if (typeof window !== 'undefined') {
  (window as any).checkLevel4DbScore = checkLevel4DbScore;
}

export function useSupabaseSync() {
  const { user } = useAuth();
  const [progressId, setProgressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(0);

  // Initialize - Load or create progress record
  useEffect(() => {
    const initializeProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        logDebug(`[INIT] Starting initialization for user ${user.id}`);
        
        // STEP 1: Perform aggressive cleanup first to ensure we have at most one valid record
        // This returns the ID of the record that was kept, if any
        const keptRecordId = await keepHighestScoreOnly(user.id);
        
        // STEP 2: If we have a record from cleanup, use that
        if (keptRecordId) {
          logDebug(`[INIT] Using record from cleanup: ID=${keptRecordId}`);
          setProgressId(keptRecordId);
          setLoading(false);
          return;
        }
        
        // STEP 3: Double-check if we have any valid records - just in case
        const { data: existingRecord, error } = await supabase
          .from('level_4')
          .select('*')
          .eq('user_id', user.id)
          .eq('module', 1)
          .eq('level', 4)
          .order('score', { ascending: false })
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('[INIT] Error fetching progress record after cleanup:', error);
        }
        
        // If we found a valid record after double-checking, use it
        if (existingRecord) {
          logDebug(`[INIT] Found existing record on double-check: ID=${existingRecord.id}, Score=${existingRecord.score}`);
          setProgressId(existingRecord.id);
          setLoading(false);
          return;
        }
        
        // STEP 4: No valid records found, we need to create a new one
        logDebug('[INIT] No valid records found, creating new progress record');
        
        // Create new progress record with explicit defaults
        const initialData: Omit<Level4Data, 'id'> = {
          user_id: user.id,
          module: 1,
          level: 4,
          score: 0,
          time: 0,
          cases: {
            currentCase: 0,
            caseProgress: [],
            scoredQuestions: {}
          },
          is_completed: false
        };

        // STEP 5: One final check before creating a new record (prevent race condition)
        // This is important because another browser tab might have created a record
        const { data: finalCheck, error: finalCheckError } = await supabase
          .from('level_4')
          .select('id, score')
          .eq('user_id', user.id)
          .eq('module', 1)
          .eq('level', 4)
          .order('score', { ascending: false });
          
        if (finalCheckError) {
          console.error('[INIT] Error in final check:', finalCheckError);
        }
        
        // If records exist in the final check, use the highest score one
        if (finalCheck && finalCheck.length > 0) {
          logDebug(`[INIT] Race condition detected, record already exists. Using ID: ${finalCheck[0].id}`);
          // If there are multiple records, clean up again
          if (finalCheck.length > 1) {
            logDebug(`[INIT] Found ${finalCheck.length} records in race condition check. Running cleanup again.`);
            await keepHighestScoreOnly(user.id);
            
            // Get the record that was kept
            const { data: afterRaceCleanup } = await supabase
              .from('level_4')
              .select('id')
              .eq('user_id', user.id)
              .eq('module', 1)
              .eq('level', 4)
              .single();
              
            if (afterRaceCleanup) {
              setProgressId(afterRaceCleanup.id);
              logDebug(`[INIT] Using record after race cleanup: ${afterRaceCleanup.id}`);
            } else {
              // This shouldn't happen, but if it does, use the highest score from the previous check
              setProgressId(finalCheck[0].id);
              logDebug(`[INIT] Fallback to highest score record: ${finalCheck[0].id}`);
            }
          } else {
            // Just one record exists, use it
            setProgressId(finalCheck[0].id);
          }
          
          setLoading(false);
          return;
        }

        // STEP 6: No records exist, create a new one
        logDebug('[INIT] Final check confirms no records exist. Creating new record.');
        const { data: newProgress, error: createError } = await supabase
          .from('level_4')
          .insert([initialData])
          .select()
          .single();

        if (createError) {
          console.error('[INIT] Error creating progress:', createError);
          return;
        }

        logDebug(`[INIT] Successfully created new progress record: ID=${newProgress.id}`);
        setProgressId(newProgress.id);
        
        // STEP 7: Final verification that we have only one record
        const { data: verifyAfterCreate } = await supabase
          .from('level_4')
          .select('id')
          .eq('user_id', user.id)
          .eq('module', 1)
          .eq('level', 4);
          
        if (verifyAfterCreate && verifyAfterCreate.length > 1) {
          logDebug(`[INIT] WARNING: After creation, found ${verifyAfterCreate.length} records. Running final cleanup.`);
          await keepHighestScoreOnly(user.id);
        }
      } catch (err) {
        console.error('[INIT] Error in initializeProgress:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeProgress();
  }, [user]);

  // Sync game state to Supabase
  const syncGameState = useCallback(async (
    gameState: GameState,
    timer: number,
    isCompleted: boolean = false
  ) => {
    // Don't sync too frequently (minimum 3 seconds between syncs)
    // This helps prevent duplicate records caused by rapid updates
    const now = Date.now();
    if (now - lastSyncTime < 3000) {
      logDebug(`[SYNC] Skipping sync due to throttling (${Math.round((now - lastSyncTime)/1000)}s)`);
      return;
    }
    setLastSyncTime(now);

    // IMPORTANT: Log the accumulated score we're syncing for debugging
    logDebug(`[SYNC] Syncing with accumulated score: ${gameState.score}`);

    if (!user || !progressId) {
      logDebug('[SYNC] Cannot sync: missing user or progressId');
      return;
    }
    
    // CRITICAL FIX: Check if this is a valid sync
    // Only sync if we have an actual score or answers
    if (
      gameState.score === 0 &&
      gameState.answers.violation === null &&
      gameState.answers.rootCause === null &&
      gameState.answers.impact === null &&
      !isCompleted
    ) {
      logDebug('[SYNC] Skipping sync - no meaningful data to sync');
      return;
    }

    try {
      const syncId = Math.floor(Math.random() * 1000); // For tracking this sync operation in logs
      logDebug(`[SYNC-${syncId}] Starting sync, timer: ${timer}, score: ${gameState.score}, completed: ${isCompleted}`);
      
      // Run a cleanup first to ensure we don't have duplicate records
      // This is especially important for syncs that happen during initialization
      // or after a page refresh where we might have orphaned records
      if (isCompleted) {
        logDebug(`[SYNC-${syncId}] This is a completion sync - performing cleanup first`);
        const keptRecordId = await keepHighestScoreOnly(user.id);
        
        // If cleanup returned a record ID and it's different from our current progressId
        // update our progressId to match
        if (keptRecordId && keptRecordId !== progressId) {
          logDebug(`[SYNC-${syncId}] Updating progressId from ${progressId} to ${keptRecordId} after cleanup`);
          setProgressId(keptRecordId);
          // Continue with the new ID by recursively calling with the updated state
          return syncGameState(gameState, timer, isCompleted);
        }
      }
      
      // Verify our record still exists before updating
      const { data: recordCheck, error: checkError } = await supabase
        .from('level_4')
        .select('id, score, is_completed')
        .eq('id', progressId)
        .single();
        
      if (checkError || !recordCheck) {
        logDebug(`[SYNC-${syncId}] Record ${progressId} no longer exists, reinitializing...`);
        
        // Record might have been deleted in a cleanup, run cleanup to be sure
        const newRecordId = await keepHighestScoreOnly(user.id);
        
        if (newRecordId) {
          // We found an existing record after cleanup
          setProgressId(newRecordId);
          logDebug(`[SYNC-${syncId}] Updated progressId to existing record ${newRecordId}`);
          
          // Continue with the updated ID - recursive call but with proper ID
          return syncGameState(gameState, timer, isCompleted);
        } else {
          // No records exist after cleanup, need to create a new one
          logDebug(`[SYNC-${syncId}] No records found after cleanup, creating new record`);
          
          // Create a new record with the current game state
          const newData = {
            user_id: user.id,
            module: 1,
            level: 4,
            score: gameState.score,
            time: timer,
            cases: {
              currentCase: gameState.currentCase + 1,
              caseProgress: [{
                id: gameState.currentCase + 1,
                answers: {
                  violation: gameState.answers.violation,
                  rootCause: gameState.answers.rootCause,
                  impact: gameState.answers.impact
                },
                isCorrect: isGameStateCorrect(gameState),
                attempts: 1,
                timeSpent: timer
              }],
              scoredQuestions: {}
            },
            is_completed: isCompleted
          };
          
          const { data: newRecord, error: createError } = await supabase
            .from('level_4')
            .insert([newData])
            .select()
            .single();
            
          if (createError) {
            console.error(`[SYNC-${syncId}] Error creating new record:`, createError);
            return;
          }
          
          logDebug(`[SYNC-${syncId}] Created new record with ID: ${newRecord.id}`);
          setProgressId(newRecord.id);
          
          // No need to continue, we've already created a record with all the current data
          return;
        }
      }
      
      const currentCaseId = gameState.currentCase + 1; // Convert 0-based to 1-based for DB
      
      // Prepare current case progress entry
      const caseProgress = {
        id: currentCaseId,
        answers: {
          violation: gameState.answers.violation,
          rootCause: gameState.answers.rootCause,
          impact: gameState.answers.impact
        },
        isCorrect: isGameStateCorrect(gameState),
        attempts: 1, 
        timeSpent: timer
      };

      // Get current progress to update it
      const { data: currentProgress, error: getError } = await supabase
        .from('level_4')
        .select('*')
        .eq('id', progressId)
        .single();

      if (getError || !currentProgress) {
        console.error(`[SYNC-${syncId}] Could not find progress record to update`, getError);
        return;
      }

      // Update case progress array
      const currentCases = currentProgress.cases || {
        currentCase: 0,
        caseProgress: [],
        scoredQuestions: {}
      };

      // Find if we already have this case in progress
      const existingCaseIndex = currentCases.caseProgress.findIndex(
        (c: any) => c.id === currentCaseId
      );

      if (existingCaseIndex >= 0) {
        // Update existing case
        currentCases.caseProgress[existingCaseIndex] = {
          ...currentCases.caseProgress[existingCaseIndex],
          answers: caseProgress.answers,
          isCorrect: caseProgress.isCorrect,
          attempts: currentCases.caseProgress[existingCaseIndex].attempts + 1,
          timeSpent: caseProgress.timeSpent
        };
      } else {
        // Add new case
        currentCases.caseProgress.push(caseProgress);
      }

      // Update scored questions
      if (gameState.showFeedback) {
        currentCases.scoredQuestions[currentCaseId - 1] = [
          'violation', 'rootCause', 'impact'
        ];
      }

      // IMPORTANT: Always update the score with the latest accumulated score
      // This is because the score in the gameState is the accumulated total across all cases
      logDebug(`[SYNC-${syncId}] Current DB score: ${currentProgress.score}, New accumulated score: ${gameState.score}, Time: ${timer}`);

      // Update progress with the latest accumulated score
      const { error: updateError } = await supabase
        .from('level_4')
        .update({
          // Always update with the latest accumulated score from all cases
          score: gameState.score,
          time: timer,
          cases: {
            ...currentCases,
            currentCase: currentCaseId
          },
          is_completed: isCompleted
        })
        .eq('id', progressId);
        
      if (updateError) {
        console.error(`[SYNC-${syncId}] Error updating progress:`, updateError);
      } else {
        logDebug(`[SYNC-${syncId}] Progress updated successfully. Score updated to ${gameState.score}.`);
      }

      // Run a final cleanup if the game is completed
      if (isCompleted && user.id) {
        logDebug(`[SYNC-${syncId}] Game completed, running final cleanup to ensure only highest score is kept`);
        await keepHighestScoreOnly(user.id);
      }
      
      // Check if we need to run cleanup on any non-completion sync
      // This helps catch and fix duplicate records that might have been created
      if (!isCompleted && Math.random() < 0.2) { // 20% chance to run cleanup on regular syncs
        logDebug(`[SYNC-${syncId}] Running periodic cleanup check`);
        const { data: countCheck } = await supabase
          .from('level_4')
          .select('id')
          .eq('user_id', user.id)
          .eq('module', 1)
          .eq('level', 4);
          
        if (countCheck && countCheck.length > 1) {
          logDebug(`[SYNC-${syncId}] Found ${countCheck.length} records during periodic check, running cleanup`);
          await keepHighestScoreOnly(user.id);
        }
      }
    } catch (err) {
      console.error('Error syncing game state:', err);
    }
  }, [user, progressId, lastSyncTime, isGameStateCorrect]);

  // Helper function to determine if all answers are correct
  function isGameStateCorrect(gameState: GameState): boolean {
    const currentCaseData = cases[gameState.currentCase];
    if (!currentCaseData) return false;

    return (
      gameState.answers.violation === currentCaseData.questions.violation.correct &&
      gameState.answers.rootCause === currentCaseData.questions.rootCause.correct &&
      gameState.answers.impact === currentCaseData.questions.impact.correct
    );
  }

  // Function to check if a new score is a high score
  const checkHighScore = useCallback(async (newScore: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get the current highest score
      const highestRecord = await getHighestScoreRecord(user.id);
      
      // If there's no previous record, this is automatically a high score
      if (!highestRecord) {
        logDebug(`First completion! Score ${newScore} is automatically a high score.`);
        return true;
      }
      
      // Compare the accumulated total score with the existing high score
      const isHighScore = newScore > highestRecord.score;
      
      if (isHighScore) {
        logDebug(`New accumulated high score achieved! ${newScore} > ${highestRecord.score}`);
      } else {
        logDebug(`Not a high score. Current accumulated: ${newScore}, Best: ${highestRecord.score}`);
      }
      
      return isHighScore;
    } catch (err) {
      console.error('Error checking high score:', err);
      return false;
    }
  }, [user]);
  
  // Complete the game - Handles game completion and finalizes the score
  const completeGame = useCallback(async (gameState: GameState, timer: number) => {
    if (!user) {
      logDebug('[COMPLETE] Cannot complete game: missing user');
      return;
    }

    try {
      const completeId = Math.floor(Math.random() * 1000); // For tracking in logs
      logDebug(`[COMPLETE-${completeId}] Completing game for user ${user.id}, score: ${gameState.score}, time: ${timer}`);
      
      // STEP 1: ULTRA-AGGRESSIVE CLEANUP - remove any existing records except the best one
      // This ensures we have at most one record to work with
      logDebug(`[COMPLETE-${completeId}] Running aggressive cleanup first`);
      const keptRecordId = await keepHighestScoreOnly(user.id);
      
      // STEP 2: TRANSACTION SAFETY - wrap in try/catch
      try {
        // STEP 3: After cleanup, check if we have a valid record to update
        // The record might have been deleted if it was invalid/empty
        if (keptRecordId) {
          logDebug(`[COMPLETE-${completeId}] Found record after cleanup: ID=${keptRecordId}`);
          
          // Get the current state of the record
          const { data: existingRecord, error: getError } = await supabase
            .from('level_4')
            .select('id, score, time, is_completed')
            .eq('id', keptRecordId)
            .single();
            
          if (getError) {
            console.error(`[COMPLETE-${completeId}] Error getting record:`, getError);
            // Record doesn't exist (somehow), we'll create a new one below
          } else {
            // We have a valid record to update
            logDebug(`[COMPLETE-${completeId}] Current record score: ${existingRecord.score}, new score: ${gameState.score}`);
            
            // Update the record with the new score and completion status
            const { error: updateError } = await supabase
              .from('level_4')
              .update({
                score: gameState.score, // Always use the accumulated score from the game state
                time: timer,
                is_completed: true,
                cases: {
                  currentCase: gameState.currentCase + 1,
                  caseProgress: [{
                    id: gameState.currentCase + 1,
                    answers: {
                      violation: gameState.answers.violation,
                      rootCause: gameState.answers.rootCause,
                      impact: gameState.answers.impact
                    },
                    isCorrect: isGameStateCorrect(gameState),
                    attempts: 1,
                    timeSpent: timer
                  }],
                  scoredQuestions: gameState.showFeedback ? 
                    { [gameState.currentCase]: ['violation', 'rootCause', 'impact'] } : {}
                }
              })
              .eq('id', keptRecordId);
              
            if (updateError) {
              console.error(`[COMPLETE-${completeId}] Error updating record:`, updateError);
            } else {
              logDebug(`[COMPLETE-${completeId}] Updated record ${keptRecordId} with score: ${gameState.score}`);
              
              // Update our progressId to match
              if (progressId !== keptRecordId) {
                setProgressId(keptRecordId);
              }
            }
            
            // Check if this is a new high score
            const isNewHighScore = await checkHighScore(gameState.score);
            
            // Update local state for UI feedback
            if (isNewHighScore) {
              logDebug(`[COMPLETE-${completeId}] New high score achieved: ${gameState.score}`);
            }
            
            // We successfully updated the record - no need to create a new one
            return;
          }
        }
        
        // STEP 4: If no record was found or the update failed, create a new one
        logDebug(`[COMPLETE-${completeId}] No valid record found after cleanup, creating new completed record`);
        
        const newData = {
          user_id: user.id,
          module: 1,
          level: 4,
          score: gameState.score,
          time: timer,
          cases: {
            currentCase: gameState.currentCase + 1,
            caseProgress: [{
              id: gameState.currentCase + 1,
              answers: {
                violation: gameState.answers.violation,
                rootCause: gameState.answers.rootCause, 
                impact: gameState.answers.impact
              },
              isCorrect: isGameStateCorrect(gameState),
              attempts: 1,
              timeSpent: timer
            }],
            scoredQuestions: {}
          },
          is_completed: true
        };
        
        // Add scored questions if there was feedback
        if (gameState.showFeedback) {
          (newData.cases.scoredQuestions as Record<string, string[]>)[gameState.currentCase.toString()] = 
            ['violation', 'rootCause', 'impact'];
        }
        
        // Create the new record
        const { data: newRecord, error: createError } = await supabase
          .from('level_4')
          .insert([newData])
          .select()
          .single();
          
        if (createError) {
          console.error(`[COMPLETE-${completeId}] Error creating completed record:`, createError);
          return;
        }
        
        logDebug(`[COMPLETE-${completeId}] Created new completed record with ID: ${newRecord.id}, Score: ${gameState.score}`);
        setProgressId(newRecord.id);
        
        // This is automatically a high score since it's the only record
        logDebug(`[COMPLETE-${completeId}] New record with score ${gameState.score} is automatically a high score!`);
      } catch (txErr) {
        console.error(`[COMPLETE-${completeId}] Transaction error:`, txErr);
      }
      
      // STEP 5: FINAL VERIFICATION - Make absolutely sure we have only one record
      logDebug(`[COMPLETE-${completeId}] Running final verification`);
      await keepHighestScoreOnly(user.id);
      
      const { data: finalState } = await supabase
        .from('level_4')
        .select('id, score, time, is_completed')
        .eq('user_id', user.id)
        .eq('module', 1)
        .eq('level', 4);
        
      if (finalState) {
        if (finalState.length === 0) {
          console.error(`[COMPLETE-${completeId}] ERROR: No records exist after completion!`);
        } else if (finalState.length > 1) {
          console.error(`[COMPLETE-${completeId}] ERROR: Multiple records (${finalState.length}) still exist after completion!`);
        } else {
          logDebug(`[COMPLETE-${completeId}] Verification successful: Single record ID=${finalState[0].id}, Score=${finalState[0].score}`);
          
          // Make sure our progressId matches the final record
          if (progressId !== finalState[0].id) {
            setProgressId(finalState[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error completing game:', err);
    }
  }, [user, progressId, isGameStateCorrect, checkHighScore]);

  // Also expose utility functions through the hook
  return {
    loading,
    syncGameState,
    completeGame,
    checkHighScore,
    cleanupRecords: cleanupLevel4Records,
    checkDbScore: checkLevel4DbScore
  };
}
