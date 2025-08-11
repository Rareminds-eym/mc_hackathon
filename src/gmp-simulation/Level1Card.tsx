import React, { useState } from 'react';
import {
  Search, ChevronRight, CheckCircle, Target
} from 'lucide-react';
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

const Level1Card: React.FC<Level1CardProps> = ({
  question,
  onAnswer,
  onNext,
  currentAnswer
}) => {
  const [selectedViolation, setSelectedViolation] = useState(currentAnswer?.violation || '');
  const [selectedRootCause, setSelectedRootCause] = useState(currentAnswer?.rootCause || '');
  const [isViolationDragOver, setIsViolationDragOver] = useState(false);
  const [isRootCauseDragOver, setIsRootCauseDragOver] = useState(false);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  const canProceed = selectedViolation && selectedRootCause;

  const handleViolationSelect = (violation: string) => {
    setSelectedViolation(violation);
    onAnswer({ violation });
  };

  const handleRootCauseSelect = (rootCause: string) => {
    setSelectedRootCause(rootCause);
    onAnswer({ rootCause });
  };

  // Drag and Drop handlers for violations
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
    setIsViolationDragOver(false);
  };

  // Drag and Drop handlers for root causes
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
    setIsRootCauseDragOver(false);
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
  };

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
};

export { Level1Card };
export default Level1Card;
