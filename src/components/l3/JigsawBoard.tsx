// External Library Imports
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Gamepad2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Internal Components and Hooks
import { JigsawContainer } from "./JigsawContainer";

import { ScenarioDialog } from "./ScenarioDialog";
import { VictoryPopup } from "../ui/Popup";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { supabase } from '../../lib/supabase';
// Save progress to Supabase, including piece placements
// Uses upsert to store one row per scenario (user_id + module_id + scenario_index combination)
async function saveProgressToSupabase({
  userId,
  moduleId,
  scenarioIndex,
  finalScore,
  totalScore,
  totalTime,
  scenarioResults,
  placedPieces,
  isCompleted,
  score,
  health,
  combo,
}: {
  userId: string | null;
  moduleId: string;
  scenarioIndex: number;
  finalScore: number;
  totalScore: number;
  totalTime: number;
  scenarioResults: any;
  placedPieces: any;
  isCompleted: boolean;
  score?: number;
  health?: number;
  combo?: number;
}) {
  if (!userId) {
    console.warn('Cannot save progress: user not authenticated');
    return { success: false, error: 'User not authenticated' };
  }

  const progressData = {
    user_id: userId,
    module_id: moduleId,
    scenario_index: scenarioIndex,
    final_score: finalScore,
    total_score: totalScore,
    total_time: totalTime,
    scenario_results: scenarioResults,
    placed_pieces: placedPieces,
    is_completed: isCompleted,
    score: typeof score !== 'undefined' ? score : null,
    health: typeof health !== 'undefined' ? health : null,
    combo: typeof combo !== 'undefined' ? combo : null,
  };

  // First, try to update existing record
  const { data: updateData, error: updateError } = await supabase
    .from('level3_progress')
    .update(progressData)
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .eq('scenario_index', scenarioIndex)
    .select();

  if (updateError) {
    console.error('Supabase update error:', updateError);
    return { success: false, error: updateError };
  }

  // If no rows were updated, insert a new record
  if (!updateData || updateData.length === 0) {
    const { data: insertData, error: insertError } = await supabase
      .from('level3_progress')
      .insert([progressData])
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return { success: false, error: insertError };
    }
    return { success: true, data: insertData };
  }

  return { success: true, data: updateData };
}
import { RootState } from "../../store/types";

// Redux hooks for game persistence
import { useLevel3Persistence } from "../../store/hooks/index";

// Level 3 Database Service
import useLevel3Service from "./hooks/useLevel3Service";

// Debug Component (temporarily disabled)
// import { Level3Debug } from "../Debug/Level3Debug";

// Extracted Components
import {
  Arsenal,
  DeviceRotationPrompt,
  DragPieceOverlay,
  PerformanceTest,
} from "./components";

// Utilities and Hooks
import { BACKGROUND_IMAGE_URL, preloadImage } from "./utils/gameUtils";

// Types
import type { PuzzlePiece } from "../../data/level3Scenarios";
import { getLevel3ScenariosByModule } from "../../data/level3Scenarios";
import { setScenarios } from "../../store/slices/level3Slice";

// Scenario result tracking types
interface ScenarioResult {
  score: number;
  combo: number;
  health: number;
  scenarioIndex: number;
}

interface OverallStats {
  totalScore: number;
  totalCombo: number;
  avgHealth: number;
  totalTime: number;
}

/**
 * Final Stats Popup Component
 *
 * Displays overall statistics when all scenarios are completed
 */
interface FinalStatsPopupProps {
  scenarioResults: ScenarioResult[];
  overallStats: OverallStats;
  onClose: () => void;
  currentModule?: string | number;
  getTopThreeBestScores: (module: string) => Promise<any[] | null>;
}

const FinalStatsPopup: React.FC<FinalStatsPopupProps> = ({
  scenarioResults,
  overallStats,
  onClose,
  currentModule,
  getTopThreeBestScores,
}) => {
  // Calculate mission summary metrics
  const totalScenarios = scenarioResults.length;
  const completedScenarios = scenarioResults.filter(r => r.score > 0).length;
  const avgScorePerScenario = totalScenarios > 0 ? Math.round(overallStats.totalScore / totalScenarios) : 0;
  // Removed avgComboPerScenario

  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const navigate = useNavigate();

  const handleGoToModules = () => {
    navigate("/modules");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`pixel-border-thick bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 text-cyan-100 shadow-2xl relative overflow-hidden ${
        isMobileHorizontal
          ? "w-[98vw] max-w-[500px] p-2 max-h-[85vh] overflow-y-auto"
          : isMobile
          ? "w-[95vw] max-w-[380px] p-3 max-h-[90vh] overflow-y-auto"
          : "w-[600px] max-w-[90vw] p-6"
      }`}
      style={{ borderRadius: 0 }}
    >
      {/* Scan Lines Effect */}
      <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <div
        className={`relative z-10 text-center ${isMobile ? "mb-3" : "mb-6"}`}
      >
        <div
          className={`flex items-center justify-center gap-2 ${
            isMobile ? "mb-2" : "mb-3"
          }`}
        >
          <Crown
            className={`text-yellow-300 ${isMobile ? "w-5 h-5" : "w-8 h-8"}`}
          />
          <h2
            className={`pixel-text font-black text-yellow-200 tracking-wider ${
              isMobile ? "text-lg" : "text-2xl"
            }`}
          >
            LEVEL COMPLETE!
          </h2>
          <Crown
            className={`text-yellow-300 ${isMobile ? "w-5 h-5" : "w-8 h-8"}`}
          />
        </div>
        <p className={`text-cyan-200 font-bold ${isMobile ? "text-sm" : ""}`}>
          All scenarios completed successfully!
        </p>
      </div>

      {/* Overall Stats Grid */}
      <div className={`relative z-10 ${isMobile ? "mb-3" : "mb-4"}`}>
        <h3
          className={`pixel-text font-bold text-yellow-200 text-center ${
            isMobile ? "text-base mb-2" : "text-lg mb-3"
          } ${isMobile && isHorizontal ? "hidden" : ""}`}
        >
          MISSION SUMMARY
        </h3>
        <div
          className={`grid grid-cols-3 gap-3 mb-4`}
        >
          <div
            className="pixel-border bg-blue-800/80 text-center p-2 flex flex-col justify-center items-center"
          >
            <div className="text-blue-200 font-bold mb-1 text-xs">SCENARIOS</div>
            <div className="text-blue-100 font-black text-base">{completedScenarios}/{totalScenarios}</div>
          </div>
          <div
            className="pixel-border bg-purple-800/80 text-center p-2 flex flex-col justify-center items-center"
          >
            <div className="text-purple-200 font-bold mb-1 text-xs">AVG SCORE</div>
            <div className="text-purple-100 font-black text-base">{avgScorePerScenario}</div>
          </div>
          <div
            className="pixel-border bg-green-800/80 text-center p-2 flex flex-col justify-center items-center"
          >
            <div className="text-green-200 font-bold mb-1 text-xs">TOTAL TIME</div>
            <div className="text-green-100 font-black text-base">{formatTime(overallStats.totalTime)}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`relative z-10 flex flex-row gap-2 justify-center ${
          isMobile ? "gap-2" : "gap-3"
        }`}
      >
        <button
          className={`pixel-border-thick bg-gradient-to-r from-green-500 to-blue-600 text-white font-black pixel-text hover:from-green-400 hover:to-blue-500 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-1 flex-1 ${
            isMobile ? "px-3 py-2 text-xs" : "px-6 py-3 gap-2"
          }`}
          onClick={handleGoToModules}
          aria-label="Back to Modules"
        >
          <Icon
            icon="mdi:home-map-marker"
            className={isMobile ? "w-3 h-3" : "w-5 h-5"}
          />
          {isMobile ? "Modules" : "Back to Modules"}
        </button>
        <button
          className={`pixel-border-thick bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 font-black pixel-text hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 active:translate-y-[2px] shadow-lg flex items-center justify-center gap-1 flex-1 ${
            isMobile ? "px-3 py-2 text-xs" : "px-6 py-3 gap-2"
          }`}
          onClick={onClose}
          aria-label="Play Again"
        >
          <Icon
            icon="mdi:refresh"
            className={isMobile ? "w-3 h-3" : "w-5 h-5"}
          />
          {isMobile ? "Replay" : "Play Again"}
        </button>
      </div>
    </div>
  );
};

