import { supabase } from "../lib/supabase";
import React, { useState, useEffect } from "react";
import { Factory, Clock, Trophy, AlertTriangle, Eye, Play } from "lucide-react";
import { useDeviceLayout } from "../hooks/useOrientation";
import { hackathonData } from "./HackathonData";
import type { Question } from "./HackathonData";
// @ts-ignore
import { QuestionCard } from "./QuestionCard";
import { Timer } from "./Timer";
import { Results } from "./Results";
import { ModuleCompleteModal } from "./ModuleCompleteModal";

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
}

interface GmpSimulationProps {
  mode?: string;
  onProceedToLevel2?: () => void;
}

const GameEngine: React.FC<GmpSimulationProps> = ({
  mode,
  onProceedToLevel2,
}) => {
  // Device layout detection
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Case brief modal state
  const [showCaseBrief, setShowCaseBrief] = useState(false);
  
  // Walkthrough video handler
  const showWalkthroughVideo = () => {
    // You can replace this URL with the actual walkthrough video URL
    const videoUrl = "https://www.youtube.com/watch?v=your-walkthrough-video-id";
    window.open(videoUrl, '_blank');
  };

  // Save team attempt to backend
  const saveTeamAttempt = async (module_number: number) => {
    if (!session_id) {
      console.warn("No session_id available for team attempt.");
      return;
    }
    // Fetch all individual attempts for this session and module
    const { data: attempts, error } = await supabase
      .from("individual_attempts")
      .select("score, completion_time_sec")
      .eq("session_id", session_id)
      .eq("module_number", module_number);
    if (error) {
      console.error(
        "Supabase fetch error (individual_attempts):",
        error.message,
        error.details
      );
      return;
    }
    if (!attempts || attempts.length === 0) {
      console.warn("No individual attempts found for team.");
      return;
    }
    // Calculate weighted average score and average time
    const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const weightedAvgScore = (totalScore / attempts.length).toFixed(2);
    const avgTimeSec = Math.round(
      attempts.reduce((sum, a) => sum + (a.completion_time_sec || 0), 0) /
        attempts.length
    );
    // Insert into team_attempts
    const { error: insertError, data: teamData } = await supabase
      .from("team_attempts")
      .insert([
        {
          session_id: session_id,
          module_number,
          weighted_avg_score: weightedAvgScore,
          avg_time_sec: avgTimeSec,
          unlocked_next_module: false,
        },
      ]);
    if (insertError) {
      console.error(
        "Supabase insert error (team_attempts):",
        insertError.message,
        insertError.details
      );
    } else {
      console.log("Saved team attempt:", teamData);
    }
  };
  // Error state for loading team info
  const [teamInfoError, setTeamInfoError] = useState<string | null>(null);
  // Determine which level to show based on mode
  // mode === 'violation-root-cause' => Level 1 (HL1)
  // mode === 'solution' => Level 2 (HL2)
  const initialLevel = mode === "solution" ? 2 : 1;
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: initialLevel,
    currentQuestion: 0,
    questions: [],
    answers: [],
    score: 0,
    timeRemaining: 5400, // 1.5 hours in seconds
    gameStarted: false,
    gameCompleted: false,
    showLevelModal: false,
    level1CompletionTime: 0,
  });
  // Team unlock state
  const [canAccessModule6, setCanAccessModule6] = useState(false);
  // Session/user info (fetch from teams table for current user)
  const [session_id, setSessionId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  // Block UI until session_id and email are loaded
  const loadingIds = !session_id || !email;

  // Example: get current user's id from auth (replace with your auth logic)
  useEffect(() => {
    const fetchTeamInfo = async () => {
      // Get current user's email from Supabase Auth
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      if (authError || !session || !session.user || !session.user.email) {
        setTeamInfoError("User email not found. Please log in.");
        return;
      }
      const userEmail = session.user.email;
      // Fetch session_id from teams table using email
      const { data, error } = await supabase
        .from("teams")
        .select("session_id")
        .eq("email", userEmail)
        .single();
      if (error) {
        setTeamInfoError(
          "Could not load team info. " + (error.message || "Unknown error.")
        );
      } else if (!data) {
        setTeamInfoError("No team info found for this user.");
      } else {
        setSessionId(data.session_id);
        setEmail(userEmail);
      }
    };
    fetchTeamInfo();
  }, []);

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

  // Auto-show case brief for Level 1 in mobile horizontal mode when game starts
  useEffect(() => {
    if (gameState.gameStarted && gameState.currentLevel === 1 && isMobileHorizontal) {
      setTimeout(() => setShowCaseBrief(true), 100);
    }
  }, [gameState.gameStarted, gameState.currentLevel, isMobileHorizontal]);

  // Save individual attempt to backend
  const saveIndividualAttempt = async (
    score: number,
    completion_time_sec: number,
    module_number: number
  ) => {
    const { error, data } = await supabase.from("individual_attempts").insert([
      {
        email: email,
        session_id: session_id,
        module_number,
        score,
        completion_time_sec,
      },
    ]);
    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      alert("Error saving attempt: " + error.message);
    } else {
      console.log("Saved attempt:", data);
    }
  };

  // Select 5 random questions for the user
  const selectRandomQuestions = () => {
    const shuffled = [...hackathonData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  };

  const startGame = () => {
    const questions = selectRandomQuestions();
    const initialAnswers = questions.map(() => ({
      violation: "",
      rootCause: "",
      solution: "",
    }));

    setGameState((prev) => ({
      ...prev,
      questions,
      answers: initialAnswers,
      gameStarted: true,
      // Ensure correct level is set on start
      currentLevel: initialLevel,
    }));
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
          await supabase.from("attempt_details").upsert(
            [
              {
                email: email,
                session_id: session_id,
                module_number: prev.currentLevel === 1 ? 5 : 6,
                question_index: prev.currentQuestion,
                question: prev.questions[prev.currentQuestion],
                answer: newAnswers[prev.currentQuestion],
              },
            ],
            { onConflict: "email,session_id,module_number,question_index" }
          );
        } catch (err) {
          console.error("Auto-save error:", err);
        }
      };
      saveAttemptDetails();

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  };

  const nextQuestion = () => {
    setGameState((prev) => {
      const nextQuestionIndex = prev.currentQuestion + 1;
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
          saveTeamAttempt(5); // Save team summary for module 5
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
          saveTeamAttempt(6); // Save team summary for module 6
          return {
            ...prev,
            gameCompleted: true,
            score: finalScore,
          };
        }
      } else {
        // Always initialize the next answer object to clear drag-and-drop
        const newAnswers = [...prev.answers];
        if (!newAnswers[nextQuestionIndex]) {
          newAnswers[nextQuestionIndex] = {
            violation: "",
            rootCause: "",
            solution: "",
          };
        } else {
          newAnswers[nextQuestionIndex].violation = "";
          newAnswers[nextQuestionIndex].rootCause = "";
          newAnswers[nextQuestionIndex].solution = "";
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

  const handleTimeUp = () => {
    const finalScore = calculateScore(gameState.answers, gameState.questions);
    setGameState((prev) => ({
      ...prev,
      gameCompleted: true,
      score: finalScore,
      timeRemaining: 0,
    }));
  };

  // Reset game state when mode changes (e.g., after navigation to HL2)
  React.useEffect(() => {
    console.log(
      "[HL2 Debug] mode:",
      mode,
      "currentLevel:",
      gameState.currentLevel
    );
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
  if (!gameState.gameStarted) {
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
                <button
                  className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-1 px-3 pixel-text transition-all text-sm"
                  onClick={() => {
                    setTeamInfoError(null);
                    window.location.reload();
                  }}
                >
                  RETRY
                </button>
              </>
            ) : (
              <>
                <p className="text-cyan-100 mb-4 text-sm font-bold">
                  Please wait while we load your team session.
                </p>
                <div className="animate-pulse text-cyan-300 font-black pixel-text text-sm">LOADING...</div>
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
              GOOD MANUFACTURING PRACTICES
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
                  60 MINUTES
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
                  Random GMP scenarios
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={startGame}
                className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm"
              >
                START SIMULATION
              </button>
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
                  60 MINUTES
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
              <button
                onClick={startGame}
                className="pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black py-2 px-4 pixel-text transition-all transform hover:scale-105 text-sm"
              >
                START SOLUTION ROUND
              </button>
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
                  <div className="text-gray-300 text-xs font-bold">
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
              <div className="flex items-center gap-1 pixel-border bg-gradient-to-r from-gray-700 to-gray-600 px-2 py-1">
                <div className="w-3 h-3 bg-gray-800 pixel-border flex items-center justify-center">
                  <Clock className="w-2 h-2 text-gray-300" />
                </div>
                <Timer
                  timeRemaining={gameState.timeRemaining}
                  onTimeUp={handleTimeUp}
                  setTimeRemaining={(time) =>
                    setGameState((prev) => ({ ...prev, timeRemaining: time }))
                  }
                  initialTime={5400}
                />
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
        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            level={gameState.currentLevel}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            currentAnswer={gameState.answers[gameState.currentQuestion]}
            session_id={session_id}
            email={email}
          />
        )}

        {/* Level Complete Modal */}
        {gameState.showLevelModal && mode === "violation-root-cause" && (
          <ModuleCompleteModal
            level1CompletionTime={gameState.level1CompletionTime}
            onProceed={proceedToLevel2}
          />
        )}

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
              className="pixel-border-thick bg-gradient-to-r from-cyan-600 to-blue-600 p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
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
                    <h3 className="text-base font-black text-cyan-100 pixel-text">
                      PROBLEM SCENARIO
                    </h3>
                    <div className="pixel-border bg-gradient-to-r from-green-600 to-green-500 px-2 py-1">
                      <span className="text-green-100 font-black text-xs pixel-text">
                        ACTIVE
                      </span>
                    </div>
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
                    <div className="w-2 h-2 bg-red-500 pixel-border mt-1 animate-pulse flex-shrink-0"></div>
                    <p className="text-gray-100 text-sm leading-relaxed font-bold">
                      {currentQuestion.caseFile} Read the scenario carefully, spot
                      the violation and its root cause, and place them in the
                      right category containers.
                    </p>
                  </div>
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