import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { JigsawContainer } from "./JigsawContainer";
import { DraggablePiece } from "./DraggablePiece";
import { ScenarioDialog } from "./ScenarioDialog";
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
import { VictoryPopup } from "../ui/Popup";
import { Icon } from "@iconify/react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

// --- Types ---
interface PuzzlePiece {
  id: string;
  text: string;
  category: "violation" | "action";
  isCorrect: boolean;
}

interface Scenario {
  title: string;
  description: string;
  pieces: PuzzlePiece[];
}

// --- Scenario Data (Consider moving to a separate file for scalability) ---
const scenarios: Scenario[] = [
  {
    title: "Cleanroom Entry Violation",
    description:
      "A production worker enters the cleanroom without gloves and skips the entry logbook. Your mission: Identify the violations and deploy corrective actions!",
    pieces: [
      {
        id: "v1",
        text: "Personnel Hygiene",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "v2",
        text: "Documentation",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "v3",
        text: "Quality Control",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "v4",
        text: "Equipment Qualification",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "a1",
        text: "Follow gowning SOP",
        category: "action",
        isCorrect: true,
      },
      {
        id: "a2",
        text: "Sign and verify entry in log",
        category: "action",
        isCorrect: true,
      },
      {
        id: "a3",
        text: "Use cleanroom air filters",
        category: "action",
        isCorrect: false,
      },
      {
        id: "a4",
        text: "Initiate audit trail",
        category: "action",
        isCorrect: false,
      },
    ],
  },
  {
    title: "Expired Balance Used",
    description:
      "An expired balance is used to weigh materials for a production batch. Your mission: Identify the violated GMP principle and deploy corrective actions!",
    pieces: [
      {
        id: "s2v1",
        text: "Equipment Calibration",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "s2v2",
        text: "Training",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2v3",
        text: "Cleaning Validation",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2v4",
        text: "Material Storage",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s2a1",
        text: "Stop use, recalibrate",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s2a2",
        text: "Repeat training",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s2a3",
        text: "Update MSDS",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s2a4",
        text: "Document deviation & assess risk",
        category: "action",
        isCorrect: true,
      },
    ],
  },
  {
    title: "Batch Record Not Reviewed by QA",
    description:
      "A batch record is signed only by Production Head. QA has not reviewed or signed. Your mission: Identify the violated GMP principle and deploy corrective actions!",
    pieces: [
      {
        id: "s3v1",
        text: "Documentation",
        category: "violation",
        isCorrect: true,
      },
      {
        id: "s3v2",
        text: "Root Cause Analysis",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3v3",
        text: "Market Complaint Handling",
        category: "violation",
        isCorrect: false,
      },
      {
        id: "s3a1",
        text: "QA counter-sign required",
        category: "action",
        isCorrect: true,
      },
      {
        id: "s3a2",
        text: "Recall product",
        category: "action",
        isCorrect: false,
      },
      {
        id: "s3a3",
        text: "Skip QA review",
        category: "action",
        isCorrect: false,
      },
    ],
  },
];

// --- Utility: Get moduleId from URL ---
const getModuleIdFromPath = () => {
  const match = window.location.pathname.match(/modules\/(\w+)/);
  return match ? match[1] : '';
};

