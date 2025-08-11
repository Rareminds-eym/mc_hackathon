import React, { useState, useRef } from 'react';
import {
  Search, ChevronRight, Factory, CheckCircle, Target,
  Star, Shield, Award, Crosshair, Brain, Trophy,
  Eye
} from 'lucide-react';
import { useDeviceLayout } from '../hooks/useOrientation';
import { Question } from './HackathonData';

interface QuestionCardProps {
  question: Question;
  level: number;
  onAnswer: (answer: Partial<{ violation: string; rootCause: string; solution: string }>) => void;
  onNext: () => void;
  currentAnswer?: { violation?: string; rootCause?: string; solution?: string };
  level1Answers?: { violation?: string; rootCause?: string; solution?: string };
  session_id?: string | null;
  email?: string | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  level,
  onAnswer,
  onNext,
  currentAnswer,
  level1Answers,
  session_id,
  email
}) => {
  const [selectedViolation, setSelectedViolation] = useState(currentAnswer?.violation || '');
  const [selectedRootCause, setSelectedRootCause] = useState(currentAnswer?.rootCause || '');
  const [selectedSolution, setSelectedSolution] = useState(currentAnswer?.solution || '');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isViolationDragOver, setIsViolationDragOver] = useState(false);
  const [isRootCauseDragOver, setIsRootCauseDragOver] = useState(false);
  const [showCaseBrief, setShowCaseBrief] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<string>('');
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  const [dragOverlay, setDragOverlay] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
    type: 'violation' | 'rootCause' | 'solution' | null;
  }>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    type: null
  });
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const canProceed = level === 1 
    ? selectedViolation && selectedRootCause 
    : selectedSolution;

  const handleViolationSelect = (violation: string) => {
    setSelectedViolation(violation);
    onAnswer({ violation });
  };

  const handleRootCauseSelect = (rootCause: string) => {
    setSelectedRootCause(rootCause);
    onAnswer({ rootCause });
  };

  const handleSolutionSelect = (solution: string) => {
    setSelectedSolution(solution);
    onAnswer({ solution });
  };

  // Drag and Drop handlers for Level 1
  const handleViolationDragStart = (e: React.DragEvent, violation: string) => {
    console.log('Drag start:', violation);
    e.dataTransfer.setData('text/plain', violation);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'violation', value: violation }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.dropEffect = 'move';
    setDraggedItem(violation);
  };

  const handleViolationDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsViolationDragOver(true);
    console.log('Drag over violation zone');
  };

  const handleViolationDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsViolationDragOver(false);
  };

  const handleViolationDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const violation = e.dataTransfer.getData('text/plain');
    console.log('Violation drop:', violation);
    if (violation) {
      handleViolationSelect(violation);
    }
    setDraggedItem(null);
    setIsViolationDragOver(false);
  };

  const handleRootCauseDragStart = (e: React.DragEvent, rootCause: string) => {
    e.dataTransfer.setData('text/plain', rootCause);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(rootCause);
  };

  const handleRootCauseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsRootCauseDragOver(true);
  };

  const handleRootCauseDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRootCauseDragOver(false);
  };

  const handleRootCauseDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rootCause = e.dataTransfer.getData('text/plain');
    if (rootCause) {
      handleRootCauseSelect(rootCause);
    }
    setDraggedItem(null);
    setIsRootCauseDragOver(false);
  };

  // Level 2 drag handlers
  const handleDragStart = (e: React.DragEvent, solution: string) => {
    e.dataTransfer.setData('text/plain', solution);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(solution);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const solution = e.dataTransfer.getData('text/plain');
    if (solution) {
      handleSolutionSelect(solution);
    }
    setDraggedItem(null);
    setIsDragOver(false);
  };

  const handleTouchStart = (solution: string) => {
    setDraggedItem(solution);
  };

  const handleTouchEnd = () => {
    setDraggedItem(null);
  };

  // Level 2 Game-style Drag System with Clean Overlay
  const handleAdvancedMouseDown = (e: React.MouseEvent, option: string, type: 'violation' | 'rootCause' | 'solution') => {
    e.preventDefault();
    console.log('🎮 Game drag started:', option, type);

    const startX = e.clientX;
    const startY = e.clientY;

    setIsMouseDragging(true);
    setDraggedItem(option);
    setDragStartPos({ x: startX, y: startY });
    setDragPreview(option);

    let isDragging = false;
    let currentDropZone: string | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);

      // Start visual drag if moved more than 8 pixels
      if (!isDragging && (deltaX > 8 || deltaY > 8)) {
        isDragging = true;
        console.log('🎮 Visual drag activated for:', option);

        // Show drag overlay
        setDragOverlay({
          visible: true,
          text: option,
          x: e.clientX,
          y: e.clientY,
          type: type
        });

        // Add drag class to body to change cursor
        document.body.style.cursor = 'grabbing';
        document.body.classList.add('dragging');
      }

      if (isDragging) {
        // Update overlay position
        setDragOverlay(prev => ({
          ...prev,
          x: e.clientX,
          y: e.clientY
        }));

        // Check what's under the cursor
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
        const dropZone = elementUnderMouse?.closest('[data-drop-zone]');
        const dropZoneType = dropZone?.getAttribute('data-drop-zone');

        // Update drop zone highlights
        if (dropZoneType !== currentDropZone) {
          // Clear previous highlights
          document.querySelectorAll('[data-drop-zone]').forEach(zone => {
            zone.classList.remove('drag-over-active');
          });

          // Add new highlight if compatible
          if (dropZone && (
            (type === 'violation' && dropZoneType === 'violation') ||
            (type === 'rootCause' && dropZoneType === 'rootCause') ||
            (type === 'solution' && dropZoneType === 'solution')
          )) {
            dropZone.classList.add('drag-over-active');
            currentDropZone = dropZoneType;
          } else {
            currentDropZone = null;
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      console.log('🎮 Drag ended, checking drop zone');

      // Hide drag overlay
      setDragOverlay(prev => ({ ...prev, visible: false }));

      // Clean up
      document.body.style.cursor = '';
      document.body.classList.remove('dragging');
      document.querySelectorAll('[data-drop-zone]').forEach(zone => {
        zone.classList.remove('drag-over-active');
      });

      if (isDragging) {
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
        const dropZone = elementUnderMouse?.closest('[data-drop-zone]');
        const dropZoneType = dropZone?.getAttribute('data-drop-zone');

        // Check for valid drop
        let dropped = false;
        if (type === 'violation' && dropZoneType === 'violation') {
          console.log('🎯 Dropped violation:', option);
          handleViolationSelect(option);
          dropped = true;
        } else if (type === 'rootCause' && dropZoneType === 'rootCause') {
          console.log('🎯 Dropped root cause:', option);
          handleRootCauseSelect(option);
          dropped = true;
        } else if (type === 'solution' && dropZoneType === 'solution') {
          console.log('🎯 Dropped solution:', option);
          handleSolutionSelect(option);
          dropped = true;
        }

        if (dropped) {
          // Add success effect to drop zone
          if (dropZone) {
            dropZone.classList.add('drop-success');
            setTimeout(() => dropZone.classList.remove('drop-success'), 600);
          }
        } else {
          console.log('❌ Invalid drop');
        }
      }

      setIsMouseDragging(false);
      setDraggedItem(null);
      setDragPreview('');

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (level === 1) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden relative">
        {/* Clean Drag Overlay for Level 1 */}
        {dragOverlay.visible && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: dragOverlay.x,
              top: dragOverlay.y,
            }}
          >
            <div className={`px-3 py-2 rounded-lg shadow-2xl border text-white text-xs font-bold max-w-48 truncate ${
              dragOverlay.type === 'violation'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400'
                : dragOverlay.type === 'rootCause'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-400'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400'
            }`}>
              {dragOverlay.text}
            </div>
          </div>
        )}

        {/* Modern Case Brief Section - Only visible in desktop/portrait mode */}
        {!isMobileHorizontal && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-blue-900/10 to-slate-900/95 border-b border-cyan-400/30">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-600/5"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>

            <div className="relative p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-cyan-400/50 rounded-full blur-sm"></div>
                </div>
                <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-200 tracking-wider">
                  CASE BRIEF
                </h3>
                <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30">
                  <span className="text-cyan-300 text-sm font-bold">CLASSIFIED</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border border-cyan-500/20 shadow-xl backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="relative mt-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-red-500/30 rounded-full animate-ping"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-red-400 text-xs font-bold mb-2 tracking-wide">⚠ PRIORITY ALERT</div>
                    <p className="text-gray-100 text-sm leading-relaxed font-medium">{question.caseFile}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Modern Investigation Interface */}
        <div className="flex-1 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/5 to-slate-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

          <div className="relative flex p-4 space-x-4 min-h-0 h-full">

            {/* Left Panel - Evidence Arsenal */}
            <div className="w-1/3 flex flex-col space-y-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-cyan-400/30 flex-1 shadow-2xl">
                {/* Panel Header */}
                <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 border-b border-cyan-400/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <Shield className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-cyan-400/50 rounded-full blur-sm"></div>
                    </div>
                    <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-200 tracking-wider">
                      EVIDENCE ARSENAL
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30">
                      <span className="text-green-300 text-sm font-bold">READY</span>
                    </div>
                  </div>
                </div>

                {/* Panel Content */}
                <div className="p-4 space-y-6 h-full overflow-hidden">
                  {/* Violation Evidence Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                        <Crosshair className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="text-sm font-black text-cyan-300 tracking-wide">VIOLATION EVIDENCE</h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {question.violationOptions.map((option) => (
                        <div
                          key={option}
                          onMouseDown={(e) => handleAdvancedMouseDown(e, option, 'violation')}
                          onClick={() => handleViolationSelect(option)}
                          className={`group relative overflow-hidden drag-item p-3 rounded-xl cursor-grab transition-all duration-300 select-none ${
                            draggedItem === option
                              ? 'dragging border-cyan-400 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 scale-105 shadow-xl shadow-cyan-500/25'
                              : selectedViolation === option
                              ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/20 scale-102'
                              : 'border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-slate-600/50 hover:to-slate-700/50 hover:scale-102'
                          } border backdrop-blur-sm`}
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            touchAction: 'none',
                          }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                          <div className="relative flex items-center justify-between">
                            <span className="text-white text-sm font-medium leading-tight pr-2">{option}</span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {selectedViolation === option && (
                                <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Root Cause Evidence Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <h4 className="text-sm font-black text-orange-300 tracking-wide">ROOT CAUSE EVIDENCE</h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-orange-400/50 to-transparent"></div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {question.rootCauseOptions.map((option) => (
                        <div
                          key={option}
                          onMouseDown={(e) => handleAdvancedMouseDown(e, option, 'rootCause')}
                          onClick={() => handleRootCauseSelect(option)}
                          className={`group relative overflow-hidden drag-item p-3 rounded-xl cursor-grab transition-all duration-300 select-none ${
                            draggedItem === option
                              ? 'dragging border-orange-400 bg-gradient-to-r from-orange-500/30 to-red-500/30 scale-105 shadow-xl shadow-orange-500/25'
                              : selectedRootCause === option
                              ? 'border-orange-400 bg-gradient-to-r from-orange-500/20 to-red-500/20 shadow-lg shadow-orange-500/20 scale-102'
                              : 'border-slate-600/50 bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:border-orange-500/50 hover:bg-gradient-to-r hover:from-slate-600/50 hover:to-slate-700/50 hover:scale-102'
                          } border backdrop-blur-sm`}
                          style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

                          <div className="relative flex items-center justify-between">
                            <span className="text-white text-sm font-medium leading-tight pr-2">{option}</span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {selectedRootCause === option && (
                                <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/25">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full opacity-60"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Panel */}
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-3 rounded-xl border border-cyan-400/20 shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
                <div className="relative flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                      <Factory className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-cyan-300 font-semibold">Manufacturing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-lg shadow-red-500/50"></div>
                    <span className="text-red-300 font-semibold">Priority Alert</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Investigation Command Center */}
            <div className="w-2/3 flex flex-col space-y-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-blue-400/30 flex-1 shadow-2xl">
                {/* Panel Header */}
                <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-b border-blue-400/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Target className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-400/50 rounded-full blur-sm"></div>
                    </div>
                    <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 tracking-wider">
                      INVESTIGATION ZONES
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
                      <span className="text-blue-300 text-sm font-bold">SCANNING</span>
                    </div>
                  </div>
                </div>

            {/* Violation Scanner */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <h3 className="text-sm font-bold text-white">VIOLATION SCANNER</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-xs">20 PTS</span>
                  {selectedViolation && (
                    <div className="flex items-center space-x-1 animate-bounce">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              <div
                data-drop-zone="violation"
                onDragOver={handleViolationDragOver}
                onDragLeave={handleViolationDragLeave}
                onDrop={handleViolationDrop}
                className={`flex-1 border-2 border-dashed rounded-lg p-3 transition-all duration-300 ${
                  isViolationDragOver
                    ? 'border-cyan-400 bg-cyan-500/20 scale-105'
                    : selectedViolation
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                {selectedViolation ? (
                  <div className="flex flex-col justify-center h-full bg-slate-700/80 p-3 rounded border border-cyan-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      <span className="font-bold text-white text-xs">VIOLATION DETECTED</span>
                    </div>
                    <p className="text-white text-xs mb-2 leading-tight">{selectedViolation}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold text-xs">+20 PTS!</span>
                      <button
                        onClick={() => handleViolationSelect('')}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 h-full flex flex-col items-center justify-center">
                    <Crosshair className={`w-8 h-8 mb-2 opacity-60 ${isViolationDragOver ? 'animate-spin text-cyan-400' : ''}`} />
                    <p className="text-xs font-bold mb-1">VIOLATION SCANNER</p>
                    <p className="text-xs opacity-75">Drop violation here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Root Cause Analyzer */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-orange-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">ROOT CAUSE ANALYZER</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-xs">20 PTS</span>
                  {selectedRootCause && (
                    <div className="flex items-center space-x-1 animate-bounce">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              <div
                data-drop-zone="rootCause"
                onDragOver={handleRootCauseDragOver}
                onDragLeave={handleRootCauseDragLeave}
                onDrop={handleRootCauseDrop}
                className={`flex-1 border-2 border-dashed rounded-lg p-3 transition-all duration-300 ${
                  isRootCauseDragOver
                    ? 'border-orange-400 bg-orange-500/20 scale-105'
                    : selectedRootCause
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                {selectedRootCause ? (
                  <div className="flex flex-col justify-center h-full bg-slate-700/80 p-3 rounded border border-orange-500/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-orange-400" />
                      <span className="font-bold text-white text-xs">ROOT CAUSE FOUND</span>
                    </div>
                    <p className="text-white text-xs mb-2 leading-tight">{selectedRootCause}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-bold text-xs">+20 PTS!</span>
                      <button
                        onClick={() => handleRootCauseSelect('')}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 h-full flex flex-col items-center justify-center">
                    <Search className={`w-8 h-8 mb-2 opacity-60 ${isRootCauseDragOver ? 'animate-pulse text-orange-400' : ''}`} />
                    <p className="text-xs font-bold mb-1">ROOT CAUSE ANALYZER</p>
                    <p className="text-xs opacity-75">Drop root cause here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-3 border-t border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Crosshair className="w-3 h-3" />
                <span>Drag & Drop or Click</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="w-3 h-3" />
                <span>20 Points Available</span>
              </div>
            </div>
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                canProceed
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="text-sm">PROCEED</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case Brief Modal - Only visible when toggled in mobile landscape */}
        {showCaseBrief && (
          <div className="case-brief-overlay" onClick={() => setShowCaseBrief(false)}>
            <div className="case-brief-modal" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">CASE BRIEF</h3>
                  <div className="bg-cyan-500/20 px-2 py-0.5 rounded-full">
                    <span className="text-cyan-300 font-bold text-xs">ACTIVE</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCaseBrief(false)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg border border-cyan-500/20">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 animate-pulse flex-shrink-0"></div>
                  <p className="text-gray-200 text-xs leading-relaxed">{question.caseFile}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Level 2 - Single Screen Solution Deployment
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 overflow-hidden relative">
      {/* Clean Drag Overlay for Level 2 */}
      {dragOverlay.visible && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: dragOverlay.x,
            top: dragOverlay.y,
          }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-2 rounded-lg shadow-2xl border border-emerald-400 text-xs font-bold max-w-48 truncate">
            {dragOverlay.text}
          </div>
        </div>
      )}

      {/* Compact Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Target className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">{question.id}</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SOLUTION DEPLOYMENT</h2>
              <p className="text-green-100 text-xs">Level 2: Strategic Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-bold">20 PTS</span>
            </div>
            <div className="bg-black/30 px-2 py-1 rounded-full">
              <span className="text-emerald-400 font-bold text-xs">DEPLOY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Single Screen Layout */}
      <div className="flex-1 flex p-3 space-x-3 min-h-0">
        
        {/* Left Panel - Intelligence Report */}
        <div className="w-1/3 flex flex-col space-y-3">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-3 border border-emerald-500/20 flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">INTEL REPORT</h3>
              <div className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="text-emerald-300 font-bold text-xs">L1</span>
              </div>
            </div>
            
            <div className="space-y-2 h-full overflow-y-auto">
              {/* Violation Analysis */}
              <div className={`p-2 rounded border-2 ${
                ((level1Answers ? level1Answers.violation : selectedViolation) === question.correctViolation) 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    ((level1Answers ? level1Answers.violation : selectedViolation) === question.correctViolation) ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <h4 className={`font-bold text-xs ${
                    ((level1Answers ? level1Answers.violation : selectedViolation) === question.correctViolation) ? 'text-green-300' : 'text-red-300'
                  }`}>
                    VIOLATION:
                  </h4>
                </div>
                <p className="text-white text-xs leading-tight">
                  {level1Answers ? level1Answers.violation : selectedViolation}
                </p>
              </div>

              {/* Root Cause Analysis */}
              <div className={`p-2 rounded border-2 ${
                ((level1Answers ? level1Answers.rootCause : selectedRootCause) === question.correctRootCause) 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    ((level1Answers ? level1Answers.rootCause : selectedRootCause) === question.correctRootCause) ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <h4 className={`font-bold text-xs ${
                    ((level1Answers ? level1Answers.rootCause : selectedRootCause) === question.correctRootCause) ? 'text-green-300' : 'text-red-300'
                  }`}>
                    ROOT CAUSE:
                  </h4>
                </div>
                <p className="text-white text-xs leading-tight">
                  {level1Answers ? level1Answers.rootCause : selectedRootCause}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Solution Deployment Zone */}
        <div className="w-1/3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '5s' }} />
              <h3 className="text-sm font-bold text-white">DEPLOYMENT ZONE</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-xs">20 PTS</span>
              {selectedSolution && (
                <div className="flex items-center space-x-1 animate-bounce">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
              )}
            </div>
          </div>
          
          <div
            ref={dropZoneRef}
            data-drop-zone="solution"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const element = document.elementFromPoint(touch.clientX, touch.clientY);
              if (element === dropZoneRef.current || dropZoneRef.current?.contains(element)) {
                setIsDragOver(true);
              } else {
                setIsDragOver(false);
              }
            }}
            className={`flex-1 border-2 border-dashed rounded-lg p-3 transition-all duration-300 ${
              isDragOver
                ? 'border-emerald-400 bg-emerald-500/20 scale-105'
                : selectedSolution
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-slate-600 bg-slate-700/50'
            }`}
          >
            {selectedSolution ? (
              <div className="flex flex-col justify-center h-full bg-slate-700/80 p-3 rounded border border-emerald-500/30">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-xs">DEPLOYED</span>
                </div>
                <p className="text-white text-xs mb-2 leading-tight">{selectedSolution}</p>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold text-xs">+20 PTS!</span>
                  <button
                    onClick={() => handleSolutionSelect('')}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ABORT
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 h-full flex flex-col items-center justify-center">
                <Target className={`w-8 h-8 mb-2 opacity-60 ${isDragOver ? 'animate-spin text-emerald-400' : ''}`} />
                <p className="text-xs font-bold mb-1">DEPLOYMENT ZONE</p>
                <p className="text-xs opacity-75">Drop solution here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Solution Options */}
        <div className="w-1/3 flex flex-col">
          <h4 className="text-sm font-bold text-emerald-300 mb-2">SOLUTION ARSENAL</h4>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {question.solutionOptions.map((option) => (
              <div
                key={option}
                onMouseDown={(e) => handleAdvancedMouseDown(e, option, 'solution')}
                onClick={() => handleSolutionSelect(option)}
                className={`drag-item p-2 rounded border cursor-grab transition-all duration-200 select-none ${
                  draggedItem === option
                    ? 'dragging border-emerald-500 bg-emerald-500/30'
                    : selectedSolution === option
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-600 bg-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-600/50'
                }`}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-medium leading-tight">{option}</span>
                  <div className="flex items-center space-x-1 ml-2">
                    {selectedSolution === option && (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    )}
                    <div className="flex space-x-0.5">
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-3 border-t border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>Drag & Drop or Click</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3" />
              <span>20 Points Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>Use Level 1 Intel</span>
            </div>
          </div>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
              canProceed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="text-sm">COMPLETE MISSION</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { QuestionCard };
export default QuestionCard;
