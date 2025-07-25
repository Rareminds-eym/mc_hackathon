// Extract user metadata, email, and username from Supabase Auth context
import { User } from '@supabase/supabase-js';

export function getAuthProfileInfo(user: User | null): ProfileInfo | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    email: user.email || '',
    full_name: meta.full_name || '',
    phone: meta.phone || '',
    team_name: meta.team_name || '',
    college_code: meta.college_code || '',
    team_lead: meta.team_lead || '',
    team_members: meta.team_members || [],
    team_member_1: meta.team_member_1 || '',
    team_member_2: meta.team_member_2 || '',
    team_member_3: meta.team_member_3 || '',
  };
}
import { supabase } from "../lib/supabase";

export interface ProfileInfo {
  email: string;
  full_name?: string;
  phone?: string;
  team_name?: string;
  college_code?: string;
  team_lead?: string;
  team_members?: string[];
  team_member_1?: string;
  team_member_2?: string;
  team_member_3?: string;
}

export async function fetchTeamInfo(email: string): Promise<ProfileInfo | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('email', email);

  if (error || !data || data.length === 0) {
    console.error('Error fetching team info:', error?.message || 'No data found');
    return null;
  }
  // Return the first matching team for the email
  return data[0] as ProfileInfo;
}