export const JigsawBoard: React.FC = () => {
  // --- State ---
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = scenarios[scenarioIndex];
  const correctViolations = useMemo(() => scenario.pieces.filter(
    (p) => p.category === "violation" && p.isCorrect
  ), [scenario]);
  const correctActions = useMemo(() => scenario.pieces.filter(
    (p) => p.category === "action" && p.isCorrect
  ), [scenario]);

  const [placedPieces, setPlacedPieces] = useState<{ violations: PuzzlePiece[]; actions: PuzzlePiece[] }>({
    violations: [],
    actions: [],
  });
  const [showScenario, setShowScenario] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const { user } = useAuth();
  const arsenalRef = useRef<HTMLDivElement>(null);
  const moduleId = getModuleIdFromPath();

  // --- Effects ---
  useEffect(() => {
    if (arsenalRef.current) arsenalRef.current.scrollTop = 0;
  }, [scenarioIndex]);

  useEffect(() => {
    const totalCorrect = correctViolations.length + correctActions.length;
    const placedCorrect = placedPieces.violations.length + placedPieces.actions.length;
    if (placedCorrect === totalCorrect && totalCorrect > 0) {
      setIsComplete(true);
      setScore((prev) => prev + 1000 + combo * 100);
      setFeedback("");
    }
  }, [placedPieces, combo, correctViolations.length, correctActions.length]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(""), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  // --- Handlers ---
  const handleDrop = useCallback((containerType: "violations" | "actions", piece: PuzzlePiece) => {
    const isCorrectCategory =
      (containerType === "violations" && piece.category === "violation") ||
      (containerType === "actions" && piece.category === "action");
    if (!isCorrectCategory) {
      setFeedback("⚠️ WRONG CATEGORY! Try the other container, Agent!");
      setHealth((prev) => Math.max(0, prev - 10));
      setCombo(0);
      return { success: false };
    }
    const isAlreadyPlaced =
      placedPieces.violations.some((p) => p.id === piece.id) ||
      placedPieces.actions.some((p) => p.id === piece.id);
    if (isAlreadyPlaced) {
      setFeedback("⚠️ Already placed! Try another piece!");
      return { success: false };
    }
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
  }, [placedPieces, combo]);

  const handleVictoryClose = useCallback(() => {
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex((idx) => idx + 1);
      setPlacedPieces({ violations: [], actions: [] });
      setIsComplete(false);
      setCombo(0);
      setHealth(100);
      setShowScenario(true);
    } else {
      // Optionally: navigate to module/levels or show a final message
      setIsComplete(false);
    }
  }, [scenarioIndex]);

  // --- DnD Backend ---
  const isTouchDevice = useMemo(() =>
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0)),
    []
  );
  const dndBackend = useMemo(() => (isTouchDevice ? TouchBackend : HTML5Backend), [isTouchDevice]);
  const dndOptions = useMemo(() =>
    isTouchDevice ? {
      enableMouseEvents: true,
      enableTouchEvents: true,
      delayTouchStart: 0,
      delayMouseStart: 0,
      touchSlop: 10,
      pressDelay: 100,
    } : undefined,
    [isTouchDevice]
  );

  // --- Derived ---
  const availablePieces = useMemo(() => scenario.pieces.filter(
    (piece) =>
      !placedPieces.violations.some((p) => p.id === piece.id) &&
      !placedPieces.actions.some((p) => p.id === piece.id)
  ), [scenario, placedPieces]);

  // --- Display Name ---
  const displayName = user?.user_metadata?.full_name || user?.email || "Player";

  // --- Layout: Force landscape ---
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

  // --- Main Render ---
  return (
    <DndProvider backend={dndBackend} options={dndOptions}>
      {/* Custom drag layer for better mobile feedback */}
      <CustomDragLayer />
      <div
        className="min-h-screen h-screen relative overflow-hidden flex flex-col justify-center items-center p-1"
        style={{
          backgroundImage: "url('/backgrounds/m1l3.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          ...(isMobile && isHorizontal ? {
            width: "100vw",
            height: "100vh",
            minHeight: "100vh",
            zIndex: 1000,
          } : {}),
        }}
      >
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
          {/* Ultra Compact Header with Menu */}
          <header className="relative w-full flex flex-row items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-900/90 to-blue-900/90 rounded-xl border border-cyan-500/50 shadow-lg backdrop-blur-sm z-50">
            {/* Left Section - Back Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-800 transition-all duration-200 shadow border border-cyan-400/50 flex items-center justify-center focus:outline-none"
                aria-label="Back"
              >
                <ArrowLeftCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Center Section - Mission Title & Progress */}
            <div className="flex flex-col items-center flex-1 px-4">
              <h1 className="text-xl font-extrabold text-white game-font tracking-wide mb-1 flex items-center gap-2">
                <span className="text-white">LEVEL 3: FIX THE VIOLATION</span>
              </h1>

              {/* Compact Progress Bar */}
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

            {/* Right Section - Menu Button */}
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

              {/* Overlay to close menu when clicking outside - Higher z-index to be above arsenal but lower than dropdown */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-transparent z-[40]"
                    onMouseDown={() => setIsMenuOpen(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-2 bg-gradient-to-br from-gray-900/98 to-blue-900/98 rounded-xl border border-cyan-500/50 shadow-2xl backdrop-blur-md z-[50] overflow-auto pointer-events-auto w-64${
                      isMobile && isHorizontal
                        ? " compact-dropdown-mobile-horizontal"
                        : ""
                    }`}
                    style={
                      isMobile && isHorizontal
                        ? {
                            minWidth: "10rem",
                            maxWidth: "13rem",
                            height: "min-content",
                            maxHeight: "70vh",
                            padding: "0.5rem 0.5rem",
                          }
                        : {}
                    }
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

                      {/* Combo Counter */}
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

          <div className="flex-1 flex flex-row gap-2 min-h-0 items-stretch overflow-x-hidden">
            {/* Mission Zones with Arsenal in the middle */}
            <div className="flex flex-row gap-4 flex-1 min-h-0 h-full justify-center items-stretch w-full max-w-6xl mx-auto">
              {/* Violations Container */}
              <div className="flex-1 flex flex-col min-h-0 items-stretch min-w-[180px] max-w-[420px] justify-center">
                <div className="flex-1 flex items-center justify-center min-h-0 flex-col">
                  <h2 className="text-base md:text-lg font-bold text-white game-font text-center mb-1">
                    VIOLATIONS DETECTED
                  </h2>
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

              {/* Arsenal - Now in the middle */}
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
                  {/* Watermark Icon */}
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
                    {availablePieces.map((piece) => (
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
                  <h2 className="text-base md:text-lg font-bold text-white game-font text-center mb-1">
                    DEPLOY COUNTERMEASURES
                  </h2>
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
            <div
              className={`fixed bottom-5 right-5 z-[9999] flex justify-end w-auto pointer-events-none ${
                isMobile && isHorizontal ? "mobile-feedback" : ""
              }`}
              style={{}}
            >
              <div
                className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border-2 max-w-xl w-full sm:w-auto
            text-base md:text-lg font-extrabold game-font tracking-wide
            pointer-events-auto
            backdrop-blur-lg bg-opacity-90
            ${
              feedback.includes("🎯") || feedback.includes("🎉")
                ? "bg-gradient-to-br from-green-700 via-emerald-600 to-cyan-700 text-green-100 border-green-300/80"
                : "bg-gradient-to-br from-red-700 via-pink-700 to-yellow-700 text-yellow-100 border-yellow-300/80 shake"
            }
          ${isMobile && isHorizontal ? " text-xs px-2 py-2 max-w-xs" : ""}`}
                style={{
                  letterSpacing: "0.04em",
                  boxShadow:
                    "0 8px 40px 0 rgba(0, 255, 255, 0.15), 0 2px 12px 0 rgba(0, 0, 0, 0.18)",
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
                  {/* Gamified Icon with animated glow and sparkles */}
                  <span
                    className={`text-4xl relative flex items-center justify-center${
                      isMobile && isHorizontal ? " text-2xl" : ""
                    }`}
                  >
                    {/* Main Icon with shine and pop */}
                    <span className="relative z-10 flex items-center justify-center">
                      <span
                        className="absolute left-0 top-0 w-full h-full animate-shine pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)",
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
                              filter:
                                "drop-shadow(0 0 8px #34d399) drop-shadow(0 0 16px #22d3ee)",
                            }}
                          />
                        ) : feedback.includes("🎉") ? (
                          <Icon
                            icon="mdi:crown"
                            className={`text-yellow-300 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter:
                                "drop-shadow(0 0 8px #fde68a) drop-shadow(0 0 16px #06b6d4)",
                            }}
                          />
                        ) : feedback.includes("⚠️") ? (
                          <Icon
                            icon="mdi:alert-octagon"
                            className={`text-yellow-400 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter:
                                "drop-shadow(0 0 8px #facc15) drop-shadow(0 0 16px #f472b6)",
                            }}
                          />
                        ) : (
                          <Icon
                            icon="mdi:close-octagon"
                            className={`text-red-400 drop-shadow-glow${
                              isMobile && isHorizontal ? " text-2xl" : ""
                            }`}
                            style={{
                              filter:
                                "drop-shadow(0 0 8px #f87171) drop-shadow(0 0 16px #06b6d4)",
                            }}
                          />
                        )}
                      </span>
                    </span>
                    {/* Sparkles and confetti */}
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
                  {/* Gamified Text with animated gradient and shadow */}
                  <span
                    className={`flex-1 text-center px-2 leading-tight select-text font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-white to-cyan-100 drop-shadow-glow animate-gradient-move${
                      isMobile && isHorizontal ? " text-xs" : ""
                    }`}
                  >
                    {feedback.replace(/^[^\w\d]+\s*/, "")}
                  </span>
                  {/* Gamified Dismiss Button */}
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
    </DndProvider>
  );
};

