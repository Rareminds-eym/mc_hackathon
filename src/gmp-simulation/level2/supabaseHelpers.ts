import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Save the selected case for a user (or session)
export async function saveSelectedCase({ email, caseId }: { email: string; caseId: number }) {
  const { data, error } = await supabase
    .from('selected_cases')
    .insert([
      { email, case_id: caseId, updated_at: new Date().toISOString() },
    ]);
  if (error) throw error;
  return data;
}