/**
 * JigsawBoard Component
 *
 * A gamified drag-and-drop puzzle interface where users identify violations
 * and place appropriate actions to fix them.
 */

export const JigsawBoard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const level3Service = useLevel3Service();
  const {
    saveGameCompletion,
    user,
    error: serviceError,
    getTopThreeBestScores,
  } = level3Service;

  // Redux persistence hooks (temporarily disabled to debug performance)
  // const moduleId = useMemo(() => "1", []); // This should come from route params or props
  // const userId = useMemo(() => user?.id || "guest", [user?.id]);
  // const persistence = useLevel3Persistence(moduleId, userId);

  // Continue game dialog state
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [userClosedScenario, setUserClosedScenario] = useState(false);

  // Create a robust fallback function if getTopThreeBestScores is undefined
  const safeGetTopThreeBestScores = React.useMemo(() => {
    if (typeof getTopThreeBestScores === "function") {
      return getTopThreeBestScores;
    }

    // Fallback function that always returns empty array
    return async (module: string) => {
      console.warn(
        "getTopThreeBestScores not available, returning empty array"
      );
      return [];
    };
  }, [getTopThreeBestScores]);

  // Debug logging (disabled to prevent performance issues)
  // console.log('🎮 JigsawBoard: User authentication status:', {
  //   user: user ? { id: user.id, email: user.email } : null,
  //   serviceError
  // });

  // Debug logging for service methods (disabled)
  // console.log('🎮 JigsawBoard: Level3Service methods:', {
  //   saveGameCompletion: typeof saveGameCompletion,
  //   getTopThreeBestScores: typeof getTopThreeBestScores,
  //   safeGetTopThreeBestScores: typeof safeGetTopThreeBestScores,
  //   availableMethods: Object.keys(level3Service)
  // });
  // ===== HOOKS & CONTEXT =====
  // Removed unused: user
  // State declarations (single set at top)
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showScenario, setShowScenario] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const [activeDragPiece, setActiveDragPiece] = useState<PuzzlePiece | null>(
    null
  );
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  // Track the order of correct placements for fair point distribution
  const [correctPlacementIndex, setCorrectPlacementIndex] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [placedPieces, setPlacedPieces] = useState<{
    violations: PuzzlePiece[];
    actions: PuzzlePiece[];
  }>({
    violations: [],
    actions: [],
  });
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);
  const [showFinalStats, setShowFinalStats] = useState(false);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const arsenalRef = useRef<HTMLDivElement>(null);
  // ===== UI STATE =====
  // (all state declarations are below, do not redeclare)

  // Timer effect will be moved after scenarios declaration to avoid initialization error

  // Auto-close feedback after 2.5 seconds
  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => setFeedback(""), 2500);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  // Redux state (declare after state, so it's available for use)
  const scenarios = useSelector((state: RootState) => state.level3.scenarios);
  const currentModule = useSelector(
    (state: RootState) => state.game.currentModule
  );

  // Timer effect: start when gameplay begins (scenario closed), stop when all scenarios complete
  useEffect(() => {
    // Start timer only when user is actively playing (scenario dialog closed and not showing final stats)
    const shouldRunTimer = !showScenario && !showFinalStats && !isComplete && scenarios && scenarios.length > 0;

    if (shouldRunTimer && !timerRef.current) {
      console.log('⏱️ Starting gameplay timer');
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    // Stop timer when scenario dialog is open, final stats are shown, or scenario is complete
    if ((!shouldRunTimer || showFinalStats) && timerRef.current) {
      console.log('⏱️ Stopping gameplay timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showScenario, showFinalStats, isComplete, scenarios]);

  // Refs to store current values for periodic updates
  const currentTimerRef = useRef(timer);
  const currentScoreRef = useRef(score);
  const currentHealthRef = useRef(health);
  const currentComboRef = useRef(combo);
  const currentScenarioResultsRef = useRef(scenarioResults);
  const currentPlacedPiecesRef = useRef(placedPieces);
  const currentScenarioIndexRef = useRef(scenarioIndex);

  // Update refs when values change
  useEffect(() => {
    currentTimerRef.current = timer;
    currentScoreRef.current = score;
    currentHealthRef.current = health;
    currentComboRef.current = combo;
    currentScenarioResultsRef.current = scenarioResults;
    currentPlacedPiecesRef.current = placedPieces;
    currentScenarioIndexRef.current = scenarioIndex;
  }, [timer, score, health, combo, scenarioResults, placedPieces, scenarioIndex]);

  // Periodically update timer in database (every 30 seconds)
  useEffect(() => {
    if (!user?.id || !currentModule || showFinalStats) return;

    console.log('🕐 Setting up periodic timer update interval');

    const updateTimerInterval = setInterval(async () => {
      try {
        const currentTimer = currentTimerRef.current;
        console.log('🕐 Periodic timer update triggered, timer:', currentTimer);

        // Get module ID for saving
        let moduleId: string = "1";
        if (
          typeof currentModule === "object" &&
          currentModule !== null &&
          "id" in currentModule
        ) {
          moduleId = (currentModule as any).id.toString();
        } else if (typeof currentModule === "number") {
          moduleId = (currentModule as number).toString();
        }

        // Only update if there's meaningful progress (timer > 10 seconds)
        if (currentTimer > 10) {
          console.log('🕐 Updating timer in database:', {
            timer: currentTimer,
            moduleId,
            scenarioIndex: currentScenarioIndexRef.current
          });

          const result = await saveProgressToSupabase({
            userId: user.id,
            moduleId,
            scenarioIndex: currentScenarioIndexRef.current,
            finalScore: currentScoreRef.current,
            totalScore: currentScoreRef.current,
            totalTime: currentTimer,
            scenarioResults: currentScenarioResultsRef.current,
            placedPieces: currentPlacedPiecesRef.current,
            isCompleted: false, // Still in progress
            score: currentScoreRef.current,
            health: currentHealthRef.current,
            combo: currentComboRef.current,
          });

          console.log('🕐 Timer update result:', result);
        } else {
          console.log('🕐 Timer too low for update:', currentTimer);
        }
      } catch (err) {
        console.error('🕐 Error updating timer in database:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      console.log('🕐 Clearing periodic timer update interval');
      clearInterval(updateTimerInterval);
    };
  }, [user?.id, currentModule, showFinalStats]); // Minimal dependencies

  // Debug logging for scenarios (disabled to prevent performance issues)
  // console.log('🎮 JigsawBoard: Scenarios state:', {
  //   scenarios: scenarios?.length || 0,
  //   scenarioIndex,
  //   currentScenario: scenarios?.[scenarioIndex]?.title || 'undefined',
  //   showScenario,
  //   currentModule
  // });

  // Initialize scenarios if they're empty (fallback)
  useEffect(() => {
    if (!scenarios || scenarios.length === 0) {
      // console.log('🎮 No scenarios found, loading default module 1 scenarios');
      dispatch(setScenarios(getLevel3ScenariosByModule(1)));
    }
  }, [scenarios, dispatch]);

  // Update scenarios when module changes
  useEffect(() => {
    let moduleId: number = 1; // default fallback
    if (
      typeof currentModule === "object" &&
      currentModule !== null &&
      "id" in currentModule
    ) {
      moduleId = Number((currentModule as any).id) || 1;
    } else if (typeof currentModule === "number") {
      moduleId = currentModule;
    }

    // console.log('🎮 Loading scenarios for module:', moduleId);

    if (moduleId >= 1 && moduleId <= 4) {
      dispatch(setScenarios(getLevel3ScenariosByModule(moduleId)));
    } else {
      // Fallback to module 1 scenarios if moduleId is invalid
      console.warn("Invalid moduleId:", moduleId, "falling back to module 1");
      dispatch(setScenarios(getLevel3ScenariosByModule(1)));
    }
  }, [currentModule, dispatch]);

  // Show scenario when scenarios are loaded and no scenario is currently showing
  useEffect(() => {
    // Auto-show scenario in these cases:
    // 1. After replay reset (isReplayMode = true)
    // 2. After page refresh when initialization is complete and no scenario is showing
    // BUT NOT if user has manually closed the scenario
    if (scenarios && scenarios.length > 0 && !showScenario && !showFinalStats && !isInitializing && !isComplete && !userClosedScenario) {
      if (isReplayMode) {
        console.log("🎯 Auto-showing first scenario after replay reset");
        setShowScenario(true);
        setIsReplayMode(false); // Reset replay mode flag
      } else if (!hasCheckedProgress) {
        // This handles the case where page was refreshed and we need to show a scenario
        // but progress restoration hasn't run yet or didn't show a scenario
        console.log("🎯 Auto-showing scenario after page refresh/initialization");
        setShowScenario(true);
      }
    }
  }, [scenarios, scenarioIndex, showScenario, showFinalStats, isInitializing, isComplete, isReplayMode, hasCheckedProgress, userClosedScenario]);

  // Auto-close feedback after 2.5 seconds (duplicate removed)

  // ===== GAME PROGRESS RESTORE FROM SUPABASE =====
  useEffect(() => {
    async function restoreProgress() {
      // Skip progress restoration if we're in replay mode or have already checked progress
      if (!user?.id || !currentModule) {
        setIsInitializing(false);
        return;
      }

      if (isReplayMode) {
        console.log("🔄 Skipping progress restoration - in replay mode");
        setIsInitializing(false);
        return;
      }

      if (hasCheckedProgress) {
        console.log("🔄 Skipping progress restoration - already checked");
        setIsInitializing(false);
        return;
      }
      let moduleId: string = "1";
      if (
        typeof currentModule === "object" &&
        currentModule !== null &&
        "id" in currentModule
      ) {
        moduleId = (currentModule as any).id.toString();
      } else if (typeof currentModule === "number") {
        moduleId = (currentModule as number).toString();
      } else if (typeof currentModule === "string") {
        moduleId = currentModule;
      }
      try {
        // Get all progress records for this user and module to determine the current state
        const { data, error } = await supabase
          .from('level3_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .order('scenario_index', { ascending: true });

        if (error) {
          console.error('Error restoring progress:', error);
          setIsInitializing(false);
          return;
        }

        if (data && data.length > 0) {
          // Find the highest completed scenario or the current scenario in progress
          let currentScenarioIndex = 0;
          let allScenarioResults: any[] = [];
          let hasIncompleteScenario = false;
          let maxTotalTime = 0;

          // Collect all completed scenario results and find incomplete scenarios
          data.forEach(progress => {
            // Track the maximum total_time across all records
            if (progress.total_time && progress.total_time > maxTotalTime) {
              maxTotalTime = progress.total_time;
            }

            if (progress.is_completed) {
              allScenarioResults.push({
                score: progress.score || 0,
                combo: progress.combo || 0,
                health: progress.health || 100,
                scenarioIndex: progress.scenario_index
              });
              // Move to next scenario after completed ones
              currentScenarioIndex = Math.max(currentScenarioIndex, progress.scenario_index + 1);
            } else {
              // If there's an incomplete scenario, prioritize it
              if (!hasIncompleteScenario || progress.scenario_index < currentScenarioIndex) {
                hasIncompleteScenario = true;
                currentScenarioIndex = progress.scenario_index;
                // Restore the incomplete scenario state
                setPlacedPieces(progress.placed_pieces || { violations: [], actions: [] });
                setScore(progress.score ?? 0);
                setHealth(progress.health ?? 100);
                setCombo(progress.combo ?? 0);
              }
            }
          });

          // Restore the timer with the maximum total_time found
          if (maxTotalTime > 0) {
            setTimer(maxTotalTime);
          }

          // If no incomplete scenarios, reset state for the next scenario
          if (!hasIncompleteScenario) {
            setPlacedPieces({ violations: [], actions: [] });
            setScore(0);
            setHealth(100);
            setCombo(0);
          }

          setScenarioIndex(currentScenarioIndex);
          setScenarioResults(allScenarioResults);

          // Check if all scenarios are completed and show FinalStatsPopup
          const totalScenariosInModule = scenarios?.length ?? 0;
          const allScenariosCompleted = allScenarioResults.length === totalScenariosInModule &&
                                       totalScenariosInModule > 0 &&
                                       !hasIncompleteScenario;

          if (allScenariosCompleted) {
            // All scenarios completed - show final stats
            setShowFinalStats(true);
          } else {
            // Not all scenarios completed - show current scenario
            console.log("📋 Showing scenario after progress restoration:", currentScenarioIndex);
            setShowScenario(true);
          }
        } else {
          // No progress data found - start fresh
          console.log('📊 No progress found, starting fresh from first scenario');
          setScenarioIndex(0);
          setScenarioResults([]);
          setScore(0);
          setHealth(100);
          setCombo(0);
          setTimer(0);
          setPlacedPieces({ violations: [], actions: [] });
          setCorrectPlacementIndex(0);
          // Show first scenario when starting fresh
          console.log("📋 Showing first scenario for fresh start");
          setShowScenario(true);
        }
      } catch (err) {
        console.error('Exception restoring progress:', err);
        // On error, also start fresh
        console.log('📊 Error during restoration, starting fresh from first scenario');
        setScenarioIndex(0);
        setScenarioResults([]);
        setScore(0);
        setHealth(100);
        setCombo(0);
        setTimer(0);
        setPlacedPieces({ violations: [], actions: [] });
        setCorrectPlacementIndex(0);
        setShowScenario(true);
      }
      setIsInitializing(false);
    }
    restoreProgress();
  }, [user?.id, currentModule, scenarios?.length, isReplayMode, hasCheckedProgress]);

  // Auto-save progress periodically (temporarily disabled)
  // useEffect(() => {
  //   let cleanup: (() => void) | undefined;
  //
  //   if (!isInitializing && user) {
  //     cleanup = persistence.enableAutoSave(30000); // Auto-save every 30 seconds
  //   }
  //
  //   return () => {
  //     if (cleanup) {
  //       cleanup();
  //     }
  //   };
  // }, [isInitializing, user]); // Removed persistence dependency

  // ===== CONTINUE GAME HANDLERS (DISABLED) =====
  const handleContinueGame = async () => {
    setShowContinueDialog(false);
    setIsInitializing(false);
  };

  const handleStartNewGame = async () => {
    setShowContinueDialog(false);
    setIsInitializing(false);
  };

  // ===== DND KIT SETUP =====
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    })
  );

  // ===== UI STATE & GAME STATE =====
  // const [isMenuOpen, setIsMenuOpen] = useState(false); // Unused
  // (moved all state declarations to top for auto-close feedback)

  // ===== DERIVED STATE =====
  // Removed unused: moduleId, displayName
  const scenario = scenarios?.[scenarioIndex];

  const correctViolations = useMemo(
    () =>
      scenario?.pieces.filter(
        (p: PuzzlePiece) => p.category === "violation" && p.isCorrect
      ) ?? [],
    [scenario]
  );

  const correctActions = useMemo(
    () =>
      scenario?.pieces.filter(
        (p: PuzzlePiece) => p.category === "action" && p.isCorrect
      ) ?? [],
    [scenario]
  );

  const availablePieces = useMemo(
    () =>
      scenario?.pieces.filter(
        (piece: PuzzlePiece) =>
          !placedPieces.violations.some((p) => p.id === piece.id) &&
          !placedPieces.actions.some((p) => p.id === piece.id)
      ) ?? [],
    [scenario, placedPieces]
  );

  // ===== STATS CALCULATION FUNCTIONS =====

  /**
   * Calculate comprehensive scenario score based on placement, health, and combo
   */
  const calculateScenarioScore = useCallback((
    correctPlacements: number,
    totalPieces: number,
    currentHealth: number,
    currentCombo: number,
    maxCombo: number
  ): number => {
    // Base score from correct placements (60% weight)
    const placementScore = totalPieces > 0 ? (correctPlacements / totalPieces) * 60 : 0;

    // Health bonus (25% weight) - reward maintaining high health
    const healthScore = (currentHealth / 100) * 25;

    // Combo bonus (15% weight) - reward consistent performance
    const comboScore = maxCombo > 0 ? (currentCombo / maxCombo) * 15 : 0;

    // Calculate final score and round to nearest integer
    const finalScore = Math.round(placementScore + healthScore + comboScore);

    // Cap at 100 points maximum
    return Math.min(finalScore, 100);
  }, []);

  /**
   * Clear current session progress data for a module (used when starting replay)
   * This clears incomplete scenarios but preserves completed module attempts for "last 3 tries"
   */
  const clearModuleProgress = useCallback(async (moduleId: string) => {
    if (!user?.id) return;

    try {
      console.log('🗑️ Clearing current session progress for replay...', { moduleId });

      // Delete incomplete scenario progress (not module completion records)
      // This allows users to start fresh while preserving their attempt history
      const { error } = await supabase
        .from('level3_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('is_completed', false); // Only delete incomplete scenarios

      if (error) {
        console.error('Error clearing current session progress:', error);
        return;
      }

      // Also delete any incomplete module completion records (is_module_complete = true but scenarios not all done)
      const { error: moduleError } = await supabase
        .from('level3_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('is_module_complete', true)
        .is('final_score', null); // Delete module records without final scores (incomplete)

      if (moduleError) {
        console.error('Error clearing incomplete module records:', moduleError);
      }

      console.log('✅ Current session progress cleared successfully');
    } catch (error) {
      console.error('Exception clearing current session progress:', error);
    }
  }, [user?.id]);

  /**
   * Save module completion attempt with last 3 tries tracking using existing table
   */
  const saveModuleAttempt = useCallback(async (
    moduleId: string,
    totalScore: number,
    totalTime: number,
    avgHealth: number,
    totalCombo: number,
    scenarioResults: ScenarioResult[]
  ) => {
    if (!user?.id) return;

    try {
      console.log('💾 Saving module attempt...', { moduleId, totalScore, totalTime });

      // Get existing module completion attempts for this user and module
      const { data: existingAttempts, error: fetchError } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('is_module_complete', true)
        .order('attempt_number', { ascending: true }); // Order by attempt_number for easier processing

      if (fetchError) {
        console.error('Error fetching existing attempts:', fetchError);
        return;
      }

      console.log('📊 Found existing attempts:', existingAttempts?.length || 0);
      if (existingAttempts && existingAttempts.length > 0) {
        console.log('📊 Existing attempt details:', existingAttempts.map(a => ({
          attempt_number: a.attempt_number,
          score: a.module_total_score,
          created_at: a.attempt_created_at
        })));
      }

      // Determine if this is a new top performance
      const isTopPerformance = !existingAttempts || existingAttempts.length === 0 ||
        totalScore > Math.max(...existingAttempts.map(a => a.module_total_score || 0));

      // Calculate next attempt number based on existing attempts
      let nextAttemptNumber = 1;

      if (existingAttempts && existingAttempts.length > 0) {
        // Sort attempts by attempt_number to ensure correct ordering
        const sortedAttempts = existingAttempts.sort((a, b) => a.attempt_number - b.attempt_number);
        console.log('📊 Existing attempts:', sortedAttempts.map(a => ({ attempt_number: a.attempt_number, score: a.module_total_score })));

        if (sortedAttempts.length >= 3) {
          // We have 3 attempts, need to remove oldest and shift
          console.log('🔄 Managing last 3 attempts constraint...');

          // Delete the oldest attempt (lowest attempt_number)
          const oldestAttempt = sortedAttempts[0];
          await supabase
            .from('level3_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('module_id', moduleId)
            .eq('attempt_number', oldestAttempt.attempt_number);

          console.log('🗑️ Deleted oldest attempt:', oldestAttempt.attempt_number);

          // Shift remaining attempts down by 1
          for (let i = 1; i < sortedAttempts.length; i++) {
            const attempt = sortedAttempts[i];
            const newAttemptNumber = attempt.attempt_number - 1;

            await supabase
              .from('level3_progress')
              .update({ attempt_number: newAttemptNumber })
              .eq('user_id', user.id)
              .eq('module_id', moduleId)
              .eq('attempt_number', attempt.attempt_number);

            console.log(`🔄 Shifted attempt ${attempt.attempt_number} → ${newAttemptNumber}`);
          }

          nextAttemptNumber = 3; // New attempt becomes #3
        } else {
          // Less than 3 attempts, just increment
          const maxAttemptNumber = Math.max(...sortedAttempts.map(a => a.attempt_number));
          nextAttemptNumber = maxAttemptNumber + 1;
        }
      }

      console.log('🎯 Next attempt number will be:', nextAttemptNumber);

      // Clear any existing top performance flags if this is a new top performance
      if (isTopPerformance) {
        await supabase
          .from('level3_progress')
          .update({ is_top_performance: false })
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .eq('is_top_performance', true);
      }

      // Insert module completion summary record
      const moduleCompletionRecord = {
        user_id: user.id,
        module_id: moduleId,
        scenario_index: -1, // Special value to indicate this is a module summary
        final_score: totalScore,
        total_score: totalScore,
        total_time: totalTime,
        scenario_results: scenarioResults,
        placed_pieces: null,
        is_completed: true,
        score: totalScore,
        health: Math.round(avgHealth),
        combo: totalCombo,
        attempt_number: nextAttemptNumber,
        is_module_complete: true,
        module_total_score: totalScore,
        module_total_time: totalTime,
        module_avg_health: avgHealth,
        module_total_combo: totalCombo,
        module_scenario_results: scenarioResults,
        is_top_performance: isTopPerformance,
        attempt_created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('level3_progress')
        .insert([moduleCompletionRecord]);

      if (insertError) {
        console.error('Error saving module attempt:', insertError);
        return;
      }

      if (isTopPerformance) {
        console.log('🏆 New top performance recorded!');
      }

      console.log('✅ Module attempt saved successfully', {
        attemptNumber: nextAttemptNumber,
        isTopPerformance,
        totalScore,
        moduleId
      });

      // Verify the save by querying the attempts again
      const { data: verifyAttempts } = await supabase
        .from('level3_progress')
        .select('attempt_number, module_total_score, is_top_performance')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('is_module_complete', true)
        .order('attempt_number', { ascending: true });

      console.log('🔍 Verification - All attempts after save:', verifyAttempts);
    } catch (error) {
      console.error('Exception saving module attempt:', error);
    }
  }, [user?.id]);

  /**
   * Calculate overall stats from scenario results
   */
  const calculateOverallStats = useCallback(
    (results: ScenarioResult[], totalTime: number): OverallStats => {
      if (results.length === 0) {
        return { totalScore: 0, totalCombo: 0, avgHealth: 0, totalTime: 0 };
      }

      let totalScore = 0;
      let totalCombo = 0;
      let totalHealth = 0;

      results.forEach((result) => {
        totalScore += result.score;
        totalCombo += result.combo;
        totalHealth += result.health;
      });

      const avgHealth = parseFloat((totalHealth / results.length).toFixed(2));

      return {
        totalScore,
        totalCombo,
        avgHealth,
        totalTime,
      };
    },
    []
  );

  // ===== GAME LOGIC HANDLERS =====

  // (Removed unused isValidUUID helper)

  /**
   * Handle piece drop on containers
   */
  const handleDrop = useCallback(
    async (containerType: "violations" | "actions", piece: PuzzlePiece) => {
      // Validate if the piece is being dropped in the right container type
      const isCorrectCategory =
        (containerType === "violations" && piece.category === "violation") ||
        (containerType === "actions" && piece.category === "action");

      if (!isCorrectCategory) {
        setFeedback("WRONG CATEGORY! Try the other container, Agent!");
        setHealth((prev) => Math.max(0, prev - 10));
        setCombo(0);
        return { success: false };
      }

      // Check if the piece is already placed somewhere
      const isAlreadyPlaced =
        placedPieces.violations.some((p) => p.id === piece.id) ||
        placedPieces.actions.some((p) => p.id === piece.id);

      if (isAlreadyPlaced) {
        setFeedback("Already placed! Try another piece!");
        return { success: false };
      }

      // Update state based on whether the piece is correct
      if (piece.isCorrect) {
        // Calculate the updated placed pieces
        const updatedPlacedPieces = {
          ...placedPieces,
          [containerType]: [...placedPieces[containerType], piece],
        };

        // Check for completion before updating state
        const totalViolations = correctViolations.length;
        const totalActions = correctActions.length;
        const isScenarioComplete =
          updatedPlacedPieces.violations.length === totalViolations &&
          updatedPlacedPieces.actions.length === totalActions;

        // Update placed pieces state
        setPlacedPieces(updatedPlacedPieces);

        // Set completion state with delay for UX
        if (isScenarioComplete) {
          setTimeout(() => {
            setIsComplete(true);
          }, 400);
        }

        setFeedback("CRITICAL HIT! Perfect placement!");

        // Update placement tracking and combo
        const newCorrectPlacements = correctPlacementIndex + 1;
        const newCombo = combo + 1;
        const totalCorrectPieces = correctViolations.length + correctActions.length;

        // Calculate comprehensive score based on placement, health, and combo
        const maxPossibleCombo = totalCorrectPieces; // Maximum combo is total pieces
        const newScore = calculateScenarioScore(
          newCorrectPlacements,
          totalCorrectPieces,
          health,
          newCombo,
          maxPossibleCombo
        );

        // Update state
        setScore(newScore);
        setCorrectPlacementIndex(newCorrectPlacements);
        setCombo(newCombo);

        // Save progress to Supabase after every successful placement
        try {
          // Get module ID for saving
          let moduleId: string = "1";
          if (
            typeof currentModule === "object" &&
            currentModule !== null &&
            "id" in currentModule
          ) {
            moduleId = (currentModule as any).id.toString();
          } else if (typeof currentModule === "number") {
            moduleId = (currentModule as number).toString();
          }

          await saveProgressToSupabase({
            userId: user?.id || null,
            moduleId,
            scenarioIndex,
            finalScore: newScore,
            totalScore: newScore,
            totalTime: timer,
            scenarioResults,
            placedPieces: updatedPlacedPieces,
            isCompleted: isScenarioComplete, // Set to true when last piece is placed
            score: newScore,
            health,
            combo: newCombo,
          });
        } catch (err) {
          console.error('Error saving progress on drag-and-drop:', err);
        }

        return { success: true };
      } else {
        setFeedback("\uD83D\uDCA5 MISS! Analyze the scenario more carefully!");
        const newHealth = Math.max(0, health - 15);
        const newCombo = 0; // Reset combo on incorrect placement

        // Recalculate score with reduced health and reset combo
        const totalCorrectPieces = correctViolations.length + correctActions.length;
        const maxPossibleCombo = totalCorrectPieces;
        const recalculatedScore = calculateScenarioScore(
          correctPlacementIndex,
          totalCorrectPieces,
          newHealth,
          newCombo,
          maxPossibleCombo
        );

        setHealth(newHealth);
        setCombo(newCombo);
        setScore(recalculatedScore);
        return { success: false };
      }
    },
    [placedPieces, combo, correctViolations.length, correctActions.length, currentModule, user?.id, scenarioIndex, score, timer, scenarioResults, health, correctPlacementIndex, calculateScenarioScore]
  );

  /**
   * Handle victory popup close and scenario transition
   */
  const handleVictoryClose = useCallback(async () => {
    // Store the current scenario result (without timer - timer runs continuously)
    const currentResult: ScenarioResult = {
      score,
      combo,
      health,
      scenarioIndex,
    };

    const updatedResults = [...scenarioResults, currentResult];
    setScenarioResults(updatedResults);

    // Scenario was already saved as completed when the last piece was placed
    // Just update the scenario results in the database for reference
    try {
      let moduleId: string = "1";
      if (
        typeof currentModule === "object" &&
        currentModule !== null &&
        "id" in currentModule
      ) {
        moduleId = (currentModule as any).id.toString();
      } else if (typeof currentModule === "number") {
        moduleId = (currentModule as number).toString();
      }

      // Update with the complete scenario results array
      await saveProgressToSupabase({
        userId: user?.id || null,
        moduleId,
        scenarioIndex,
        finalScore: score,
        totalScore: score,
        totalTime: timer,
        scenarioResults: updatedResults, // Updated results array
        placedPieces,
        isCompleted: true, // Already completed
        score,
        health,
        combo,
      });
    } catch (err) {
      console.error('Error updating scenario results:', err);
    }

    // Check if this was the last scenario
    const isLastScenario = scenarioIndex >= (scenarios?.length ?? 0) - 1;

    if (isLastScenario) {
      // All scenarios completed - show final stats
      setIsComplete(false);
      setShowFinalStats(true);
    } else {
      // Move to next scenario (timer continues running)
      setScenarioIndex((idx) => idx + 1);
      setPlacedPieces({ violations: [], actions: [] });
      setIsComplete(false);
      setCombo(0);
      setHealth(100);
      setScore(0); // Reset score for each scenario
      setCorrectPlacementIndex(0); // Reset placement index for new scenario
      setUserClosedScenario(false); // Reset user close flag for new scenario
      setShowScenario(true);
    }
  }, [scenarioIndex, scenarios?.length, score, health, combo, scenarioResults, currentModule, user?.id, timer, placedPieces]);

  // ===== PROGRESS SAVING =====
  // Temporarily disabled auto-save to prevent infinite re-renders
  // Auto-save will be handled by the persistence hook's interval-based approach

  // ===== EFFECTS =====

  // Preload background image on mount
  useEffect(() => {
    preloadImage(BACKGROUND_IMAGE_URL);
  }, []);

  // ===== CONDITIONAL RENDERING =====

  // Force landscape mode
  if (!isHorizontal) {
    return <DeviceRotationPrompt />;
  }

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-cyan-100 font-bold">Loading Game...</div>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER - PIXEL/RETRO STYLE =====
  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const piece = availablePieces.find((p) => p.id === event.active.id);
        setActiveDragPiece(piece || null);
      }}
      onDragEnd={async (event) => {
        setActiveDragPiece(null);
        if (event.over && event.active) {
          const containerType = event.over.id;
          const piece = availablePieces.find((p) => p.id === event.active.id);
          if (
            (containerType === "violations" || containerType === "actions") &&
            piece
          ) {
            await handleDrop(containerType, piece);
          }
        }
      }}
      onDragCancel={() => setActiveDragPiece(null)}
      autoScroll={true}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      {/* DragPieceOverlay component */}
      <DragPieceOverlay activeDragPiece={activeDragPiece} isMobile={isMobile} />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src="/backgrounds/m1l3.webp"
          alt="Level 3 Background"
          className="w-full h-full object-cover object-center absolute inset-0 z-0"
          style={{ filter: "brightness(0.7) contrast(1.1)" }}
          draggable={false}
        />
        {/* Optional: dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none z-20">
        <div className="grid-pattern"></div>
      </div>

      {/* Main Game Layout */}
      <div
        className={`relative z-10 h-screen flex flex-col items-center justify-center ${
          isMobile ? "p-2" : "p-6"
        }`}
      >
        {/* Navbar - Pixel/Retro style, extra compact on mobile horizontal */}
        <nav className="w-full mx-auto sticky top-0 z-10">
          <div
            className={`w-full flex flex-col md:flex-row items-center bg-gradient-to-r from-gray-900 via-indigo-900 to-blue-900 pixel-border-thick
              ${isMobile && isHorizontal ? "p-1 mt-1 mb-2" : "p-2 mt-2 mb-4"}`}
          >
            <div className="flex w-full items-center justify-between">
              {/* Back Button + Timer */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  className={`pixel-border bg-gray-800 hover:bg-gray-700 text-cyan-100 flex items-center ${
                    isMobile && isHorizontal
                      ? "gap-0.5 px-1 py-0.5 text-xs"
                      : "gap-1 px-2 py-1"
                  } font-bold transition-all duration-150 active:scale-95`}
                  style={{ borderRadius: 4 }}
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                >
                  <ArrowLeft
                    className={`${
                      isMobile && isHorizontal ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  <span
                    className={`${
                      isMobile && isHorizontal ? "hidden" : "hidden sm:inline"
                    }`}
                  >
                    Back
                  </span>
                </button>
                {/* Timer Display */}
                <div
                  className={`pixel-border bg-gray-900 text-cyan-200 font-mono flex items-center gap-1 ${
                    isMobile && isHorizontal
                      ? "px-1 py-0.5 text-xs"
                      : "px-2 py-1"
                  }`}
                  style={{ borderRadius: 4 }}
                >
                  <Icon
                    icon="mdi:timer-outline"
                    className={`text-cyan-300 ${
                      isMobile && isHorizontal ? "w-3 h-3" : "w-4 h-4"
                    }`}
                  />
                  <span className={isMobile && isHorizontal ? "text-xs" : ""}>
                    {`${Math.floor(timer / 60)
                      .toString()
                      .padStart(2, "0")}:${(timer % 60)
                      .toString()
                      .padStart(2, "0")}`}
                  </span>
                </div>
              </div>
              {/* Centered Game Title and Level Info - absolutely centered */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                <div
                  className={`${
                    isMobile && isHorizontal ? "w-6 h-6" : "w-8 h-8"
                  } bg-indigo-700 pixel-border flex items-center justify-center`}
                >
                  <Crown
                    className={`${
                      isMobile && isHorizontal ? "w-3.5 h-3.5" : "w-4 h-4"
                    } text-yellow-300`}
                  />
                </div>
                <div className="text-center">
                  <h1
                    className={`pixel-text tracking-wider leading-none drop-shadow-glow font-black text-cyan-100 ${
                      isMobile && isHorizontal ? "text-base" : "text-lg"
                    }`}
                  >
                    GMP QUEST
                  </h1>
                  <div
                    className={`text-blue-200 font-bold tracking-widest leading-none ${
                      isMobile && isHorizontal ? "text-[10px]" : "text-xs"
                    }`}
                  >
                    LEVEL 3: JIGSAW
                  </div>
                </div>
                <div
                  className={`${
                    isMobile && isHorizontal ? "w-6 h-6" : "w-8 h-8"
                  } bg-blue-700 pixel-border flex items-center justify-center`}
                >
                  <Gamepad2
                    className={`${
                      isMobile && isHorizontal ? "w-3.5 h-3.5" : "w-4 h-4"
                    } text-cyan-200`}
                  />
                </div>
              </div>
              {/* Mission Briefing Button */}
              <div
                className={`flex-shrink-0 flex items-center ml-2 ${
                  !(isMobile && isHorizontal) && "hidden"
                }`}
              >
                <button
                  className={`pixel-border bg-yellow-700 hover:bg-yellow-600 text-black flex items-center font-bold transition-all duration-150 active:scale-95 ${
                    isMobile && isHorizontal
                      ? "gap-0.5 px-1 py-0.5 text-xs"
                      : "gap-1 px-2 py-1"
                  }`}
                  style={{ borderRadius: 4 }}
                  onClick={() => setShowBriefing(true)}
                  aria-label="Show Mission Briefing"
                >
                  <Icon
                    icon="mdi:message-bulleted"
                    className={`${
                      isMobile && isHorizontal ? "w-4 h-4" : "w-5 h-5"
                    } text-yellow-300`}
                  />
                  <span
                    className={`${
                      isMobile && isHorizontal ? "hidden" : "hidden sm:inline"
                    }`}
                  >
                    Mission Briefing
                  </span>
                </button>
              </div>
              {/* Stats HUD - right aligned */}
              <div className="flex-shrink-0 flex items-center ml-auto">
                <div
                  className={`flex flex-row justify-center items-center ${
                    isMobile && isHorizontal ? "gap-1" : "gap-2 md:gap-4"
                  }`}
                >
                  <div
                    className={`pixel-border bg-blue-800/80 flex flex-col items-center ${
                      isMobile && isHorizontal
                        ? "px-1 py-0.5 min-w-[38px]"
                        : "px-2 py-1 min-w-[60px]"
                    }`}
                  >
                    <span
                      className={`text-blue-200 font-bold leading-none ${
                        isMobile && isHorizontal ? "text-[8px]" : "text-[10px]"
                      }`}
                    >
                      SCORE
                    </span>
                    <span
                      className={`text-cyan-100 font-black leading-none ${
                        isMobile && isHorizontal ? "text-xs" : "text-base"
                      }`}
                    >
                      {score}
                    </span>
                  </div>
                  <div
                    className={`pixel-border bg-fuchsia-900/80 flex flex-col items-center ${
                      isMobile && isHorizontal
                        ? "px-1 py-0.5 min-w-[38px]"
                        : "px-2 py-1 min-w-[60px]"
                    }`}
                  >
                    <span
                      className={`text-pink-200 font-bold leading-none ${
                        isMobile && isHorizontal ? "text-[8px]" : "text-[10px]"
                      }`}
                    >
                      HEALTH
                    </span>
                    <span
                      className={`text-pink-100 font-black leading-none ${
                        isMobile && isHorizontal ? "text-xs" : "text-base"
                      }`}
                    >
                      {health}
                    </span>
                  </div>
                  <div
                    className={`pixel-border bg-yellow-700/80 flex flex-col items-center ${
                      isMobile && isHorizontal
                        ? "px-1 py-0.5 min-w-[38px]"
                        : "px-2 py-1 min-w-[60px]"
                    }`}
                  >
                    <span
                      className={`text-yellow-200 font-bold leading-none ${
                        isMobile && isHorizontal ? "text-[8px]" : "text-[10px]"
                      }`}
                    >
                      COMBO
                    </span>
                    <span
                      className={`text-yellow-100 font-black leading-none ${
                        isMobile && isHorizontal ? "text-xs" : "text-base"
                      }`}
                    >
                      {combo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mission Briefing - Pixel/Retro style (dynamic) */}
        {/* Mission Briefing Popup */}
        <AnimatePresence>
          {showBriefing && scenario?.description && (
            <motion.div
              key="mission-briefing-popup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <div className="pixel-border-thick bg-gradient-to-r from-indigo-900 via-blue-900 to-fuchsia-900 text-cyan-100 px-6 py-6 text-base md:text-lg font-mono tracking-wide shadow-2xl text-center max-w-xl mx-auto relative">
                <span className="font-bold text-yellow-200 text-lg block mb-2">
                  MISSION BRIEFING
                </span>
                <div className="mb-4 text-cyan-100">{scenario.description}</div>
                <button
                  className="pixel-border bg-yellow-700 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded mt-2"
                  onClick={() => setShowBriefing(false)}
                  aria-label="Close Mission Briefing"
                >
                  Close
                </button>
                <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Game Area - Pixel/Retro style */}
        <main className="flex-1 flex flex-col h-full w-full max-w-6xl mx-auto relative z-10">
          {/* Scenario Dialog Overlay */}
          <AnimatePresence>
            {showScenario && scenario && (
              <motion.div
                key="scenario-dialog"
                initial={{ opacity: 0, scale: 1, y: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <ScenarioDialog
                  scenario={scenario}
                  onClose={() => {
                    console.log("👤 User manually closed scenario dialog");
                    setShowScenario(false);
                    setUserClosedScenario(true);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mission Briefing - Pixel/Retro style (dynamic) */}
          {scenario?.description && (
            <div
              className={`w-full max-w-3xl mx-auto mb-2 md:mb-4 px-2 md:px-0${
                isMobile && isHorizontal ? " hidden" : ""
              }`}
            >
              <div className="pixel-border bg-gradient-to-r from-indigo-900 via-blue-900 to-fuchsia-900 text-cyan-100 px-3 py-2 md:py-3 text-xs md:text-sm font-mono tracking-wide shadow-lg text-center">
                <span className="font-bold text-yellow-200">
                  MISSION BRIEFING:
                </span>{" "}
                {scenario.description}
              </div>
            </div>
          )}

          {/* Main Game Area - Now using CSS Grid for layout, with pixel borders */}
          <div
            className="flex-1 flex flex-row gap-2 md:gap-4 items-stretch justify-center w-full"
            style={{
              maxHeight:
                isHorizontal && !isMobile ? "calc(100vh - 64px)" : "100vh",
              minHeight: 0,
            }}
          >
            {/* Violations Container */}
            <section className="flex-1 min-w-[180px] max-w-[400px] h-full flex flex-col items-center justify-start">
              <JigsawContainer
                type="violations"
                pieces={placedPieces.violations}
                maxPieces={correctViolations.length}
              />
              <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
            </section>

            {/* Arsenal */}
            <section className="flex-1 min-w-[180px] max-w-[400px] h-full flex flex-col items-center justify-start">
              <Arsenal
                availablePieces={availablePieces}
                isMobile={isMobile}
                isHorizontal={isHorizontal}
                arsenalRef={arsenalRef}
              />
              <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
            </section>

            {/* Actions Container */}
            <section className="flex-1 min-w-[180px] max-w-[400px] h-full flex flex-col items-center justify-start">
              <JigsawContainer
                type="actions"
                pieces={placedPieces.actions}
                maxPieces={correctActions.length}
              />
              <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none"></div>
            </section>
          </div>

          {/* Feedback Console - Pixel/Retro style */}
          {feedback && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="pixel-border-thick bg-gradient-to-r from-cyan-700 via-blue-800 to-purple-800 shadow-2xl px-6 py-4 relative overflow-hidden min-w-[220px] max-w-[90vw] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4">
                {/* Scan Lines */}
                <div className="absolute inset-0 bg-scan-lines opacity-20 pointer-events-none z-0"></div>
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 blur-lg pointer-events-none z-0"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <Icon
                    icon="mdi:message-bulleted"
                    className="text-yellow-300 w-6 h-6 drop-shadow-glow animate-pulse"
                  />
                  <span className="text-white font-black text-base pixel-text tracking-wide drop-shadow-glow">
                    {feedback}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Victory Popup - Pixel/Retro style overlay */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                key="victory-popup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <VictoryPopup
                  onClose={handleVictoryClose}
                  score={Number(score)}
                  health={health}
                  combo={combo}
                  open={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final Stats Popup - Level Complete */}
          <AnimatePresence>
            {showFinalStats && (
              <motion.div
                key="final-stats-popup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <FinalStatsPopup
                  scenarioResults={scenarioResults}
                  overallStats={calculateOverallStats(scenarioResults, timer)}
                  currentModule={
                    typeof currentModule === "object" &&
                    currentModule !== null &&
                    "id" in currentModule
                      ? (currentModule as any).id
                      : currentModule
                  }
                  getTopThreeBestScores={safeGetTopThreeBestScores}
                  onClose={async () => {
                    console.log("🎯 Level 3 module completed! Saving module attempt...");

                    // Calculate overall stats for this module attempt
                    const overallStats = calculateOverallStats(scenarioResults, timer);

                    // Get module ID for saving
                    let moduleId: string = "1";
                    if (
                      typeof currentModule === "object" &&
                      currentModule !== null &&
                      "id" in currentModule
                    ) {
                      moduleId = (currentModule as any).id.toString();
                    } else if (typeof currentModule === "number") {
                      moduleId = (currentModule as number).toString();
                    }

                    // Save this module attempt with last 3 tries tracking
                    await saveModuleAttempt(
                      moduleId,
                      overallStats.totalScore,
                      overallStats.totalTime,
                      overallStats.avgHealth,
                      overallStats.totalCombo,
                      scenarioResults
                    );

                    // Reset ALL game state variables for complete replay
                    console.log("🔄 Resetting all game state for replay...");

                    // Note: Module attempt was already saved in the saveModuleAttempt call above
                    // Now clear current session progress for clean replay (but preserve completed attempts)
                    await clearModuleProgress(moduleId);

                    // Core game state
                    setShowFinalStats(false);
                    setScenarioIndex(0);
                    setScenarioResults([]);
                    setScore(0);
                    setHealth(100);
                    setCombo(0);
                    setTimer(0);
                    setPlacedPieces({ violations: [], actions: [] });
                    setCorrectPlacementIndex(0);

                    // UI state - initially hide scenario dialog
                    setShowScenario(false);
                    setShowBriefing(false);
                    setIsComplete(false);
                    setFeedback("");
                    setActiveDragPiece(null);

                    // Initialization state
                    setShowContinueDialog(false);
                    setIsInitializing(false); // Don't trigger initialization
                    setHasCheckedProgress(true); // Skip progress check
                    setIsReplayMode(true); // Enable replay mode for auto-show
                    setUserClosedScenario(false); // Reset user close flag for replay

                    // Clear timer interval if running and restart it
                    if (timerRef.current) {
                      clearInterval(timerRef.current);
                      timerRef.current = null;
                    }

                    // Show first scenario after state reset (timer will start when scenario is closed)
                    setTimeout(() => {
                      // Don't start timer here - it will start automatically when user closes scenario dialog
                      console.log("⏱️ Timer will start when user closes scenario dialog and begins playing");

                      // Ensure scenarios are loaded and show first scenario dialog
                      if (scenarios && scenarios.length > 0) {
                        console.log("🎯 Showing first scenario for replay...", scenarios[0]?.title);
                        setShowScenario(true);
                        setIsReplayMode(false); // Reset replay mode since we're showing manually
                      } else {
                        console.log("⚠️ Scenarios not loaded yet, will show when available via useEffect");
                        // Scenarios will be loaded by the useEffect and showScenario will be triggered
                      }
                    }, 200); // Delay to ensure state is fully reset

                    console.log("✅ Complete game reset for replay finished");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Continue Game Dialog (temporarily disabled) */}
      {/* <AnimatePresence>
        {showContinueDialog && (
          <ContinueGameDialog
            isOpen={showContinueDialog}
            onClose={() => setShowContinueDialog(false)}
            onContinue={handleContinueGame}
            onStartNew={handleStartNewGame}
            progressSummary={null}
            isLoading={false}
          />
        )}
      </AnimatePresence> */}

      {/* Performance Test - development only */}
      {process.env.NODE_ENV === "development" && (
        <>
          {/* <PerformanceTest /> */}
        </>
      )}

      {/* Debug Component - temporarily disabled */}
      {/* {process.env.NODE_ENV === 'development' && <Level3Debug />} */}
    </DndContext>
  );
};
