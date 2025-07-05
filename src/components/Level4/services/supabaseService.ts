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
  progress: Level4Progress
): Promise<Level4Progress | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;
  
  // Make sure we're updating the user's own record
  if (!progress.id) {
    console.error('No progress ID provided');
    return null;
  }

  const { data, error } = await supabase
    .from('level_4')
    .update({
      score: progress.score,
      time: progress.time,
      cases: progress.cases,
      is_completed: progress.is_completed,
    })
    .eq('id', progress.id)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating Level 4 progress:', error);
    return null;
  }

  return data as Level4Progress;
};

/**
 * Update a specific case in the Level 4 progress
 */
export const updateCaseProgress = async (
  progressId: string,
  caseId: number,
  answers: {
    violation: number | null;
    rootCause: number | null;
    impact: number | null;
  },
  isCorrect: boolean,
  attempts: number,
  timeSpent: number
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

  const cases = currentProgress.cases as Level4Cases;
  
  // Find if this case already exists in the progress
  const caseIndex = cases.caseProgress.findIndex(c => c.id === caseId);
  
  if (caseIndex >= 0) {
    // Update existing case
    cases.caseProgress[caseIndex] = {
      id: caseId,
      answers,
      isCorrect,
      attempts,
      timeSpent
    };
  } else {
    // Add new case
    cases.caseProgress.push({
      id: caseId,
      answers,
      isCorrect,
      attempts,
      timeSpent
    });
  }

  // Update scored questions
  if (isCorrect && !cases.scoredQuestions[caseId - 1]) {
    cases.scoredQuestions[caseId - 1] = ['violation', 'rootCause', 'impact'];
  }

  // Update the progress
  const { data, error } = await supabase
    .from('level_4')
    .update({
      cases,
      // Only update current case if it's advancing
      ...(caseId > cases.currentCase ? { currentCase: caseId } : {}),
      // Update score based on correctness
      ...(isCorrect ? { score: currentProgress.score + 3 } : {}), 
    })
    .eq('id', progressId)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case progress:', error);
    return null;
  }

  return data as Level4Progress;
};

/**
 * Mark Level 4 as completed
 */
export const completeLevel4 = async (
  progressId: string,
  finalTime: number
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;

  const { error } = await supabase
    .from('level_4')
    .update({
      is_completed: true,
      time: finalTime
    })
    .eq('id', progressId)
    .eq('user_id', user.user.id);

  if (error) {
    console.error('Error completing Level 4:', error);
    return false;
  }

  return true;
};
