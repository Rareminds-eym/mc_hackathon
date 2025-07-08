import { supabase } from '../../../lib/supabase';

// Define types for Level 4 data
export interface Level4Progress {
  id?: string;
  user_id?: string;
  module: number;
  level: number;
  score: number;
  time: number;
  cases: Level4Cases;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Level4Cases {
  currentCase: number;
  caseProgress: CaseProgress[];
  scoredQuestions: Record<string, string[]>;
}

export interface CaseProgress {
  id: number;
  answers: {
    violation: number | null;
    rootCause: number | null;
    impact: number | null;
  };
  isCorrect: boolean;
  attempts: number;
  timeSpent: number;
}

// Functions to interact with Supabase

/**
 * Utility function to cleanup duplicate Level 4 records for the current user
 * This can be exposed through a development console command
 */
export const cleanupDuplicateLevel4Records = async (): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  // First get all Level 4 records for the user
  const { data: allRecords } = await supabase
    .from('level_4')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('module', 1)
    .eq('level', 4)
    .order('score', { ascending: false });  // Get highest score first

  if (!allRecords || allRecords.length <= 1) {
    console.log('No duplicate records found');
    return false;
  }

  console.log(`Found ${allRecords.length} Level 4 records for user. Keeping the one with highest score.`);
  
  // Keep the record with the highest score
  const recordToKeep = allRecords[0];
  const recordsToDelete = allRecords.slice(1).map(record => record.id);

  // Delete duplicate records
  const { error } = await supabase
    .from('level_4')
    .delete()
    .in('id', recordsToDelete);

  if (error) {
    console.error('Error deleting duplicate records:', error);
    return false;
  }

  console.log(`Successfully deleted ${recordsToDelete.length} duplicate records.`);
  return true;
};

/**
 * Get Level 4 progress for the current user in module 1
 */
export const getLevel4Progress = async (): Promise<Level4Progress | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from('level_4')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('module', 1)
    .eq('level', 4)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching Level 4 progress:', error);
    return null;
  }

  return data as Level4Progress;
};

/**
 * Create a new Level 4 progress entry
 */
export const createLevel4Progress = async (): Promise<Level4Progress | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  // First check if a record already exists
  const { data: existingData } = await supabase
    .from('level_4')
    .select('*')
    .eq('user_id', user.user.id)
    .eq('module', 1)
    .eq('level', 4);

  // If records exist, return the first one
  if (existingData && existingData.length > 0) {
    return existingData[0] as Level4Progress;
  }

  // Initialize empty progress
  const initialProgress: Level4Progress = {
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

  const { data, error } = await supabase
    .from('level_4')
    .insert([{ ...initialProgress, user_id: user.user.id }])
    .select()
    .single();

  if (error) {
    console.error('Error creating Level 4 progress:', error);
    return null;
  }

  return data as Level4Progress;
};

/**
 * Update Level 4 progress
 */
export const updateLevel4Progress = async (
  progressId: string,
  data: Partial<Level4Progress>
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  // If score is being updated, get current progress to check if we should update score
  if (data.score !== undefined) {
    const { data: currentProgress } = await supabase
      .from('level_4')
      .select('score')
      .eq('id', progressId)
      .eq('user_id', user.user.id)
      .single();

    if (currentProgress) {
      // Only update score if new score is higher
      if (data.score <= (currentProgress.score || 0)) {
        console.log(`Not updating score. Current: ${currentProgress.score || 0}, New: ${data.score}`);
        // Remove score from data to prevent overwriting higher score
        delete data.score;
      } else {
        console.log(`Updating score from ${currentProgress.score || 0} to ${data.score}`);
      }
    }
  }

  // Only proceed with update if there's still data to update
  if (Object.keys(data).length === 0) {
    console.log('No updates needed for level 4 progress');
    return true; // Nothing to update
  }

  console.log('Updating level 4 progress with:', data);

  const { error } = await supabase
    .from('level_4')
    .update(data)
    .eq('id', progressId)
    .eq('user_id', user.user.id);

  if (error) {
    console.error('Error updating Level 4 progress:', error);
    return false;
  }

  return true;
};

/**
 * Update the progress of a case
 */
export const updateCaseProgress = async (
  progressId: string,
  caseId: string,
  score: number,
  lastSlide: number | null = null
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  // Get current progress to check if we should update score
  const { data: currentProgress } = await supabase
    .from('level_4')
    .select('*')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  if (!currentProgress) {
    console.error('Progress not found');
    return false;
  }

  // Prepare update data
  const updateData: any = {};
  
  // Add completed case to array if not already present
  const completedCases = currentProgress.completed_cases || [];
  if (!completedCases.includes(caseId)) {
    updateData.completed_cases = [...completedCases, caseId];
  }
  
  // Update the last slide if provided
  if (lastSlide !== null) {
    updateData.last_slide = lastSlide;
  }

  // Only update score if it's higher than the current score
  // This ensures we always keep the highest score
  if (score > (currentProgress.score || 0)) {
    updateData.score = score;
    console.log(`Updating score from ${currentProgress.score || 0} to ${score}`);
  } else {
    console.log(`Not updating score. Current: ${currentProgress.score || 0}, New: ${score}`);
  }

  if (Object.keys(updateData).length === 0) {
    console.log('No updates needed for case progress');
    return true; // Nothing to update
  }

  console.log('Updating case progress with:', updateData);

  const { error } = await supabase
    .from('level_4')
    .update(updateData)
    .eq('id', progressId)
    .eq('user_id', user.user.id);

  if (error) {
    console.error('Error updating case progress:', error);
    return false;
  }

  return true;
};

