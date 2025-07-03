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

type GamePhase = 'login' | 'reportView' | 'step1' | 'step2' | 'step3' | 'feedback';

export const GameBoard2D: React.FC = () => {
  const navigate = useNavigate();

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

  const [currentPhase, setCurrentPhase] = useState<GamePhase>('login');
  const [canContinue, setCanContinue] = useState(true); // Login phase always allows continue
  const [timer, setTimer] = useState<number>(0); // Start from 0
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track which questions have been scored for each case
  const [scoredQuestions, setScoredQuestions] = useState<Record<number, Set<'violation' | 'rootCause' | 'impact'>>>({});
  const [popupOpen, setPopupOpen] = useState(false);

  const currentCase = cases[gameState.currentCase];

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
        [questionType]: answer
      }
    }));
    setCanContinue(true);
  };

  const handleContinue = () => {
    switch (currentPhase) {
      case 'login':
        setCurrentPhase('reportView');
        setCanContinue(true);
        break;
      case 'reportView':
        setCurrentPhase('step1');
        setCanContinue(false);
        break;
      case 'step1':
        if (gameState.answers.violation !== null) {
          setCurrentPhase('step2');
          setCanContinue(false);
        }
        break;
      case 'step2':
        if (gameState.answers.rootCause !== null) {
          setCurrentPhase('step3');
          setCanContinue(false);
        }
        break;
      case 'step3':
        if (gameState.answers.impact !== null) {
          setCurrentPhase('feedback');
          calculateResults();
        }
        break;
      case 'feedback':
        const correctAnswers = getCorrectAnswers();
        if (correctAnswers === 3) {
          // Only continue if all answers are correct
          if (gameState.currentCase < cases.length - 1) {
            // Move to next case
            setGameState(prev => ({
              ...prev,
              currentCase: prev.currentCase + 1,
              answers: { violation: null, rootCause: null, impact: null },
              showFeedback: false
            }));
            setCurrentPhase('login');
            setCanContinue(true);
          } else {
            // Game complete
            setGameState(prev => ({ ...prev, gameComplete: true }));
          }
        } else {
          // Show "Needs Improvement" and don't allow continue
          setCanContinue(false);
        }
        break;
    }
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
      if (userAns !== null && userAns === correctAns && !currentScored.has(type)) {
        newScore += 5; // 5 points per correct answer
        newQuestions++;
        newScored.add(type);
      } else if (userAns !== null && !currentScored.has(type)) {
        newQuestions++;
        newScored.add(type);
      }
    });
    setGameState(prev => ({
      ...prev,
      score: prev.score + newScore,
      totalQuestions: prev.totalQuestions + newQuestions,
      showFeedback: true
    }));
    setScoredQuestions(prev => ({ ...prev, [caseIdx]: newScored }));
  };

  const getCorrectAnswers = () => {
    if (!gameState.answers.violation && !gameState.answers.rootCause && !gameState.answers.impact) return 0;
    
    let correct = 0;
    if (gameState.answers.violation === currentCase.questions.violation.correct) correct++;
    if (gameState.answers.rootCause === currentCase.questions.rootCause.correct) correct++;
    if (gameState.answers.impact === currentCase.questions.impact.correct) correct++;
    return correct;
  };  const renderCharacter = () => (
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
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Animation_manufacture />
      </div>
      {/* Case label top left on login page */}
      <div className="absolute top-4 left-4 rounded-lg px-2 py-0.5 text-[10px] font-bold text-cyan-400 z-50 sm:top-4 sm:left-4 sm:text-lg sm:px-4 sm:py-2 flex flex-col items-start bg-black/40 backdrop-blur-md border border-cyan-400/30">
        <span className="text-cyan-300 font-bold text-xs md:text-base mb-1">Case-{gameState.currentCase + 1}</span>
      </div>
      {/* Main content with gradient overlay */}
      <div className="relative z-10 h-full w-full flex flex-col text-xs md:text-sm lg:text-base">
        {/* Header */}
        <div className="flex flex-col items-center justify-center w-full z-10 landscape:relative landscape:z-20 landscape:bg-transparent landscape:pt-2 ">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-red-600  ">DEVIATION REPORT</h1>
          <p className="text-xs md:text-base lg:text-2xl text-cyan-400 landscape:text-xs landscape:mb-1 lg:mb-2 glow-cyan-2">
            Quality deviation detected - Investigation required
          </p>
        </div>

        {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
        <div className="pt-2 items-center justify-center flex-1 w-full h-full lg:flex lg:items-center lg:justify-center">
          <div
            className="rounded-2xl shadow-xl bg-black/60 lg:p-12 xl:p-16 h-auto pt-4 pb-4 flex flex-col justify-center mx-auto items-center border-2 border-cyan-100 relative w-[96vw] sm:w-[90vw] md:w-[80vw] lg:w-auto max-w-md lg:max-w-2xl xl:max-w-3xl lg:min-h-[420px] xl:min-h-[520px] py-4 max-h-[calc(100vh-120px)] mb-4"
            style={{
              backgroundImage: `url('/exam-pad-bg.png')`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              minHeight: '160px',
              // boxShadow: '0 0 12px 2px #06b6d4, 0 2px 16px 0 #000'
            }}
          >
            <div className=" flex flex-col items-center justify-center gap-1 mt-2 lg:overflow-visible w-auto h-auto max-w-full max-h-full">
              <h2 className="text-xs md:text-xl lg:text-2xl xl:text-3xl font-bold text-cyan-400  text-center whitespace-pre-line mb-2 lg:mb-4 xl:mb-6 px-0">Product Under Investigation</h2>
              <div className="w-full h-full flex flex-col items-center justify-center lg:overflow-visible">
                <Product2D
                  productName="Pharmaceutical Tablet"
                  batchNumber={`A2024-${String(gameState.currentCase + 1).padStart(3, '0')}`}
                  hasDeviation={true}
                  deviationType={gameState.currentCase === 0 ? 'cleaning' : 'calibration'}
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
        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .square-shape {
          border-radius: 2px;
        }
        .floating-shape {
          will-change: transform;
        }
      `}</style>
    </div>
  );
  // Phase 2: Report View
  const renderReportView = () => (
    <div className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm"
    
    >
      {/* Animated background layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <Animation_manufacture />
      </div>
      <div className="w-[100%] h-[100%] flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="text-center mb-[1vw] w-[100%]">
          <h1 className="text-xl md:text-2xl font-bold text-cyan-400  ">Deviation Investigation Game</h1>
          <p className="text-base text-cyan-400  ">Case Report Review</p>
        </div>
        {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
        <div className="flex flex-col items-center justify-center flex-1 w-full h-full mb-4 md:mb-0 mt-2 lg:flex lg:items-center lg:justify-center">
          <div
            className="rounded-2xl shadow-xl bg-black/60  lg:p-12 xl:p-16 h-auto pt-4 pb-4 flex flex-col justify-center mx-auto items-center border-2 border-cyan-400 relative w-[96vw] sm:w-[90vw] md:w-[80vw] lg:w-auto max-w-md lg:max-w-2xl xl:max-w-3xl lg:min-h-[420px] xl:min-h-[520px] py-4 max-h-[calc(100vh-120px)] mb-4"
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
                <div>
                  <span className="font-bold">Case ID:</span> DEV-{String(gameState.currentCase + 1).padStart(3, '0')}
                </div>
                <div>
                  <span className="font-bold">Date:</span> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <span className="font-bold">Title:</span> <span className="break-words text-[10px] md:text-xs">{currentCase.title}</span>
                </div>
                <div>
                  <span className="font-bold">Description:</span>
                  <p className="mt-1 text-cyan-400 leading-relaxed text-[10px] md:text-xs break-words">{currentCase.scenario}</p>
                </div>
                <div>
                  <span className="font-bold">Product:</span> <span className="text-[10px] md:text-xs">Pharmaceutical Tablet</span>
                </div>
                <div>
                  <span className="font-bold">Batch:</span> <span className="text-[10px] md:text-xs">A2024-{String(gameState.currentCase + 1).padStart(3, '0')}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1 w-full">
                  <div className="flex flex-col items-center justify-center bg-red-50 p-0.5 rounded border-l-4 border-red-500 min-w-0 w-full">
                    <div className="font-bold text-red-800 text-[10px] leading-tight truncate">Priority</div>
                    <div className="text-red-600 text-[10px] leading-tight truncate">HIGH</div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-yellow-50 p-0.5 rounded border-l-4 border-yellow-500 min-w-0 w-full">
                    <div className="font-bold text-yellow-800 text-[10px] leading-tight truncate">Status</div>
                    <div className="text-yellow-600 text-[10px] leading-tight truncate">OPEN</div>
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

    const StepIcon = stepIcons[currentPhase as keyof typeof stepIcons];    return (
      <div className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm"
       aria-hidden="true"
      >
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Animation_manufacture />
        </div>
        <div className="relative w-[100%] h-[100%] flex-1 flex flex-col z-10">
          {/* Header */}
          <div className="text-center mb-[1vw] w-[100%]">
            {/* <div className="inline-flex items-center justify-center w-[3vw] h-[3vw] min-w-[24px] min-h-[24px] bg-blue-100 rounded-full mb-[0.5vw]">
              <StepIcon className="w-[1.5vw] h-[1.5vw] min-w-[12px] min-h-[12px] text-blue-600" />
            </div> */}
            <h1 className="text-lg md:text-xl font-bold text-cyan-400 mb-1 ">{stepTitles[currentPhase as keyof typeof stepTitles]}</h1>
            <p className="text-base text-cyan-400">Deviation Investigation Game</p>
          </div>
          {/* Responsive layout: flex-row for mobile landscape, grid for desktop */}
          <div className="flex items-center justify-center flex-1 w-[100%] min-h-0 overflow-visible mb-[60px] lg:mb-0 lg:gap-[2vw] lg:px-2 lg:py-6 lg:h-full h-auto mt-4 lg:mt-0">
            {/* Centered: Question Panel */}
            <div className=" rounded-2xl shadow-xl p-[1vw] flex flex-col items-center justify-center w-full h-auto overflow-visible landscape:p-2 landscape:max-w-xs landscape:text-[9px] sm:text-xs lg:w-auto lg:min-w-[480px] lg:max-w-2xl lg:p-8 xl:p-12 mx-auto">
              <div className="w-auto h-full text-[9px] md:text-sm landscape:text-[9px] mt-2 md:mt-0 landscape:leading-tight">
                <QuestionPanel
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
    const isAllCorrect = correctAnswers === 3;
    const caseAccuracy = Math.round((correctAnswers / 3) * 100);
    const performance = gameState.totalQuestions > 0 ? Math.round((gameState.score / gameState.totalQuestions) * 100) : 0;

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

    const allAnswersReviewed = Object.keys(scoredQuestions).length > 0 && Object.values(scoredQuestions).some(set => set.size === 3);

    return (
      <div className="fixed inset-0 h-screen w-screen z-40 p-[1vw] flex flex-col text-xs md:text-sm overflow-hidden"
      
      >
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
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
                // Responsive: larger on desktop
                "bg-black/60 rounded-lg mb-4 shadow p-1 flex flex-col gap-0.5 items-stretch flex-1 min-w-0 min-h-0 w-full h-full text-[9px] md:text-xs lg:p-8 xl:p-12 lg:text-lg xl:text-xl overflow-y-auto lg:overflow-auto lg:max-h-[80vh] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-5xl w-[95%] sm:w-[90%] md:w-[80%] lg:w-[80%] mx-auto"
              }
              style={{ minHeight: 0 }}
            >
              {/* Parent div for detailed feedback */}
              <div className="flex flex-col w-full gap-0.5 lg:text-xs xl:text-sm lg:space-y-3 xl:space-y-4">
                {/* Header */}
                <div className="flex flex-col items-start mb-0.5">
                  <span className="text-yellow-700 font-bold text-[9px] md:text-xs leading-tight lg:text-base xl:text-lg">{isAllCorrect ? 'Excellent!' : 'Needs Improvement'}</span>
                  <span className="text-cyan-400 text-[8px] md:text-xs font-semibold leading-tight lg:text-base xl:text-lg">Case analysis complete - Review your results</span>
                </div>
                {/* Score summary */}
                <div className="flex flex-row items-center gap-1 mt-0.5">
                  <div className="flex flex-col items-center justify-center bg-white/40 rounded px-1 py-0.5">
                    <span className="text-red-600 font-bold text-xs leading-tight lg:text-base xl:text-lg">{correctAnswers}/3 Correct</span>
                    <span className="text-gray-700 text-[8px] leading-tight lg:text-base xl:text-lg">Case Accuracy: {caseAccuracy}%</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white/40 rounded px-1 py-0.5">
                    <span className="text-cyan-400 font-bold text-xs leading-tight lg:text-base xl:text-lg">{performance}%</span>
                    <span className="text-gray-700 text-[8px] leading-tight lg:text-base xl:text-lg">Performance</span>
                  </div>
                </div>
                {/* Detailed Analysis */}
                <div className="mt-0.5">
                  <span className="font-bold text-[9px] text-cyan-400 leading-tight lg:text-base xl:text-lg">Detailed Analysis</span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex flex-col bg-white/20 border-l-4 border-yellow-400 rounded p-0.5">
                      <span className="font-bold text-yellow-700 text-[9px] leading-tight lg:text-base xl:text-lg">🔍 GMP Violation Identification</span>
                      <div className="flex flex-row justify-between items-center w-full text-[8px]">
                        <span className="text-cyan-400 lg:text-base xl:text-lg">Correct: {violationCorrect}</span>
                        <span className={violationIsCorrect ? 'text-green-600 font-bold lg:text-base xl:text-lg' : 'text-red-600 font-bold lg:text-base xl:text-lg'}>Your answer: {violationUser || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-white/20 border-l-4 border-yellow-400 rounded p-0.5">
                      <span className="font-bold text-yellow-700 text-[9px] leading-tight lg:text-base xl:text-lg">🎯 Root Cause Analysis</span>
                      <div className="flex flex-row justify-between items-center w-full text-[8px]">
                        <span className="text-cyan-400 lg:text-base xl:text-lg">Correct: {rootCauseCorrect}</span>
                        <span className={rootCauseIsCorrect ? 'text-green-600 font-bold lg:text-base xl:text-lg' : 'text-red-600 font-bold lg:text-base xl:text-lg'}>Your answer: {rootCauseUser || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-white/20 border-l-4 border-yellow-400 rounded p-0.5">
                      <span className="font-bold text-yellow-700 text-[9px] leading-tight lg:text-base xl:text-lg">⚡ Impact Assessment</span>
                      <div className="flex flex-row justify-between items-center w-full text-[8px]">
                        <span className="text-cyan-400 lg:text-base xl:text-lg">Correct: {impactCorrect}</span>
                        <span className={impactIsCorrect ? 'text-green-600 font-bold lg:text-base xl:text-lg' : 'text-red-600 font-bold lg:text-base xl:text-lg'}>Your answer: {impactUser || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Learning Insight */}
                <div className="mt-0.5 bg-white/30 border-l-4 border-blue-400 rounded p-0.5 flex flex-col">
                  <span className="font-bold text-blue-700 text-[9px] leading-tight lg:text-base xl:text-lg">💡 Learning Insight</span>
                  <span className="text-cyan-400 text-[8px] flex items-center mt-0.5 leading-tight lg:text-base xl:text-lg"><span className="mr-1" role="img" aria-label="book">📚</span>This case highlights areas for improvement. Focus on understanding the interconnections between GMP violations and their underlying causes.</span>
                </div>
                {/* Next Case button - only show if not last case */}
                {gameState.currentCase < cases.length - 1 }
                {/* Summary message at the bottom */}
                <div className="flex flex-col items-start justify-center bg-white/20 border-l-4 border-yellow-500 p-0.5 w-full rounded mt-1">
                  <div className="flex items-center min-h-[18px] py-0.5">
                    <span className="text-yellow-700 font-medium text-[8px] md:text-xs mr-1 leading-tight lg:text-base xl:text-lg">Needs Improvement - You must get all answers correct to continue</span>
                    <AlertTriangle className="w-3 h-3 min-w-2 min-h-2 text-yellow-500 mr-1" />
                    <span className="ml-1 text-xs" role="img" aria-label="book">📚</span>
                  </div>
                  <div className="text-cyan-400 text-[8px] md:text-xs font-semibold text-start pl-[10%] w-full bg-transparent mt-0.5 leading-tight lg:text-base xl:text-lg">Case analysis complete - Review your results</div>
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
                  className="px-1.5 py-0.5 text-[10px] sm:px-4 sm:py-2 sm:text-sm lg:text-lg min-px-4 min-py-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-cyan-400 rounded-xl hover:from-cyan-300 hover:to-purple-700 transition-all duration-300 font-bold flex items-center space-x-2 shadow-lg border border-cyan-400/30"
                >
                  <span>Submit</span>
                </button>
              )}
              {isAllCorrect && (
                <button
                  onClick={handleContinue}
                  className="px-1.5 py-0.5 text-[10px] sm:px-4 sm:py-2 sm:text-sm lg:text-lg min-px-4 min-py-2 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-700 text-cyan-400 rounded-xl hover:from-green-500 hover:to-blue-800 transition-all duration-300 font-bold flex items-center space-x-2 shadow-lg border border-cyan-400/30"
                >
                  <span>{gameState.currentCase < cases.length - 1 ? 'Next Case' : 'Complete Game'}</span>
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
              score={gameState.score}
              time={formatTimer(timer)}
            />
          )}
        </div>
      </div>
    );
  };

  // Format timer as MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Show timer and score in all investigation and feedback phases (not just when timerActive is true)
  const showTimer = ["reportView", "step1", "step2", "step3", "feedback"].includes(currentPhase) && !gameState.gameComplete;

  // Main render logic
  return (
    <div className="relative h-full w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
      {/* Neon Animated SVG Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
       
      </div>
      {/* Case label and Timer/Score always top left */}
      {showTimer && (
        <div className="absolute top-4 left-4 rounded-lg px-2 py-0.5 font-bold text-cyan-400 z-50 sm:top-4 sm:left-4 flex flex-col items-start bg-black/40 backdrop-blur-md border border-cyan-400/30">
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
        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .square-shape {
          border-radius: 2px;
        }
        .floating-shape {
          will-change: transform;
        }
      `}</style>
    </div>
  );
};
