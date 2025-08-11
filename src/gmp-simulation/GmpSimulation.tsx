import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { Factory, Clock, Trophy, AlertTriangle } from 'lucide-react';
import { hackathonData } from './HackathonData';
import type { Question } from './HackathonData';
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
        const { data, error } = await supabase
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

  const resetGame = () => {
    setGameState({
      currentLevel: 1,
      currentQuestion: 0,
      questions: [],
      answers: [],
      score: 0,
      timeRemaining: 5400,
      gameStarted: false,
      gameCompleted: false,
      showLevelModal: false,
      level1CompletionTime: 0,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
      <div className="container mx-auto px-2 lg:px-4 py-2 lg:py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-3 lg:p-4 mb-3 lg:mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
            <div className="flex items-center gap-2 lg:gap-3">
              <Factory className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
              <div>
                <h1 className="text-base lg:text-xl font-bold text-gray-800">
                  Level {gameState.currentLevel} - {gameState.currentLevel === 1 ? 'Analysis' : 'Solution'}
                </h1>
                <p className="text-xs lg:text-sm text-gray-600">
                  Question {gameState.currentQuestion + 1} of 5
                </p>
              </div>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-4">
              <Timer
                timeRemaining={gameState.timeRemaining}
                onTimeUp={handleTimeUp}
                setTimeRemaining={(time) => setGameState(prev => ({ ...prev, timeRemaining: time }))}
                initialTime={5400}
              />
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 lg:mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default GameEngine;