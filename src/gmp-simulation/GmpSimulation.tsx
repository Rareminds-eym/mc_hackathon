
import { AlertTriangle, Clock, Eye, Factory, Play, Trophy } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeviceLayout } from "../hooks/useOrientation";
import { supabase } from "../lib/supabase";
import type { Question } from "./HackathonData";
import { hackathonData } from "./HackathonData";
import { ModuleCompleteModal } from "./ModuleCompleteModal";
import { QuestionCard } from "./QuestionCard";
import { Results } from "./Results";
import { Timer } from "./Timer";




export interface GameState {
  currentLevel: 1 | 2;
  currentQuestion: number;
  questions: Question[];
  answers: Array<{
    violation: string;
    rootCause: string;
    solution: string;
  }>;
  score: number;
  timeRemaining: number;
  gameStarted: boolean;
  gameCompleted: boolean;
  showLevelModal: boolean;
  level1CompletionTime: number;
  showCountdown: boolean;
  countdownNumber: number;
  isCountdownForContinue: boolean;
}

interface GmpSimulationProps {
  mode?: string;
  onProceedToLevel2?: () => void;
}

const GameEngine: React.FC<GmpSimulationProps> = ({
  mode,
  onProceedToLevel2,
}) => {

  // State for team score calculation modal (must be inside component)
  const [showTeamScoreModal, setShowTeamScoreModal] = useState(false);

  // Device layout detection
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  // Case brief modal state
  const [showCaseBrief, setShowCaseBrief] = useState(false);

  // Case change indication state
  const [showCaseChangeIndicator, setShowCaseChangeIndicator] = useState(false);
  const [previousQuestionId, setPreviousQuestionId] = useState<string | null>(null);

  // Utility function to ensure valid session before API calls
  const ensureValidSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw new Error("Session expired. Please log in again.");
        }
      }

      return true;
    } catch (err) {
      console.error("Session validation failed:", err);
      setTeamInfoError("Session expired. Please log in again.");
      return false;
    }
  };

  // Walkthrough video handler
  const showWalkthroughVideo = () => {
    // You can replace this URL with the actual walkthrough video URL
    const videoUrl = "https://www.youtube.com/watch?v=TlZ79exnc4o";
    window.open(videoUrl, '_blank');
  };

  // Save team attempt to backend
  const saveTeamAttempt = async (module_number: number) => {
    if (!session_id) {
      console.warn("No session_id available for team attempt.");
      return;
    }

    // Ensure valid session before saving
    const sessionValid = await ensureValidSession();
    if (!sessionValid) {
      console.error("Cannot save team attempt: Invalid session");
      return;
    }

    // Debug: Log query parameters and types
    console.log("[DEBUG] Querying individual_attempts with:", { session_id, module_number });
    console.log("[DEBUG] Type of session_id:", typeof session_id, "Value:", session_id);
    console.log("[DEBUG] Type of module_number:", typeof module_number, "Value:", module_number);

    // Try a broader query to see all attempts for this session_id
    const { data: allAttempts, error: allError } = await supabase
      .from("individual_attempts")
      .select("*")
      .eq("session_id", session_id);
    console.log("[DEBUG] All attempts for session_id:", allAttempts, allError);
    // Fetch all individual attempts for this session and module
    const { data: attempts, error } = await supabase
      .from("individual_attempts")
      .select("score, completion_time_sec, module_number, session_id, email")
      .eq("session_id", session_id)
      .eq("module_number", module_number);
    // Debug: Log query result
    console.log("[DEBUG] Query result (session_id + module_number):", { attempts, error });
    if (error) {
      console.error(
        "Supabase fetch error (individual_attempts):",
        error.message,
        error.details
      );
      if (error.message.includes("JWT") || error.message.includes("expired")) {
        setTeamInfoError("Session expired while loading team data. Please log in again.");
      }
      return;
    }
    if (!attempts || attempts.length === 0) {
      console.warn("No individual attempts found for team.");
      return;
    }

    // Fetch team_name, college_code, and full_name from teams table
    let teamName = null;
    let collegeCode = null;
    let fullName = null;
    if (email) {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("team_name, college_code, full_name")
          .eq("email", email)
          .limit(1)
          .single();

        if (teamError) {
          if (teamError.message.includes("JSON object requested, multiple")) {
            console.warn("Multiple team records found for team_attempts, using first record");
            // Try to get the first record when multiple exist
            const { data: firstTeamData } = await supabase
              .from("teams")
              .select("team_name, college_code, full_name")
              .eq("email", email)
              .limit(1)
              .single();
            if (firstTeamData) {
              teamName = firstTeamData.team_name;
              collegeCode = firstTeamData.college_code;
              fullName = firstTeamData.full_name;
            }
          } else {
            console.warn("Could not fetch team fields for team_attempts:", teamError.message);
          }
        } else if (teamData) {
          teamName = teamData.team_name;
          collegeCode = teamData.college_code;
          fullName = teamData.full_name;
        }
      } catch (err) {
        console.warn("Error fetching team data for team_attempts:", err);
      }
    }

    // Calculate average score, top scorer, and average time
    const scores = attempts.map(a => a.score || 0);
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const avgScore = scores.length > 0 ? totalScore / scores.length : 0;
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;
    const weightedAvgScore = (0.7 * avgScore + 0.3 * topScore).toFixed(2);
    const avgTimeSec = Math.round(
      attempts.reduce((sum, a) => sum + (a.completion_time_sec || 0), 0) /
      attempts.length
    );
    // Debug logs
    console.log("[TEAM SCORING] Individual scores:", scores);
    console.log(`[TEAM SCORING] Avg score: ${avgScore}, Top score: ${topScore}, Weighted team score: ${weightedAvgScore}`);
    console.log(`[TEAM SCORING] Avg time (sec): ${avgTimeSec}`);
    // Debug: Log calculation and insert data right before insert
    console.log("[DEBUG] About to insert into team_attempts:");
    console.log("  scores:", scores);
    console.log("  avgScore:", avgScore, "topScore:", topScore, "weightedAvgScore:", weightedAvgScore);
    console.log("  Insert object:", {
      session_id,
      module_number,
      weighted_avg_score: weightedAvgScore,
      avg_time_sec: avgTimeSec,
      unlocked_next_module: false,
      team_name: teamName,
      college_code: collegeCode,
      full_name: fullName,
      email
    });
    // Upsert into team_attempts (insert or update if exists)
    const { error: insertError } = await supabase
      .from("team_attempts")
      .upsert([
        {
          session_id: session_id,
          module_number,
          weighted_avg_score: weightedAvgScore,
          avg_time_sec: avgTimeSec,
          unlocked_next_module: false,
          team_name: teamName,
          college_code: collegeCode,
          full_name: fullName,
          email: email
        },
      ], {
        onConflict: 'email,module_number'
      });
    if (insertError) {
      console.error(
        "Supabase insert error (team_attempts):",
        insertError.message,
        insertError.details
      );
      if (insertError.message.includes("JWT") || insertError.message.includes("expired")) {
        setTeamInfoError("Session expired while saving team data. Please log in again.");
      }
    }
  };
  // Error state for loading team info
  const [teamInfoError, setTeamInfoError] = useState<string | null>(null);
  // Determine which level to show based on mode
  // mode === 'violation-root-cause' => Level 1 (HL1)
  // mode === 'solution' => Level 2 (HL2)
  const initialLevel = mode === "solution" ? 2 : 1;

  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState: GameState = {
      currentLevel: initialLevel as 1 | 2,
      currentQuestion: 0,
      questions: [],
      answers: [],
      score: 0,
      timeRemaining: 5400, // 1.5 hours in seconds
      gameStarted: false,
      gameCompleted: false,
      showLevelModal: false,
      level1CompletionTime: 0,
      showCountdown: false,
      countdownNumber: 3,
      isCountdownForContinue: false,
    };

    return initialState;
  });
  // Team unlock state
  const [canAccessModule6, setCanAccessModule6] = useState(false);
  // Session/user info (fetch from teams table for current user)
  const [session_id, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Progress loading state
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [savedProgressInfo, setSavedProgressInfo] = useState<{
    currentQuestion: number;
    totalQuestions: number;
    answeredQuestions: number;
    timeRemaining: number;
  } | null>(null);

  // Block UI until session_id, email are loaded and progress is checked
  const loadingIds = !session_id || !email || isLoadingProgress;

  // Periodic timer save interval
  const [timerSaveInterval, setTimerSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Timer save status indicator
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // Refs to access current values in intervals without causing re-renders
  const gameStateRef = useRef(gameState);
  const sessionIdRef = useRef(session_id);
  const emailRef = useRef(email);

  // Update refs when values change
  useEffect(() => {
    gameStateRef.current = gameState;
    sessionIdRef.current = session_id;
    emailRef.current = email;
  }, [gameState, session_id, email]);



  // Enhanced auth handling with JWT refresh
  useEffect(() => {
    const fetchTeamInfo = async () => {
      try {
        // First, try to refresh the session if it's expired
        const { error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.warn("Session refresh failed:", refreshError.message);
        }

        // Get current user's email from Supabase Auth
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          console.error("Auth error:", authError);
          if (authError.message.includes("JWT") || authError.message.includes("expired")) {
            setTeamInfoError("Session expired. Please log in again.");
          } else {
            setTeamInfoError("Authentication error. Please log in.");
          }
          return;
        }

        if (!session || !session.user || !session.user.email) {
          setTeamInfoError("User session not found. Please log in.");
          return;
        }

        const userEmail = session.user.email;

        // First, check how many records exist for this email
        const { data: countData, error: countError } = await supabase
          .from("teams")
          .select("session_id", { count: 'exact' })
          .eq("email", userEmail);

        if (countError) {
          console.error("Database count error:", countError);
          if (countError.message.includes("JWT") || countError.message.includes("expired")) {
            setTeamInfoError("Session expired. Please log in again.");
          } else {
            setTeamInfoError("Database connection error. Please try again later.");
          }
          return;
        }

        const recordCount = countData?.length || 0;
        console.log(`Found ${recordCount} team records for email: ${userEmail}`);

        if (recordCount === 0) {
          setTeamInfoError("No team registration found for your account. Please complete team registration first.");
          return;
        }

        if (recordCount > 1) {
          console.warn(`Multiple team records found for email: ${userEmail}. Using the first one.`);
          // Use the first record when multiple exist
          const { data, error } = await supabase
            .from("teams")
            .select("session_id")
            .eq("email", userEmail)
            .limit(1)
            .single();

          if (error) {
            console.error("Database error (multiple records):", error);
            setTeamInfoError("Multiple team registrations found. Please contact support for assistance.");
            return;
          }

          if (!data || !data.session_id) {
            setTeamInfoError("Invalid team data found. Please contact support.");
            return;
          }

          console.log("Using session_id from first record:", data.session_id);
          setSessionId(data.session_id);
          setEmail(userEmail);
          return;
        }

        // Exactly one record found - proceed normally
        const { data, error } = await supabase
          .from("teams")
          .select("session_id")
          .eq("email", userEmail)
          .single();

        if (error) {
          console.error("Database error:", error);

          // Provide specific error messages based on error type
          if (error.message.includes("JWT") || error.message.includes("expired")) {
            setTeamInfoError("Session expired. Please log in again.");
          } else if (error.message.includes("JSON object requested, multiple")) {
            setTeamInfoError("Multiple team registrations detected. Please contact support to resolve this issue.");
          } else if (error.message.includes("no rows")) {
            setTeamInfoError("Team registration not found. Please complete your team registration.");
          } else if (error.code === 'PGRST116') {
            setTeamInfoError("Team data not found. Please verify your registration.");
          } else {
            setTeamInfoError(`Team data loading failed: ${error.message}. Please try again or contact support.`);
          }
        } else if (!data) {
          setTeamInfoError("Team registration data is empty. Please complete your registration.");
        } else if (!data.session_id) {
          setTeamInfoError("Invalid team session. Please contact support for assistance.");
        } else {
          console.log("Successfully loaded team info for:", userEmail);
          setSessionId(data.session_id);
          setEmail(userEmail);
        }
      } catch (err) {
        console.error("Unexpected error in fetchTeamInfo:", err);
        if (err instanceof Error) {
          if (err.message.includes("fetch")) {
            setTeamInfoError("Network connection error. Please check your internet connection and try again.");
          } else if (err.message.includes("timeout")) {
            setTeamInfoError("Request timed out. Please try again.");
          } else {
            setTeamInfoError(`Unexpected error: ${err.message}. Please try again or contact support.`);
          }
        } else {
          setTeamInfoError("An unexpected error occurred. Please refresh the page and try again.");
        }
      }
    };

    fetchTeamInfo();
  }, []);

  // Load saved progress when session_id and email are available
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!session_id || !email || progressLoaded) return;

      setIsLoadingProgress(true);
      try {
        // Determine module number based on current level/mode
        const moduleNumber = initialLevel === 1 ? 5 : 6;

        // Load saved attempt details
        const { data: attemptDetails, error } = await supabase
          .from("attempt_details")
          .select("*")
          .eq("email", email)
          .eq("session_id", session_id)
          .eq("module_number", moduleNumber)
          .order("question_index", { ascending: true });

        if (error) {
          console.error("Error loading saved progress:", error);
          setProgressLoaded(true);
          return;
        }

        if (attemptDetails && attemptDetails.length > 0) {
          setHasSavedProgress(true);

          console.log("Loading saved progress:", {
            attemptDetailsLength: attemptDetails.length,
            moduleNumber,
            initialLevel,
            attemptDetails: attemptDetails.map(d => ({
              question_index: d.question_index,
              hasQuestion: !!d.question,
              hasAnswer: !!d.answer
            }))
          });

          // Always restore game state if there are saved attempt details,
          // even if no answers have been provided yet
          // This fixes the "No saved questions found" error when user starts game but doesn't answer anything
          if (attemptDetails.length > 0) {
            // The saved data might not have all 5 questions if user didn't reach them all
            // We need to reconstruct the full game state properly

            // First, get the questions that were saved
            const savedQuestionData = attemptDetails.map(detail => ({
              index: detail.question_index,
              question: detail.question,
              answer: detail.answer
            })).sort((a, b) => a.index - b.index);

            console.log("Saved question data:", savedQuestionData);

            // If we don't have a complete set, we need to generate the missing questions
            // This happens when user didn't reach all questions before saving
            if (savedQuestionData.length < 5) {
              console.log("Incomplete saved data, generating missing questions...");

              // Generate a fresh set of 5 questions
              const allQuestions = selectRandomQuestions();
              const allAnswers = allQuestions.map(() => ({
                violation: "",
                rootCause: "",
                solution: "",
              }));

              // Restore the saved questions and answers in their correct positions
              savedQuestionData.forEach(({ index, question, answer }) => {
                if (index < 5 && question) {
                  allQuestions[index] = question;
                  allAnswers[index] = answer || { violation: "", rootCause: "", solution: "" };
                }
              });

              // Use the reconstructed arrays
              var finalQuestions = allQuestions;
              var finalAnswers = allAnswers;
            } else {
              console.log("Complete saved data found, using saved questions...");
              // We have all 5 questions saved
              var finalQuestions = savedQuestionData.map(item => item.question).filter(q => q) as Question[];
              var finalAnswers = savedQuestionData.map(item => item.answer || { violation: "", rootCause: "", solution: "" }) as { violation: string; rootCause: string; solution: string; }[];

              // Ensure we still have 5 questions even if some were null
              if (finalQuestions.length < 5) {
                console.warn("Some saved questions were null, filling with random questions...");
                const additionalQuestions = selectRandomQuestions();
                while (finalQuestions.length < 5) {
                  finalQuestions.push(additionalQuestions[finalQuestions.length]);
                  finalAnswers.push({ violation: "", rootCause: "", solution: "" });
                }
              }
            }

            console.log("Final questions and answers:", {
              questionsLength: finalQuestions.length,
              answersLength: finalAnswers.length,
              questions: finalQuestions.map(q => q?.id || 'null')
            });

            // Find the furthest question the user has navigated to
            // This represents where they should continue from (after clicking Proceed)
            let currentQuestionIndex = 0;
            let furthestQuestionIndex = -1;
            let completeCount = 0;
            let savedTimeRemaining = 5400; // Default timer value

            // The furthest question is the highest question_index in the saved data
            // This represents the last question the user navigated to (via Proceed button)
            attemptDetails.forEach(detail => {
              if (detail.question_index > furthestQuestionIndex) {
                furthestQuestionIndex = detail.question_index;
                // Get the timer state from the furthest question reached
                if (detail.time_remaining && typeof detail.time_remaining === 'number' && !isNaN(detail.time_remaining)) {
                  savedTimeRemaining = Math.max(0, Math.min(detail.time_remaining, 5400)); // Ensure valid range
                }
              }
            });

            // Validate savedTimeRemaining before using it
            if (isNaN(savedTimeRemaining) || savedTimeRemaining < 0 || savedTimeRemaining > 5400) {
              savedTimeRemaining = 5400;
            }

            // Count complete answers for progress display
            for (let i = 0; i < finalAnswers.length; i++) {
              const answer = finalAnswers[i];
              if (answer) {
                let isComplete = false;
                if (initialLevel === 1) {
                  isComplete = !!(answer.violation && answer.violation.trim() !== "" &&
                    answer.rootCause && answer.rootCause.trim() !== "");
                } else {
                  isComplete = !!(answer.solution && answer.solution.trim() !== "");
                }
                if (isComplete) completeCount++;
              }
            }

            // Continue from the furthest question the user reached
            if (furthestQuestionIndex >= 0) {
              currentQuestionIndex = furthestQuestionIndex;
            } else {
              currentQuestionIndex = 0;
            }

            // Set progress info
            setSavedProgressInfo({
              currentQuestion: currentQuestionIndex + 1,
              totalQuestions: finalQuestions.length,
              answeredQuestions: completeCount,
              timeRemaining: savedTimeRemaining,
            });

            // Ensure currentQuestion is within valid bounds
            currentQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, finalQuestions.length - 1));

            // Final validation of savedTimeRemaining before setting state
            const finalTimeRemaining = (isNaN(savedTimeRemaining) || savedTimeRemaining < 0 || savedTimeRemaining > 5400) ? 5400 : savedTimeRemaining;

            // Check if all cases are completed during restoration
            const allCasesCompleted = completeCount >= finalQuestions.length;

            if (allCasesCompleted) {
              // All cases completed - show level complete modal immediately
              if (initialLevel === 1) {
                const level1Time = Math.max(0, 5400 - finalTimeRemaining);
                // Save attempt to backend
                saveIndividualAttempt(
                  calculateScore(finalAnswers, finalQuestions),
                  level1Time,
                  5
                );
                // Only save team attempt if all individual attempts are complete
                setShowTeamScoreModal(true);
                supabase.rpc('is_team_complete', {
                  p_session_id: session_id,
                  p_module_number: 5
                }).then(async ({ data: isComplete, error }) => {
                  if (isComplete && isComplete === true) {
                    await saveTeamAttempt(5);
                  } else {
                    console.log("Not all team members have completed their attempts for module 5.");
                  }
                  setShowTeamScoreModal(false);
                });

                // Restore game state with level modal shown
                setGameState(prev => ({
                  ...prev,
                  questions: finalQuestions,
                  answers: finalAnswers,
                  currentQuestion: finalQuestions.length - 1, // Set to last question
                  gameStarted: false,
                  currentLevel: initialLevel,
                  timeRemaining: finalTimeRemaining,
                  showLevelModal: true,
                  level1CompletionTime: level1Time,
                }));
              } else {
                // Level 2 completed - finish game
                const finalScore = calculateScore(finalAnswers, finalQuestions);
                const finalTime = Math.max(0, 5400 - finalTimeRemaining);
                saveIndividualAttempt(finalScore, finalTime, 6);
                setShowTeamScoreModal(true);
                supabase.rpc('is_team_complete', {
                  p_session_id: session_id,
                  p_module_number: 6
                }).then(async ({ data: isComplete, error }) => {
                  if (isComplete && isComplete === true) {
                    await saveTeamAttempt(6);
                  } else {
                    console.log("Not all team members have completed their attempts for module 6.");
                  }
                  setShowTeamScoreModal(false);
                });

                // Restore game state as completed
                setGameState(prev => ({
                  ...prev,
                  questions: finalQuestions,
                  answers: finalAnswers,
                  currentQuestion: finalQuestions.length - 1, // Set to last question
                  gameStarted: false,
                  currentLevel: initialLevel,
                  timeRemaining: finalTimeRemaining,
                  gameCompleted: true,
                  score: finalScore,
                }));
              }
            } else {
              // Not all cases completed - restore normal game state
              console.log("Restoring normal game state:", {
                questionsLength: finalQuestions.length,
                answersLength: finalAnswers.length,
                currentQuestionIndex,
                finalTimeRemaining
              });

              setGameState(prev => ({
                ...prev,
                questions: finalQuestions,
                answers: finalAnswers,
                currentQuestion: currentQuestionIndex,
                gameStarted: false, // Let user choose to continue
                currentLevel: initialLevel,
                timeRemaining: finalTimeRemaining, // Restore timer state with validation
              }));
            }


          }
        } else {
          console.log("No saved attempt details found");
          setHasSavedProgress(false);
        }

        setProgressLoaded(true);
      } catch (err) {
        console.error("Error loading progress:", err);
        // Even if loading fails, if we detected saved progress, keep that flag
        // The continue game function will handle generating questions if needed
        setProgressLoaded(true);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadSavedProgress();
  }, [session_id, email, initialLevel, progressLoaded]);

  // Poll for module 6 unlock after Module 5
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (gameState.gameCompleted && gameState.currentLevel === 1) {
      // Only poll after Module 5 completion
      const poll = async () => {
        const { data } = await supabase
          .from("teams")
          .select("can_access_module6")
          .eq("session_id", session_id)
          .single();
        if (data && data.can_access_module6) {
          setCanAccessModule6(true);
          clearInterval(pollInterval);
        }
      };
      pollInterval = setInterval(poll, 3000); // Poll every 3s
      poll();
    }
    return () => pollInterval && clearInterval(pollInterval);
  }, [gameState.gameCompleted, gameState.currentLevel, session_id]);

  // Cleanup timer save interval on component unmount
  useEffect(() => {
    return () => {
      if (timerSaveInterval) {
        clearInterval(timerSaveInterval);
      }
    };
  }, []);

  // Auto-show case brief for Level 1 in mobile horizontal mode when game starts
  useEffect(() => {
    if (gameState.gameStarted && gameState.currentLevel === 1 && isMobileHorizontal) {
      setTimeout(() => setShowCaseBrief(true), 100);
    }
  }, [gameState.gameStarted, gameState.currentLevel, isMobileHorizontal]);

  // Periodic timer save - save timer every 30 seconds during active gameplay
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameCompleted || gameState.showLevelModal || !session_id || !email) {
      // Clear any existing interval if game is not active or level modal is shown
      if (timerSaveInterval) {
        clearInterval(timerSaveInterval);
        setTimerSaveInterval(null);
      }
      return;
    }

    // Only create interval if one doesn't exist
    if (!timerSaveInterval) {
      const interval = setInterval(async () => {
        try {
          const currentState = gameStateRef.current;
          const currentSession = sessionIdRef.current;
          const currentEmailValue = emailRef.current;

          // Skip if game is no longer active or level modal is shown
          if (!currentState.gameStarted || currentState.gameCompleted || currentState.showLevelModal || !currentSession || !currentEmailValue) {
            return;
          }

          // Only save if we have meaningful progress (timer has been running for at least 10 seconds)
          if (currentState.timeRemaining < 5390) { // 5400 - 10 seconds
            // Ensure valid session before saving
            const sessionValid = await ensureValidSession();
            if (!sessionValid) {
              return;
            }

            await supabase.from("attempt_details").upsert(
              [
                {
                  email: currentEmailValue,
                  session_id: currentSession,
                  module_number: currentState.currentLevel === 1 ? 5 : 6,
                  question_index: currentState.currentQuestion,
                  question: currentState.questions[currentState.currentQuestion] || null,
                  answer: currentState.answers[currentState.currentQuestion] || { violation: "", rootCause: "", solution: "" },
                  time_remaining: currentState.timeRemaining,
                },
              ],
              { onConflict: "email,session_id,module_number,question_index" }
            );

            // Update save indicator
            setShowSaveIndicator(true);

            // Hide save indicator after 2 seconds
            setTimeout(() => {
              setShowSaveIndicator(false);
            }, 2000);
          }
        } catch (err) {
          console.error('Periodic timer save error:', err);
          if (err instanceof Error && (err.message.includes("JWT") || err.message.includes("expired"))) {
            console.warn("Session expired during periodic timer save");
          }
        }
      }, 30000); // Fixed 30-second interval

      setTimerSaveInterval(interval);
    }
  }, [gameState.gameStarted, gameState.gameCompleted, gameState.showLevelModal, session_id, email, timerSaveInterval]);

  // Detect case changes and show indicator
  useEffect(() => {
    const currentQuestion = gameState.questions[gameState.currentQuestion];

    if (currentQuestion && previousQuestionId && previousQuestionId !== currentQuestion.id) {
      // Case has changed, show the indicator
      setShowCaseChangeIndicator(true);

      // Hide the indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowCaseChangeIndicator(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // Update the previous question ID
    if (currentQuestion) {
      setPreviousQuestionId(currentQuestion.id);
    }
  }, [gameState.questions, gameState.currentQuestion, previousQuestionId]);

  // Save individual attempt to backend
  const saveIndividualAttempt = async (
    score: number,
    completion_time_sec: number,
    module_number: number
  ) => {
    // Ensure valid session before saving
    const sessionValid = await ensureValidSession();
    if (!sessionValid) {
      console.error("Cannot save attempt: Invalid session");
      return;
    }

    // Fetch team_name, college_code, and full_name from teams table
    let teamName = null;
    let collegeCode = null;
    let fullName = null;
    if (email) {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("team_name, college_code, full_name")
          .eq("email", email)
          .limit(1)
          .single();

        if (teamError) {
          if (teamError.message.includes("JSON object requested, multiple")) {
            console.warn("Multiple team records found for individual_attempts, using first record");
            // Try to get the first record when multiple exist
            const { data: firstTeamData } = await supabase
              .from("teams")
              .select("team_name, college_code, full_name")
              .eq("email", email)
              .limit(1)
              .single();
            if (firstTeamData) {
              teamName = firstTeamData.team_name;
              collegeCode = firstTeamData.college_code;
              fullName = firstTeamData.full_name;
            }
          } else {
            console.warn("Could not fetch team fields for individual_attempts:", teamError.message);
          }
        } else if (teamData) {
          teamName = teamData.team_name;
          collegeCode = teamData.college_code;
          fullName = teamData.full_name;
        }
      } catch (err) {
        console.warn("Error fetching team data for individual_attempts:", err);
      }
    }

    const { error } = await supabase.from("individual_attempts").upsert([
      {
        email: email,
        session_id: session_id,
        module_number,
        score,
        completion_time_sec,
        team_name: teamName,
        college_code: collegeCode,
        full_name: fullName,
      },
    ], { onConflict: "email,session_id,module_number" });
    if (error) {
      console.error("Supabase upsert error:", error.message, error.details);
      if (error.message.includes("JWT") || error.message.includes("expired")) {
        setTeamInfoError("Session expired while saving. Please log in again.");
      } else {
        alert("Error saving attempt: " + error.message);
      }
    }
  };

  // Clear saved progress for a fresh start
  const clearSavedProgress = async () => {
    if (!session_id || !email) return;

    try {
      const moduleNumber = initialLevel === 1 ? 5 : 6;
      await supabase
        .from("attempt_details")
        .delete()
        .eq("email", email)
        .eq("session_id", session_id)
        .eq("module_number", moduleNumber);


    } catch (err) {
      console.error("Error clearing saved progress:", err);
    }
  };

  // Select 5 random questions for the user
  const selectRandomQuestions = () => {
    const shuffled = [...hackathonData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  };

  const startGame = async () => {
    // Clear any existing saved progress for a fresh start
    await clearSavedProgress();

    const questions = selectRandomQuestions();
    const initialAnswers = questions.map(() => ({
      violation: "",
      rootCause: "",
      solution: "",
    }));

    // Start countdown
    setGameState((prev) => ({
      ...prev,
      questions,
      answers: initialAnswers,
      showCountdown: true,
      countdownNumber: 3,
      isCountdownForContinue: false,
      // Ensure correct level is set on start
      currentLevel: initialLevel,
      // Reset timer to full time for new game
      timeRemaining: 5400,
    }));

    // Countdown sequence: 3, 2, 1, then start
    const countdown = async () => {
      for (let i = 3; i >= 1; i--) {
        setGameState(prev => ({ ...prev, countdownNumber: i }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // After countdown, start the actual game
      setGameState(prev => ({
        ...prev,
        showCountdown: false,
        gameStarted: true,
      }));

      // Save initial position (question 0) when starting new game
      setTimeout(() => {
        saveCurrentPosition(0);
      }, 100);
    };

    countdown();

    // Reset progress flags
    setProgressLoaded(false);
    setHasSavedProgress(false);
    setSavedProgressInfo(null);
  };

  // Function to check if hackathon is completed
  const isHackathonCompleted = () => {
    if (!gameState.questions.length || !gameState.answers.length) {
      console.log("isHackathonCompleted: No questions or answers", {
        questionsLength: gameState.questions.length,
        answersLength: gameState.answers.length
      });
      return false;
    }

    let completeCount = 0;
    console.log("Checking hackathon completion:", {
      currentLevel: gameState.currentLevel,
      questionsLength: gameState.questions.length,
      answersLength: gameState.answers.length
    });

    for (let i = 0; i < gameState.answers.length; i++) {
      const answer = gameState.answers[i];
      if (answer) {
        let isComplete = false;
        if (gameState.currentLevel === 1) {
          isComplete = !!(answer.violation && answer.violation.trim() !== "" &&
            answer.rootCause && answer.rootCause.trim() !== "");
        } else {
          isComplete = !!(answer.solution && answer.solution.trim() !== "");
        }
        console.log(`Answer ${i}:`, {
          violation: answer.violation || "(empty)",
          rootCause: answer.rootCause || "(empty)",
          solution: answer.solution || "(empty)",
          isComplete
        });
        if (isComplete) completeCount++;
      }
    }

    const completed = completeCount >= gameState.questions.length;
    console.log("Hackathon completion result:", {
      completeCount,
      questionsLength: gameState.questions.length,
      completed
    });
    return completed;
  };

  // Function to reset game state (for testing)
  const resetGameState = () => {
    console.log("Resetting game state...");
    setGameState(prev => ({
      ...prev,
      questions: [],
      answers: [],
      currentQuestion: 0,
      gameStarted: false,
      gameCompleted: false,
      showLevelModal: false,
      level1CompletionTime: 0,
      timeRemaining: 5400,
      showCountdown: false,
    }));
    setHasSavedProgress(false);
    setProgressLoaded(false);
  };

  // Function to handle when hackathon is completed
  const showCompletionModal = () => {
    console.log("showCompletionModal called - showing completion modal");
    setGameState(prev => {
      console.log("Setting showLevelModal to true, current state:", {
        showLevelModal: prev.showLevelModal,
        currentLevel: prev.currentLevel,
        gameCompleted: prev.gameCompleted
      });
      return {
        ...prev,
        showLevelModal: true,
        level1CompletionTime: Math.max(0, 5400 - prev.timeRemaining),
        gameStarted: false,
      };
    });
  };

  const continueGame = () => {
    // Check if all cases are completed before doing anything else
    setGameState(prev => {
      console.log("Continue Game Debug:", {
        questionsLength: prev.questions.length,
        answersLength: prev.answers.length,
        currentQuestion: prev.currentQuestion,
        currentLevel: prev.currentLevel,
        showLevelModal: prev.showLevelModal,
        gameCompleted: prev.gameCompleted
      });

      // If already showing completion screen, don't do anything
      if (prev.showLevelModal || prev.gameCompleted) {
        console.log("Already showing completion screen, returning current state");
        return prev;
      }

      // Validate game state before continuing
      if (prev.questions.length === 0) {
        console.error("No questions found in game state. Attempting to restore from saved progress...");
        if (hasSavedProgress) {
          console.log("Attempting to generate questions for continue game...");
          const questions = selectRandomQuestions();
          const initialAnswers = questions.map(() => ({
            violation: "",
            rootCause: "",
            solution: "",
          }));
          return {
            ...prev,
            questions,
            answers: initialAnswers,
            showCountdown: true,
            countdownNumber: 3,
            isCountdownForContinue: true,
          };
        }
        alert("Error: No saved questions found. Please start a new game.");
        return prev;
      }

      // Fix answers array if needed
      if (prev.answers.length !== prev.questions.length) {
        console.warn("Answers length mismatch. Fixing...");
        const fixedAnswers = [...prev.answers];
        while (fixedAnswers.length < prev.questions.length) {
          fixedAnswers.push({ violation: "", rootCause: "", solution: "" });
        }
        return { ...prev, answers: fixedAnswers };
      }

      // Check completion status
      let completeCount = 0;
      console.log("Checking completion status for all answers:");

      for (let i = 0; i < prev.answers.length; i++) {
        const answer = prev.answers[i];
        if (answer) {
          let isComplete = false;
          if (prev.currentLevel === 1) {
            // For Level 1, need both violation and root cause
            isComplete = !!(answer.violation && answer.violation.trim() !== "" &&
              answer.rootCause && answer.rootCause.trim() !== "");
          } else {
            // For Level 2, need solution
            isComplete = !!(answer.solution && answer.solution.trim() !== "");
          }

          console.log(`Answer ${i}:`, {
            violation: answer.violation || "(empty)",
            rootCause: answer.rootCause || "(empty)",
            solution: answer.solution || "(empty)",
            isComplete
          });

          if (isComplete) completeCount++;
        }
      }

      const allCasesCompleted = completeCount >= prev.questions.length;
      console.log(`Completion check: ${completeCount}/${prev.questions.length} completed = ${allCasesCompleted}`);

      // If all cases completed, show completion screen immediately
      if (allCasesCompleted) {
        console.log("🎉 All cases completed! Showing completion screen immediately...");

        if (prev.currentLevel === 1) {
          const level1Time = Math.max(0, 5400 - prev.timeRemaining);
          console.log("Level 1 completed, showing modal with time:", level1Time);

          // Save attempt to backend
          saveIndividualAttempt(calculateScore(prev.answers, prev.questions), level1Time, 5);
          saveTeamAttempt(5);

          return {
            ...prev,
            showLevelModal: true,
            level1CompletionTime: level1Time,
            gameStarted: false,
            showCountdown: false, // Make sure countdown is not shown
          };
        } else {
          // Level 2 completed
          const finalScore = calculateScore(prev.answers, prev.questions);
          const finalTime = Math.max(0, 5400 - prev.timeRemaining);
          console.log("Level 2 completed, finishing game with score:", finalScore);

          saveIndividualAttempt(finalScore, finalTime, 6);
          saveTeamAttempt(6);

          return {
            ...prev,
            gameCompleted: true,
            score: finalScore,
            gameStarted: false,
            showCountdown: false, // Make sure countdown is not shown
          };
        }
      }

      // Not all cases completed - start countdown
      console.log("Not all cases completed, starting countdown...");
      return {
        ...prev,
        showCountdown: true,
        countdownNumber: 3,
        isCountdownForContinue: true,
      };
    });

    // Start countdown only if needed (after a small delay to let state update)
    setTimeout(() => {
      setGameState(prev => {
        // Skip countdown if completion screen should be shown
        if (prev.showLevelModal || prev.gameCompleted || !prev.showCountdown) {
          console.log("Skipping countdown - completion screen should be shown");
          return prev;
        }

        console.log("Starting countdown sequence...");

        // Countdown sequence: 3, 2, 1, then continue
        const countdown = async () => {
          for (let i = 3; i >= 1; i--) {
            setGameState(prevState => ({ ...prevState, countdownNumber: i }));
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // After countdown, continue the actual game
          setGameState(prevState => ({
            ...prevState,
            showCountdown: false,
            gameStarted: true,
          }));
        };

        countdown();
        return prev;
      });
    }, 100); // Small delay to ensure state has updated
  };

  const handleAnswer = (answer: {
    violation?: string;
    rootCause?: string;
    solution?: string;
  }) => {
    setGameState((prev) => {
      const newAnswers = [...prev.answers];
      if (answer.violation !== undefined) {
        newAnswers[prev.currentQuestion].violation = answer.violation;
      }
      if (answer.rootCause !== undefined) {
        newAnswers[prev.currentQuestion].rootCause = answer.rootCause;
      }
      if (answer.solution !== undefined) {
        newAnswers[prev.currentQuestion].solution = answer.solution;
      }

      // Auto-save answers and questions to database after every answer
      const saveAttemptDetails = async () => {
        try {
          // Ensure valid session before auto-saving
          const sessionValid = await ensureValidSession();
          if (!sessionValid) {
            console.warn("Cannot auto-save: Invalid session");
            return;
          }

          await supabase.from("attempt_details").upsert(
            [
              {
                email: email,
                session_id: session_id,
                module_number: prev.currentLevel === 1 ? 5 : 6,
                question_index: prev.currentQuestion,
                question: prev.questions[prev.currentQuestion],
                answer: newAnswers[prev.currentQuestion],
                time_remaining: prev.timeRemaining, // Save current timer state
              },
            ],
            { onConflict: "email,session_id,module_number,question_index" }
          );

          // Update save indicator
          setShowSaveIndicator(true);
          setTimeout(() => setShowSaveIndicator(false), 2000);
        } catch (err) {
          console.error("Auto-save error:", err);
          if (err instanceof Error && (err.message.includes("JWT") || err.message.includes("expired"))) {
            console.warn("Session expired during auto-save");
            // Don't show error to user for auto-save failures, just log it
          }
        }
      };
      saveAttemptDetails();

      // Check if all cases are completed after this answer
      let completeCount = 0;
      for (let i = 0; i < newAnswers.length; i++) {
        const answerItem = newAnswers[i];
        if (answerItem) {
          let isComplete = false;
          if (prev.currentLevel === 1) {
            isComplete = !!(answerItem.violation && answerItem.violation.trim() !== "" &&
              answerItem.rootCause && answerItem.rootCause.trim() !== "");
          } else {
            isComplete = !!(answerItem.solution && answerItem.solution.trim() !== "");
          }
          if (isComplete) completeCount++;
        }
      }

      const allCasesCompleted = completeCount >= prev.questions.length;

      // If all cases are completed, automatically show completion screen
      if (allCasesCompleted) {
        if (prev.currentLevel === 1) {
          // Level 1 completed - show modal
          const level1Time = Math.max(0, 5400 - prev.timeRemaining);
          // Save attempt to backend
          saveIndividualAttempt(
            calculateScore(newAnswers, prev.questions),
            level1Time,
            5
          );
          saveTeamAttempt(5); // Save team summary for module 5
          return {
            ...prev,
            answers: newAnswers,
            showLevelModal: true,
            level1CompletionTime: level1Time,
          };
        } else {
          // Level 2 completed - finish game
          const finalScore = calculateScore(newAnswers, prev.questions);
          const finalTime = Math.max(0, 5400 - prev.timeRemaining);
          // Save attempt to backend
          saveIndividualAttempt(finalScore, finalTime, 6);
          saveTeamAttempt(6); // Save team summary for module 6
          return {
            ...prev,
            answers: newAnswers,
            gameCompleted: true,
            score: finalScore,
          };
        }
      }

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  // Save current position to database
  const saveCurrentPosition = async (questionIndex: number) => {
    if (!session_id || !email) return;

    try {
      const sessionValid = await ensureValidSession();
      if (!sessionValid) return;

      await supabase.from("attempt_details").upsert(
        [
          {
            email: email,
            session_id: session_id,
            module_number: initialLevel === 1 ? 5 : 6,
            question_index: questionIndex,
            question: gameState.questions[questionIndex] || null,
            answer: gameState.answers[questionIndex] || { violation: "", rootCause: "", solution: "" },
            time_remaining: gameState.timeRemaining, // Save current timer state
          },
        ],
        { onConflict: "email,session_id,module_number,question_index" }
      );

      // Update save indicator
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    } catch (err) {
      console.error("Error saving position:", err);
    }
  };

  const nextQuestion = () => {
    setGameState((prev) => {
      const nextQuestionIndex = prev.currentQuestion + 1;

      // Save the new position when user proceeds
      if (nextQuestionIndex < 5) {
        saveCurrentPosition(nextQuestionIndex);
      }

      if (nextQuestionIndex >= 5) {
        if (prev.currentLevel === 1) {
          // Level 1 completed - show modal
          const level1Time = Math.max(0, 5400 - prev.timeRemaining);
          // Save attempt to backend
          saveIndividualAttempt(
            calculateScore(prev.answers, prev.questions),
            level1Time,
            5
          );
          setShowTeamScoreModal(true);
          supabase.rpc('is_team_complete', {
            p_session_id: session_id,
            p_module_number: 5
          }).then(async ({ data: isComplete, error }) => {
            if (isComplete && isComplete === true) {
              await saveTeamAttempt(5);
            } else {
              console.log("Not all team members have completed their attempts for module 5.");
            }
            setShowTeamScoreModal(false);
          });
          return {
            ...prev,
            showLevelModal: true,
            level1CompletionTime: level1Time,
          };
        } else {
          // Level 2 completed - finish game
          const finalScore = calculateScore(prev.answers, prev.questions);
          // Save attempt to backend
          const finalTime = Math.max(0, 5400 - prev.timeRemaining);
          saveIndividualAttempt(finalScore, finalTime, 6);
          setShowTeamScoreModal(true);
          supabase.rpc('is_team_complete', {
            p_session_id: session_id,
            p_module_number: 6
          }).then(async ({ data: isComplete, error }) => {
            if (isComplete && isComplete === true) {
              await saveTeamAttempt(6);
            } else {
              console.log("Not all team members have completed their attempts for module 6.");
            }
            setShowTeamScoreModal(false);
          });
  // Modal for team score calculation
  const TeamScoreModal = () => (
    showTeamScoreModal ? (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          padding: '2rem 3rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: 500
        }}>
          Calculating team score… Please wait.
        </div>
      </div>
    ) : null
  );
  // ...existing code...
  // Render the modal at the root of the component
  return (
    <>
      <TeamScoreModal />
      <div
        className="h-screen bg-gray-800 flex flex-col overflow-hidden relative"
        style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        {/* ...rest of your hackathon level UI code... */}
      </div>
    </>
  );
          return {
            ...prev,
            gameCompleted: true,
            score: finalScore,
          };
        }
      } else {
        // Move to next question and ensure answer object exists
        const newAnswers = [...prev.answers];

        // Ensure the next question has an answer object initialized
        if (!newAnswers[nextQuestionIndex]) {
          newAnswers[nextQuestionIndex] = {
            violation: "",
            rootCause: "",
            solution: "",
          };
        }

        // Only clear the next question's answers if we're in normal gameplay
        // (not when restoring from saved progress)
        if (!progressLoaded || nextQuestionIndex > prev.currentQuestion) {
          // Clear only the fields relevant to the current level
          if (prev.currentLevel === 1) {
            newAnswers[nextQuestionIndex].violation = "";
            newAnswers[nextQuestionIndex].rootCause = "";
          } else {
            newAnswers[nextQuestionIndex].solution = "";
          }
        }



        return {
          ...prev,
          currentQuestion: nextQuestionIndex,
          answers: newAnswers,
        };
      }
    });
  };

  const proceedToLevel2 = () => {
    // Only allow proceeding to Level 2 if mode is not 'solution' AND not 'violation-root-cause'
    // In HL1 (violation-root-cause), do NOT show Level 2 after modal
    if (mode === "solution") {
      // Do nothing, stay in Level 2
      return;
    }
    // If mode is 'violation-root-cause', trigger navigation to HL2 via parent
    if (onProceedToLevel2) onProceedToLevel2();
  };

  const calculateScore = (
    answers: Array<{ violation: string; rootCause: string; solution: string }>,
    questions: Question[]
  ) => {
    let score = 0;

    questions.forEach((question, index) => {
      const answer = answers[index];

      // Level 1 scoring (10 points each for violation and root cause)
      if (answer.violation === question.correctViolation) score += 10;
      if (answer.rootCause === question.correctRootCause) score += 10;

      // Level 2 scoring (20 points for solution)
      if (answer.solution === question.correctSolution) score += 20;
    });

    return score;
  };

  const handleTimeUp = useCallback(() => {
    const currentGameState = gameStateRef.current;
    const finalScore = calculateScore(currentGameState.answers, currentGameState.questions);
    setGameState((prev) => ({
      ...prev,
      gameCompleted: true,
      score: finalScore,
      timeRemaining: 0,
    }));
  }, []); // Empty dependency array - use ref for current values

  const handleSetTimeRemaining = useCallback((timeOrUpdater: number | ((prev: number) => number)) => {
    if (typeof timeOrUpdater === 'function') {
      // Handle functional update
      setGameState((prev) => {
        const newTime = timeOrUpdater(prev.timeRemaining);
        // Validate the result
        if (isNaN(newTime) || newTime < 0) {
          return prev;
        }
        const validTime = Math.max(0, Math.min(newTime, 5400));
        return { ...prev, timeRemaining: validTime };
      });
    } else {
      // Handle direct value
      if (isNaN(timeOrUpdater) || timeOrUpdater < 0) {
        return;
      }
      const validTime = Math.max(0, Math.min(timeOrUpdater, 5400));
      setGameState((prev) => ({ ...prev, timeRemaining: validTime }));
    }
  }, []);

  // Reset game state when mode changes (e.g., after navigation to HL2)
  React.useEffect(() => {
    if (mode === "solution") {
      // Preserve Level 1 answers for summary in Level 2
      setGameState((prev) => {
        // If already in Level 2, do nothing
        if (prev.currentLevel === 2) return prev;
        // Use previous questions and answers, only reset solution field
        const newAnswers = prev.answers.map((ans) => ({
          violation: ans.violation,
          rootCause: ans.rootCause,
          solution: "", // clear solution for Level 2
        }));
        return {
          ...prev,
          currentLevel: 2,
          currentQuestion: 0,
          // Keep previous questions and answers
          questions:
            prev.questions.length === 5
              ? prev.questions
              : selectRandomQuestions(),
          answers:
            prev.answers.length === 5
              ? newAnswers
              : selectRandomQuestions().map(() => ({
                violation: "",
                rootCause: "",
                solution: "",
              })),
          gameStarted: true,
          gameCompleted: false,
          showLevelModal: false,
          level1CompletionTime: 0,
        };
      });
    }
  }, [mode]);

  // Only show Level 1 UI for HL1 (mode violation-root-cause)
  // Only show Level 2 UI for HL2 (mode solution)
  if (!gameState.gameStarted && !gameState.showCountdown) {
    if (loadingIds || teamInfoError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 relative p-2">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
          <div className="pixel-border bg-gradient-to-r from-cyan-600 to-blue-600 p-4 max-w-md w-full text-center relative z-10">
            <h2 className="text-lg font-black mb-3 text-cyan-100 pixel-text">
              LOADING TEAM INFO...
            </h2>
            {teamInfoError ? (
              <>
                <p className="text-red-300 mb-4 font-bold text-sm">{teamInfoError}</p>
                <div className="flex flex-col gap-2">
                  {teamInfoError.includes("expired") || teamInfoError.includes("JWT") ? (
                    <>
                      <button
                        className="pixel-border bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black py-2 px-4 pixel-text transition-all text-sm"
                        onClick={() => {
                          // Redirect to login page
                          navigate('/login');
                        }}
                      >
                        GO TO LOGIN
                      </button>
                      <button
                        className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-1 px-3 pixel-text transition-all text-sm"
                        onClick={async () => {
                          setTeamInfoError(null);
                          // Try to sign out and clear any cached tokens
                          try {
                            await supabase.auth.signOut();
                          } catch (err) {
                            console.warn("Sign out error:", err);
                          }
                          window.location.reload();
                        }}
                      >
                        RETRY
                      </button>
                    </>
                  ) : teamInfoError.includes("No team registration found") ? (
                    <button
                      className="pixel-border bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-black py-1 px-3 pixel-text transition-all text-sm"
                      onClick={() => {
                        navigate('/home');
                      }}
                    >
                      BACK TO HOME
                    </button>
                  ) : (
                    <button
                      className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-1 px-3 pixel-text transition-all text-sm"
                      onClick={() => {
                        setTeamInfoError(null);
                        window.location.reload();
                      }}
                    >
                      RETRY
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-cyan-100 mb-4 text-sm font-bold">
                  Please wait while we load your team session and check for saved progress.
                </p>
                <div className="animate-pulse text-cyan-300 font-black pixel-text text-sm">
                  {isLoadingProgress ? "LOADING PROGRESS..." : "LOADING..."}
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    if (initialLevel === 1) {
      return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center p-2 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

          <div className="pixel-border-thick bg-gradient-to-r from-cyan-600 to-blue-600 p-4 max-w-xl w-full text-center relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-cyan-500 pixel-border flex items-center justify-center">
                <Factory className="w-6 h-6 text-cyan-900" />
              </div>
            </div>
            <h1 className="text-xl font-black text-cyan-100 mb-3 pixel-text">
              Medical Coding
            </h1>
            {/* <p className="text-cyan-100 mb-4 text-sm font-bold">
              Test your knowledge of Good Manufacturing Practices through
              interactive case studies
            </p> */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="pixel-border bg-gradient-to-r from-blue-700 to-blue-600 p-2">
                <div className="w-6 h-6 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-blue-300" />
                </div>
                <h3 className="font-black text-white text-xs pixel-text">
                  90 MINUTES
                </h3>
                <p className="text-blue-100 text-xs font-bold">
                  Complete all questions
                </p>
              </div>
              <div className="pixel-border bg-gradient-to-r from-green-700 to-green-600 p-2">
                <div className="w-6 h-6 bg-green-800 pixel-border mx-auto mb-1 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-green-300" />
                </div>
                <h3 className="font-black text-white text-xs pixel-text">
                  2 LEVELS
                </h3>
                <p className="text-green-100 text-xs font-bold">
                  Analysis & Solution
                </p>
              </div>
              <div className="pixel-border bg-gradient-to-r from-orange-700 to-orange-600 p-2">
                <div className="w-6 h-6 bg-orange-800 pixel-border mx-auto mb-1 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-orange-300" />
                </div>
                <h3 className="font-black text-white text-xs pixel-text">
                  5 CASES
                </h3>
                <p className="text-orange-100 text-xs font-bold">
                  Random MC scenarios
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {hasSavedProgress ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      const completed = isHackathonCompleted();
                      console.log("Button clicked, completed status:", completed);
                      if (completed) {
                        console.log("Calling showCompletionModal");
                        showCompletionModal();
                      } else {
                        console.log("Calling continueGame");
                        continueGame();
                      }
                    }}
                    className={`pixel-border text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm ${isHackathonCompleted()
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500"
                      }`}
                  >
                    {isHackathonCompleted() ? "HL-1 COMPLETED" : "CONTINUE HACKATHON"}
                  </button>
                  {/* {savedProgressInfo && (
                    <div className="text-xs text-cyan-200 font-bold space-y-1">
                      <div>Progress: {savedProgressInfo.answeredQuestions}/{savedProgressInfo.totalQuestions} questions answered</div>
                      <div>Time remaining: {Math.floor(savedProgressInfo.timeRemaining / 60)}:{String(savedProgressInfo.timeRemaining % 60).padStart(2, '0')}</div>
                    </div>
                  )} */}
                </div>
              ) : (
                <button
                  onClick={startGame}
                  className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm"
                >
                  {/* START SIMULATION */}
                  START HACKATHON
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
          </div>
        </div>
      );
    } else {
      // Level 2 only UI (HL2)
      return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center p-2 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

          <div className="pixel-border-thick bg-gradient-to-r from-purple-600 to-purple-700 p-4 max-w-xl w-full text-center relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-purple-500 pixel-border flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-900" />
              </div>
            </div>
            <h1 className="text-xl font-black text-purple-100 mb-3 pixel-text">
              GMP SOLUTION ROUND
            </h1>
            <p className="text-purple-100 mb-4 text-sm font-bold">
              Select the best solutions for each GMP case scenario
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className="pixel-border bg-gradient-to-r from-blue-700 to-blue-600 p-2">
                <div className="w-6 h-6 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-blue-300" />
                </div>
                <h3 className="font-black text-white text-xs pixel-text">
                  90 MINUTES
                </h3>
                <p className="text-blue-100 text-xs font-bold">
                  Complete all solutions
                </p>
              </div>
              <div className="pixel-border bg-gradient-to-r from-orange-700 to-orange-600 p-2">
                <div className="w-6 h-6 bg-orange-800 pixel-border mx-auto mb-1 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-orange-300" />
                </div>
                <h3 className="font-black text-white text-xs pixel-text">
                  5 CASES
                </h3>
                <p className="text-orange-100 text-xs font-bold">
                  Random GMP scenarios
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {hasSavedProgress ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      const completed = isHackathonCompleted();
                      console.log("Button clicked, completed status:", completed);
                      if (completed) {
                        console.log("Calling showCompletionModal");
                        showCompletionModal();
                      } else {
                        console.log("Calling continueGame");
                        continueGame();
                      }
                    }}
                    className={`pixel-border text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm ${isHackathonCompleted()
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500"
                      }`}
                  >
                    {isHackathonCompleted() ? "HL-2 COMPLETED" : "CONTINUE HACKATHON"}
                  </button>
                  {/* {savedProgressInfo && (
                    <div className="text-xs text-purple-200 font-bold space-y-1">
                      <div>Progress: {savedProgressInfo.answeredQuestions}/{savedProgressInfo.totalQuestions} questions answered</div>
                      <div>Time remaining: {Math.floor(savedProgressInfo.timeRemaining / 60)}:{String(savedProgressInfo.timeRemaining % 60).padStart(2, '0')}</div>
                    </div>
                  )} */}
                </div>
              ) : (
                <button
                  onClick={startGame}
                  className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm"
                >
                  START SOLUTION ROUND
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
          </div>
        </div>
      );
    }
  }

  if (gameState.gameCompleted) {
    // After Module 5, show waiting screen if not unlocked
    if (gameState.currentLevel === 1 && !canAccessModule6) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 relative p-2">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
          <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

          <div className="pixel-border bg-gradient-to-r from-cyan-600 to-blue-600 p-4 max-w-md w-full text-center relative z-10">
            <h2 className="text-lg font-black mb-3 text-cyan-100 pixel-text">
              AWAITING TEAM EVALUATION
            </h2>
            <p className="text-cyan-100 mb-4 text-sm font-bold">
              Your team's results are being evaluated. Please wait for Module 6
              to unlock.
            </p>
            <div className="animate-pulse text-cyan-300 font-black pixel-text text-sm">
              CHECKING TEAM STATUS...
            </div>
          </div>
        </div>
      );
    }
    // If unlocked or Module 6, show results
    return (
      <Results gameState={gameState} canAccessModule6={canAccessModule6} />
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / 5) * 100;



  return (
    <div className="h-screen bg-gray-800 flex flex-col overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

      {/* Pixel Game Header */}
      <div className="pixel-border-thick bg-gradient-to-r from-gray-900 to-gray-800 relative z-10">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Left - Game Identity */}
            <div className="flex items-center gap-3">
              {/* Level Badge */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 pixel-border flex items-center justify-center">
                  <span className="text-gray-100 font-black text-sm pixel-text">
                    {gameState.currentLevel}
                  </span>
                </div>
                <div>
                  <h1 className="text-gray-100 font-black text-sm pixel-text">
                    LEVEL {gameState.currentLevel}
                  </h1>
                  {/* Simple Progress Indicator */}
                  <div className="text-white text-xs font-bold bg-violet-600 px-3 py-1 rounded-lg">
                    CASE {gameState.currentQuestion + 1}/5
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center gap-2">
              {/* Mobile Case Brief Button */}
              {isMobileHorizontal && gameState.currentLevel === 1 && (
                <button
                  onClick={() => setShowCaseBrief(true)}
                  className="pixel-border bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 px-2 py-1 transition-all text-xs font-black text-white flex items-center gap-1 pixel-text"
                >
                  <Eye className="w-3 h-3" />
                  BRIEF
                </button>
              )}

              {/* Timer */}
              <div className="flex items-center gap-1 pixel-border bg-gradient-to-r from-red-700 to-red-600 px-2 py-1">
                <div className="w-3 h-3 bg-gray-800 pixel-border flex items-center justify-center">
                  <Clock className="w-2 h-2 text-gray-300" />
                </div>
                <Timer
                  key="game-timer"
                  timeRemaining={gameState.timeRemaining}
                  onTimeUp={handleTimeUp}
                  setTimeRemaining={handleSetTimeRemaining}
                  initialTime={5400}
                  isActive={gameState.gameStarted && !gameState.gameCompleted && !gameState.showLevelModal}
                />

                {/* Auto-save indicator */}
                {showSaveIndicator && (
                  <div className="ml-1 text-xs text-green-400 font-bold animate-pulse">
                    ●
                  </div>
                )}
              </div>

              {/* Overall Progress */}
              <div className="hidden sm:flex items-center gap-2 pixel-border bg-gradient-to-r from-gray-700 to-gray-600 px-2 py-1">
                <div className="w-3 h-3 bg-yellow-600 pixel-border flex items-center justify-center">
                  <Trophy className="w-2 h-2 text-yellow-300" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-2 bg-gray-800 pixel-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-black min-w-[2rem] pixel-text">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-1 min-h-0">
        {/* Countdown Display */}
        {gameState.showCountdown && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-8xl md:text-9xl font-black text-white pixel-text animate-pulse mb-4">
                {gameState.countdownNumber}
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-300 pixel-text">
                {gameState.isCountdownForContinue ? "GET READY TO CONTINUE!" : "GET READY TO START!"}
              </div>
            </div>
          </div>
        )}

        {/* Question Card */}
        {currentQuestion && gameState.questions.length > 0 && gameState.currentQuestion < gameState.questions.length ? (
          <QuestionCard
            question={currentQuestion}
            level={gameState.currentLevel}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            currentAnswer={gameState.answers[gameState.currentQuestion]}
            session_id={session_id}
            email={email}
          />
        ) : gameState.gameStarted && (
          <div className="flex items-center justify-center h-full">
            <div className="pixel-border bg-gradient-to-r from-red-600 to-red-700 p-6 text-center max-w-md">
              <h3 className="text-white font-black pixel-text mb-4 text-lg">GAME STATE ERROR</h3>
              <div className="text-red-100 text-sm space-y-2">
                <p>Question {gameState.currentQuestion + 1} not found.</p>
                <p>Questions available: {gameState.questions.length}</p>
                <p>Current index: {gameState.currentQuestion}</p>
                <p>Game started: {gameState.gameStarted ? "Yes" : "No"}</p>
              </div>
              <div className="flex gap-2 mt-4 justify-center">
                <button
                  onClick={() => {
                    setGameState(prev => ({
                      ...prev,
                      currentQuestion: 0,
                      gameStarted: false
                    }));
                  }}
                  className="pixel-border bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 text-xs font-bold"
                >
                  RESET TO START
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="pixel-border bg-red-500 hover:bg-red-400 text-white px-3 py-2 text-xs font-bold"
                >
                  RELOAD GAME
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level Complete Modal */}
        {(() => {
          const shouldShowModal = gameState.showLevelModal && gameState.currentLevel === 1;
          console.log("Modal render check:", {
            showLevelModal: gameState.showLevelModal,
            currentLevel: gameState.currentLevel,
            shouldShowModal
          });
          return shouldShowModal ? (
            <ModuleCompleteModal
              level1CompletionTime={gameState.level1CompletionTime}
              onProceed={proceedToLevel2}
              scenarios={gameState.questions.map((q, idx) => ({
                caseFile: q.caseFile,
                violation: gameState.answers[idx]?.violation || '',
                rootCause: gameState.answers[idx]?.rootCause || '',
                solution: gameState.answers[idx]?.solution || ''
              }))}
            />
          ) : null;
        })()}

        {/* Module 6 Button (only if unlocked) */}
        {canAccessModule6 && gameState.currentLevel === 1 && (
          <div className="flex justify-center mt-4">
            <button
              className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text text-sm"
              onClick={() =>
                setGameState((prev) => {
                  // Preserve Level 1 answers and questions
                  const newAnswers = prev.answers.map((ans) => ({
                    violation: ans.violation,
                    rootCause: ans.rootCause,
                    solution: "",
                  }));
                  return {
                    ...prev,
                    currentLevel: 2,
                    currentQuestion: 0,
                    questions:
                      prev.questions.length === 5
                        ? prev.questions
                        : selectRandomQuestions(),
                    answers:
                      prev.answers.length === 5
                        ? newAnswers
                        : selectRandomQuestions().map(() => ({
                          violation: "",
                          rootCause: "",
                          solution: "",
                        })),
                    gameStarted: true,
                    gameCompleted: false,
                    showLevelModal: false,
                    level1CompletionTime: 0,
                  };
                })
              }
            >
              START MODULE 6
            </button>
          </div>
        )}

        {/* PROBLEM SCENARIO Modal - Only visible when toggled in mobile horizontal */}
        {showCaseBrief && currentQuestion && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2"
            onClick={() => setShowCaseBrief(false)}
          >
            <div
              className="pixel-border-thick p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto relative bg-gradient-to-r from-cyan-600 to-blue-600"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
              <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-cyan-500 pixel-border flex items-center justify-center">
                      <Eye className="w-3 h-3 text-cyan-900" />
                    </div>
                    <h3 className={`font-black pixel-text text-lg transition-all duration-500 ${showCaseChangeIndicator
                      ? 'text-yellow-300 animate-pulse drop-shadow-lg shadow-yellow-400/50 scale-105'
                      : 'text-cyan-100'
                      }`}>
                      PROBLEM SCENARIO
                    </h3>
                    {showCaseChangeIndicator ? (
                      <div className="pixel-border bg-gradient-to-r from-yellow-600 to-orange-500 px-2 py-1 animate-bounce">
                        <span className="text-yellow-100 font-black text-xs pixel-text">
                          NEW CASE
                        </span>
                      </div>
                    ) : (
                      <div className="pixel-border bg-gradient-to-r from-green-600 to-green-500 px-2 py-1">
                        <span className="text-green-100 font-black text-xs pixel-text">
                          ACTIVE
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCaseBrief(false)}
                    className="pixel-border bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-red-100 hover:text-white transition-all text-lg font-black w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <div className="pixel-border bg-gradient-to-r from-gray-700 to-gray-600 p-3">
                  <div className="flex items-start space-x-2">
                    <div className={`w-2 h-2 pixel-border mt-1 flex-shrink-0 ${showCaseChangeIndicator
                      ? 'bg-yellow-400 animate-ping'
                      : 'bg-red-500 animate-pulse'
                      }`}></div>
                    <p className="text-gray-100 text-sm leading-relaxed font-bold">
                      {currentQuestion.caseFile} Read the scenario carefully, spot
                      the violation and its root cause, and place them in the
                      right category containers.
                    </p>
                  </div>
                  {showCaseChangeIndicator && (
                    <div className="mt-3 flex items-center space-x-2 pixel-border bg-gradient-to-r from-yellow-700 to-orange-700 p-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                      <span className="text-yellow-200 text-xs font-bold">
                        Case scenario has changed - review carefully!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameEngine;