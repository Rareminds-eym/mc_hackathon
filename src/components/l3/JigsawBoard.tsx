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
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

// Internal Components and Hooks
import { JigsawContainer } from "./JigsawContainer";

import { ScenarioDialog } from "./ScenarioDialog";
import { VictoryPopup } from "../ui/Popup";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useAuth } from "../../contexts/AuthContext";
import { RootState } from "../../store/types";
import { supabase } from "../../lib/supabase";

// Extracted Components
import {
  GameHeader,
  Arsenal,
  FeedbackConsole,
  DeviceRotationPrompt,
  LoadingState,
  DragPieceOverlay,
} from "./components";

// Utilities and Hooks
import {
  BACKGROUND_IMAGE_URL,
  preloadImage,
  getModuleIdFromPath,
} from "./utils/gameUtils";

// Types
import type { PuzzlePiece } from "../../data/level3Scenarios";
import { GameProgress } from "./types/gameTypes";

/**
 * JigsawBoard Component
 *
 * A gamified drag-and-drop puzzle interface where users identify violations
 * and place appropriate actions to fix them.
 */
export const JigsawBoard: React.FC = () => {
  // ===== HOOKS & CONTEXT =====
  const { user } = useAuth();
  const { isMobile, isHorizontal } = useDeviceLayout();
  const arsenalRef = useRef<HTMLDivElement>(null);

  // Redux state
  const scenarios = useSelector((state: RootState) => state.level3.scenarios);

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

  // ===== UI STATE =====
  const [showScenario, setShowScenario] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDragPiece, setActiveDragPiece] = useState<PuzzlePiece | null>(
    null
  );

  // ===== GAME STATE =====
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentScenarioPoints, setCurrentScenarioPoints] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [placedPieces, setPlacedPieces] = useState<{
    violations: PuzzlePiece[];
    actions: PuzzlePiece[];
  }>({
    violations: [],
    actions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // ===== DERIVED STATE =====
  const moduleId = getModuleIdFromPath();
  const displayName = user?.user_metadata?.full_name || user?.email || "Player";
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

  // ===== GAME LOGIC HANDLERS =====

  /**
   * Load game progress from database
   */
  const loadGameProgress = useCallback(async () => {
    if (!user?.id || !moduleId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("level3_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error loading progress:", error);
        setIsLoading(false);
        return;
      }

      // If we have saved progress, restore it
      if (data && data.length > 0) {
        const savedProgress = data[0] as GameProgress;

        if (savedProgress.completed) {
          // If the saved scenario is completed, advance to the next scenario
          if (savedProgress.scenario_index < scenarios?.length - 1) {
            // Move to the next scenario
            setScenarioIndex(savedProgress.scenario_index + 1);
            setScore(savedProgress.score); // Preserve the score
            setCurrentScenarioPoints(0); // Reset points for the new scenario
            setHealth(100); // Reset health for the new scenario
            setCombo(0); // Reset combo for the new scenario
            setPlacedPieces({ violations: [], actions: [] }); // Clear placed pieces
            setInitialized(true);
            setShowScenario(true); // Show scenario dialog for new scenario

            // Show message about advancing to next scenario
            setTimeout(() => {
              setFeedback("🎮 Welcome back! Advancing to the next scenario.");
            }, 1000);
          } else {
            // If all scenarios are completed, just restore the state
            setScenarioIndex(savedProgress.scenario_index);
            setScore(savedProgress.score);
            // For completed scenarios, use the saved score directly
            setCurrentScenarioPoints(100); // Completed scenarios always have full points
            setHealth(savedProgress.health);
            setCombo(savedProgress.combo);
            setPlacedPieces(savedProgress.placed_pieces);
            setInitialized(true);
            setIsComplete(true); // Set completion flag to prevent re-triggering completion logic
            setShowScenario(false);
          }
        } else {
          // Restore in-progress scenario
          setScenarioIndex(savedProgress.scenario_index);
          setScore(savedProgress.score);
          // Calculate current scenario points based on placed pieces
          const totalCorrectPieces =
            correctViolations.length + correctActions.length;
          const pointsPerPiece = Math.floor(100 / totalCorrectPieces);
          const calculatedPoints = Math.min(
            100,
            (savedProgress.placed_pieces.violations.length +
              savedProgress.placed_pieces.actions.length) *
              pointsPerPiece
          );
          setCurrentScenarioPoints(calculatedPoints);
          setHealth(savedProgress.health);
          setCombo(savedProgress.combo);
          setPlacedPieces(savedProgress.placed_pieces);
          setInitialized(true);

          // Don't show scenario dialog if user was in the middle of a scenario
          if (
            savedProgress.placed_pieces.violations.length > 0 ||
            savedProgress.placed_pieces.actions.length > 0
          ) {
            setShowScenario(false);

            // Show welcome back message using the feedback console
            setTimeout(() => {
              setFeedback("🔄 Welcome back! Your progress has been restored.");
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, moduleId]);

  /**
   * Reset game progress
   */
  const resetProgress = useCallback(async () => {
    setScenarioIndex(0);
    setScore(0);
    setCurrentScenarioPoints(0);
    setHealth(100);
    setCombo(0);
    setPlacedPieces({ violations: [], actions: [] });
    setShowScenario(true);
    setIsComplete(false);

    // Show feedback message
    setFeedback("🔄 Progress reset! Starting fresh.");

    // Reset database record if user is logged in
    if (user?.id && moduleId) {
      try {
        await supabase
          .from("level3_progress")
          .delete()
          .match({ user_id: user.id, module_id: moduleId });
      } catch (error) {
        console.error("Error resetting progress:", error);
      }
    }
  }, [user?.id, moduleId]);

  /**
   * Handle piece drop on containers
   */
  const handleDrop = useCallback(
    (containerType: "violations" | "actions", piece: PuzzlePiece) => {
      setInitialized(true);

      // Validate if the piece is being dropped in the right container type
      const isCorrectCategory =
        (containerType === "violations" && piece.category === "violation") ||
        (containerType === "actions" && piece.category === "action");

      if (!isCorrectCategory) {
        setFeedback("⚠️ WRONG CATEGORY! Try the other container, Agent!");
        setHealth((prev) => Math.max(0, prev - 10));
        setCombo(0);
        return { success: false };
      }

      // Check if the piece is already placed somewhere
      const isAlreadyPlaced =
        placedPieces.violations.some((p) => p.id === piece.id) ||
        placedPieces.actions.some((p) => p.id === piece.id);

      if (isAlreadyPlaced) {
        setFeedback("⚠️ Already placed! Try another piece!");
        return { success: false };
      }

      // Update state based on whether the piece is correct
      if (piece.isCorrect) {
        setPlacedPieces((prev) => ({
          ...prev,
          [containerType]: [...prev[containerType], piece],
        }));
        setFeedback("🎯 CRITICAL HIT! Perfect placement!");

        // Calculate points per correct piece based on total correct pieces
        const totalCorrectPieces =
          correctViolations.length + correctActions.length;
        const pointsPerPiece = Math.floor(100 / totalCorrectPieces);

        // Update current scenario points and total score
        setCurrentScenarioPoints((prev) => {
          const newPoints = Math.min(100, prev + pointsPerPiece);
          // Update total score with just the incremental points
          setScore((prevScore) => prevScore + (newPoints - prev));
          return newPoints;
        });

        setCombo((prev) => prev + 1);
        return { success: true };
      } else {
        setFeedback("💥 MISS! Analyze the scenario more carefully!");
        setHealth((prev) => Math.max(0, prev - 15));
        setCombo(0);
        return { success: false };
      }
    },
    [placedPieces, combo, correctViolations.length, correctActions.length]
  );

  /**
   * Handle victory popup close and scenario transition
   */
  const handleVictoryClose = useCallback(async () => {
    // First mark current scenario as completed and save it
    if (isComplete && user?.id) {
      // Construct the completed progress object for current scenario
      const completedProgress: GameProgress = {
        user_id: user.id,
        module_id: moduleId,
        scenario_index: scenarioIndex,
        score,
        health,
        combo,
        placed_pieces: placedPieces,
        completed: true,
        created_at: new Date().toISOString(),
      };

      try {
        // Save the completed state
        await supabase.from("level3_progress").upsert(completedProgress, {
          onConflict: "user_id,scenario_index",
          ignoreDuplicates: false,
        });
      } catch (error) {
        console.error("Error saving completed state:", error);
      }
    }

    // Then proceed to next scenario or clear completion state
    if (scenarioIndex < scenarios?.length - 1) {
      setScenarioIndex((idx) => idx + 1);
      setPlacedPieces({ violations: [], actions: [] });
      setIsComplete(false);
      setCombo(0);
      setHealth(100);
      setCurrentScenarioPoints(0); // Reset points for new scenario
      setScore(0); // Reset score for each scenario
      setShowScenario(true);
    } else {
      setIsComplete(false);
    }
  }, [
    scenarioIndex,
    scenarios?.length,
    isComplete,
    user?.id,
    moduleId,
    score,
    health,
    combo,
    placedPieces,
  ]);

  /**
   * Save game progress to database
   */
  const saveGameProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Construct the progress object
      const progress: GameProgress = {
        user_id: user.id,
        module_id: moduleId,
        scenario_index: scenarioIndex,
        score,
        health,
        combo,
        placed_pieces: placedPieces,
        completed: isComplete,
        created_at: new Date().toISOString(),
      };

      // Use upsert operation (conflict only on user_id and scenario_index)
      const { error } = await supabase
        .from("level3_progress")
        .upsert(progress, {
          onConflict: "user_id,scenario_index",
          ignoreDuplicates: false,
        });

      // Log any errors but don't disrupt gameplay
      if (error) {
        console.error("Error saving progress:", error);
      }
    } catch (error) {
      // Capture and log any unexpected errors
      console.error("Unexpected error saving progress:", error);
    }
  }, [
    user?.id,
    moduleId,
    scenarioIndex,
    score,
    health,
    combo,
    placedPieces,
    isComplete,
  ]);

  // ===== EFFECTS =====

  // Preload background image on mount
  useEffect(() => {
    preloadImage(BACKGROUND_IMAGE_URL);
  }, []);

  // Load saved game progress on mount
  useEffect(() => {
    loadGameProgress();
  }, [loadGameProgress]);

  // Save game progress when game state changes
  useEffect(() => {
    if (initialized) saveGameProgress();
  }, [
    initialized,
    saveGameProgress,
    isComplete, // Make sure we save when completion status changes
    placedPieces, // Save when pieces are placed
    score, // Save when score changes
  ]);

  // Load game progress on user and moduleId change
  useEffect(() => {
    if (user && moduleId) {
      loadGameProgress();
    }
  }, [user, moduleId, loadGameProgress]);

  // Reset arsenal scroll position when scenario changes
  useEffect(() => {
    if (arsenalRef.current) arsenalRef.current.scrollTop = 0;
  }, [scenarioIndex]);

  // Check for game completion
  useEffect(() => {
    // Skip if already marked as complete to prevent re-adding points
    if (isComplete) return;

    const totalCorrect = correctViolations.length + correctActions.length;
    const placedCorrect =
      placedPieces.violations.length + placedPieces.actions.length;

    if (placedCorrect === totalCorrect && totalCorrect > 0) {
      setIsComplete(true);

      // Make sure we give exactly 100 points total for the scenario
      setCurrentScenarioPoints((prev) => {
        const remainingPoints = 100 - prev;
        if (remainingPoints > 0) {
          setScore((prevScore) => prevScore + remainingPoints);
          return 100;
        }
        return prev;
      });

      setFeedback("");
    }
  }, [
    placedPieces,
    isComplete,
    correctViolations.length,
    correctActions.length,
  ]);

  // Auto-dismiss feedback after timeout
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(""), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  // ===== CONDITIONAL RENDERING =====

  // Force landscape mode
  if (!isHorizontal) {
    return <DeviceRotationPrompt />;
  }

  // Show loading screen if scenarios aren't loaded yet or we're loading saved progress
  if (isLoading || !scenario) {
    return (
      <LoadingState loadingProgress={isLoading && scenario !== undefined} />
    );
  }

  // ===== MAIN RENDER =====
  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const piece = availablePieces.find((p) => p.id === event.active.id);
        setActiveDragPiece(piece || null);
      }}
      onDragEnd={(event) => {
        setActiveDragPiece(null);

        if (event.over && event.active) {
          const containerType = event.over.id;
          const piece = availablePieces.find((p) => p.id === event.active.id);

          if (
            (containerType === "violations" || containerType === "actions") &&
            piece
          ) {
            handleDrop(containerType, piece);
          }
        }
      }}
      onDragCancel={() => setActiveDragPiece(null)}
      autoScroll={true}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      {/* DragPieceOverlay component */}
      <DragPieceOverlay activeDragPiece={activeDragPiece} isMobile={isMobile} />

      {/* Main Game Container */}
      <div
        className="min-h-screen h-screen relative overflow-hidden flex flex-col justify-center items-center p-1"
        style={{
          backgroundImage: `url('${BACKGROUND_IMAGE_URL}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          ...(isMobile && isHorizontal
            ? {
                width: "100vw",
                height: "100vh",
                minHeight: "100vh",
                zIndex: 1000,
              }
            : {}),
        }}
      >
        {/* Scenario Dialog */}
        <AnimatePresence>
          {showScenario && (
            <motion.div
              key="scenario-dialog"
              initial={{ opacity: 0, scale: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, zIndex: 2000 }}
            >
              <ScenarioDialog
                scenario={scenario}
                onClose={() => setShowScenario(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full p-1 relative z-10 flex flex-col gap-1 h-full">
          {/* Header with Menu */}
          <GameHeader
            isComplete={isComplete}
            placedPieces={placedPieces}
            correctViolations={correctViolations}
            correctActions={correctActions}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            displayName={displayName}
            score={score}
            health={health}
            combo={combo}
            setShowScenario={setShowScenario}
            onResetProgress={resetProgress}
            isMobile={isMobile}
            isHorizontal={isHorizontal}
          />

          {/* Game Menu - Render this inside the GameHeader for proper dropdown positioning */}

          {/* Main Game Area */}
          <div className="flex-1 flex flex-row gap-2 min-h-0 items-stretch overflow-x-hidden">
            <div className="flex flex-row gap-4 flex-1 min-h-0 h-full justify-center items-stretch w-full max-w-6xl mx-auto">
              {/* Violations Container */}
              <div className="flex-1 flex flex-col min-h-0 items-stretch min-w-[180px] max-w-[420px] justify-center">
                <div className="flex-1 flex items-center justify-center min-h-0 flex-col">
                  <div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                      maxHeight: "max-content",
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <JigsawContainer
                      type="violations"
                      title="Violation Container"
                      pieces={placedPieces.violations}
                      maxPieces={correctViolations.length}
                      onDrop={handleDrop}
                    />
                  </div>
                </div>
              </div>

              {/* Arsenal (Middle) */}
              <Arsenal
                availablePieces={availablePieces}
                isMobile={isMobile}
                isHorizontal={isHorizontal}
                arsenalRef={arsenalRef}
              />

              {/* Actions Container */}
              <div className="flex-1 flex flex-col min-h-0 items-stretch min-w-[180px] max-w-[420px] justify-center">
                <div className="flex-1 flex items-center justify-center min-h-0 flex-col">
                  <div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                      maxHeight: "max-content",
                      minHeight: "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <JigsawContainer
                      type="actions"
                      title="Action Container"
                      pieces={placedPieces.actions}
                      maxPieces={correctActions.length}
                      onDrop={handleDrop}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Console */}
          {feedback && (
            <FeedbackConsole
              feedback={feedback}
              isMobile={isMobile}
              isHorizontal={isHorizontal}
              setFeedback={setFeedback}
            />
          )}

          {/* Victory Screen */}
          <VictoryPopup
            open={isComplete}
            onClose={handleVictoryClose}
            score={score}
            combo={combo}
            health={health}
            isLevelCompleted={scenarioIndex >= scenarios.length - 1}
            showReset={scenarioIndex >= scenarios.length - 1} // Only show reset on last scenario
            onReset={resetProgress} // Pass the reset function
            moduleId={moduleId}
          />
        </div>
      </div>
    </DndContext>
  );
};
