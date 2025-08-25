import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, Search, Target, AlertTriangle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection
} from "@dnd-kit/core";
import { useDeviceLayout } from "../../hooks/useOrientation";
import { Question } from "../HackathonData";



export interface Level2SolutionCardProps {
  question: import("../HackathonData").Question;
  selectedSolution: string;
  setSelectedSolution: (solution: string) => void;
  onDragInteraction?: (seconds: number) => void;
}

// Draggable Item Component (solution only)
interface DraggableItemProps {
  id: string;
  text: string;
  isSelected: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, text, isSelected }) => {
  const { isMobile } = useDeviceLayout();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { text },
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };
  const colorClasses = isSelected
    ? "pixel-border bg-gradient-to-r from-cyan-500 to-blue-500"
    : "pixel-border bg-gradient-to-r from-gray-600 to-gray-700 hover:from-cyan-600 hover:to-blue-600";
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...(isMobile && { touchAction: 'none', WebkitTouchAction: 'none', msTouchAction: 'none' }) }}
      {...listeners}
      {...attributes}
      className={`p-2 cursor-grab active:cursor-grabbing transition-all select-none font-[Verdana,Arial,sans-serif] ${isMobile ? "touch-manipulation" : "touch-none"} ${colorClasses} ${isDragging ? "opacity-0" : ""}`}
    >
      <span className="text-white text-xs font-bold pixel-text pointer-events-none font-[Verdana,Arial,sans-serif]">{text}</span>
    </div>
  );
};

