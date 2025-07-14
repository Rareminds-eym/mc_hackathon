import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameState } from './types';
import { cases } from './data/cases';
import { Product2D } from './Product2D';
import { QuestionPanel } from './QuestionPanel';
import { DragDropZone } from './DragDropZone';
import { FeedbackPanel } from './FeedbackPanel';
import { GameHeader } from './GameHeader';
import BoyBook from './boybook';
import Animation_manufacture from './animated_manufacture'
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { 
  ChevronRight, 
  AlertTriangle, 
  ChevronLeft, 
  TrendingUp, 
  Target,
  Brain
} from 'lucide-react';
import CharacterRotator from './CharacterRotator';
import Characterboybook from './Characterboybook';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { FeedbackPopup } from './Popup';
import HighScoreAlert from './HighScoreAlert';

type GamePhase = 'login' | 'reportView' | 'step1' | 'step2' | 'step3' | 'feedback';

export const GameBoard2D: React.FC = () => {
  const navigate = useNavigate();

  // All state hooks need to be at the top level of the component
  const [gameState, setGameState] = useState<GameState>({
    currentCase: 0,
    answers: {
      violation: null,
      rootCause: null,
      impact: null
    },
    score: 0,
    totalQuestions: 0,
    showFeedback: false,
    gameComplete: false
  });

  // Track all component state at the top level
  const [isHighScore, setIsHighScore] = useState(false); // Use original name for consistency
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('login');
  const [canContinue, setCanContinue] = useState(true); // Login phase always allows continue
  const [timer, setTimer] = useState<number>(0); // Start from 0
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [scoredQuestions, setScoredQuestions] = useState<Record<number, Set<'violation' | 'rootCause' | 'impact'>>>({});
  const [popupOpen, setPopupOpen] = useState(false);
  const [showHighScorePopup, setShowHighScorePopup] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  // allAnswersCorrectAtFeedback will be declared later
  
  // All refs need to be at the top level too
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track last synced state to prevent duplicate syncs
  const lastSyncedRef = useRef({
    score: -1,
    violation: null as number | null,
    rootCause: null as number | null,
    impact: null as number | null,
    showFeedback: false
  });

  // Derived state
  const currentCase = cases[gameState.currentCase];
  
  // Add Supabase integration
  const { syncGameState, completeGame, checkHighScore } = useSupabaseSync();

  // Save game state to localStorage for Supabase integration
  useEffect(() => {
    // Save the game state
    localStorage.setItem('level4_gameState', JSON.stringify({
      ...gameState,
      correctAnswers: getCorrectAnswers() // Add correct answers count for the wrapper
    }));
    
    // Trigger storage event for our wrapper
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'level4_gameState',
      newValue: localStorage.getItem('level4_gameState')
    }));
  }, [gameState]);
  
  // Save timer to localStorage
  useEffect(() => {
    localStorage.setItem('level4_timer', timer.toString());
  }, [timer]);

  // Improved sync game state with Supabase only on meaningful changes
  useEffect(() => {
    // Sync on significant state changes only, not on every render
    const shouldSync = 
      // We have at least one answer
      (gameState.answers.violation !== null || 
       gameState.answers.rootCause !== null || 
       gameState.answers.impact !== null) &&
      // And we've actually made progress (not just initial state)
      (gameState.score > 0 || gameState.totalQuestions > 0 || gameState.showFeedback) &&
      // And something has changed since last sync
      (gameState.score !== lastSyncedRef.current.score || 
       gameState.answers.violation !== lastSyncedRef.current.violation ||
       gameState.answers.rootCause !== lastSyncedRef.current.rootCause ||
       gameState.answers.impact !== lastSyncedRef.current.impact ||
       gameState.showFeedback !== lastSyncedRef.current.showFeedback);
      
    if (shouldSync) {
      // Add a longer delay to batch rapid changes - this helps prevent duplicate records
      const syncTimeout = setTimeout(() => {
        console.log(`[GameBoard] Syncing state: score=${gameState.score}, answers=${Object.values(gameState.answers).filter(Boolean).length}/3`);
        syncGameState(gameState, timer);
        
        // Update last synced state
        lastSyncedRef.current = {
          score: gameState.score,
          violation: gameState.answers.violation,
          rootCause: gameState.answers.rootCause,
          impact: gameState.answers.impact,
          showFeedback: gameState.showFeedback
        };
      }, 500);
      return () => clearTimeout(syncTimeout);
    }
  }, [gameState.answers, gameState.score, gameState.showFeedback, gameState.totalQuestions, timer, syncGameState]);
  
  // Handle game completion separately
  useEffect(() => {
    // Only trigger on actual completion state change
    if (gameState.gameComplete) {
      completeGame(gameState, timer);
    }
  }, [gameState.gameComplete, gameState, timer, completeGame]);

  // Force animation refresh when phase changes
  useEffect(() => {
    if (['reportView', 'step1', 'step2', 'step3'].includes(currentPhase)) {
      setAnimationKey(prev => prev + 1);
    }
  }, [currentPhase]);

  // Start timer when entering investigation phases
  useEffect(() => {
    if (["reportView", "step1", "step2", "step3"].includes(currentPhase) && !timerActive) {
      setTimerActive(true);
    }
    // Stop timer when leaving investigation phases
    if (!["reportView", "step1", "step2", "step3"].includes(currentPhase)) {
      setTimerActive(false);
    }
  }, [currentPhase]);

  // Timer count up effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setTimeout(() => setTimer(timer + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timer]);

  // Reset timer only if game is fully restarted (login, first case, and score is 0)
  useEffect(() => {
    if (currentPhase === 'login' && gameState.currentCase === 0 && gameState.score === 0) {
      setTimer(0);
    }
  }, [currentPhase, gameState.currentCase, gameState.score]);

  const handleAnswerSelect = (questionType: 'violation' | 'rootCause' | 'impact', answer: number) => {
    setGameState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionType]: answer,
        // Add a dummy value to force state update if needed
        _lastSelected: Math.random()
      }
    }));
    setCanContinue(true); // Always enable continue, even if already selected
  };

  const handleContinue = async () => {
    // Show loading only when transitioning between major phases
    if (currentPhase === 'login' || currentPhase === 'feedback') {
      // Remove loading logic
    }
    
    switch (currentPhase) {
      case 'login':
        setCurrentPhase('reportView');
        setCanContinue(true);
        // Log when starting a new case
        console.log(`[Game] Starting case ${gameState.currentCase + 1} with accumulated score ${gameState.score}`);
        // Hide loading after a short delay to show the transition
        setTimeout(() => setLoading(false), 800);
        break;
      case 'reportView':
        setCurrentPhase('step1');
        setCanContinue(false);
        break;
      case 'step1':
        if (gameState.answers.violation !== null) {
          setCurrentPhase('step2');
          setCanContinue(gameState.answers.rootCause !== null);
        }
        break;
      case 'step2':
        if (gameState.answers.rootCause !== null) {
          setCurrentPhase('step3');
          setCanContinue(gameState.answers.impact !== null);
        }
        break;
      case 'step3':
        if (gameState.answers.impact !== null) {
          // Ensure state is updated before switching to feedback
          // IMPROVED: Use requestAnimationFrame for better timing
          requestAnimationFrame(() => {
            setCurrentPhase('feedback');
            calculateResults();
          });
        }
        break;
      case 'feedback':
        const correctAnswers = getCorrectAnswers();
        if (correctAnswers === 3) {
          // Only continue if all answers are correct
          if (gameState.currentCase < cases.length - 1) {
            // Move to next case - maintain the accumulated score
            // Important: We do NOT reset the score here as we want to keep accumulating it across cases
            const nextGameState = {
              ...gameState,
              currentCase: gameState.currentCase + 1,
              answers: { violation: null, rootCause: null, impact: null },
              showFeedback: false,
              // score is maintained from previous case
              // totalQuestions is maintained from previous case
            };
            
            // Log transition to next case with accumulated score
            console.log(`[Game] Moving to case ${nextGameState.currentCase + 1} with accumulated score ${nextGameState.score}`);
            
            // IMPROVED: First sync the state transition to Supabase, keeping the accumulated score
            // Then update the UI state to prevent race conditions
            await syncGameState(nextGameState, timer);
            
            // Now update the UI state
            setGameState(nextGameState);
            setCurrentPhase('login');
            setCanContinue(true);
          } else {
            // Game complete - mark as complete but keep the accumulated total score
            const completedGameState = { ...gameState, gameComplete: true };
            
            // Log final combined score
            console.log(`[Game] Game complete with final COMBINED score: ${completedGameState.score}`);
            
            // IMPROVED: First check if this is a high score
            const isNewHighScore = await checkHighScore(gameState.score);
            
            // IMPROVED: First complete the game in Supabase with the accumulated total score
            // This ensures the data is saved before we update the UI
            await completeGame(completedGameState, timer);
            
            // Now update the UI state
            setGameState(completedGameState);
            setIsHighScore(isNewHighScore);
            
            // If it's a high score, show a popup
            if (isNewHighScore) {
              setShowHighScorePopup(true);
              setTimeout(() => {
                setShowHighScorePopup(false);
              }, 5000); // Auto-hide after 5 seconds
            }
          }
        } else {
          // Allow retry: reset answers but keep accumulated score
          const resetGameState = {
            ...gameState,
            answers: { violation: null, rootCause: null, impact: null },
            showFeedback: false
            // score is maintained
            // totalQuestions is maintained
          };
          setGameState(resetGameState);
          setCurrentPhase('step1');
          setCanContinue(true);
          
          // Sync the retry to Supabase with current score
          syncGameState(resetGameState, timer);
        }
        break;
    }
    // Remove loading logic
  };

  const handleBack = () => {
    switch (currentPhase) {
      case 'login':
        // Dynamic module navigation based on current case (SPA routing)
        navigate(`/modules/${gameState.currentCase + 1}`);
        break;
      case 'reportView':
        setCurrentPhase('login');
        setCanContinue(true);
        break;
      case 'step1':
        setCurrentPhase('reportView');
        setCanContinue(true);
        break;
      case 'step2':
        setCurrentPhase('step1');
        setCanContinue(gameState.answers.violation !== null);
        break;
      case 'step3':
        setCurrentPhase('step2');
        setCanContinue(gameState.answers.rootCause !== null);
        break;
      case 'feedback':
        setCurrentPhase('step3');
        setCanContinue(gameState.answers.impact !== null);
        break;
    }
  };

  const [allAnswersCorrectAtFeedback, setAllAnswersCorrectAtFeedback] = useState(false);

  const calculateResults = () => {
    const caseIdx = gameState.currentCase;
    const currentScored = scoredQuestions[caseIdx] || new Set<'violation' | 'rootCause' | 'impact'>();
    let newScore = 0;
    let newQuestions = 0;
    const newScored = new Set(currentScored);
    
    // Prepare question list with correct types
    const questionList: Array<['violation' | 'rootCause' | 'impact', number | null, number]> = [
      ['violation', gameState.answers.violation, currentCase.questions.violation.correct],
      ['rootCause', gameState.answers.rootCause, currentCase.questions.rootCause.correct],
      ['impact', gameState.answers.impact, currentCase.questions.impact.correct],
    ];
    
    questionList.forEach(([type, userAns, correctAns]) => {
      if (!currentScored.has(type) && userAns !== null) {
        newQuestions++;
        if (userAns === correctAns) {
          newScore += 5;
        }
        newScored.add(type);
      }
    });
    
    // Check if all answers are correct at feedback time
    const allCorrect =
      gameState.answers.violation === currentCase.questions.violation.correct &&
      gameState.answers.rootCause === currentCase.questions.rootCause.correct &&
      gameState.answers.impact === currentCase.questions.impact.correct;
    
    setAllAnswersCorrectAtFeedback(allCorrect);
    
    // ENHANCED LOGGING: Clearly show the accumulated score calculation
    console.log(`[Game] Calculating results for case ${caseIdx + 1}:`);
    console.log(`[Game] - Previous accumulated score: ${gameState.score}`);
    console.log(`[Game] - New points from this case: +${newScore}`);
    console.log(`[Game] - New accumulated total: ${gameState.score + newScore}`);
    
    // Update the game state with new scores - this updates the ACCUMULATED total
    const updatedGameState = {
      ...gameState,
      score: gameState.score + newScore, // Add to the accumulated score
      totalQuestions: gameState.totalQuestions + newQuestions,
      showFeedback: true
    };
    
    // Update local state
    setGameState(updatedGameState);
    setScoredQuestions(prev => ({ ...prev, [caseIdx]: newScored }));
    
    // We don't need to force an immediate sync here
    // The useEffect hook will detect the state change and sync automatically
    // This prevents possible duplicate sync operations
    
    // Log for debugging
    console.log(`[Game] Calculated results: +${newScore} points, ${newQuestions} new questions scored, all correct: ${allCorrect}`);
    console.log(`[Game] ACCUMULATED TOTAL SCORE NOW: ${updatedGameState.score}`);
  };

  const getCorrectAnswers = () => {
    let correct = 0;
    if (gameState.answers.violation !== null && gameState.answers.violation === currentCase.questions.violation.correct) correct++;
    if (gameState.answers.rootCause !== null && gameState.answers.rootCause === currentCase.questions.rootCause.correct) correct++;
    if (gameState.answers.impact !== null && gameState.answers.impact === currentCase.questions.impact.correct) correct++;
    return correct;
  };

  // Debug: Show current answers and correct answers in feedback for troubleshooting
  const renderCharacter = () => (
    <div className="flex flex-col items-center ">
      <div className="w-full h-full flex items-center justify-center">
        {/* <img 
          src="/rendering-cartoon-fantasy-scene-illustration.png" 
          alt="Alert" 
          className="landscape:w-48 landscape:h-48 landscape:max-w-[192px] landscape:max-h-[192px] landscape:object-contain object-contain" 
          style={{ maxWidth: '100%', height: 'auto' }}
        /> */}
        <Animation_manufacture />
      </div>
    </div>
  );// Phase 1: Login/Deviation Report
  const renderLogin = () => (
    <div className="fixed inset-0 h-screen w-screen p-0 m-0 flex flex-col text-xs md:text-sm lg:text-base z-50 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Neon Animated SVG Background - only one layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-25">
        <Animation_manufacture />
      </div>
      {/* Case label top left on login page */}
      <div className="absolute top-4 left-4 rounded-lg px-2 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:top-4 sm:left-4 sm:text-lg sm:px-4 sm:py-2 flex flex-col items-start bg-black/30 backdrop-blur-md border border-cyan-400/30">
        <span className="text-cyan-300 font-bold text-xs md:text-base mb-1">Case-{gameState.currentCase + 1}</span>
      </div>
      {/* Main content with gradient overlay */}
      <div className="relative z-10 h-full w-full flex flex-col text-xs md:text-sm lg:text-base">
        {/* Header */}
        <div className="flex flex-col items-center justify-center w-full z-10 landscape:relative landscape:z-20 landscape:bg-transparent landscape:pt-2 ">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-red-600  ">DEVIATION REPORT</h1>
          <p className=" text-cyan-400 text-[10px] lg:text-2xl font-semibold landscape:mb-1 lg:mb-2 glow-cyan-2">
            Quality deviation detected - Investigation required
          </p>
        </div>

        {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
        <div className="pt-2 items-center justify-center flex-1 w-full h-full lg:flex lg:items-center lg:justify-center">
          <div
            className="rounded-2xl shadow-xl bg-black/40 lg:p-12 xl:p-16 h-auto pt-4 pb-4 flex flex-col justify-center mx-auto items-center border-2 border-cyan-100 relative w-[96vw] sm:w-[90vw] md:w-[80vw] lg:w-auto max-w-md lg:max-w-2xl xl:max-w-3xl lg:min-h-[420px] xl:min-h-[520px] py-4 max-h-[calc(100vh-120px)] mb-4"
            style={{
              backgroundImage: `url('/exam-pad-bg.png')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              minHeight: '160px',
            }}
          >
            <div className=" flex flex-col items-center justify-center gap-1 mt-2 lg:overflow-visible w-auto h-auto max-w-full max-h-full">
              <h2 className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold text-cyan-400 text-center whitespace-pre-line mb-2 lg:mb-4 xl:mb-6 px-0 animate-typing overflow-hidden border-r-2 border-cyan-400">Product Under Investigation</h2>
              <div className="w-full h-full flex flex-col items-center justify-center lg:overflow-visible">
                <Product2D
                  productName={currentCase.productName}
                  batchNumber={currentCase.batchNumber}
                  hasDeviation={true}
                  imageSrc={currentCase.imageSrc}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Navigation - always visible in mobile landscape */}
        <div className="flex flex-row items-center justify-between w-full px-2 pb-1 pt-1 sm:px-4  sm:pt-2 fixed bottom-0 left-0 z-50 shadow-lg">
          <button
            onClick={handleBack}
            className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg  flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300 mb-2 sm:mb-0"
          >
            <ChevronLeft className="w-4 h-4 md:w-[0.7vw] md:h-[0.7vw] min-w-3 min-h-3 mr-1" />
            <span>Back</span>
          </button>
          <div className="flex w-auto justify-end">
            <button
              onClick={handleContinue}
              className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300"
            >
              <span>Start Investigation</span>
              <ChevronRight className="w-5 h-5 md:w-[1vw] md:h-[1vw] lg:w-8 lg:h-8 min-w-4 min-h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      {/* Custom CSS for floating shapes and neon theme */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.6s ease-out forwards;
        }
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
        @keyframes slide-in-option {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in-option {
          animation: slide-in-option 0.5s ease-out forwards;
        }
        @keyframes pulse-text {
          0%, 100% {
            color: rgba(255, 255, 255, 0.8);
            text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            color: rgba(59, 130, 246, 0.9);
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
          }
        }
        .animate-pulse-text {
          animation: pulse-text 2s ease-in-out infinite;
        }
        @keyframes slide-in-option-left {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slide-in-option-right {
          0% {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slide-in-option-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-option-left 0.5s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-option-right 0.5s ease-out forwards;
        }
        .animate-slide-in-up {
          animation: slide-in-option-up 0.5s ease-out forwards;
        }
        @keyframes typing {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes blink {
          0%, 50% {
            border-color: transparent;
          }
          51%, 100% {
            border-color: #06b6d4;
          }
        }
        .animate-typing {
          width: 0;
          animation: typing 2s steps(25, end) forwards, blink 0.75s step-end infinite;
          white-space: nowrap;
        }
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          opacity: 0;
          animation: fade-in-scale 0.6s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-bounce-in {
          opacity: 0;
          animation: bounce-in 0.8s ease-out forwards;
        }
        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .square-shape {
          border-radius: 2px;
        }
        .floating-shape {
          will-change: transform;
        }
        @keyframes report-field-fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-report-field {
          opacity: 0;
          animation: report-field-fade-in 0.5s ease-out forwards;
        }
        .glow-cyan {
          text-shadow: 0 0 8px #22d3ee, 0 0 16px #38bdf8, 0 0 24px #0ea5e9;
        }
        .glow-green {
          text-shadow: 0 0 8px #4ade80, 0 0 16px #22c55e;
        }
        .glow-yellow {
          text-shadow: 0 0 8px #fde68a, 0 0 16px #facc15;
        }
      `}</style>
    </div>
  );
  // Phase 2: Report View
  const renderReportView = () => (
    <div 
      key={`reportView-${animationKey}`}
      className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm"
    >
      {/* Animated background layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-25">
        <Animation_manufacture />
      </div>
      <div className="w-[100%] h-[100%] flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center w-full lg:mb-4">
          <h1 className="text-xl lg:text-4xl font-black text-cyan-300 tracking-wide">DEVIATION REPORT</h1>
          <p className="text-cyan-400 text-xs lg:text-lg font-semibold text-center">
            Quality deviation detected - Investigation required
          </p>
        </div>
        {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
        <div className="flex flex-col items-center justify-center flex-1 w-full h-full mb-4 md:mb-0 lg:mt-2 lg:flex lg:items-center lg:justify-center">
          <div
            className="rounded-2xl shadow-xl bg-black/40  lg:p-12 xl:p-16 h-auto pt-4 pb-4 flex flex-col justify-center mx-auto items-center border-2 border-cyan-400 relative w-[96vw] sm:w-[90vw] md:w-[80vw] lg:w-auto max-w-md lg:max-w-2xl xl:max-w-3xl lg:min-h-[420px] xl:min-h-[520px] py-4 max-h-[calc(100vh-120px)] mb-4"
            style={{
              backgroundImage: `url('/exam-pad-bg.png')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              minHeight: '160px',
              // boxShadow: '0 0 12px 2px #06b6d4, 0 2px 16px 0 #000'
            }}
          >
            {/* Exam pad ring/clip at the top */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[-18px] w-20 h-6 bg-gray-300 rounded-b-2xl border-2 border-gray-400 shadow-md z-10 flex items-center justify-center">
              <div className="w-8 h-2 bg-gray-400 rounded-full"></div>
            </div>
            {/* Paper styling */}
            <div className="mt-[1vw] w-full h-full text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl max-h-full max-w-full overflow-auto break-words px-2 md:px-4 lg:px-0">
              <div className="text-center mb-2 w-full">
                <h2 className="text-xs md:text-sm lg:text-2xl xl:text-3xl font-bold text-red-600 mb-1">DEVIATION REPORT</h2>
                <div className="w-full h-px bg-gray-300 mb-1"></div>
              </div>
              <div className="space-y-1 text-[10px] md:text-xs lg:text-base xl:text-lg 2xl:text-xl text-cyan-400">
                <div className="animate-report-field  text-white" style={{ animationDelay: '0.2s' }}>
                  <span className="font-bold text-cyan-400">Case ID:</span> DEV-{String(gameState.currentCase + 1).padStart(3, '0')}
                </div>
                <div className="animate-report-field text-white" style={{ animationDelay: '0.4s' }}>
                  <span className="font-bold text-cyan-400">Date:</span> {new Date().toLocaleDateString()}
                </div>
                <div className="animate-report-field text-white" style={{ animationDelay: '0.6s' }}>
                  <span className="font-bold text-cyan-400">Title:</span> <span className="break-words text-[10px] lg:text-lg">{currentCase.title}</span>
                </div>
                <div className="animate-report-field text-white" style={{ animationDelay: '0.8s' }}>
                  <span className="font-bold text-cyan-400">Description:</span>
                  <p className="mt-1  leading-relaxed text-[10px] lg:text-lg break-words ">{currentCase.scenario}</p>
                </div>
                <div className="animate-report-field text-white" style={{ animationDelay: '1.0s' }}>
                  <span className="font-bold text-[10px] lg:text-lg text-cyan-400">Product:</span> <span className="text-[10px] lg:text-lg">Pharmaceutical Tablet</span>
                </div>
                <div className="animate-report-field text-white" style={{ animationDelay: '1.2s' }}>
                  <span className="font-bold text-[10px] lg:text-lg text-cyan-400">Batch:</span> <span className="text-[10px] lg:text-lg">A2024-{String(gameState.currentCase + 1).padStart(3, '0')}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1 w-full animate-report-field" style={{ animationDelay: '1.4s' }}>
                  <div className="flex flex-col items-center justify-center bg-red-50 p-0.5 rounded border-l-4 border-red-500 min-w-0 w-full">
                    <div className="font-bold text-red-800 text-[10px] lg:text-lg leading-tight truncate">Priority</div>
                    <div className="text-red-600 text-[10px] lg:text-lg leading-tight truncate">HIGH</div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-yellow-50 p-0.5 rounded border-l-4 border-yellow-500 min-w-0 w-full">
                    <div className="font-bold text-yellow-800 text-[10px] lg:text-lg leading-tight truncate">Status</div>
                    <div className="text-yellow-600 text-[10px] lg:text-lg leading-tight truncate">OPEN</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex flex-row items-center justify-between w-full px-2 pb-1 pt-1 sm:px-4  sm:pt-2 fixed bottom-0 left-0 z-50 shadow-lg">
          <button
            onClick={handleBack}
            className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300 mb-2 sm:mb-0"
          >
            <ChevronLeft className="w-4 h-4 md:w-[0.7vw] md:h-[0.7vw] min-w-3 min-h-3 mr-1" />
            <span>Back</span>
          </button>
          <div className="flex w-auto justify-end">
            <button
              onClick={handleContinue}
              className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300"
            >
              <span>Start Investigation</span>
              <ChevronRight className="w-5 h-5 md:w-[1vw] md:h-[1vw] lg:w-8 lg:h-8 min-w-4 min-h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Phase 3-5: Investigation Steps
  const renderInvestigationStep = () => {
    const stepTitles = {
      'step1': 'Step 1: Identify GMP Violation',
      'step2': 'Step 2: Root Cause Analysis',
      'step3': 'Step 3: Impact Assessment'
    };

    const stepIcons = {
      'step1': Target,
      'step2': Brain,
      'step3': TrendingUp
    };

    const StepIcon = stepIcons[currentPhase as keyof typeof stepIcons];
    return (
      <div 
        key={`step-${currentPhase}-${animationKey}`}
        className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm"
        aria-hidden="true"
      >
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-25">
          <Animation_manufacture />
        </div>
        <div className="relative w-[100%] h-[100%] flex-1 flex flex-col z-10">
          {/* Header */}
          <div className="text-center mb-[1vw] w-[100%] animate-fade-in-down">
            {/* <div className="inline-flex items-center justify-center w-[3vw] h-[3vw] min-w-[24px] min-h-[24px] bg-blue-100 rounded-full mb-[0.5vw]">
              <StepIcon className="w-[1.5vw] h-[1.5vw] min-w-[12px] min-h-[12px] text-blue-600" />
            </div> */}
            <h1 className="text-lg md:text-xl font-bold text-cyan-400 mb-1 ">{stepTitles[currentPhase as keyof typeof stepTitles]}</h1>
            <p className="text-[10px] lg:text-lg text-cyan-400">Deviation Investigation Game</p>
          </div>
          {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
          <div className="flex items-center justify-center flex-1 w-[100%] min-h-0 overflow-visible mb-[60px] lg:mb-0 lg:gap-[2vw] lg:px-2 lg:py-6 lg:h-full h-auto mt-4 lg:mt-0">
            {/* Centered: Question Panel */}
            <div className="rounded-2xl shadow-xl flex flex-col items-center justify-center w-[100vw] sm:w-full h-auto overflow-visible landscape:p-2 landscape:max-w-xs landscape:text-[9px] sm:text-xs lg:w-auto lg:min-w-[480px] lg:max-w-2xl lg:p-8 xl:p-12 mx-auto animate-fade-slide-up">
              <div className="sm:w-full h-full text-[9px] md:text-sm landscape:text-[9px] mt-2 md:mt-0 landscape:leading-tight">
                <QuestionPanel
                  key={`question-${currentPhase}-${animationKey}`}
                  case={currentCase}
                  currentQuestion={
                    currentPhase === 'step1'
                      ? 'violation'
                      : currentPhase === 'step2'
                      ? 'rootCause'
                      : 'impact'
                  }
                  selectedAnswers={gameState.answers}
                  onAnswerSelect={handleAnswerSelect}
                  showFeedback={false}
                />
              </div>
            </div>
          </div>
          {/* Navigation */}
          <div className="flex flex-row items-center justify-between w-full px-2 pb-1 pt-1 sm:px-4  sm:pt-2 fixed bottom-0 left-0 z-50 shadow-lg">
            <button
              onClick={handleBack}
              className="top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg flex flex-row items-center bg-black/40 backdrop-blur-md border border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300 mb-2 sm:mb-0"
            >
              <ChevronLeft className="w-4 h-4 md:w-[0.7vw] md:h-[0.7vw] min-w-3 min-h-3 mr-1" />
              <span>Back</span>
            </button>
            <div className="flex w-auto justify-end">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`top-4 left-4 rounded-lg px-1.5 py-0.5 text-[10px] font-bold flex flex-row items-center z-50 sm:px-4 sm:py-2 sm:text-sm lg:text-lg sm:font-bold sm:rounded-lg sm:transition-all sm:duration-300 sm:bg-black/40 sm:backdrop-blur-md sm:border sm:border-cyan-400/30 hover:bg-cyan-900/60 transition-all duration-300 mb-2 sm:mb-0 ${
                  canContinue
                    ? 'text-cyan-400'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ChevronRight className="w-[1vw] h-[1vw] min-w-4 min-h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Phase 6: Feedback
  const renderFeedback = () => {
    const correctAnswers = getCorrectAnswers();
    const isAllCorrect = allAnswersCorrectAtFeedback;
    const caseAccuracy = Math.round((correctAnswers / 3) * 100);
    // Calculate performance for this case only based on score (out of 15)
    const caseIdx = gameState.currentCase;
    // Calculate score for current case: check which questions were scored for this case
    // Use a typed array for question types
    const questionTypes: Array<'violation' | 'rootCause' | 'impact'> = ['violation', 'rootCause', 'impact'];
    let caseScore = 0;
    if (scoredQuestions[caseIdx]) {
      questionTypes.forEach(type => {
        if (
          scoredQuestions[caseIdx].has(type) &&
          gameState.answers[type] === currentCase.questions[type].correct
        ) {
          caseScore += 5;
        }
      });
    }
    const performance = Math.round((caseScore / 15) * 100);

    // Get correct and user answers for each question
    const violationCorrect = currentCase.questions.violation.options[currentCase.questions.violation.correct];
    const violationUser = gameState.answers.violation !== null ? currentCase.questions.violation.options[gameState.answers.violation] : null;
    const violationIsCorrect = gameState.answers.violation === currentCase.questions.violation.correct;

    const rootCauseCorrect = currentCase.questions.rootCause.options[currentCase.questions.rootCause.correct];
    const rootCauseUser = gameState.answers.rootCause !== null ? currentCase.questions.rootCause.options[gameState.answers.rootCause] : null;
    const rootCauseIsCorrect = gameState.answers.rootCause === currentCase.questions.rootCause.correct;

    const impactCorrect = currentCase.questions.impact.options[currentCase.questions.impact.correct];
    const impactUser = gameState.answers.impact !== null ? currentCase.questions.impact.options[gameState.answers.impact] : null;
    const impactIsCorrect = gameState.answers.impact === currentCase.questions.impact.correct;

    // Only show Submit in feedback phase of case 2 if all answers are provided and all are correct
    const allAnswersProvided =
      gameState.answers.violation !== null &&
      gameState.answers.rootCause !== null &&
      gameState.answers.impact !== null;
    const allAnswersCorrect =
      gameState.answers.violation === currentCase.questions.violation.correct &&
      gameState.answers.rootCause === currentCase.questions.rootCause.correct &&
      gameState.answers.impact === currentCase.questions.impact.correct;

    return (
      <div className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm overflow-hidden"
      
      >
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-25">
          <Animation_manufacture />
        </div>
        <div className="relative z-10 w-full h-full flex-1 flex flex-col overflow-hidden">
          <GameHeader
            currentCase={gameState.currentCase + 1}
            totalCases={cases.length}
            score={gameState.score}
            totalQuestions={gameState.totalQuestions}
          />
          {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
          <div className="flex flex-row gap-2 items-start flex-1 w-full min-h-0 px-4 pb-[70px] sm:pb-0">
            {/* Left: Character */}
            <div className="flex justify-center items-center flex-shrink-0 p-2" style={{ minWidth: 0 }}>
               <CharacterRotator />
            </div>
            {/* Right: Feedback Panel - make this scrollable if content overflows */}
            <div
              className={
                // Enhanced feedback panel with better visibility and readability
                "bg-slate-800/95 backdrop-blur-sm rounded-xl mb-4 shadow-2xl border border-cyan-400/30 p-2 sm:p-3 lg:p-6 xl:p-8 flex flex-col gap-1 sm:gap-2 lg:gap-3 items-stretch flex-1 min-w-0 min-h-0 h-full text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg overflow-y-auto lg:overflow-auto lg:max-h-[80vh] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-5xl w-[95%] sm:w-[90%] md:w-[80%] lg:w-[80%] mx-auto transition-all duration-300 hover:shadow-cyan-400/20 hover:shadow-xl"
              }
              style={{ minHeight: 0 }}
            >
              {/* Parent div for detailed feedback */}
              <div className="flex flex-col w-full gap-1  lg:gap-3 xl:gap-4">
                {/* Header */}
                <div className="flex flex-col items-start mb-1 sm:mb-2">
                  <span className="text-yellow-400 font-bold text-sm  lg:text-xl xl:text-2xl leading-tight drop-shadow-sm">{isAllCorrect ? 'Excellent!' : 'Needs Improvement'}</span>
                  <span className="text-cyan-300 text-xs sm:text-sm lg:text-lg xl:text-xl font-semibold leading-tight mt-1">Case analysis complete - Review your results</span>
                </div>
                {/* Score summary */}
                <div className="flex flex-row items-center gap-2 sm:gap-3 mt-1">
                  <div className="flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-white/20 shadow-lg">
                    <span className="text-red-700 font-bold text-sm  lg:text-lg xl:text-xl leading-tight">{correctAnswers}/3 Correct</span>
                    <span className="text-slate-600 text-xs  lg:text-base xl:text-lg leading-tight font-medium">Case Accuracy: {caseAccuracy}%</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-black/20  backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-white/20 shadow-lg">
                    <span className="text-cyan-600 font-bold text-sm  lg:text-lg xl:text-xl leading-tight">{Math.min(performance, 100)}%</span>
                    <span className="text-slate-600 text-xs  lg:text-base xl:text-lg leading-tight font-medium">Performance</span>
                  </div>
                </div>
                {/* Detailed Analysis */}
                <div className="mt-1 lg:mt-2 ">
                  <span className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl text-cyan-300 leading-tight drop-shadow-sm">Detailed Analysis</span>
                  <div className="flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <div className="flex flex-col bg-white/70 backdrop-blur-sm border-l-4 border-yellow-400 rounded-lg p-2 sm:p-3 shadow-lg border border-white/20">
                      <span className="font-bold text-yellow-600 text-sm sm:text-base lg:text-lg xl:text-xl leading-tight flex items-center gap-2">🔍 GMP Violation Identification</span>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full text-xs sm:text-sm lg:text-base xl:text-lg mt-2 gap-1 sm:gap-2">
                        <span className="text-slate-700 lg:text-lg text-sm">Correct: <span className="text-green-700 font-semibold">{violationCorrect}</span></span>
                        <span className={`font-semibold ${violationIsCorrect ? 'text-green-600' : 'text-red-600'}`}>Your answer: <span className="font-bold">{violationUser || 'Not answered'}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-white/70 backdrop-blur-sm border-l-4 border-yellow-400 rounded-lg p-2 sm:p-3 shadow-lg border border-white/20">
                      <span className="font-bold text-yellow-600 text-sm sm:text-base lg:text-lg xl:text-xl leading-tight flex items-center gap-2">🎯 Root Cause Analysis</span>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full text-xs sm:text-sm lg:text-base xl:text-lg mt-2 gap-1 sm:gap-2">
                        <span className="text-slate-700 font-medium">Correct: <span className="text-green-700 font-semibold">{rootCauseCorrect}</span></span>
                        <span className={`font-semibold ${rootCauseIsCorrect ? 'text-green-600' : 'text-red-600'}`}>Your answer: <span className="font-bold">{rootCauseUser || 'Not answered'}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-white/70 backdrop-blur-sm border-l-4 border-yellow-400 rounded-lg p-2 sm:p-3 shadow-lg border border-white/20">
                      <span className="font-bold text-yellow-600 text-sm sm:text-base lg:text-lg xl:text-xl leading-tight flex items-center gap-2">⚡ Impact Assessment</span>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full text-xs sm:text-sm lg:text-base xl:text-lg mt-2 gap-1 sm:gap-2">
                        <span className="text-slate-700 font-medium">Correct: <span className="text-green-700 font-semibold">{impactCorrect}</span></span>
                        <span className={`font-semibold ${impactIsCorrect ? 'text-green-600' : 'text-red-600'}`}>Your answer: <span className="font-bold">{impactUser || 'Not answered'}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Learning Insight */}
                <div className="mt-2 sm:mt-3 bg-blue-50/70 backdrop-blur-sm border-l-4 border-blue-400 rounded-lg p-2 sm:p-3 flex flex-col shadow-lg border border-blue-200/50">
                  <span className="font-bold text-blue-700 text-sm sm:text-base lg:text-lg xl:text-xl leading-tight flex items-center gap-2">💡 Learning Insight</span>
                  <span className="text-slate-700 text-xs sm:text-sm lg:text-base xl:text-lg flex items-start mt-2 leading-relaxed">
                    <span className="mr-2 text-base" role="img" aria-label="book">📚</span>
                    <span className="font-medium">This case highlights areas for improvement. Focus on understanding the interconnections between GMP violations and their underlying causes.</span>
                  </span>
                </div>
                {/* Next Case button - only show if not last case */}
                {gameState.currentCase < cases.length - 1 }
                {/* Summary message at the bottom */}
                <div className="flex flex-col items-start justify-center bg-yellow-50/70 backdrop-blur-sm border-l-4 border-yellow-500 p-2 sm:p-3 w-full rounded-lg mt-2 sm:mt-3 shadow-lg border border-yellow-200/50">
                  <div className="flex items-center min-h-[20px] py-1">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2 flex-shrink-0" />
                    <span className="text-yellow-700 font-semibold text-xs sm:text-sm lg:text-base xl:text-lg leading-tight">Needs Improvement - You must get all answers correct to continue</span>
                    <span className="ml-2 text-sm sm:text-base" role="img" aria-label="book">📚</span>
                  </div>
                  <div className="text-slate-700 text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-start mt-2 w-full bg-transparent leading-relaxed">Case analysis complete - Review your results and try again</div>
                </div>
              </div>
            </div>
          </div>
          {/* Navigation - fixed at bottom, full width, justify-between */}
          <div className="flex flex-row items-center justify-between w-full px-2 pb-1 pt-1 sm:px-4  sm:pt-2 fixed bottom-0 left-0 z-50 shadow-lg">
            <button
              onClick={handleBack}
              disabled={isAllCorrect}
              className={`px-1.5 py-0.5 text-[10px] rounded-lg font-semibold flex items-center space-x-1 transition-all duration-300 sm:px-4 sm:py-2 sm:text-sm lg:text-lg ${
                isAllCorrect
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-cyan-400/30 hover:text-cyan-200 border border-cyan-400/30 shadow-md'
              }`}
            >
              <ChevronLeft className="w-[0.7vw] h-[0.7vw] min-w-3 min-h-3" />
              <span>Back</span>
            </button>
            <div className="flex w-auto justify-end">
              {/* Show Submit only in feedback phase for case2 (index 1), all answers provided, and all correct */}
              {currentPhase === 'feedback' && gameState.currentCase === 1 && allAnswersProvided && allAnswersCorrect && (
                <button
                  onClick={() => setPopupOpen(true)}
                  className="px-1.5 py-0.5 text-[10px] sm:px-4 sm:py-2 sm:text-sm lg:text-lg min-px-4 min-py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-xl hover:from-cyan-500 hover:to-purple-700 transition-all duration-300 font-bold flex items-center space-x-2 shadow-lg border border-cyan-400/30"
                >
                  <span>Submit</span>
                  <ChevronRight className="w-[1vw] h-[1vw] min-w-4 min-h-4" />
                </button>
              )}
              {isAllCorrect && gameState.currentCase !== 1 && (
                <button
                  onClick={handleContinue}
                  className="px-1.5 py-0.5 text-[10px] sm:px-4 sm:py-2 sm:text-sm lg:text-lg min-px-4 min-py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white rounded-xl hover:from-cyan-500 hover:to-purple-700 transition-all duration-300 font-bold flex items-center space-x-2 shadow-lg border border-cyan-400/30"
                >
                  <span>Next Case</span>
                  <ChevronRight className="w-[1vw] h-[1vw] min-w-4 min-h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Feedback Popup - only for case2 feedback phase */}
          {currentPhase === 'feedback' && gameState.currentCase === 1 && (
            <FeedbackPopup
              open={popupOpen}
              onClose={() => setPopupOpen(false)}
              onNext={handleContinue}
              onBackToLevels={() => window.location.assign('/modules')}
              onPlayAgain={handlePlayAgain}
              score={gameState.score}
              time={formatTimer(timer)}
            />
          )}
        </div>
      </div>
    );
  };

  // Handler to reset game to login phase with proper Supabase integration
  const handlePlayAgain = () => {
    // Clear localStorage to ensure a fresh start
    localStorage.removeItem('level4_gameState');
    localStorage.removeItem('level4_timer');
    
    console.log('[PlayAgain] Resetting game for a new attempt');
    
    // Reset game state completely
    setGameState({
      currentCase: 0,
      answers: {
        violation: null,
        rootCause: null,
        impact: null
      },
      score: 0, // Start with zero score for this attempt
      totalQuestions: 0,
      showFeedback: false,
      gameComplete: false
    });
    
    // Reset all other related state
    setCurrentPhase('login');
    setTimer(0);
    setScoredQuestions({}); // Reset scored questions tracking
    setCanContinue(true);   // Ensure continue button is enabled
    setTimerActive(false);  // Ensure timer is stopped
    setPopupOpen(false);    // Close any open popups
    
    // Force reset the animation
    setAnimationKey(prev => prev + 1);

    // This is key: Trigger a Supabase sync after reset
    // This will ensure the database state is updated with a clean slate
    // while preserving the high score
    const resetSync = setTimeout(() => {
      // This is just to trigger the useEffect sync
      setGameState(state => ({ ...state }));
    }, 500);
    
    return () => clearTimeout(resetSync);
  };

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Show timer and score in all investigation and feedback phases (not just when timerActive is true)
  const showTimer = ["reportView", "step1", "step2", "step3", "feedback"].includes(currentPhase) && !gameState.gameComplete;

  // Add this useEffect to ensure results are calculated when entering feedback phase
  React.useEffect(() => {
    if (currentPhase === 'feedback' && !gameState.showFeedback) {
      calculateResults();
    }
  }, [currentPhase]);

  // Main render logic
  return (
    <div className="relative h-full w-full min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900
 overflow-hidden">
      {/* High Score Alert */}
      <HighScoreAlert 
        score={gameState.score} 
        isVisible={showHighScorePopup} 
        onClose={() => setShowHighScorePopup(false)}
      />
      
      {/* Neon Animated SVG Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
       
      </div>
      {/* Case label and Timer/Score always top left */}
      {showTimer && (
        <div className="absolute top-4 left-4 rounded-lg px-2 py-0.5 font-bold text-cyan-400 z-50 sm:top-4 sm:left-4 flex flex-col items-start bg-black/30 backdrop-blur-md border border-cyan-400/30">
          {/* Case label above timer */}
          <span className="text-cyan-300 font-bold text-[9px] sm:text-xs md:text-base mb-1">Case-{gameState.currentCase + 1}</span>
          <span className="text-[9px] sm:text-xs md:text-base">Time : {formatTimer(timer)}</span>
          <span className="text-green-400 font-bold mt-1 text-[9px] sm:text-xs md:text-base">Score : {gameState.score}</span>
        </div>
      )}
      {/* Phase rendering */}
      <div className="relative z-10">
        {(() => {
          switch (currentPhase) {
            case 'login':
              return renderLogin();
            case 'reportView':
              return renderReportView();
            case 'step1':
            case 'step2':
            case 'step3':
              return renderInvestigationStep();
            case 'feedback':
              return renderFeedback();
            default:
              return renderLogin();
          }
        })()}
      </div>
      {/* Custom CSS for floating shapes and neon theme */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-slide-up {
          animation: fade-slide-up 0.6s ease-out forwards;
        }
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
        @keyframes slide-in-option {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in-option {
          animation: slide-in-option 0.5s ease-out forwards;
        }
        @keyframes pulse-text {
          0%, 100% {
            color: rgba(255, 255, 255, 0.8);
            text-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            color: rgba(59, 130, 246, 0.9);
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
          }
        }
        .animate-pulse-text {
          animation: pulse-text 2s ease-in-out infinite;
        }
        @keyframes slide-in-option-left {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slide-in-option-right {
          0% {
            opacity: 0;
            transform: translateX(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slide-in-option-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-option-left 0.5s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-option-right 0.5s ease-out forwards;
        }
        .animate-slide-in-up {
          animation: slide-in-option-up 0.5s ease-out forwards;
        }
        @keyframes typing {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes blink {
          0%, 50% {
            border-color: transparent;
          }
          51%, 100% {
            border-color: #06b6d4;
          }
        }
        .animate-typing {
          width: 0;
          animation: typing 2s steps(25, end) forwards, blink 0.75s step-end infinite;
          white-space: nowrap;
        }
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          opacity: 0;
          animation: fade-in-scale 0.6s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-bounce-in {
          opacity: 0;
          animation: bounce-in 0.8s ease-out forwards;
        }
        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .square-shape {
          border-radius: 2px;
        }
        .floating-shape {
          will-change: transform;
        }
        @keyframes report-field-fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-report-field {
          opacity: 0;
          animation: report-field-fade-in 0.5s ease-out forwards;
        }
        .glow-cyan {
          text-shadow: 0 0 8px #22d3ee, 0 0 16px #38bdf8, 0 0 24px #0ea5e9;
        }
        .glow-green {
          text-shadow: 0 0 8px #4ade80, 0 0 16px #22c55e;
        }
        .glow-yellow {
          text-shadow: 0 0 8px #fde68a, 0 0 16px #facc15;
        }
      `}</style>
    </div>
  );
};