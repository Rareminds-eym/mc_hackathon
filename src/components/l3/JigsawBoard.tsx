import React, { useState, useEffect } from "react";
import { DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { JigsawContainer } from "./JigsawContainer";
import { DraggablePiece } from "./DraggablePiece";
import { ScenarioDialog } from "./ScenarioDialog";
import { RotateCcw, Zap, ArrowLeftCircle, Menu, User, Trophy, Heart, FileText, X } from "lucide-react";
import { VictoryPopup } from "../ui/Popup";

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

const scenario: Scenario = {
  title: "MISSION: Cleanroom Entry Violation",
  description:
    "A production worker enters the cleanroom without gloves and skips the entry logbook. Your mission: Identify the violations and deploy corrective actions!",
  pieces: [
    {
      id: "v1",
      text: "Personnel Hygiene",
      category: "violation",
      isCorrect: true,
    },
    { id: "v2", text: "Documentation", category: "violation", isCorrect: true },
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
};

export const JigsawBoard = () => {
  const correctViolations = scenario.pieces.filter(
    (p) => p.category === "violation" && p.isCorrect
  );
  const correctActions = scenario.pieces.filter(
    (p) => p.category === "action" && p.isCorrect
  );

  const [placedPieces, setPlacedPieces] = useState<{
    violations: PuzzlePiece[];
    actions: PuzzlePiece[];
  }>({
    violations: [],
    actions: [],
  });

  const [showScenario, setShowScenario] = useState(true);
  const [feedback, setFeedback] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  useEffect(() => {
    // Check if all correct pieces are placed
    const totalCorrectPieces = correctViolations.length + correctActions.length;
    const placedCorrectPieces =
      placedPieces.violations.length + placedPieces.actions.length;

    if (placedCorrectPieces === totalCorrectPieces && totalCorrectPieces > 0) {
      setIsComplete(true);
      setScore((prev) => prev + 1000 + combo * 100);
      setFeedback("🎉 MISSION ACCOMPLISHED! Perfect execution, Agent!");
    }
  }, [placedPieces, combo, correctViolations.length, correctActions.length]);

  const handleDrop = (
    containerType: "violations" | "actions",
    piece: PuzzlePiece
  ) => {
    const isCorrectCategory =
      (containerType === "violations" && piece.category === "violation") ||
      (containerType === "actions" && piece.category === "action");

    if (!isCorrectCategory) {
      setFeedback("⚠️ WRONG CATEGORY! Try the other container, Agent!");
      setHealth((prev) => Math.max(0, prev - 10));
      setCombo(0);
      return { success: false };
    }

    // Check if piece is already placed
    const isAlreadyPlaced =
      placedPieces.violations.find((p) => p.id === piece.id) ||
      placedPieces.actions.find((p) => p.id === piece.id);

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
  };

  const availablePieces = scenario.pieces.filter(
    (piece) =>
      !placedPieces.violations.find((p) => p.id === piece.id) &&
      !placedPieces.actions.find((p) => p.id === piece.id)
  );

  // Detect touch device for DnD backend
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));
  const dndBackend = isTouchDevice ? TouchBackend : HTML5Backend;
  const dndOptions = isTouchDevice
    ? { enableMouseEvents: true, preview: true }
    : undefined;

  if (!isLandscape) {
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

  return (
    <DndProvider backend={dndBackend} options={dndOptions}>
      {/* Custom drag layer for better mobile feedback */}
      <CustomDragLayer />
      <div
        className="min-h-screen h-screen relative overflow-hidden flex flex-col justify-center items-center p-1"
        style={{
          backgroundImage:
            "url('/backgrounds/m1l3.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {showScenario && (
          <ScenarioDialog
            scenario={scenario}
            onClose={() => setShowScenario(false)}
          />
        )}

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
                <span className="text-yellow-400">⚡</span>
                <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
                  LEVEL 3: FIX THE VIOLATION
                </span>
                <span className="text-yellow-400">⚡</span>
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
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Dropdown Menu - Fixed z-index to be above everything */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-br from-gray-900/98 to-blue-900/98 rounded-xl border border-cyan-500/50 shadow-2xl backdrop-blur-md z-[9999] overflow-hidden">
                  {/* Menu Header */}
                  <div className="px-4 py-3 border-b border-cyan-500/30">
                    <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      AGENT STATUS
                    </h3>
                  </div>

                  {/* Agent Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border border-yellow-300 shadow">
                          <span className="text-lg font-bold text-black">🕵️‍♂️</span>
                        </span>
                        <div>
                          <div className="text-cyan-200 font-bold text-sm">AGENT 47</div>
                          <div className="text-xs text-cyan-400">Level 3 Operative</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-lg p-3 border border-green-400/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-bold text-green-300">SCORE</span>
                        </div>
                        <div className="text-lg font-bold text-green-200">{score}</div>
                        <div className="text-xs text-green-400">XP Points</div>
                      </div>

                      <div className="bg-black/30 rounded-lg p-3 border border-red-400/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-bold text-red-300">HEALTH</span>
                        </div>
                        <div className="text-lg font-bold text-red-200">{health}%</div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-green-400 transition-all duration-300"
                            style={{ width: `${health}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Combo Counter */}
                    {combo > 0 && (
                      <div className="bg-black/30 rounded-lg p-3 border border-yellow-400/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-300">COMBO</span>
                        </div>
                        <div className="text-lg font-bold text-yellow-200">{combo}x</div>
                        <div className="text-xs text-yellow-400">Streak Multiplier</div>
                      </div>
                    )}

                    {/* Mission Brief Button */}
                    <button
                      onClick={() => {
                        setShowScenario(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow border border-cyan-300/50 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      MISSION BRIEF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="flex-1 flex flex-row gap-2 min-h-0 items-stretch overflow-x-auto">
            {/* Mission Zones */}
            <div className="flex flex-row gap-2 flex-[2_2_0%] min-h-0 h-full justify-stretch items-stretch min-w-[400px] w-full">
              {/* Violations Container */}
              <div className="flex-1 flex flex-col min-h-0 items-stretch min-w-[120px] max-w-[50vw]">
                <h2 className="text-base md:text-lg font-bold text-red-400 game-font text-center mb-1">
                  🎯 VIOLATIONS DETECTED
                </h2>
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div
                    className="w-full"
                    style={{
                      maxHeight: "220px",
                      minHeight: "120px",
                      display: "flex",
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

              {/* Actions Container */}
              <div className="flex-1 flex flex-col min-h-0 items-stretch min-w-[120px] max-w-[50vw]">
                <h2 className="text-base md:text-lg font-bold text-blue-400 game-font text-center mb-1">
                  ⚡ DEPLOY COUNTERMEASURES
                </h2>
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <div
                    className="w-full"
                    style={{
                      maxHeight: "220px",
                      minHeight: "120px",
                      display: "flex",
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

            {/* Arsenal - Reduced z-index to be below dropdown */}
            <div className="flex-1 min-w-[80px] max-w-[80px] sm:max-w-xs flex flex-col h-full min-h-0 items-stretch justify-stretch relative z-10">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-2 border-2 border-cyan-400 glow-border flex flex-col h-full min-h-0">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-xs font-bold text-white game-font">
                    ARSENAL
                  </h3>
                </div>
                <div className="space-y-1 overflow-y-auto flex-1 min-h-0 flex flex-col items-center">
                  {availablePieces.map((piece) => (
                    <DraggablePiece key={piece.id} piece={piece} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Console */}
          {feedback && (
            <div
              className={`mt-1 p-2 rounded-xl text-center font-bold text-xs md:text-base game-font border-2 transform transition-all duration-500 max-w-md mx-auto ${
                feedback.includes("🎯") || feedback.includes("🎉")
                  ? "bg-gradient-to-r from-green-900 to-emerald-900 text-green-300 border-green-500 glow-border-green animate-pulse"
                  : "bg-gradient-to-r from-red-900 to-pink-900 text-red-300 border-red-500 glow-border-red shake"
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Victory Screen */}
          <VictoryPopup
            open={isComplete}
            onClose={() => {
              setIsComplete(false);
              setPlacedPieces({ violations: [], actions: [] });
              setScore(0);
              setCombo(0);
              setHealth(100);
              setFeedback("");
            }}
            score={score}
            combo={combo}
            health={health}
          />
        </div>

        {/* Overlay to close menu when clicking outside - Higher z-index than arsenal but lower than dropdown */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-transparent z-[9998]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};

// Custom drag layer for mobile/desktop drag feedback
const CustomDragLayer = () => {
  const { item, isDragging, sourceOffset, clientOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      isDragging: monitor.isDragging(),
      sourceOffset: monitor.getSourceClientOffset(),
      clientOffset: monitor.getClientOffset(),
    })
  );

  // Detect touch device
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (navigator && navigator.maxTouchPoints > 0));

  // Use sourceOffset if available, else fallback to clientOffset
  const offset = sourceOffset || clientOffset;
  if (!isDragging || !item || !offset) return null;

  // Use the dragged piece's color
  const categoryGradient = "from-blue-500 via-cyan-500 to-teal-500";
  const categoryBorder = "border-cyan-400";

  // Only center the preview on desktop
  const transform = isTouchDevice
    ? `translate(${offset.x}px, ${offset.y}px)`
    : `translate(${offset.x}px, ${offset.y}px) `;

  return (
    <div
      className={`pointer-events-none fixed z-50 left-0 top-0 w-32 opacity-90 transition-transform duration-75 bg-gradient-to-r ${categoryGradient} text-white p-4 rounded-lg font-bold text-center shadow-2xl border-2 ${categoryBorder} game-font`}
      style={{
        transform,
        clipPath:
          "polygon(0% 20%, 10% 20%, 15% 0%, 25% 0%, 30% 20%, 70% 20%, 75% 0%, 85% 0%, 90% 20%, 100% 20%, 100% 80%, 90% 80%, 85% 100%, 75% 100%, 70% 80%, 30% 80%, 25% 100%, 15% 100%, 10% 80%, 0% 80%)",
        filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))",
        pointerEvents: "none",
      }}
    >
      <div className="relative z-10">{item.text}</div>
    </div>
  );
};