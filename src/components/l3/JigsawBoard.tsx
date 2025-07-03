// External Library Imports
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
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
  LoadingState
} from "./components";

// Utilities and Hooks
import { BACKGROUND_IMAGE_URL, preloadImage, getModuleIdFromPath } from "./utils/gameUtils";


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
  const [activeDragPiece, setActiveDragPiece] = useState<PuzzlePiece | null>(null);

  // ===== GAME STATE =====
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
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
        setScore((prev) => prev + 100 + combo * 10);
        setCombo((prev) => prev + 1);
        return { success: true };
      } else {
        setFeedback("💥 MISS! Analyze the scenario more carefully!");
        setHealth((prev) => Math.max(0, prev - 15));
        setCombo(0);
        return { success: false };
      }
    },
    [placedPieces, combo]
  );
  
  /**
   * Handle victory popup close and scenario transition
   */
  const handleVictoryClose = useCallback(() => {
    if (scenarioIndex < scenarios?.length - 1) {
      setScenarioIndex((idx) => idx + 1);
      setPlacedPieces({ violations: [], actions: [] });
      setIsComplete(false);
      setCombo(0);
      setHealth(100);
      setShowScenario(true);
    } else {
      setIsComplete(false);
    }
  }, [scenarioIndex, scenarios?.length]);

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
  
  // Save game progress when game state changes
  useEffect(() => {
    if (initialized) saveGameProgress();
  }, [
    initialized,
    saveGameProgress,
  ]);

  // Reset arsenal scroll position when scenario changes
  useEffect(() => {
    if (arsenalRef.current) arsenalRef.current.scrollTop = 0;
  }, [scenarioIndex]);

  // Check for game completion
  useEffect(() => {
    const totalCorrect = correctViolations.length + correctActions.length;
    const placedCorrect =
      placedPieces.violations.length + placedPieces.actions.length;

    if (placedCorrect === totalCorrect && totalCorrect > 0) {
      setIsComplete(true);
      setScore((prev) => prev + 1000 + combo * 100);
      setFeedback("");
    }
  }, [placedPieces, combo, correctViolations.length, correctActions.length]);

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

  // Show loading screen if scenarios aren't loaded yet
  if (!scenario) {
    return <LoadingState />;
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
      {/* Official DragOverlay from dnd-kit */}
      <DragOverlay 
        adjustScale={false}
        zIndex={9999} 
        dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
        {activeDragPiece && (
          <div
            className={`pointer-events-none opacity-95 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white p-4 font-bold text-center shadow-2xl border-2 border-cyan-400 game-font flex items-center justify-center select-none overflow-hidden${
              isMobile ? " arsenal-piece-mobile-horizontal" : ""
            }`}
            style={{
              minHeight: isMobile ? "58px" : "80px",
              height: isMobile ? "58px" : undefined,
              maxWidth: isMobile ? "220px" : "260px",
              width: isMobile ? "max-content" : "max-content",
              filter: "brightness(0.95) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))",
              clipPath: "polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)",
              borderRadius: "8px",
              fontSize: isMobile ? "0.95rem" : "1rem",
              paddingTop: isMobile ? "0.25rem" : "1rem",
              paddingBottom: isMobile ? "0.25rem" : "1rem",
              touchAction: "none",
            }}
          >
            {/* Animated Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse opacity-50" />

            {/* Category Icon */}
            <div className="absolute top-2 left-2 opacity-20">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-cyan-600/80 border border-white/30">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
            </div>

            {/* Sparkle Effect */}
            <div className="absolute top-2 right-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fde68a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 animate-pulse"
              >
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l-1.41-1.41M6.34 6.34L4.93 4.93" />
              </svg>
            </div>

            {/* Main Content */}
            <div className="relative z-10 pointer-events-none h-full flex items-center justify-center">
              <div className="text-sm leading-tight">{activeDragPiece.text}</div>
            </div>

            {/* Jigsaw Piece Connectors */}
            <div className="absolute top-0 left-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
            <div className="absolute top-0 right-1/4 w-2 h-1 bg-white/30 rounded-b-full" />
            <div className="absolute bottom-0 left-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
            <div className="absolute bottom-0 right-1/4 w-2 h-1 bg-white/30 rounded-t-full" />
          </div>
        )}
      </DragOverlay>

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
            showNext={scenarioIndex < scenarios.length - 1}
            moduleId={moduleId}
          />
        </div>
      </div>
    </DndContext>
  );
};
