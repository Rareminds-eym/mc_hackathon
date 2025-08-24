
import { createClient } from '@supabase/supabase-js';
import { hackathonData, Question } from '../HackathonData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface AttemptDetail {
  id: number;
  email: string;
  session_id: string;
  module_number: number;
  question_index: number;
  question: any;
  answer: any;
  created_at: string;
  updated_at: string;
  time_remaining: number;
}

// Returns an array of 20 AttemptDetail-like objects, 5 per member, filling with random hackathonData if <4 members
export async function fetchLevel1CasesForTeam(teamMembers: { email: string }[]): Promise<{ member: { email: string }, attempt: AttemptDetail }[]> {
  console.log('[fetchLevel1CasesForTeam] Fetching cases for teamMembers:', teamMembers);
  const allCases: { member: { email: string }, attempt: AttemptDetail }[] = [];
  const usedCaseIds = new Set<number>();

  // 1. Fetch first 5 cases for each real member
  for (const member of teamMembers) {
    const { data, error } = await supabase
      .from('attempt_details')
      .select('*')
      .eq('email', member.email)
      .eq('module_number', 5)
      .order('question_index', { ascending: true })
      .limit(5);
    if (error) {
      console.error('Error fetching attempt_details for', member.email, error);
      continue;
    }
    if (data && Array.isArray(data)) {
      for (const attempt of data) {
        // Track used case IDs (from hackathonData)
        let qid = undefined;
        if (typeof attempt.question === 'object' && attempt.question.id) qid = attempt.question.id;
        else if (typeof attempt.question === 'string') {
          try {
            const parsed = JSON.parse(attempt.question);
            if (parsed && parsed.id) qid = parsed.id;
          } catch {}
        }
        if (qid) usedCaseIds.add(qid);
        allCases.push({ member, attempt });
      }
    }
  }

  // 2. If <4 members, fill with random, non-duplicate hackathonData cases
  const numMembers = teamMembers.length;
  const totalCasesNeeded = 20;
  let memberIdx = 0;
  while (allCases.length < totalCasesNeeded) {
    // Find a random unused case from hackathonData
    const availableCases = hackathonData.filter(q => !usedCaseIds.has(q.id));
    if (availableCases.length === 0) break;
    const randomIdx = Math.floor(Math.random() * availableCases.length);
    const randomCase = availableCases[randomIdx];
    // Create a fake AttemptDetail for this random case
    const attempt: AttemptDetail = {
      id: randomCase.id,
      email: `random${memberIdx}@example.com`,
      session_id: '',
      module_number: 5,
      question_index: 0,
      question: randomCase,
      answer: null,
      created_at: '',
      updated_at: '',
      time_remaining: 0,
    };
    // Assign to a pseudo-member slot (rotating through missing members)
    let member: { email: string };
    if (numMembers < 4) {
      // Use a label like 'Random Member 1', etc.
      member = { email: `random_member_${(allCases.length / 5 | 0) + 1}@example.com` };
    } else {
      member = { email: `random${memberIdx}@example.com` };
    }
    usedCaseIds.add(randomCase.id);
    allCases.push({ member, attempt });
    memberIdx++;
  }

  // 3. Sort so that the first 5 are for member 1, next 5 for member 2, etc.
  const grouped: { member: { email: string }, attempt: AttemptDetail }[][] = [];
  for (let i = 0; i < 4; i++) {
    grouped[i] = [];
  }
  for (let i = 0; i < allCases.length; i++) {
    grouped[i % 4].push(allCases[i]);
  }
  // Flatten in order: first 5 of member 1, then 5 of member 2, etc.
  const ordered: { member: { email: string }, attempt: AttemptDetail }[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      if (grouped[j][i]) ordered.push(grouped[j][i]);
    }
  }
  return ordered;
}
