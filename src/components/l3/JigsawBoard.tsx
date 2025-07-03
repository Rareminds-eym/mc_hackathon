// External Library Imports
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import {
  RotateCcw,
  Zap,
  ArrowLeftCircle,
  Menu,
  User,
  Trophy,
  Heart,
  FileText,
  X,
} from "lucide-react";

// Internal Components and Hooks
import { supabase } from "../../lib/supabase";
import { JigsawContainer } from "./JigsawContainer";
import { DraggablePiece } from "./DraggablePiece";
import { ScenarioDialog } from "./ScenarioDialog";
import { VictoryPopup } from "../ui/Popup";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { useAuth } from "../../contexts/AuthContext";
import { RootState } from "../../store/types";

// Types
import type { PuzzlePiece } from "../../data/level3Scenarios";

// Constants
const BACKGROUND_IMAGE_URL = "/backgrounds/m1l3.webp";

// Utility Functions
const preloadImage = (url: string) => {
  const img = new window.Image();
  img.src = url;
};

const getModuleIdFromPath = () => {
  const match = window.location.pathname.match(/modules\/(\w+)/);
  return match ? match[1] : "";
};

// TypeScript Interfaces
interface GameProgress {
  user_id: string;
  module_id: string;
  scenario_index: number;
  score: number;
  health: number;
  combo: number;
  placed_pieces: {
    violations: PuzzlePiece[];
    actions: PuzzlePiece[];
  };
  completed: boolean;
  created_at: string;
}

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

  // ===== LOCAL STATE =====
  // Game state
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // UI state
  const [showScenario, setShowScenario] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDragPiece, setActiveDragPiece] = useState<PuzzlePiece | null>(
    null
  );

  // Game pieces state
  const [placedPieces, setPlacedPieces] = useState<{
    violations: PuzzlePiece[];
    actions: PuzzlePiece[];
  }>({
    violations: [],
    actions: [],
  });

  // ===== DERIVED STATE =====
  const scenario = scenarios[scenarioIndex];
  const moduleId = getModuleIdFromPath();
  const displayName = user?.user_metadata?.full_name || user?.email || "Player";

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
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex((idx) => idx + 1);
      setPlacedPieces({ violations: [], actions: [] });
      setIsComplete(false);
      setCombo(0);
      setHealth(100);
      setShowScenario(true);
    } else {
      setIsComplete(false);
    }
  }, [scenarioIndex, scenarios.length]);

  // ===== DATA PERSISTENCE =====

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
    user?.id,
    moduleId,
    scenarioIndex,
    score,
    health,
    combo,
    placedPieces,
    isComplete,
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-8 max-w-md border-2 border-cyan-400 glow-border">
          <RotateCcw className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2 game-font">
            ROTATE DEVICE
          </h2>
          <p className="text-cyan-200">
            Switch to landscape mode to begin your mission!
          </p>
        </div>
      </div>
    );
  }

  // Show loading screen if scenarios aren't loaded yet
  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl font-bold">Loading scenario...</div>
      </div>
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
    >
      {/* DragOverlay for custom drag preview */}
      <DragOverlay
        zIndex={9999}
        adjustScale={false}
        style={{ pointerEvents: "none", touchAction: "none" }}
      >
        {activeDragPiece ? (
          <div
            className={`pointer-events-none z-[9999] opacity-95 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white p-4 font-bold text-center shadow-2xl border-2 border-cyan-400 game-font flex items-center justify-center select-none overflow-hidden${
              isMobile ? " arsenal-piece-mobile-horizontal" : ""
            }`}
            style={{
              minHeight: isMobile ? "58px" : "80px",
              height: isMobile ? "58px" : undefined,
              maxWidth: isMobile ? "220px" : "260px",
              filter:
                "brightness(0.95) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))",
              clipPath:
                "polygon(0% 15%, 8% 15%, 12% 0%, 20% 0%, 25% 15%, 75% 15%, 80% 0%, 88% 0%, 92% 15%, 100% 15%, 100% 85%, 92% 85%, 88% 100%, 80% 100%, 75% 85%, 25% 85%, 20% 100%, 12% 100%, 8% 85%, 0% 85%)",
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
        ) : null}
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
          <header className="relative w-full flex flex-row items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-900/90 to-blue-900/90 rounded-xl border border-cyan-500/50 shadow-lg backdrop-blur-sm z-50">
            {/* Left: Back Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-800 transition-all duration-200 shadow border border-cyan-400/50 flex items-center justify-center focus:outline-none"
                aria-label="Back"
              >
                <ArrowLeftCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Mission Title & Progress */}
            <div className="flex flex-col items-center flex-1 px-4">
              <h1 className="text-xl font-extrabold text-white game-font tracking-wide mb-1 flex items-center gap-2">
                <span className="text-white">LEVEL 3: FIX THE VIOLATION</span>
              </h1>

              {/* Progress Bar */}
              <div className="w-full max-w-xs h-1.5 bg-gray-800 rounded-full overflow-hidden border border-cyan-400/50">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500"
                  style={{
                    width: isComplete
                      ? "100%"
                      : `${Math.min(
                          100,
                          ((placedPieces.violations.length +
                            placedPieces.actions.length) /
                            (correctViolations.length +
                              correctActions.length)) *
                            100
                        )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Right: Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow border border-cyan-300/50 flex items-center justify-center focus:outline-none"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Menu Dropdown */}
              {isMenuOpen && (
                <>
                  {/* Overlay to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 bg-transparent z-[40]"
                    onMouseDown={() => setIsMenuOpen(false)}
                  />

                  {/* Menu Content */}
                  <div
                    className={`absolute right-0 top-full mt-2 bg-gradient-to-br from-gray-900/98 to-blue-900/98 rounded-xl border border-cyan-500/50 shadow-2xl backdrop-blur-md z-[50] overflow-auto pointer-events-auto${
                      isMobile && isHorizontal
                        ? " compact-dropdown-mobile-horizontal"
                        : " w-72"
                    }`}
                    style={{
                      minWidth: isMobile && isHorizontal ? "12rem" : "18rem",
                      maxWidth: isMobile && isHorizontal ? "90vw" : "22rem",
                      width: isMobile && isHorizontal ? "90vw" : "22rem",
                      height: "min-content",
                      maxHeight: isMobile && isHorizontal ? "70vh" : "80vh",
                      padding:
                        isMobile && isHorizontal
                          ? "0.5rem 0.5rem"
                          : "1rem 1.2rem",
                      boxSizing: "border-box",
                      overflowX: "hidden",
                      overflowY: "auto",
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {/* Menu Header */}
                    <div
                      className={`border-b border-cyan-500/30${
                        isMobile && isHorizontal ? " px-2 py-1" : " px-4 py-3"
                      }`}
                    >
                      <h3
                        className={`text-sm font-bold text-cyan-300 flex items-center gap-2${
                          isMobile && isHorizontal ? " text-xs" : ""
                        }`}
                      >
                        <User
                          className={`w-4 h-4${
                            isMobile && isHorizontal ? " w-3 h-3" : ""
                          }`}
                        />
                        AGENT STATUS
                      </h3>
                    </div>

                    {/* Agent Info */}
                    <div
                      className={`space-y-2${
                        isMobile && isHorizontal ? " p-2" : " p-4 space-y-3"
                      }`}
                    >
                      {/* Agent Identity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border border-yellow-300 shadow${
                              isMobile && isHorizontal
                                ? " w-6 h-6 text-base"
                                : " w-8 h-8 text-lg"
                            }`}
                          >
                            <span className="font-bold text-black">🕵️‍♂️</span>
                          </span>
                          <div>
                            <div
                              className={`text-cyan-200 font-bold${
                                isMobile && isHorizontal
                                  ? " text-xs"
                                  : " text-sm"
                              }`}
                            >
                              {displayName}
                            </div>
                            <div
                              className={`text-xs text-cyan-400${
                                isMobile && isHorizontal ? " leading-tight" : ""
                              }`}
                            >
                              Level 3 Operative
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div
                        className={`grid grid-cols-2 gap-2${
                          isMobile && isHorizontal ? "" : " gap-3"
                        }`}
                      >
                        {/* Score Box */}
                        <div
                          className={`bg-black/30 rounded-lg border border-green-400/50${
                            isMobile && isHorizontal ? " p-2" : " p-3"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy
                              className={`w-4 h-4 text-green-400${
                                isMobile && isHorizontal ? " w-3 h-3" : ""
                              }`}
                            />
                            <span className="text-xs font-bold text-green-300">
                              SCORE
                            </span>
                          </div>
                          <div
                            className={`font-bold text-green-200${
                              isMobile && isHorizontal
                                ? " text-base"
                                : " text-lg"
                            }`}
                          >
                            {score}
                          </div>
                          <div className="text-xs text-green-400">
                            XP Points
                          </div>
                        </div>

                        {/* Health Box */}
                        <div
                          className={`bg-black/30 rounded-lg border border-red-400/50${
                            isMobile && isHorizontal ? " p-2" : " p-3"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Heart
                              className={`w-4 h-4 text-red-400${
                                isMobile && isHorizontal ? " w-3 h-3" : ""
                              }`}
                            />
                            <span className="text-xs font-bold text-red-300">
                              HEALTH
                            </span>
                          </div>
                          <div
                            className={`font-bold text-red-200${
                              isMobile && isHorizontal
                                ? " text-base"
                                : " text-lg"
                            }`}
                          >
                            {health}%
                          </div>
                          <div
                            className={`w-full${
                              isMobile && isHorizontal ? " h-1" : " h-1.5"
                            } bg-gray-700 rounded-full overflow-hidden mt-1`}
                          >
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-green-400 transition-all duration-300"
                              style={{ width: `${health}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Combo Counter (conditionally shown) */}
                      {combo > 0 && (
                        <div
                          className={`bg-black/30 rounded-lg border border-yellow-400/50${
                            isMobile && isHorizontal ? " p-2" : " p-3"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Zap
                              className={`w-4 h-4 text-yellow-400${
                                isMobile && isHorizontal ? " w-3 h-3" : ""
                              }`}
                            />
                            <span className="text-xs font-bold text-yellow-300">
                              COMBO
                            </span>
                          </div>
                          <div
                            className={`font-bold text-yellow-200${
                              isMobile && isHorizontal
                                ? " text-base"
                                : " text-lg"
                            }`}
                          >
                            {combo}x
                          </div>
                          <div className="text-xs text-yellow-400">
                            Streak Multiplier
                          </div>
                        </div>
                      )}

                      {/* Mission Brief Button */}
                      <button
                        onClick={() => {
                          setShowScenario(true);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-cyan-300/50 shadow bg-gradient-to-r from-cyan-500 to-blue-500${
                          isMobile && isHorizontal
                            ? " px-2 py-2 text-xs"
                            : " px-4 py-3"
                        }`}
                      >
                        <FileText
                          className={`w-4 h-4${
                            isMobile && isHorizontal ? " w-3 h-3" : ""
                          }`}
                        />
                        MISSION BRIEF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

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
              <div
                className={`flex flex-col my-auto items-center justify-center w-max relative z-20${
                  isMobile && isHorizontal ? " arsenal-mobile-horizontal" : ""
                }`}
                style={{
                  height: isMobile && isHorizontal ? "220px" : "300px",
                  minHeight: isMobile && isHorizontal ? "220px" : "300px",
                  maxHeight: "100%",
                }}
              >
                <div
                  className={`relative flex flex-col h-full w-max p-2 rounded-2xl shadow-2xl border-2 border-cyan-400/80 arsenal-glass-container items-center justify-between${
                    isMobile && isHorizontal
                      ? " arsenal-glass-mobile-horizontal"
                      : ""
                  }`}
                  style={{
                    background: "rgba(20, 30, 60, 0.35)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 0 24px 4px #22d3ee55, 0 2px 16px 0 #0008",
                    border: "2.5px solid #22d3ee",
                    overflow: "hidden",
                    width: "max-content",
                    padding:
                      isMobile && isHorizontal ? "0.5rem" : "0.5rem 1rem",
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 z-0">
                    <Zap
                      className={`w-24 h-24 text-cyan-300 animate-pulse-slow${
                        isMobile && isHorizontal ? " w-14 h-14" : ""
                      }`}
                    />
                  </div>

                  {/* Arsenal Title */}
                  <div
                    className={`flex flex-row items-center justify-center gap-2 mb-2 relative z-10 w-full whitespace-nowrap${
                      isMobile && isHorizontal ? " text-base" : ""
                    }`}
                  >
                    <Zap
                      className={`w-6 h-6 text-yellow-300 drop-shadow-glow animate-flicker flex-shrink-0${
                        isMobile && isHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                    <h3
                      className={`text-lg font-extrabold text-cyan-100 game-font tracking-widest neon-text drop-shadow-glow animate-gradient-move text-center whitespace-nowrap${
                        isMobile && isHorizontal ? " text-base" : ""
                      }`}
                      style={{
                        letterSpacing: "0.12em",
                        textShadow: "0 0 8px #22d3ee, 0 0 16px #fde68a",
                      }}
                    >
                      ARSENAL
                    </h3>
                  </div>

                  {/* Pieces List */}
                  <div
                    ref={arsenalRef}
                    className={`space-y-1 overflow-y-auto flex-1 min-h-0 flex flex-col items-center custom-scrollbar relative z-10 w-full px-2 py-2${
                      isMobile && isHorizontal ? " text-xs px-1 py-1" : ""
                    }`}
                  >
                    {availablePieces.map((piece: PuzzlePiece) => (
                      <DraggablePiece key={piece.id} piece={piece} />
                    ))}
                  </div>

                  {/* Animated Glow Border */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none border-4 border-cyan-400/60 animate-glow-border"
                    style={{ boxShadow: "0 0 32px 8px #22d3ee55" }}
                  ></div>
                </div>
              </div>

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

          {/* Feedback Console (conditionally rendered) */}
          {feedback && (
            <div
              className={`fixed bottom-5 right-5 z-[9999] flex justify-end w-auto pointer-events-none ${
                isMobile && isHorizontal ? "mobile-feedback" : ""
              }`}
            >
              <div
                className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border-2 max-w-xl w-full sm:w-auto
                  text-base md:text-lg font-extrabold game-font tracking-wide
                  pointer-events-auto backdrop-blur-lg bg-opacity-90
                  ${
                    feedback.includes("🎯") || feedback.includes("🎉")
                      ? "bg-gradient-to-br from-green-700 via-emerald-600 to-cyan-700 text-green-100 border-green-300/80"
                      : "bg-gradient-to-br from-red-700 via-pink-700 to-yellow-700 text-yellow-100 border-yellow-300/80 shake"
                  }
                  ${isMobile && isHorizontal ? " text-xs px-2 py-2 max-w-xs" : ""}`}
                style={{
                  letterSpacing: "0.04em",
                  boxShadow: "0 8px 40px 0 rgba(0, 255, 255, 0.15), 0 2px 12px 0 rgba(0, 0, 0, 0.18)",
                  ...(isMobile && isHorizontal
                    ? {
                        fontSize: "0.85rem",
                        padding: "0.5rem 0.75rem",
                        maxWidth: "18rem",
                      }
                    : {}),
                }}
                role="status"
                aria-live="polite"
              >
                <div className="relative flex items-center gap-4 w-full">
                  {/* Icon with animated effects */}
                  <span
                    className={`text-4xl relative flex items-center justify-center${
                      isMobile && isHorizontal ? " text-2xl" : ""
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <span
                        className="absolute left-0 top-0 w-full h-full animate-shine pointer-events-none"
                        style={{
                          background: "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)",
                          borderRadius: "9999px",
                        }}
                      ></span>
                      <span className="relative animate-pop-scale">
                        {feedback.includes("🎯") ? (
                          <Icon
                            icon="mdi:gamepad-variant"
                            className={`text-green-300 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter: "drop-shadow(0 0 8px #34d399) drop-shadow(0 0 16px #22d3ee)",
                            }}
                          />
                        ) : feedback.includes("🎉") ? (
                          <Icon
                            icon="mdi:crown"
                            className={`text-yellow-300 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter: "drop-shadow(0 0 8px #fde68a) drop-shadow(0 0 16px #06b6d4)",
                            }}
                          />
                        ) : feedback.includes("⚠️") ? (
                          <Icon
                            icon="mdi:alert-octagon"
                            className={`text-yellow-400 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter: "drop-shadow(0 0 8px #facc15) drop-shadow(0 0 16px #f472b6)",
                            }}
                          />
                        ) : (
                          <Icon
                            icon="mdi:close-octagon"
                            className={`text-red-400 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter: "drop-shadow(0 0 8px #f87171) drop-shadow(0 0 16px #06b6d4)",
                            }}
                          />
                        )}
                      </span>
                    </span>

                    {/* Decorative sparkles */}
                    <span
                      className={`absolute left-1 top-1 animate-bounce text-yellow-200 text-xs select-none pointer-events-none${
                        isMobile && isHorizontal ? " text-[0.7rem]" : ""
                      }`}
                    >
                      ✦
                    </span>
                    <span
                      className={`absolute right-1 bottom-1 animate-bounce-slow text-cyan-200 text-sm select-none pointer-events-none${
                        isMobile && isHorizontal ? " text-xs" : ""
                      }`}
                    >
                      ✧
                    </span>
                    <span
                      className={`absolute -left-2 -top-2 animate-float text-pink-300 text-lg select-none pointer-events-none${
                        isMobile && isHorizontal ? " text-base" : ""
                      }`}
                    >
                      ★
                    </span>
                    <span
                      className={`absolute -right-2 -bottom-2 animate-float-slow text-blue-200 text-base select-none pointer-events-none${
                        isMobile && isHorizontal ? " text-xs" : ""
                      }`}
                    >
                      ✪
                    </span>
                  </span>

                  {/* Feedback message text */}
                  <span
                    className={`flex-1 text-center px-2 leading-tight select-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-white to-cyan-100 drop-shadow-glow animate-gradient-move${
                      isMobile && isHorizontal ? " text-xs" : ""
                    }`}
                  >
                    {feedback.replace(/^[^\w\d]+\s*/, "")}
                  </span>

                  {/* Dismiss button */}
                  <button
                    className={`ml-2 p-2 rounded-full bg-gradient-to-br from-cyan-700 via-blue-700 to-teal-600 hover:from-cyan-500 hover:to-teal-400 transition-colors border-2 border-cyan-300/60 text-white focus:outline-none shadow-lg active:scale-95 animate-pop${
                      isMobile && isHorizontal ? " p-1" : ""
                    }`}
                    onClick={() => setFeedback("")}
                    aria-label="Dismiss feedback"
                  >
                    <X
                      className={`w-5 h-5${
                        isMobile && isHorizontal ? " w-4 h-4" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
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
