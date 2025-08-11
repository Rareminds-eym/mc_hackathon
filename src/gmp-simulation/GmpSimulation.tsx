import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { Factory, Clock, Trophy, AlertTriangle, Eye } from 'lucide-react';
import { useDeviceLayout } from '../hooks/useOrientation';
import { hackathonData } from './HackathonData';
import type { Question } from './HackathonData';
// @ts-ignore
import { QuestionCard } from './QuestionCard';
import { Timer } from './Timer';
import { Results } from './Results';
import { ModuleCompleteModal } from './ModuleCompleteModal';

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

const GameEngine: React.FC<GmpSimulationProps> = ({ mode, onProceedToLevel2 }) => {
  // Device layout detection
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Case brief modal state
  const [showCaseBrief, setShowCaseBrief] = useState(false);

  // Save team attempt to backend
  const saveTeamAttempt = async (module_number: number) => {
    if (!session_id) {
      console.warn('No session_id available for team attempt.');
      return;
    }
    // Fetch all individual attempts for this session and module
    const { data: attempts, error } = await supabase
      .from('individual_attempts')
      .select('score, completion_time_sec')
      .eq('session_id', session_id)
      .eq('module_number', module_number);
    if (error) {
      console.error('Supabase fetch error (individual_attempts):', error.message, error.details);
      return;
    }
    if (!attempts || attempts.length === 0) {
      console.warn('No individual attempts found for team.');
      return;
    }
    // Calculate weighted average score and average time
    const totalScore = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const weightedAvgScore = (totalScore / attempts.length).toFixed(2);
    const avgTimeSec = Math.round(attempts.reduce((sum, a) => sum + (a.completion_time_sec || 0), 0) / attempts.length);
    // Insert into team_attempts
    const { error: insertError, data: teamData } = await supabase
      .from('team_attempts')
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
      console.error('Supabase insert error (team_attempts):', insertError.message, insertError.details);
    } else {
      console.log('Saved team attempt:', teamData);
    }
  };
  // Error state for loading team info
  const [teamInfoError, setTeamInfoError] = useState<string | null>(null);
  // Determine which level to show based on mode
  // mode === 'violation-root-cause' => Level 1 (HL1)
  // mode === 'solution' => Level 2 (HL2)
  const initialLevel = mode === 'solution' ? 2 : 1;
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
        setTeamInfoError("Could not load team info. " + (error.message || "Unknown error."));
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

  // Save individual attempt to backend
  const saveIndividualAttempt = async (score: number, completion_time_sec: number, module_number: number) => {
    const { error, data } = await supabase
      .from("individual_attempts")
      .insert([
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
      violation: '',
      rootCause: '',
      solution: ''
    }));
    
    setGameState(prev => ({
      ...prev,
      questions,
      answers: initialAnswers,
      gameStarted: true,
      // Ensure correct level is set on start
      currentLevel: initialLevel,
    }));
  };

  const handleAnswer = (answer: { violation?: string; rootCause?: string; solution?: string }) => {
    setGameState(prev => {
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
          await supabase.from('attempt_details').upsert([
            {
              email: email,
              session_id: session_id,
              module_number: prev.currentLevel === 1 ? 5 : 6,
              question_index: prev.currentQuestion,
              question: prev.questions[prev.currentQuestion],
              answer: newAnswers[prev.currentQuestion],
            }
          ], { onConflict: 'email,session_id,module_number,question_index' });
        } catch (err) {
          console.error('Auto-save error:', err);
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
    setGameState(prev => {
      const nextQuestionIndex = prev.currentQuestion + 1;
      if (nextQuestionIndex >= 5) {
        if (prev.currentLevel === 1) {
          // Level 1 completed - show modal
          const level1Time = Math.max(0, 5400 - prev.timeRemaining);
          // Save attempt to backend
          saveIndividualAttempt(calculateScore(prev.answers, prev.questions), level1Time, 5);
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
          newAnswers[nextQuestionIndex] = { violation: '', rootCause: '', solution: '' };
        } else {
          newAnswers[nextQuestionIndex].violation = '';
          newAnswers[nextQuestionIndex].rootCause = '';
          newAnswers[nextQuestionIndex].solution = '';
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
    if (mode === 'solution') {
      // Do nothing, stay in Level 2
      return;
    }
    // If mode is 'violation-root-cause', trigger navigation to HL2 via parent
    if (onProceedToLevel2) onProceedToLevel2();
  };

  const calculateScore = (answers: Array<{violation: string; rootCause: string; solution: string}>, questions: Question[]) => {
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
    setGameState(prev => ({
      ...prev,
      gameCompleted: true,
      score: finalScore,
      timeRemaining: 0,
    }));
  };

  // Reset game state when mode changes (e.g., after navigation to HL2)
  React.useEffect(() => {
    console.log('[HL2 Debug] mode:', mode, 'currentLevel:', gameState.currentLevel);
    if (mode === 'solution') {
      // Preserve Level 1 answers for summary in Level 2
      setGameState(prev => {
        // If already in Level 2, do nothing
        if (prev.currentLevel === 2) return prev;
        // Use previous questions and answers, only reset solution field
        const newAnswers = prev.answers.map(ans => ({
          violation: ans.violation,
          rootCause: ans.rootCause,
          solution: '' // clear solution for Level 2
        }));
        return {
          ...prev,
          currentLevel: 2,
          currentQuestion: 0,
          // Keep previous questions and answers
          questions: prev.questions.length === 5 ? prev.questions : selectRandomQuestions(),
          answers: prev.answers.length === 5 ? newAnswers : selectRandomQuestions().map(() => ({ violation: '', rootCause: '', solution: '' })),
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Loading Team Info...</h2>
            {teamInfoError ? (
              <>
                <p className="text-red-600 mb-6">{teamInfoError}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg" onClick={() => { setTeamInfoError(null); window.location.reload(); }}>Retry</button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
                  Please wait while we load your team session.
                </p>
                <div className="animate-pulse text-blue-600">Loading...</div>
              </>
            )}
          </div>
        </div>
      );
    }
    if (initialLevel === 1) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-2 lg:p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-2xl w-full text-center">
            <div className="flex justify-center mb-6">
              <Factory className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600" />
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4">
              GMP Simulation Game
            </h1>
            <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
              Test your knowledge of Good Manufacturing Practices through interactive case studies
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm lg:text-base">60 Minutes</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Complete all questions</p>
              </div>
              <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
                <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm lg:text-base">2 Levels</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Analysis & Solution</p>
              </div>
              <div className="bg-orange-50 p-3 lg:p-4 rounded-lg">
                <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm lg:text-base">5 Cases</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Random GMP scenarios</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 lg:px-8 rounded-lg transition-colors duration-200 text-sm lg:text-base"
            >
              Start Simulation
            </button>
          </div>
        </div>
      );
    } else {
      // Level 2 only UI (HL2)
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-2 lg:p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-2xl w-full text-center">
            <div className="flex justify-center mb-6">
              <Trophy className="w-12 h-12 lg:w-16 lg:h-16 text-green-600" />
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4">
              GMP Solution Round
            </h1>
            <p className="text-gray-600 mb-6 lg:mb-8 text-sm lg:text-base">
              Select the best solutions for each GMP case scenario
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
                <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm lg:text-base">60 Minutes</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Complete all solutions</p>
              </div>
              <div className="bg-orange-50 p-3 lg:p-4 rounded-lg">
                <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 text-sm lg:text-base">5 Cases</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Random GMP scenarios</p>
              </div>
            </div>
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 lg:px-8 rounded-lg transition-colors duration-200 text-sm lg:text-base"
            >
              Start Solution Round
            </button>
          </div>
        </div>
      );
    }
  }

  if (gameState.gameCompleted) {
    // After Module 5, show waiting screen if not unlocked
    if (gameState.currentLevel === 1 && !canAccessModule6) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Awaiting Team Evaluation</h2>
            <p className="text-gray-600 mb-6">Your team’s results are being evaluated. Please wait for Module 6 to unlock.</p>
            <div className="animate-pulse text-blue-600">Checking team status...</div>
          </div>
        </div>
      );
    }
    // If unlocked or Module 6, show results
    return (
      <Results
        gameState={gameState}
        canAccessModule6={canAccessModule6}
      />
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestion];
  const progress = ((gameState.currentQuestion + 1) / 5) * 100;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-cyan-500/5 to-blue-600/5 animate-pulse"></div>
        </div>
      </div>

      {/* Modern Gaming Header */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900/20 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        </div>

        <div className="relative backdrop-blur-sm border-b border-cyan-500/30 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">

              {/* Left Section - Mission Identity */}
              <div className="flex items-center gap-6">
                {/* Mission Badge */}
                <div className="relative group">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25 transform transition-all duration-300 group-hover:scale-105">
                    <Factory className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-black text-black">{gameState.currentLevel}</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-cyan-400/50 rounded-full blur-sm"></div>
                </div>

                {/* Mission Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-200 tracking-wider">
                      {gameState.currentLevel === 1 ? 'INVESTIGATION MODE' : 'SOLUTION DEPLOYMENT'}
                    </h1>
                    <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30">
                      <span className="text-cyan-300 text-sm font-bold">LEVEL {gameState.currentLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-cyan-200 text-sm font-semibold">
                        CASE {gameState.currentQuestion + 1} OF 5
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gradient-to-b from-transparent via-slate-500 to-transparent"></div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 text-sm font-bold">ACTIVE MISSION</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Control Panel */}
              <div className="flex items-center gap-3">
                {/* Case Brief Button - Mobile Horizontal Only */}
                {isMobileHorizontal && gameState.currentLevel === 1 && (
                  <button
                    onClick={() => setShowCaseBrief(true)}
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="relative flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-bold">CASE BRIEF</span>
                    </div>
                  </button>
                )}

                {/* Timer Module */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-3 border border-slate-600/50 shadow-xl backdrop-blur-sm">
                  <Timer
                    timeRemaining={gameState.timeRemaining}
                    onTimeUp={handleTimeUp}
                    setTimeRemaining={(time) => setGameState(prev => ({ ...prev, timeRemaining: time }))}
                    initialTime={5400}
                  />
                </div>

                {/* Progress Module */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-3 border border-slate-600/50 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <span className="text-cyan-400 text-xs font-bold mb-1">PROGRESS</span>
                      <div className="w-24 h-2.5 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-700 shadow-lg"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-cyan-400 text-lg font-black">{Math.round(progress)}%</div>
                      <div className="text-slate-400 text-xs">COMPLETE</div>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2.5 rounded-xl border border-green-400/30 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-green-300 font-black text-sm tracking-wide">ONLINE</span>
                    </div>
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-green-400/30 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-2 min-h-0">

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
        {gameState.showLevelModal && mode === 'violation-root-cause' && (
          <ModuleCompleteModal
            level1CompletionTime={gameState.level1CompletionTime}
            onProceed={proceedToLevel2}
          />
        )}

        {/* Module 6 Button (only if unlocked) */}
        {canAccessModule6 && gameState.currentLevel === 1 && (
          <div className="flex justify-center mt-8">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
              onClick={() => setGameState(prev => {
                // Preserve Level 1 answers and questions
                const newAnswers = prev.answers.map(ans => ({
                  violation: ans.violation,
                  rootCause: ans.rootCause,
                  solution: ''
                }));
                return {
                  ...prev,
                  currentLevel: 2,
                  currentQuestion: 0,
                  questions: prev.questions.length === 5 ? prev.questions : selectRandomQuestions(),
                  answers: prev.answers.length === 5 ? newAnswers : selectRandomQuestions().map(() => ({ violation: '', rootCause: '', solution: '' })),
                  gameStarted: true,
                  gameCompleted: false,
                  showLevelModal: false,
                  level1CompletionTime: 0,
                };
              })}
            >
              Start Module 6
            </button>
          </div>
        )}

        {/* Case Brief Modal - Only visible when toggled in mobile horizontal */}
        {showCaseBrief && currentQuestion && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCaseBrief(false)}
          >
            <div
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-cyan-500/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">CASE BRIEF</h3>
                  <div className="bg-cyan-500/20 px-3 py-1 rounded-full">
                    <span className="text-cyan-300 font-bold text-sm">ACTIVE</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCaseBrief(false)}
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg border border-cyan-500/20">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse flex-shrink-0"></div>
                  <p className="text-gray-200 text-sm leading-relaxed">{currentQuestion.caseFile}</p>
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