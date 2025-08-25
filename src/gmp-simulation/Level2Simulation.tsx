import { AlertTriangle, Clock, Play } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Level2Card from "./Level2Card";
// import Level2Timer from "./Level2Timer";
import { getLevel2Progress, isLevel2Screen3Completed } from "./level2/level2ProgressHelpers";
import { useGameSession } from "./useGameSession";

// Real eligibility check: only allow if user is in winners_list_level1
import { supabase } from "../lib/supabase";
async function isLevel2Allowed(email: string | null, session_id: string | null): Promise<boolean> {
  if (!email) return false;
  // Check if user is in winners_list_l1 table by email only (to match GmpSimulation)
  const { data, error } = await supabase
    .from("winners_list_l1")
    .select("*")
    .eq("email", email)
    .limit(1);
  console.log("[Level2 Access Debug] Querying winners_list_l1 with:", { email });
  console.log("[Level2 Access Debug] Supabase response:", { data, error });
  if (error) {
    console.error("Eligibility check error (winners_list_l1):", error);
    return false;
  }
  return !!(data && data.length > 0);
}

const showWalkthroughVideo = () => {
  const videoUrl = "https://www.youtube.com/watch?v=De5tXqUyT-0&feature=youtu.be";
  window.open(videoUrl, '_blank');
};

