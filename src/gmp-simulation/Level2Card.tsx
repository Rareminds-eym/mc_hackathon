import React, { useState } from 'react';
import {
  ChevronRight, CheckCircle, Target, Trophy
} from 'lucide-react';
import { Question } from './HackathonData';

interface Level2CardProps {
  question: Question;
  onAnswer: (answer: { solution: string }) => void;
  onNext: () => void;
  currentAnswer?: { solution?: string };
  level1Answers?: { violation?: string; rootCause?: string };
  session_id?: string | null;
  email?: string | null;
}

const Level2Card: React.FC<Level2CardProps> = ({
  question,
  onAnswer,
  onNext,
  currentAnswer,
  level1Answers
}) => {
  const [selectedSolution, setSelectedSolution] = useState(currentAnswer?.solution || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const canProceed = selectedSolution;

  const handleSolutionSelect = (solution: string) => {
    setSelectedSolution(solution);
    onAnswer({ solution });
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const solution = e.dataTransfer.getData('text/plain');
    const droppedType = e.dataTransfer.getData('application/type');
    
    // Only accept solution drops
    if (solution && droppedType === 'solution') {
      handleSolutionSelect(solution);
    }
    
    setIsDragOver(false);
    setDraggedItem(null);
  };

  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.setData('application/type', 'solution');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsDragOver(false);
  };

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
              <p className="text-white text-xs">{level1Answers?.violation || 'Not identified'}</p>
            </div>
            <div className="p-2 rounded border border-green-500/50 bg-green-500/20">
              <h4 className="text-green-300 font-bold text-xs mb-1">ROOT CAUSE:</h4>
              <p className="text-white text-xs">{level1Answers?.rootCause || 'Not identified'}</p>
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
                ? 'border-emerald-400 bg-emerald-500/20 scale-105'
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
                onDragEnd={handleDragEnd}
                onClick={() => handleSolutionSelect(option)}
                className={`p-2 rounded border cursor-grab transition-all ${
                  selectedSolution === option
                    ? 'border-emerald-400 bg-emerald-500/20'
                    : 'border-slate-600 bg-slate-700/50 hover:border-emerald-500/50'
                } ${draggedItem === option ? 'opacity-50' : ''}`}
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

export { Level2Card };
export default Level2Card;
