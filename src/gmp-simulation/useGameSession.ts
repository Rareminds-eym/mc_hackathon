// Shared hook to get session_id, email, and team info error/loading state from Supabase Auth and teams table
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface GameSessionResult {
  session_id: string | null;
  email: string | null;
  teamInfoError: string | null;
  setTeamInfoError: (err: string | null) => void;
  loadingIds: boolean;
}

export function useGameSession(): GameSessionResult {
  const [session_id, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [teamInfoError, setTeamInfoError] = useState<string | null>(null);
  const loadingIds = !session_id || !email;

  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn("Session refresh failed:", refreshError.message);
        }
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          setTeamInfoError("Authentication error. Please log in.");
          return;
        }
        if (!session || !session.user || !session.user.email) {
          setTeamInfoError("User session not found. Please log in.");
          return;
        }
        const userEmail = session.user.email;
        // Ensure email is always available to the app, even if team lookup fails
        setEmail(userEmail);
        const { data: countData, error: countError } = await supabase
          .from("teams")
          .select("session_id", { count: 'exact' })
          .eq("email", userEmail);
        if (countError) {
          setTeamInfoError("Database connection error. Please try again later.");
          return;
        }
        const recordCount = countData?.length || 0;
        if (recordCount === 0) {
          setTeamInfoError("No team registration found for your account. Please complete team registration first.");
          return;
        }
        if (recordCount > 1) {
          const { data, error } = await supabase
            .from("teams")
            .select("session_id")
            .eq("email", userEmail)
            .limit(1)
            .single();
          if (error || !data || !data.session_id) {
            setTeamInfoError("Multiple team registrations found. Please contact support for assistance.");
            return;
          }
          setSessionId(data.session_id);
          setEmail(userEmail);
          return;
        }
        const { data, error } = await supabase
          .from("teams")
          .select("session_id")
          .eq("email", userEmail)
          .single();
        if (error || !data || !data.session_id) {
          setTeamInfoError("Team registration not found or invalid. Please complete your team registration.");
        } else {
          setSessionId(data.session_id);
          setEmail(userEmail);
        }
      } catch {
        setTeamInfoError("An unexpected error occurred. Please refresh the page and try again.");
      }
    };
    fetchTeamInfo();
  }, []);

  return { session_id, email, teamInfoError, setTeamInfoError, loadingIds };
}