// --- Custom Drag Layer (unchanged, but consider extracting for clarity) ---
const CustomDragLayer = () => {
  const { item, isDragging, clientOffset } = useDragLayer((monitor: any) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  // Dynamically size the preview to match the dragged piece's DOM size
  const [pieceSize, setPieceSize] = React.useState<{ width: number; height: number } | null>(null);
  React.useEffect(() => {
    if (!item || !item.id) {
      setPieceSize(null);
      return;
    }
    // Try to find the DOM node of the dragged piece
    const el = document.querySelector(`[data-piece-id='${item.id}']`);
    if (el) {
      const rect = (el as HTMLElement).getBoundingClientRect();
      setPieceSize({ width: rect.width, height: rect.height });
    }
  }, [item]);

  const offset =
    clientOffset ||
    (typeof window !== "undefined"
      ? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      : null);
  if (!isDragging || !item || !offset) return null;

  const width = pieceSize?.width || 128;
  const height = pieceSize?.height || 60;
  const categoryGradient = "from-blue-500 via-cyan-500 to-teal-500";
  const categoryBorder = "border-cyan-400";
  // Center the preview under the finger/cursor
  const transform = `translate(${offset.x - width / 2}px, ${offset.y - height / 2}px)`;

  return (
    <div
      className={`pointer-events-none fixed z-[9999] left-0 top-0 opacity-95 transition-transform duration-75 bg-gradient-to-r ${categoryGradient} text-white rounded-lg font-bold text-center shadow-2xl border-2 ${categoryBorder} game-font`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform,
        clipPath:
          "polygon(0% 20%, 10% 20%, 15% 0%, 25% 0%, 30% 20%, 70% 20%, 75% 0%, 85% 0%, 90% 20%, 100% 20%, 100% 80%, 90% 80%, 85% 100%, 75% 100%, 70% 80%, 30% 80%, 25% 100%, 15% 100%, 10% 80%, 0% 80%)",
        filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))",
        pointerEvents: "none",
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative z-10 flex items-center justify-center h-full w-full text-xs md:text-sm px-1">
        {item.text}
      </div>
    </div>
  );
};
