import React, { useState } from 'react';
import {
  Search, ChevronRight, CheckCircle, Target
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { useDeviceLayout } from '../hooks/useOrientation';
import { Question } from './HackathonData';

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
  type: 'violation' | 'rootCause';
  isSelected: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, text, type, isSelected }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: { text, type },
  });



  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const colorClasses = type === 'violation' 
    ? isSelected 
      ? 'border-cyan-400 bg-cyan-500/20' 
      : 'border-slate-600 bg-slate-700/50 hover:border-cyan-500/50'
    : isSelected 
      ? 'border-orange-400 bg-orange-500/20' 
      : 'border-slate-600 bg-slate-700/50 hover:border-orange-500/50';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}


      className={`p-2 rounded border cursor-grab transition-all select-none touch-none ${colorClasses} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="text-white text-sm">{text}</span>
    </div>
  );
};

// Droppable Zone Component
interface DroppableZoneProps {
  id: string;
  type: 'violation' | 'rootCause';
  selectedItem: string;
  children: React.ReactNode;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({ id, type, selectedItem, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type },
  });

  const colorClasses = type === 'violation'
    ? isOver
      ? 'border-cyan-400 bg-cyan-500/20 scale-105 shadow-lg shadow-cyan-500/25'
      : selectedItem
      ? 'border-cyan-500/50 bg-cyan-500/10'
      : 'border-slate-600 bg-slate-700/50'
    : isOver
      ? 'border-orange-400 bg-orange-500/20 scale-105 shadow-lg shadow-orange-500/25'
      : selectedItem
      ? 'border-orange-500/50 bg-orange-500/10'
      : 'border-slate-600 bg-slate-700/50';

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-4 min-h-24 transition-all ${colorClasses}`}
    >
      {children}
    </div>
  );
};

const Level1Card: React.FC<Level1CardProps> = ({
  question,
  onAnswer,
  onNext,
  currentAnswer
}) => {
  const [selectedViolation, setSelectedViolation] = useState(currentAnswer?.violation || '');
  const [selectedRootCause, setSelectedRootCause] = useState(currentAnswer?.rootCause || '');
  const [activeItem, setActiveItem] = useState<{ text: string; type: 'violation' | 'rootCause' } | null>(null);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Setup sensors for drag and drop with higher thresholds to prevent click selection
  const sensors = useSensors(
    // Mouse sensor for desktop - requires significant movement
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement to start drag
      },
    }),
    // Touch sensor with delay to distinguish from taps
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay to prevent tap selection
        tolerance: 5, // Lower tolerance after delay
      },
    }),
    // Pointer sensor with higher distance threshold
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 8 : 10, // Higher distance requirement
        delay: isMobile ? 100 : 0, // Small delay on mobile
        tolerance: 5, // Lower tolerance
      },
    })
  );

  const canProceed = selectedViolation && selectedRootCause;

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
    const draggedData = active.data.current as { text: string; type: 'violation' | 'rootCause' };
    setActiveItem(draggedData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const draggedData = active.data.current as { text: string; type: 'violation' | 'rootCause' };
    const dropZoneData = over.data.current as { type: 'violation' | 'rootCause' };

    // Only allow drops in matching zones
    if (draggedData.type === dropZoneData.type) {
      if (draggedData.type === 'violation') {
        handleViolationSelect(draggedData.text);
      } else if (draggedData.type === 'rootCause') {
        handleRootCauseSelect(draggedData.text);
      }
    }

    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Case Brief */}
        {!isMobileHorizontal && (
          <div className="bg-slate-800 p-4 border-b border-cyan-500/20">
            <h3 className="text-cyan-300 font-bold mb-2">CASE BRIEF</h3>
            <p className="text-gray-200 text-sm">{question.caseFile}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex p-4 space-x-4">
          {/* Evidence Panel */}
          <div className="w-1/3 bg-slate-800/90 rounded-xl p-4 border border-cyan-400/30">
            <h3 className="text-cyan-300 font-bold mb-4">EVIDENCE ARSENAL</h3>
            
            {/* Violations */}
            <div className="mb-6">
              <h4 className="text-cyan-300 text-sm font-bold mb-2">VIOLATIONS</h4>
              <div className="space-y-2">
                {question.violationOptions.map((option, index) => (
                  <DraggableItem
                    key={`violation-${index}`}
                    id={`violation-${index}`}
                    text={option}
                    type="violation"
                    isSelected={selectedViolation === option}
                  />
                ))}
              </div>
            </div>

            {/* Root Causes */}
            <div>
              <h4 className="text-orange-300 text-sm font-bold mb-2">ROOT CAUSES</h4>
              <div className="space-y-2">
                {question.rootCauseOptions.map((option, index) => (
                  <DraggableItem
                    key={`rootCause-${index}`}
                    id={`rootCause-${index}`}
                    text={option}
                    type="rootCause"
                    isSelected={selectedRootCause === option}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="w-2/3 bg-slate-800/90 rounded-xl p-4 border border-blue-400/30">
            <h3 className="text-blue-300 font-bold mb-4">INVESTIGATION ZONES</h3>
            
            <div className="space-y-4">
              {/* Violation Scanner */}
              <div>
                <h4 className="text-cyan-300 text-sm font-bold mb-2">VIOLATION SCANNER</h4>
                <DroppableZone
                  id="violation-zone"
                  type="violation"
                  selectedItem={selectedViolation}
                >
                  {selectedViolation ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400" />
                        <span className="text-white font-bold text-sm">VIOLATION DETECTED</span>
                      </div>
                      <p className="text-white text-sm">{selectedViolation}</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Target className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">Drop violation here</p>
                    </div>
                  )}
                </DroppableZone>
              </div>

              {/* Root Cause Analyzer */}
              <div>
                <h4 className="text-orange-300 text-sm font-bold mb-2">ROOT CAUSE ANALYZER</h4>
                <DroppableZone
                  id="rootCause-zone"
                  type="rootCause"
                  selectedItem={selectedRootCause}
                >
                  {selectedRootCause ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-orange-400" />
                        <span className="text-white font-bold text-sm">ROOT CAUSE FOUND</span>
                      </div>
                      <p className="text-white text-sm">{selectedRootCause}</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Search className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">Drop root cause here</p>
                    </div>
                  )}
                </DroppableZone>
              </div>

              {/* Proceed Button */}
              <div className="mt-6 flex flex-col items-center">
                <div className="text-slate-400 text-xs mb-3 text-center">
                  Drag & Drop to select both violation and root cause
                </div>
                <button
                  onClick={onNext}
                  disabled={!canProceed}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all ${
                    canProceed
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg transform hover:scale-105'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>PROCEED TO NEXT CASE</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className={`p-2 rounded border cursor-grabbing shadow-lg ${
            activeItem.type === 'violation'
              ? 'border-cyan-400 bg-cyan-500/20'
              : 'border-orange-400 bg-orange-500/20'
          } bg-slate-800/90 backdrop-blur-sm transform scale-105 opacity-90`}>
            <span className="text-white text-sm font-medium">
              {activeItem.text || 'Dragging...'}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export { Level1Card };
export default Level1Card;