/**
 * Update Level 4 score only if the new score is higher
 * This ensures we always keep the highest score for a user
 */
export const updateHighScore = async (
  progressId: string,
  newScore: number
): Promise<Level4Progress | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  // First get the current progress
  const { data: currentProgress } = await supabase
    .from('level_4')
    .select('*')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  if (!currentProgress) {
    console.error('Progress not found');
    return null;
  }

  // Only update if the new score is higher
  if (newScore > currentProgress.score) {
    const { data, error } = await supabase
      .from('level_4')
      .update({
        score: newScore
      })
      .eq('id', progressId)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating high score:', error);
      return null;
    }

    return data as Level4Progress;
  }

  // Return current progress if no update was needed
  return currentProgress as Level4Progress;
};

/**
 * Reset Level 4 progress for replay, but keep the high score
 */
export const resetLevel4Progress = async (
  progressId: string
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  // Get current high score before resetting
  const { data: currentProgress } = await supabase
    .from('level_4')
    .select('score')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  const currentHighScore = currentProgress?.score || 0;
  
  // Reset everything except the high score
  const resetData = {
    is_completed: false,
    last_slide: 0,
    completed_cases: [],
    current_case: 1,
    // Explicitly preserve the high score
    score: currentHighScore,
    // Time is not reset as it's only relevant with the score
  };

  console.log('Resetting level 4 progress while preserving high score:', currentHighScore);

  const { error } = await supabase
    .from('level_4')
    .update(resetData)
    .eq('id', progressId)
    .eq('user_id', user.user.id);

  if (error) {
    console.error('Error resetting Level 4 progress:', error);
    return false;
  }

  return true;
};

/**
 * Mark Level 4 as completed
 */
export const completeLevel4 = async (
  progressId: string,
  finalTime: number,
  finalScore: number
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  // Get current progress to check if we have a higher score
  const { data: currentProgress } = await supabase
    .from('level_4')
    .select('*')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  if (!currentProgress) {
    console.error('Progress not found');
    return false;
  }

  // Only update time if this score is higher or equal to the current high score
  // This ensures we keep the best time with the highest score
  const updateData: any = { is_completed: true };
  
  if (finalScore >= currentProgress.score) {
    updateData.time = finalTime;
    // Only update score if it's higher
    if (finalScore > currentProgress.score) {
      updateData.score = finalScore;
    }
  }

  console.log('Completing level 4 with data:', updateData);

  const { error } = await supabase
    .from('level_4')
    .update(updateData)
    .eq('id', progressId)
    .eq('user_id', user.user.id);

  if (error) {
    console.error('Error completing Level 4:', error);
    return false;
  }

  return true;
};

/**
 * Get the current high score for Level 4
 */
export const getLevel4HighScore = async (progressId: string): Promise<number> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return 0;

  const { data } = await supabase
    .from('level_4')
    .select('score')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  return data?.score || 0;
};

/**
 * DEBUG FUNCTION: Check and fix score discrepancies
 * This function can be called from the browser console to diagnose and fix score issues
 */
export const debugAndFixScore = async (progressId: string, expectedScore?: number): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    console.error('No user logged in');
    return false;
  }

  // Fetch the current record
  const { data: record } = await supabase
    .from('level_4')
    .select('*')
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .single();

  if (!record) {
    console.error('No record found with ID:', progressId);
    return false;
  }

  console.log('Current Level 4 record:', record);
  console.log('Current score:', record.score);
  
  // If an expected score was provided and it's higher than the current score, update it
  if (expectedScore !== undefined && expectedScore > record.score) {
    console.log(`Updating score from ${record.score} to ${expectedScore}`);
    
    const { error } = await supabase
      .from('level_4')
      .update({ score: expectedScore })
      .eq('id', progressId)
      .eq('user_id', user.user.id);
      
    if (error) {
      console.error('Error updating score:', error);
      return false;
    }
    
    console.log('Score updated successfully');
    return true;
  }
  
  return true;
};

// Make these functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugLevel4Score = debugAndFixScore;
  (window as any).getLevel4HighScore = getLevel4HighScore;
  (window as any).cleanupDuplicateLevel4Records = cleanupDuplicateLevel4Records;
  
  console.log('Level 4 debug tools loaded. Available in console:');
  console.log('- debugLevel4Score(progressId, [expectedScore])');
  console.log('- getLevel4HighScore(progressId)');
  console.log('- cleanupDuplicateLevel4Records()');
}
