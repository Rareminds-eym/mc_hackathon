import { supabase } from '../../lib/supabase';

export interface Level2Progress {
  user_id: string;
  current_screen: number;
  completed_screens: number[];
  timer?: number;
}

export async function saveLevel2Progress({ user_id, current_screen, completed_screens, timer }: Level2Progress) {
  const upsertObj: any = {
    user_id,
    current_screen,
    completed_screens,
    updated_at: new Date().toISOString(),
  };
  if (typeof timer === 'number') {
    upsertObj.timer = timer;
  }
  const { data, error } = await supabase
    .from('hl2_progress')
    .upsert([
      upsertObj
    ], { onConflict: 'user_id' });
  if (error) throw error;
  return data;
}

export async function getLevel2Progress(user_id: string) {
  const { data, error } = await supabase
    .from('hl2_progress')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
  return data;
}

/**
 * Save timer state for Level 2 hackathon progress
 * @param user_id - User identifier
 * @param timer - Remaining time in seconds
 * @param current_screen - Current screen number (optional)
 */
export async function saveLevel2TimerState(user_id: string, timer: number, current_screen?: number) {
  console.log('[Timer Save] Saving timer state:', { user_id, timer, current_screen });
  
  try {
    // Get existing progress first
    const existingProgress = await getLevel2Progress(user_id);
    
    const updateData: Partial<Level2Progress> = {
      timer,
      updated_at: new Date().toISOString()
    };
    
    // Update current_screen if provided
    if (current_screen !== undefined) {
      updateData.current_screen = current_screen;
    }
    
    const { data, error } = await supabase
      .from('hl2_progress')
      .upsert(
        existingProgress 
          ? { ...existingProgress, ...updateData }
          : {
              user_id,
              current_screen: current_screen || 1,
              completed_screens: [],
              timer,
              updated_at: new Date().toISOString()
            },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[Timer Save] Error saving timer state:', error);
      throw error;
    }
    
    console.log('[Timer Save] Successfully saved timer state:', data);
    return data;
  } catch (err) {
    console.error('[Timer Save] Failed to save timer state:', err);
    throw err;
  }
}

/**
 * Get saved timer state for Level 2 hackathon progress
 * @param user_id - User identifier
 * @returns Timer value in seconds or null if not found
 */
export async function getLevel2TimerState(user_id: string): Promise<number | null> {
  try {
    const progress = await getLevel2Progress(user_id);
    if (progress && typeof progress.timer === 'number') {
      console.log('[Timer Load] Loaded timer state:', progress.timer);
      return progress.timer;
    }
    console.log('[Timer Load] No timer state found');
    return null;
  } catch (err) {
    console.error('[Timer Load] Error loading timer state:', err);
    return null;
  }
}

/**
 * Mark screen as completed and save timer state
 * @param user_id - User identifier
 * @param screen - Screen number to mark as completed
 * @param timer - Current timer value in seconds
 */
export async function markScreenCompleteWithTimer(user_id: string, screen: number, timer: number) {
  console.log('[Screen Complete] Marking screen complete with timer:', { user_id, screen, timer });
  
  try {
    const existingProgress = await getLevel2Progress(user_id);
    let completedScreens = [];
    
    if (existingProgress?.completed_screens) {
      // Handle both array and JSONB formats
      completedScreens = Array.isArray(existingProgress.completed_screens)
        ? existingProgress.completed_screens
        : JSON.parse(existingProgress.completed_screens as any);
    }
    
    // Add current screen if not already completed
    if (!completedScreens.includes(screen)) {
      completedScreens.push(screen);
    }
    
    const progressData = {
      user_id,
      current_screen: screen + 1, // Move to next screen
      completed_screens: completedScreens,
      timer,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('hl2_progress')
      .upsert(progressData, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) {
      console.error('[Screen Complete] Error marking screen complete:', error);
      throw error;
    }
    
    console.log('[Screen Complete] Successfully marked screen complete:', data);
    return data;
  } catch (err) {
    console.error('[Screen Complete] Failed to mark screen complete:', err);
    throw err;
  }
}
