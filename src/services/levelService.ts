import { supabase } from '../lib/supabase';

export async function completeLevel(userId: string, moduleId: number, levelId: number) {
  const { error } = await supabase
    .from('level_progress')
    .upsert([
      { user_id: userId, module_id: moduleId, level_id: levelId, is_completed: true }
    ]);
  if (error) throw error;
}
