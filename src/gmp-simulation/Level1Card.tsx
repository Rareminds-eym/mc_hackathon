import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { CheckCircle, ChevronRight, Search, Target } from "lucide-react";
import React, { useState } from "react";
import { useDeviceLayout } from "../hooks/useOrientation";
import { Question } from "./HackathonData";

interface Level1CardProps {
  question: Question;
  onAnswer: (answer: Partial<{ violation: string; rootCause: string }>) => void;
  onNext: () => void;
  currentAnswer?: { violation?: string; rootCause?: string };
  session_id?: string | null;
  email?: string | null;
}

// Draggable Item Component
interface DraggableItemProps {
  id: string;
  text: string;
  type: "violation" | "rootCause";
  isSelected: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  text,
  type,
  isSelected,
}) => {
  const { isMobile } = useDeviceLayout();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { text, type },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  const colorClasses = isSelected
    ? "pixel-border bg-gradient-to-r from-cyan-500 to-blue-500"
    : "pixel-border bg-gradient-to-r from-gray-600 to-gray-700 hover:from-cyan-600 hover:to-blue-600";

  // Mobile-optimized event handlers
  const handleClick = (e: React.MouseEvent) => {
    if (!isMobile) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchStart = () => {
    // Prevent scrolling when touching draggable items on mobile
    if (isMobile) {
      // Strong haptic feedback for mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  // Enhanced listeners for mobile touch
  const enhancedListeners = isMobile ? {
    ...listeners,
    onTouchStart: handleTouchStart,
  } : {
    ...listeners,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(isMobile && {
          touchAction: 'none',
          WebkitTouchAction: 'none',
          msTouchAction: 'none',
        }),
      }}
      {...enhancedListeners}
      {...attributes}
      onClick={handleClick}
      className={`p-2 cursor-grab active:cursor-grabbing transition-all select-none ${
        isMobile ? "touch-manipulation" : "touch-none"
      } ${colorClasses} ${isDragging ? "opacity-0" : ""}`}
    >
      <span className="text-white text-xs font-bold pixel-text pointer-events-none">
        {text}
      </span>
    </div>
  );
};

// Droppable Zone Component
interface DroppableZoneProps {
  id: string;
  type: "violation" | "rootCause";
  selectedItem: string;
  children: React.ReactNode;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  type,
  selectedItem,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type, isDropZone: true },
  });

  return (
    <div ref={setNodeRef} className="h-full relative">
      {/* Drop Zone Effects */}
      {isOver && (
        <div className="absolute inset-0">
          <div className="absolute inset-1 border-2 border-dashed border-cyan-300 animate-pulse rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-3 border-yellow-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute inset-2 bg-cyan-400 opacity-20 animate-pulse rounded-lg"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black animate-bounce pixel-text">
            DROP HERE!
          </div>
        </div>
      )}

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

const Level1Card: React.FC<Level1CardProps> = ({
  question,
  onAnswer,
  onNext,
  currentAnswer,
}) => {
  const [selectedViolation, setSelectedViolation] = useState(
    currentAnswer?.violation || ""
  );
  const [selectedRootCause, setSelectedRootCause] = useState(
    currentAnswer?.rootCause || ""
  );
  const [activeItem, setActiveItem] = useState<{
    text: string;
    type: "violation" | "rootCause";
  } | null>(null);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Reset fields when question changes
  React.useEffect(() => {
    setSelectedViolation(currentAnswer?.violation || "");
    setSelectedRootCause(currentAnswer?.rootCause || "");
    setActiveItem(null);
  }, [question.id, currentAnswer]);

  // Custom collision detection that only allows drops on specific zones
  const customCollisionDetection = (args: any) => {
    // First, let's try pointer intersection for more precise detection
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Filter to only our designated drop zones
      const validCollisions = pointerCollisions.filter((collision: any) => {
        const validIds = ["violation-zone", "rootCause-zone"];
        return validIds.includes(collision.id);
      });

      if (validCollisions.length > 0) {
        return validCollisions;
      }
    }

    // Fallback to rectangle intersection but still filter
    const rectCollisions = rectIntersection(args);
    const validRectCollisions = rectCollisions.filter((collision: any) => {
      const validIds = ["violation-zone", "rootCause-zone"];
      return validIds.includes(collision.id);
    });

    return validRectCollisions.length > 0 ? validRectCollisions : [];
  };
  // Setup sensors for drag and drop with mobile-optimized constraints
  const sensors = useSensors(
    // Mouse sensor for desktop
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3, // Very low distance
      },
    }),
    // Touch sensor with minimal constraints for mobile
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // No delay for immediate response
        tolerance: 15, // High tolerance for easier touch
      },
    }),
    // Pointer sensor with ultra-low constraints for mobile
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 1 : 3, // Almost no distance for mobile
        delay: 0, // No delay
        tolerance: isMobile ? 15 : 5, // Very high tolerance for mobile
      },
    })
  );

  const canProceed = selectedViolation && selectedRootCause;

  // Simple haptic feedback for mobile devices
  const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'strong' = 'light') => {
    if (!isMobile || !('vibrate' in navigator)) return;

    const patterns = {
      light: 15,
      medium: 30,
      strong: [40, 20, 40]
    };

    navigator.vibrate(patterns[intensity]);
  };

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Combine and shuffle violations and root causes
  const combinedOptions = React.useMemo(() => {
    const violations = question.violationOptions.map((option, index) => ({
      id: `violation-${index}`,
      text: option,
      type: "violation" as const,
      isSelected: selectedViolation === option,
    }));

    const rootCauses = question.rootCauseOptions.map((option, index) => ({
      id: `rootCause-${index}`,
      text: option,
      type: "rootCause" as const,
      isSelected: selectedRootCause === option,
    }));

    return shuffleArray([...violations, ...rootCauses]);
  }, [
    question.violationOptions,
    question.rootCauseOptions,
    selectedViolation,
    selectedRootCause,
  ]);

  const handleViolationSelect = (violation: string) => {
    setSelectedViolation(violation);
    onAnswer({ violation });
  };

  const handleRootCauseSelect = (rootCause: string) => {
    setSelectedRootCause(rootCause);
    onAnswer({ rootCause });
  };

  // Drag and Drop event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedData = active.data.current as {
      text: string;
      type: "violation" | "rootCause";
    };

    if (draggedData && draggedData.text) {
      setActiveItem(draggedData);
      // Provide haptic feedback on drag start
      triggerHapticFeedback('strong');
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    // Light haptic feedback for cancelled drag
    triggerHapticFeedback('light');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("Drag end event:", {
      activeId: active?.id,
      overId: over?.id,
      overData: over?.data?.current,
    });

    // Always clear the active item first
    setActiveItem(null);

    // If there's no drop target, don't do anything
    if (!over) {
      console.log("Dropped outside of any drop zone - no 'over' detected");
      triggerHapticFeedback('light'); // Cancelled drop
      return;
    }

    // Strict validation - only allow drops on our specific zones
    const validDropZoneIds = ["violation-zone", "rootCause-zone"];
    if (!validDropZoneIds.includes(over.id as string)) {
      console.log("Invalid drop zone ID:", over.id);
      return;
    }

    // Check if the drop target has the isDropZone flag
    const dropZoneData = over.data.current as {
      type: "violation" | "rootCause";
      isDropZone?: boolean;
    };

    // Only proceed if this is actually one of our designated drop zones
    if (!dropZoneData?.isDropZone) {
      console.log("Dropped on non-drop zone element:", over.id);
      return;
    }

    const draggedData = active.data.current as {
      text: string;
      type: "violation" | "rootCause";
    };

    // Validate that we have proper drag data
    if (!draggedData || !draggedData.text) {
      console.warn("Invalid drag data:", draggedData);
      return;
    }

    // Validate that we have proper drop zone data
    if (!dropZoneData || !dropZoneData.type) {
      console.warn("Invalid drop zone data:", dropZoneData);
      return;
    }

    // Final validation: exact ID and type matching
    if (over.id === "violation-zone" && dropZoneData.type === "violation") {
      console.log(
        "✅ Successfully dropping item in violation zone:",
        draggedData.text
      );
      handleViolationSelect(draggedData.text);
      triggerHapticFeedback('strong'); // Successful drop
    } else if (
      over.id === "rootCause-zone" &&
      dropZoneData.type === "rootCause"
    ) {
      console.log(
        "✅ Successfully dropping item in root cause zone:",
        draggedData.text
      );
      handleRootCauseSelect(draggedData.text);
      triggerHapticFeedback('strong'); // Successful drop
    } else {
      console.log("❌ Drop zone validation failed:", {
        dropZoneId: over.id,
        dropZoneType: dropZoneData.type,
        draggedText: draggedData.text,
      });
      triggerHapticFeedback('light'); // Failed drop
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="flex flex-col bg-gray-800 overflow-hidden relative"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

        {/* PROBLEM SCENARIO */}
        {!isMobileHorizontal && (
          <div className="relative z-10 pixel-border bg-gradient-to-r from-cyan-600 to-blue-600 p-4 m-2 mb-0">
            <h3 className="text-cyan-100 font-black pixel-text mb-2">
              PROBLEM SCENARIO
            </h3>
            <p className="text-cyan-50 text-sm font-bold">
              {question.caseFile} <br />
              Read the scenario carefully, spot the violation and its root
              cause, and place them in the right category containers.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex p-2 space-x-3 min-h-0">
          {/* COMMAND CENTER - Items Pool */}
          <div className="w-1/3 flex-shrink-0 flex flex-col min-h-0">
            <div className="pixel-border-thick bg-gray-800 p-4 flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
              <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

              <div className="relative z-10 flex flex-col h-full min-h-0">
                {/* Command Center Header */}
                <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
                  <div className="w-6 h-6 bg-cyan-500 pixel-border flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-900" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-cyan-300 pixel-text">
                      VIOLATION & ROOT CAUSE
                    </h2>
                    {!isMobileHorizontal && (
                      <div className="text-xs text-gray-400 font-bold">
                        ITEMS: {combinedOptions.length} | DRAG TO ZONES
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Pool - Scrollable with Max Height */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-700">
                    <div className="space-y-2 p-1">
                      {combinedOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className="animate-slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <DraggableItem
                            id={option.id}
                            text={option.text}
                            type={option.type}
                            isSelected={option.isSelected}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TARGET ZONES */}
          <div className="flex-1 flex gap-3 min-h-0">
            {/* Violation Scanner */}
            <div
              className="flex-1 animate-slideIn"
              style={{ animationDelay: "0ms" }}
            >
              <div className="pixel-border-thick bg-gradient-to-br from-indigo-900 to-indigo-800 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
                {/* Header */}
                <div className="relative z-10 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-800 pixel-border flex items-center justify-center">
                        <Target className="w-3 h-3 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white pixel-text">
                          VIOLATION
                        </h3>
                        <div className="text-white/80 text-xs">
                          Scanner Zone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop Zone */}
                <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto relative z-10">
                  <DroppableZone
                    id="violation-zone"
                    type="violation"
                    selectedItem={selectedViolation}
                  >
                    {selectedViolation ? (
                      <div className="h-full flex flex-col">
                        {/* Status Header */}
                        <div className="text-center py-2 border-b border-blue-700/30">
                          <div className="w-8 h-8 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-5 h-5 text-blue-300" />
                          </div>
                          <p className="text-blue-100 font-black pixel-text text-xs">
                            VIOLATION DETECTED!
                          </p>
                        </div>

                        {/* Dropped Item Display */}
                        <div className="flex-1 p-3">
                          <div className="w-full">
                            <div className="pixel-border-thick bg-gradient-to-r from-blue-900 to-blue-700 p-3 relative overflow-hidden">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>

                              {/* Content */}
                              <div className="relative z-10">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-blue-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-4 h-4 text-blue-300" />
                                  </div>
                                  <p className="text-white text-xs font-black pixel-text leading-tight">
                                    {selectedViolation}
                                  </p>
                                </div>
                              </div>

                              {/* Success Animation */}
                              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-800 rounded-full animate-ping"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/20 mx-auto mb-3 flex items-center justify-center rounded-full">
                          <Target className="w-8 h-8 text-white/60" />
                        </div>
                        <p className="text-white/80 font-bold text-sm">
                          DROP ZONE
                        </p>
                        <p className="text-white/60 text-xs">
                          Drag violation here
                        </p>
                      </div>
                    )}
                  </DroppableZone>
                </div>
              </div>
            </div>

            {/* Root Cause Analyzer */}
            <div
              className="flex-1 animate-slideIn"
              style={{ animationDelay: "150ms" }}
            >
              <div className="pixel-border-thick bg-gradient-to-br from-purple-900 to-purple-800 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
                {/* Header */}
                <div className="relative z-10 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-purple-800 pixel-border flex items-center justify-center">
                        <Search className="w-3 h-3 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white pixel-text">
                          ROOT CAUSE
                        </h3>
                        <div className="text-purple-100/80 text-xs">
                          Analyzer Zone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop Zone */}
                <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto relative z-10">
                  <DroppableZone
                    id="rootCause-zone"
                    type="rootCause"
                    selectedItem={selectedRootCause}
                  >
                    {selectedRootCause ? (
                      <div className="h-full flex flex-col">
                        {/* Status Header */}
                        <div className="text-center py-2 border-b border-purple-700/30">
                          <div className="w-8 h-8 bg-purple-800 pixel-border mx-auto mb-1 flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-5 h-5 text-purple-300" />
                          </div>
                          <p className="text-purple-100 font-black pixel-text text-xs">
                            ROOT CAUSE FOUND!
                          </p>
                        </div>

                        {/* Dropped Item Display */}
                        <div className="flex-1 p-3">
                          <div className="w-full">
                            <div className="pixel-border-thick bg-gradient-to-r from-purple-900 to-purple-700 p-3 relative overflow-hidden">
                              {/* Background Pattern */}
                              <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>

                              {/* Content */}
                              <div className="relative z-10">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-purple-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                                    <Search className="w-4 h-4 text-purple-300" />
                                  </div>
                                  <p className="text-white text-xs font-black pixel-text leading-tight">
                                    {selectedRootCause}
                                  </p>
                                </div>
                              </div>

                              {/* Success Animation */}
                              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-800 rounded-full animate-ping"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-white/20 mx-auto mb-3 flex items-center justify-center rounded-full">
                          <Search className="w-8 h-8 text-white/60" />
                        </div>
                        <p className="text-white/80 font-bold text-sm">
                          DROP ZONE
                        </p>
                        <p className="text-white/60 text-xs">
                          Drag root cause here
                        </p>
                      </div>
                    )}
                  </DroppableZone>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button - Fixed Position */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-4 py-3 pixel-border font-black pixel-text transition-all shadow-lg ${
                canProceed
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white transform hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              <span className="text-sm">PROCEED</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div
            className="pixel-border bg-gradient-to-r from-cyan-500 to-blue-500 p-2 cursor-grabbing transform scale-110 opacity-95 shadow-2xl pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <span className="text-white text-xs font-black pixel-text">
              {activeItem.text}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export { Level1Card };
export default Level1Card;
