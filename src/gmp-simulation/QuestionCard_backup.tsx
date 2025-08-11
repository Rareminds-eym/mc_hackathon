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
  level1Answers
}) => {
  const [selectedViolation, setSelectedViolation] = useState(currentAnswer?.violation || '');
  const [selectedRootCause, setSelectedRootCause] = useState(currentAnswer?.rootCause || '');
  const [selectedSolution, setSelectedSolution] = useState(currentAnswer?.solution || '');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isViolationDragOver, setIsViolationDragOver] = useState(false);
  const [isRootCauseDragOver, setIsRootCauseDragOver] = useState(false);
  const [showCaseBrief, setShowCaseBrief] = useState(false);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

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

  // Drag and Drop handlers
  const handleViolationDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsViolationDragOver(true);
  };

  const handleViolationDragLeave = () => {
    setIsViolationDragOver(false);
  };

  const handleViolationDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const violation = e.dataTransfer.getData('text/plain');
    if (violation) {
      handleViolationSelect(violation);
    }
    setDraggedItem(null);
    setIsViolationDragOver(false);
  };

  const handleRootCauseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRootCauseDragOver(true);
  };

  const handleRootCauseDragLeave = () => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
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

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    setDraggedItem(item);
  };

  if (level === 1) {
    return (
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
                {question.violationOptions.map((option) => (
                  <div
                    key={option}
                    draggable
                    onDragStart={(e) => handleDragStart(e, option)}
                    onClick={() => handleViolationSelect(option)}
                    className={`p-2 rounded border cursor-grab transition-all ${
                      selectedViolation === option
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-cyan-500/50'
                    }`}
                  >
                    <span className="text-white text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Causes */}
            <div>
              <h4 className="text-orange-300 text-sm font-bold mb-2">ROOT CAUSES</h4>
              <div className="space-y-2">
                {question.rootCauseOptions.map((option) => (
                  <div
                    key={option}
                    draggable
                    onDragStart={(e) => handleDragStart(e, option)}
                    onClick={() => handleRootCauseSelect(option)}
                    className={`p-2 rounded border cursor-grab transition-all ${
                      selectedRootCause === option
                        ? 'border-orange-400 bg-orange-500/20'
                        : 'border-slate-600 bg-slate-700/50 hover:border-orange-500/50'
                    }`}
                  >
                    <span className="text-white text-sm">{option}</span>
                  </div>
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
                <div
                  onDragOver={handleViolationDragOver}
                  onDragLeave={handleViolationDragLeave}
                  onDrop={handleViolationDrop}
                  className={`border-2 border-dashed rounded-lg p-4 min-h-24 transition-all ${
                    isViolationDragOver
                      ? 'border-cyan-400 bg-cyan-500/20'
                      : selectedViolation
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
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
                </div>
              </div>

              {/* Root Cause Analyzer */}
              <div>
                <h4 className="text-orange-300 text-sm font-bold mb-2">ROOT CAUSE ANALYZER</h4>
                <div
                  onDragOver={handleRootCauseDragOver}
                  onDragLeave={handleRootCauseDragLeave}
                  onDrop={handleRootCauseDrop}
                  className={`border-2 border-dashed rounded-lg p-4 min-h-24 transition-all ${
                    isRootCauseDragOver
                      ? 'border-orange-400 bg-orange-500/20'
                      : selectedRootCause
                      ? 'border-orange-500/50 bg-orange-500/10'
                      : 'border-slate-600 bg-slate-700/50'
                  }`}
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-slate-800 p-3 border-t border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Drag & Drop or Click to select
            </div>
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                canProceed
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>PROCEED</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level 2 - Solutions
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">SOLUTION DEPLOYMENT</h2>
              <p className="text-green-100 text-sm">Level 2: Strategic Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold">20 PTS</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex p-3 space-x-3">
        {/* Intel Report */}
        <div className="w-1/3 bg-slate-800/80 rounded-xl p-3 border border-emerald-500/20">
          <h3 className="text-emerald-400 font-bold mb-3">INTEL REPORT</h3>
          <div className="space-y-2">
            <div className="p-2 rounded border border-green-500/50 bg-green-500/20">
              <h4 className="text-green-300 font-bold text-xs mb-1">VIOLATION:</h4>
              <p className="text-white text-xs">{level1Answers?.violation || selectedViolation}</p>
            </div>
            <div className="p-2 rounded border border-green-500/50 bg-green-500/20">
              <h4 className="text-green-300 font-bold text-xs mb-1">ROOT CAUSE:</h4>
              <p className="text-white text-xs">{level1Answers?.rootCause || selectedRootCause}</p>
            </div>
          </div>
        </div>

        {/* Deployment Zone */}
        <div className="w-1/3">
          <h3 className="text-emerald-400 font-bold mb-2">DEPLOYMENT ZONE</h3>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 h-64 transition-all ${
              isDragOver
                ? 'border-emerald-400 bg-emerald-500/20'
                : selectedSolution
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-slate-600 bg-slate-700/50'
            }`}
          >
            {selectedSolution ? (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold text-sm">DEPLOYED</span>
                </div>
                <p className="text-white text-sm">{selectedSolution}</p>
              </div>
            ) : (
              <div className="text-center text-slate-400 h-full flex flex-col items-center justify-center">
                <Target className="w-8 h-8 mb-2" />
                <p className="text-sm">Drop solution here</p>
              </div>
            )}
          </div>
        </div>

        {/* Solution Arsenal */}
        <div className="w-1/3">
          <h3 className="text-emerald-400 font-bold mb-2">SOLUTION ARSENAL</h3>
          <div className="space-y-2">
            {question.solutionOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={(e) => handleDragStart(e, option)}
                onClick={() => handleSolutionSelect(option)}
                className={`p-2 rounded border cursor-grab transition-all ${
                  selectedSolution === option
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : 'border-slate-600 bg-slate-700/50 hover:border-emerald-500/50'
                }`}
              >
                <span className="text-white text-sm">{option}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-slate-800 p-3 border-t border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            Drag & Drop or Click to deploy solution
          </div>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
              canProceed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>COMPLETE MISSION</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export { QuestionCard };
export default QuestionCard;