const Level2Simulation: React.FC = () => {
  const navigate = useNavigate();
  // --- All hooks must be at the top level, before any early returns ---
  const [canAccessLevel2, setCanAccessLevel2] = useState<boolean | null>(null);
  const [hideProgress, setHideProgress] = React.useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const { session_id, email, teamInfoError, loadingIds } = useGameSession();
  const [showLevel2Card, setShowLevel2Card] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<{ name: string; email: string }[]>([]);
  const [level2Screen, setLevel2Screen] = useState(1);
  const totalQuestions = 5; // Adjust if dynamic
  // const INITIAL_TIME = 10800;
  // const [timerActive, setTimerActive] = useState(false);
  // const [timerValue, setTimerValue] = useState(INITIAL_TIME);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLevel2Completed, setIsLevel2Completed] = useState(false);

  // Restore progress on mount
  useEffect(() => {
    (async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user || !user.id) throw new Error('User not authenticated');
        
        // Check if Level2Screen3 (Innovation Round) is completed
        const level2CompletionStatus = await isLevel2Screen3Completed(user.id);
        setIsLevel2Completed(level2CompletionStatus);
        
        const progress = await getLevel2Progress(user.id);
        console.log('[Level2Simulation] Restored progress from hl2_progress:', progress);
        console.log('[Level2Simulation] Level2Screen3 completion status:', level2CompletionStatus);
        
        if (progress) {
          // Resume from next incomplete screen
          let nextScreen = 1;
          if (Array.isArray(progress.completed_screens) && progress.completed_screens.length > 0) {
            nextScreen = Math.max(...progress.completed_screens) + 1;
          } else if (progress.current_screen) {
            nextScreen = progress.current_screen;
          }
          setLevel2Screen(nextScreen);
          // Update isFirstTime based on progress
          setIsFirstTime(nextScreen === 1 && !progress.completed_screens?.length);
        } else {
          setIsFirstTime(true);
        }
      } catch (err) {
        setIsFirstTime(true);
      }
    })();
  }, []);
  useEffect(() => {
    console.log('[Level2Simulation][DEBUG] hideProgress state changed:', hideProgress);
  }, [hideProgress]);
  useEffect(() => {
    console.log('[Level2Simulation][DEBUG] canAccessLevel2 state changed:', canAccessLevel2);
  }, [canAccessLevel2]);

  // Remove old auth fetch, now handled by useGameSession

  // Fetch full name from winners_list_l1 if qualified
  useEffect(() => {
    const fetchFullNameAndTeam = async () => {
      if (canAccessLevel2 && email) {
        const { data, error } = await supabase
          .from("winners_list_l1")
          .select("full_name, team_name")
          .eq("email", email)
          .single();
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.team_name) setTeamName(data.team_name);
          setShowCongrats(true);
          setTimeout(() => setShowCongrats(false), 5000); // Updated duration to 5 seconds
        }
      }
    };
    fetchFullNameAndTeam();
  }, [canAccessLevel2, email]);

  // Eligibility check
  useEffect(() => {
    // Only check eligibility if email is available
    if (!email) {
      setCanAccessLevel2(null); // Still loading, don't check yet
      return;
    }
    const checkLevel2Access = async () => {
      setCanAccessLevel2(null); // loading
      const allowed = await isLevel2Allowed(email, session_id);
      console.log('[Level2Simulation][DEBUG] Eligibility check result:', allowed, 'for email:', email, 'session_id:', session_id);
      setCanAccessLevel2(allowed);
    };
    checkLevel2Access();
  }, [email, session_id]);

  // Fetch team members from attempt_details table using user's email (find team_name, then all members with that team_name)
  useEffect(() => {
    async function fetchTeamMembers() {
      console.log('[Level2Simulation][DEBUG] fetchTeamMembers called with email:', email);
      if (!email) {
        console.warn('[Level2Simulation][DEBUG] No email found for logged-in user.');
        return;
      }
      console.log('[Level2Simulation][DEBUG] Logged-in user email:', email);
      // First, get the team_name for this user
      const { data: userData, error: userError } = await supabase
        .from('attempt_details')
        .select('team_name')
        .eq('email', email)
        .limit(1)
        .single();
      console.log('[Level2Simulation][DEBUG] team_name fetch result:', { userData, userError });
      if (userError || !userData?.team_name) {
        setTeamMembers([]);
        console.warn('[Level2Simulation][DEBUG] No team_name found for email:', email, { userError });
        return;
      }
      const teamName = userData.team_name;
      console.log('[Level2Simulation][DEBUG] Found team_name:', teamName);
      // Now, get all members with this team_name
      const { data, error } = await supabase
        .from('attempt_details')
        .select('email')
        .eq('team_name', teamName);
      console.log('[Level2Simulation][DEBUG] attempt_details fetch result for team_name:', { data, error });
      if (data && Array.isArray(data)) {
        // Remove duplicate emails (one per member)
        const uniqueMembers = Object.values(
          data.reduce((acc: Record<string, { email: string }>, curr) => {
            acc[curr.email] = curr;
            return acc;
          }, {} as Record<string, { email: string }>));
        setTeamMembers(uniqueMembers as { email: string }[]);
        console.log('[Level2Simulation][DEBUG] Loaded teamMembers from attempt_details:', uniqueMembers);
      } else {
        setTeamMembers([]);
        console.warn('[Level2Simulation][DEBUG] No team members found in attempt_details for team_name:', teamName, { data, error });
      }
    }
    fetchTeamMembers();
  }, [email]);

  // Completion logic
  const isHackathonCompleted = useCallback(() => {
    // TODO: Replace with real completion logic
    return gameCompleted;
  }, [gameCompleted]);

  const showCompletionModal = useCallback(() => {
    setShowLevelModal(true);
  }, []);

  // Timer auto-save handler removed

  // UI rendering
  console.log('[Level2Simulation][DEBUG] Render: canAccessLevel2 =', canAccessLevel2);
  if (canAccessLevel2 === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-white text-lg font-bold animate-pulse">Checking eligibility...</div>
      </div>
    );
  }
  // Block simulation UI while congrats modal is showing
  if (showCongrats && fullName) {
    console.log('[Level2Simulation][DEBUG] Congrats modal rendered. showCongrats =', showCongrats, 'fullName =', fullName);
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'radial-gradient(ellipse at center, #0f2027 0%, #2c5364 100%)' }}>
        {/* Pixel/pattern overlays for extra effect */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-10 pointer-events-none"></div>
        <div className="pixel-border-thick bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 p-8 max-w-xl w-full text-center relative z-10 shadow-2xl rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-yellow-400 pixel-border flex items-center justify-center animate-bounce shadow-lg">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-green-100 mb-2 pixel-text drop-shadow-lg">Well Done, {fullName}!</h2>
          <p className="text-lg font-black text-cyan-100 mb-2 pixel-text">
            Team {teamName || "-"} has successfully advanced to Hackathon Level 2.
          </p>
          <p className="text-base text-yellow-100 font-bold mb-2 pixel-text flex items-center justify-center gap-2">
            Innovation starts now—let’s go! <span className="text-2xl">💡</span>
          </p>
        </div>
      </div>
    );
  }

  // Block simulation UI until fullName is set and congrats modal is finished
  if (canAccessLevel2 && !fullName) {
    console.log('[Level2Simulation][DEBUG] Waiting for fullName before rendering simulation UI. canAccessLevel2 =', canAccessLevel2, 'fullName =', fullName);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-white text-lg font-bold animate-pulse">Preparing your team details...</div>
      </div>
    );
  }
  if (!canAccessLevel2) {
    console.log('[Level2Simulation][DEBUG] ACCESS DENIED modal rendered. canAccessLevel2 =', canAccessLevel2);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="pixel-border-thick bg-gradient-to-r from-red-700 to-red-800 p-6 max-w-xl w-full text-center">
          <h2 className="text-2xl font-black text-red-100 mb-3 pixel-text">ACCESS DENIED</h2>
          <p className="text-red-200 mb-4 text-sm font-bold">You are not eligible to participate in Level 2 (HL2).<br/>Only winners from Level 1 can access this round.</p>
          <button
            onClick={() => navigate('/modules')}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold pixel-border"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  // Countdown overlay
  if (showCountdown) {
    // Show 'GET READY' if on case selection (first screen), else 'GET READY TO CONTINUE!'
    const showGetReady = currentQuestion === 0;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-8xl md:text-9xl font-black text-white pixel-text animate-pulse mb-4">
            {countdownNumber}
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-300 pixel-text">
            {showGetReady ? "GET READY TO START" : "GET READY TO CONTINUE!"}
          </div>
        </div>
      </div>
    );
  }

  // --- HL2 screen state management ---
  // (already declared at the top with other hooks)
  // ---
  if (showLevel2Card) {
  const isCaseSelection = level2Screen === 1 && showLevel2Card;
  if (hideProgress) {
    return null;
  }
  const handleAdvanceScreen = () => {
    setHideProgress(true);
    setTimeout(() => {
      setHideProgress(false);
      setLevel2Screen((s) => s + 1);
    }, 1200);
  };
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center relative">
      <div className="relative w-full">
        <Level2Card
          teamName={teamName || ''}
          teamMembers={teamMembers}
          screen={level2Screen}
          onAdvanceScreen={handleAdvanceScreen}
        />
        {/* Countdown overlay for screen 1 */}
        {isCaseSelection && showCountdown && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-black text-white pixel-text animate-pulse mb-4">
                {countdownNumber}
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-300 pixel-text">
                GET READY TO START
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
  // Main simulation UI before starting

  console.log('[Level2Simulation][DEBUG] Simulation UI rendered. canAccessLevel2 =', canAccessLevel2, 'showCongrats =', showCongrats, 'fullName =', fullName);
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-2 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
      <div className="pixel-border-thick bg-gradient-to-r from-blue-600 to-blue-700 p-4 max-w-xl w-full text-center relative z-10">
        {/* Back Button - styled like Level 1 modal */}
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={() => navigate('/modules')}
            className="pixel-border bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-1 px-3 pixel-text transition-all flex items-center gap-2 text-xs shadow-lg"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-500 pixel-border flex items-center justify-center">
            <Play className="w-6 h-6 text-blue-900" />
          </div>
        </div>
        <h1 className="text-xl font-black text-blue-100 mb-3 pixel-text">
          CodeCare 2.0
        </h1>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="pixel-border bg-gradient-to-r from-blue-700 to-blue-600 p-2">
            <div className="w-6 h-6 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center">
              <Clock className="w-3 h-3 text-blue-300" />
            </div>
            <h3 className="font-black text-white text-xs pixel-text">
              3 HOURS
            </h3>
            <p className="text-blue-100 text-xs font-bold">
              Select 1 case, find Solution and Innovate.
            </p>
          </div>
          <div className="pixel-border bg-gradient-to-r from-orange-700 to-orange-600 p-2">
            <div className="w-6 h-6 bg-orange-800 pixel-border mx-auto mb-1 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-orange-300" />
            </div>
            <h3 className="font-black text-white text-xs pixel-text">
              SOLUTION ROUND
            </h3>
            <p className="text-orange-100 text-xs font-bold">
              Find Solution for selected case
            </p>
          </div>
          <div className="pixel-border bg-gradient-to-r from-purple-700 to-purple-600 p-2">
            <div className="w-6 h-6 bg-purple-800 pixel-border mx-auto mb-1 flex items-center justify-center">
              <Play className="w-3 h-3 text-purple-300" />
            </div>
            <h3 className="font-black text-white text-xs pixel-text">
              INNOVATION ROUND
            </h3>
            <p className="text-purple-100 text-xs font-bold">
              Answer precisely and add attachment
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {isLevel2Completed ? (
            <div className="pixel-border bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-2 px-4 pixel-text text-sm flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              HL2-Completed
            </div>
          ) : (
            <button
              onClick={() => {
                // Set session_id and email in sessionStorage if available
                if (session_id && email) {
                  window.sessionStorage.setItem('session_id', session_id);
                  window.sessionStorage.setItem('email', email);
                  console.log('[DEBUG] Set session_id and email in sessionStorage:', session_id, email);
                } else {
                  console.warn('[DEBUG] session_id or email missing, not set in sessionStorage');
                }
                setShowCountdown(true);
                setCountdownNumber(3);
                let i = 3;
                const interval = setInterval(() => {
                  i--;
                  setCountdownNumber(i);
                  if (i === 0) {
                    clearInterval(interval);
                    setShowCountdown(false);
                    setShowLevel2Card(true);
                    // Set timer start timestamp if not already set
                    if (!window.sessionStorage.getItem('level2_timer_start')) {
                      window.sessionStorage.setItem('level2_timer_start', Date.now().toString());
                      console.log('[TIMER] Set level2_timer_start:', Date.now());
                    }
                  }
                }, 1000);
              }}
              className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm"
            >
              {isFirstTime ? "START HACKATHON" : "CONTINUE"}
            </button>
          )}
          <button
            onClick={showWalkthroughVideo}
            className="pixel-border bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            WALKTHROUGH VIDEO
          </button>
        </div>
        {/* Completion Modal */}
        {showLevelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <p className="mb-4">You have completed Level 2 (HL2)!</p>
              <button
                onClick={() => setShowLevelModal(false)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
// Timer effect removed
};

export default Level2Simulation;
