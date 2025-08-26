import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface TeamMember {
  team_name: string; // fallback to email if name not available
  email: string;
  full_name?: string;
}


export async function getTeamMembersBySession(session_id: string): Promise<TeamMember[]> {
  if (!session_id) return [];
  const { data, error } = await supabase
    .from('teams')
    .select('team_name, email, full_name')
    .eq('session_id', session_id);
  if (error) {
    console.error('[getTeamMembersBySession] Error:', error);
    return [];
  }
  console.log('[getTeamMembersBySession] Loaded team members:', data);
  return data || [];
}

// New function to get team name by session_id
export async function getTeamNameBySession(session_id: string): Promise<string> {
  const { data, error } = await supabase
    .from('attempt_details')
    .select('team_name')
    .eq('session_id', session_id)
    .limit(1)
    .single();
  if (error) {
    console.error('[getTeamNameBySession] Supabase error:', error);
    return '';
  }
  return data?.team_name || '';
}