// Droppable Zone Component (violation/rootCause)
interface DroppableZoneProps {
  id: string;
  type: "violation" | "rootCause";
  selectedItem: string;
  children: React.ReactNode;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({ id, type, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id, data: { type, isDropZone: true } });
  return (
    <div ref={setNodeRef} className="h-full relative font-[Verdana,Arial,sans-serif]">
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


const Level2SolutionCard: React.FC<Level2SolutionCardProps> = ({ question, selectedSolution, setSelectedSolution, onDragInteraction }) => {
  // Track drag interaction time
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const [totalDragTime, setTotalDragTime] = useState<number>(0);
  // TODO: Replace with actual session_id, email, and module_number from context/auth
  let session_id = window.sessionStorage.getItem('session_id') || "";
  let email = window.sessionStorage.getItem('email') || "";

  // If session_id or email missing, derive from authenticated user or winners_list_l1 (no prompts)
  useEffect(() => {
    async function initUser() {
      try {
        // Prefer authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.warn('[Level2SolutionCard] Auth not ready:', authError.message);
        }

        const authEmail = user?.email || email;
        if (authEmail) {
          email = authEmail;
          window.sessionStorage.setItem('email', authEmail);
        }

        let sid = window.sessionStorage.getItem('session_id') || (user?.user_metadata as any)?.session_id || session_id;

        // Fallback: look up session_id using winners_list_l1 by authenticated email
        if (!sid && authEmail) {
          const { data, error } = await supabase
            .from('winners_list_l1')
            .select('session_id')
            .eq('email', authEmail)
            .maybeSingle();
          if (!error && data?.session_id) {
            sid = data.session_id as string;
          }
        }

        if (sid) {
          session_id = sid;
          window.sessionStorage.setItem('session_id', sid);
        }
      } catch (e) {
        console.error('[Level2SolutionCard] initUser error', e);
      }
    }
    initUser();
  }, []);
  const module_number = 6; // or get from props/context if dynamic

  // Fetch saved solution on mount
  useEffect(() => {
    const fetchSavedSolution = async () => {
      if (!session_id || !email) return;
  const { data } = await supabase
        .from('selected_solution')
        .select('solution')
        .eq('session_id', session_id)
        .eq('email', email)
        .eq('module_number', module_number)
        .single();
      if (data && data.solution) setSelectedSolution(data.solution);
    };
    fetchSavedSolution();
    // eslint-disable-next-line
  }, [session_id, email, module_number]);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  // selectedSolution and setSelectedSolution are now props
  const [activeItem, setActiveItem] = useState<{ text: string } | null>(null);
  const [showCaseChangeIndicator, setShowCaseChangeIndicator] = useState(false);
  const [previousQuestionId, setPreviousQuestionId] = useState<number | null>(null);

  useEffect(() => {
    if (previousQuestionId && previousQuestionId !== question.id) {
      setShowCaseChangeIndicator(true);
      const timer = setTimeout(() => setShowCaseChangeIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousQuestionId(question.id);
  }, [question.id, previousQuestionId]);

  // DnD sensors and collision detection (match Level 1)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 15 } }),
    useSensor(PointerSensor, { activationConstraint: { axis: 'x', distance: isMobile ? 1 : 3, delay: 0, tolerance: isMobile ? 15 : 5 } })
  );
  const customCollisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const validCollisions = pointerCollisions.filter((collision: any) => {
        const validIds = ["violation-zone", "rootCause-zone"];
        return validIds.includes(collision.id);
      });
      if (validCollisions.length > 0) return validCollisions;
    }
    const rectCollisions = rectIntersection(args);
    const validRectCollisions = rectCollisions.filter((collision: any) => {
      const validIds = ["violation-zone", "rootCause-zone"];
      return validIds.includes(collision.id);
    });
    return validRectCollisions.length > 0 ? validRectCollisions : [];
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
  // Show only solutionOptions as draggable options
  const solutionOptions = React.useMemo(() =>
    shuffleArray(question.solutionOptions).map((option, index) => ({
      id: `solution-${index}`,
      text: option,
      isSelected: selectedSolution === option,
    })),
    [question.solutionOptions, selectedSolution]
  );

  // Drag and Drop event handlers (solution only)
  const handleDragStart = (event: any) => {
    setDragStartTime(Date.now());
    const { active } = event;
    const draggedData = active.data.current as { text: string };
    if (draggedData && draggedData.text) setActiveItem(draggedData);
  };

  const handleDragCancel = () => {
    if (dragStartTime) {
      const now = Date.now();
      const rawDuration = (now - dragStartTime) / 1000;
      const duration = Math.max(1, Math.floor(rawDuration));
      setTotalDragTime((prev) => prev + duration);
      console.log('[DEBUG] DragCancel:', {
        dragStartTime,
        now,
        rawDuration,
        duration,
        totalDragTime,
        next: totalDragTime + duration
      });
      if (onDragInteraction) onDragInteraction(totalDragTime + duration);
    }
    setDragStartTime(null);
    setActiveItem(null);
  };

  const handleDragEnd = (event: any) => {
    if (dragStartTime) {
      const now = Date.now();
      const rawDuration = (now - dragStartTime) / 1000;
      const duration = Math.max(1, Math.floor(rawDuration));
      setTotalDragTime((prev) => prev + duration);
      console.log('[DEBUG] DragEnd:', {
        dragStartTime,
        now,
        rawDuration,
        duration,
        totalDragTime,
        next: totalDragTime + duration
      });
      if (onDragInteraction) onDragInteraction(totalDragTime + duration);
    }
    setDragStartTime(null);
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;
    if (over.id !== "violation-zone") return;
    const dropZoneData = over.data.current as { isDropZone?: boolean };
    if (!dropZoneData?.isDropZone) return;
    const draggedData = active.data.current as { text: string };
    if (!draggedData || !draggedData.text) return;
    setSelectedSolution(draggedData.text);
  };
  // Report total drag time to parent on change
  useEffect(() => {
    console.log('[DEBUG] useEffect totalDragTime', totalDragTime);
    if (onDragInteraction) onDragInteraction(totalDragTime);
    // eslint-disable-next-line
  }, [totalDragTime]);



  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col bg-gray-800 overflow-hidden relative" style={{ height: "calc(100vh - 80px)" }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

        {/* CASE SCENARIO HEADER (matches Level 1) */}
        {!isMobileHorizontal && (
          <div className="relative z-10 pixel-border p-4 m-2 mb-0 bg-gradient-to-r from-cyan-600 to-blue-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-black pixel-text text-lg transition-all duration-500 ${showCaseChangeIndicator 
                ? 'text-yellow-300 animate-pulse drop-shadow-lg shadow-yellow-400/50 scale-105' 
                : 'text-cyan-100'
              }`}>
                SOLUTION ROUND
              </h3>
              {showCaseChangeIndicator && (
                <div className="flex items-center space-x-2 animate-bounce">
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  <span className="text-yellow-300 font-black text-xs pixel-text">
                    NEW CASE
                  </span>
                </div>
              )}
            </div>
            <p className="text-cyan-50 text-sm font-bold">
              {question.caseFile} <br />
              Drag the correct Solution to the drop zone.
            </p>
            {showCaseChangeIndicator && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <span className="text-yellow-200 text-xs font-bold">
                  Case scenario has changed - review carefully!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main Content - Match Level 1 UI for first two columns */}
        <div className="relative z-10 flex-1 flex p-2 space-x-3 min-h-0">
          {/* OPTIONS AREA - Left Panel (matches Level 1) */}
          <div className="w-1/3 flex-shrink-0 flex flex-col min-h-0 z-30">
            <div className="pixel-border-thick bg-gray-800 p-4 flex-1 overflow-hidden flex flex-col min-h-0 relative z-30">
              <div className="absolute inset-0 bg-pixel-pattern opacity-10 z-10"></div>
              <div className="absolute inset-0 bg-scan-lines opacity-20 z-10"></div>
              <div className="relative z-20 flex flex-col h-full min-h-0">
                <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
                  <div className="w-6 h-6 bg-cyan-500 pixel-border flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-900" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-cyan-300 pixel-text">SOLUTION</h2>
                    {!isMobileHorizontal && (
                      <div className="text-xs text-gray-400 font-bold">
                        ITEMS: {solutionOptions.length} | DRAG TO ZONE
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-700">
                    <div className="space-y-2 p-1">
                      {solutionOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className="animate-slideIn"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <DraggableItem
                            id={option.id}
                            text={option.text}
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

          {/* DND DROP ZONES - Middle Panel (only Violation Drop Zone remains) */}
          <div className="flex-1 flex gap-3 min-h-0">
            {/* Violation Drop Zone */}
            <div className="flex-1 animate-slideIn" style={{ animationDelay: "0ms" }}>
              <div className="pixel-border-thick bg-gradient-to-br from-indigo-900 to-indigo-800 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
                {/* Header */}
                <div className="relative z-10 p-3 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-800 pixel-border flex items-center justify-center">
                        <Target className="w-3 h-3 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white pixel-text">ONE SOLUTION</h3>
                        <div className="text-white/80 text-xs">Scanner Zone</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Drop Zone */}
                <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto relative z-10">
                  <DroppableZone id="violation-zone" type="violation" selectedItem={selectedSolution}>
                    {selectedSolution ? (
                      <div className="h-full flex flex-col">
                        <div className="text-center py-2 border-b border-blue-700/30">
                          <div className="w-8 h-8 bg-blue-800 pixel-border mx-auto mb-1 flex items-center justify-center animate-pulse">
                            <CheckCircle className="w-5 h-5 text-blue-300" />
                          </div>
                          <p className="text-blue-100 font-black pixel-text text-xs">SOLUTION DETECTED!</p>
                        </div>
                        <div className="flex-1 p-3">
                          <div className="w-full">
                            <div className="pixel-border-thick bg-gradient-to-r from-blue-900 to-blue-700 p-3 relative overflow-hidden">
                              <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>
                              <div className="relative z-10">
                                <div className="flex items-center mb-2">
                                  <div className="w-6 h-6 bg-blue-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-4 h-4 text-blue-300" />
                                  </div>
                                  <p className="text-white text-xs font-black pixel-text leading-tight">{selectedSolution}</p>
                                </div>
                              </div>
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
                        <p className="text-white/80 font-bold text-sm">DROP ZONE</p>
                        <p className="text-white/60 text-xs">Drag solution here</p>
                      </div>
                    )}
                  </DroppableZone>
                </div>
              </div>
            </div>
          </div>



          {/* Correct Violation & Root Cause - Right Panel (unchanged) */}
          <div className="w-1/3 flex flex-col min-h-0">
            <div className="pixel-border-thick bg-gradient-to-br from-indigo-900 to-indigo-800 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col mb-3">
              <div className="relative z-10 p-3 flex-shrink-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-5 h-5 bg-blue-800 pixel-border flex items-center justify-center">
                    <Target className="w-3 h-3 text-blue-300" />
                  </div>
                  <h3 className="text-xs font-black text-white pixel-text">CORRECT VIOLATION</h3>
                </div>
              </div>
              <div className="flex-1 p-3 flex items-center">
                <div className="w-full pixel-border-thick bg-gradient-to-r from-blue-900 to-blue-700 p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-6 h-6 bg-blue-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-blue-300" />
                    </div>
                    <p className="text-white text-xs font-black pixel-text leading-tight">{question.correctViolation}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pixel-border-thick bg-gradient-to-br from-purple-900 to-purple-800 h-full relative overflow-hidden transition-all duration-300 rounded-lg flex flex-col">
              <div className="relative z-10 p-3 flex-shrink-0">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-5 h-5 bg-purple-800 pixel-border flex items-center justify-center">
                    <Search className="w-3 h-3 text-purple-300" />
                  </div>
                  <h3 className="text-xs font-black text-white pixel-text">CORRECT ROOT CAUSE</h3>
                </div>
              </div>
              <div className="flex-1 p-3 flex items-center">
                <div className="w-full pixel-border-thick bg-gradient-to-r from-purple-900 to-purple-700 p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-pixel-pattern opacity-20"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-6 h-6 bg-purple-800 pixel-border mr-2 flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-purple-300" />
                    </div>
                    <p className="text-white text-xs font-black pixel-text leading-tight">{question.correctRootCause}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div className="pixel-border bg-gradient-to-r from-cyan-500 to-blue-500 p-2 cursor-grabbing transform scale-110 opacity-95 shadow-2xl pointer-events-none" style={{ zIndex: 9999 }}>
              <span className="text-white text-xs font-black pixel-text">{activeItem.text}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Level2SolutionCard;