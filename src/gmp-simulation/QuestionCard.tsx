import React, { useState, useRef } from 'react';
import { AlertTriangle, Search, Wrench, ChevronRight, Factory, CheckCircle, Target } from 'lucide-react';
import { Question } from './HackathonData';

interface QuestionCardProps {
  question: Question;
  level: 1 | 2;
  onAnswer: (answer: { violation?: string; rootCause?: string; solution?: string }) => void;
  onNext: () => void;
  currentAnswer?: {
    violation: string;
    rootCause: string;
    solution: string;
  };
  currentQuestion?: number; // Add currentQuestion index as prop
  session_id?: string | null;
  email?: string | null;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  level,
  onAnswer,
  onNext,
  currentAnswer,
  currentQuestion,
  session_id,
  email
}) => {

  // ...existing code...
  const [selectedViolation, setSelectedViolation] = useState(currentAnswer?.violation || '');
  const [selectedRootCause, setSelectedRootCause] = useState(currentAnswer?.rootCause || '');
  const [selectedSolution, setSelectedSolution] = useState(currentAnswer?.solution || '');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Fix: Declare level1Answers state for Level 2 summary
  const [level1Answers, setLevel1Answers] = useState<{ violation: string; rootCause: string } | null>(null);

  // Use currentQuestion prop for DB lookup, fallback to question.id - 1 if not provided
  const currentQuestionIndex = typeof currentQuestion === 'number' ? currentQuestion : (question.id ? question.id - 1 : 0);

  // Fetch Level 1 answers from DB when in Level 2
  React.useEffect(() => {
    async function fetchLevel1Answers() {
      if (level === 2 && currentAnswer) {
        console.log('[Level1Analysis] Fetch params:', {
          email,
          session_id,
          question_index: currentQuestionIndex,
          module_number: 5,
          currentAnswer,
          currentQuestion,
          question,
        });
        if (!session_id || !email) {
          console.warn('[Level1Analysis] Missing session_id or email');
          return;
        }
        const { supabase } = await import('../lib/supabase');
        try {
          const { data, error } = await supabase
            .from('attempt_details')
            .select('question_index, answer')
            .eq('email', email)
            .eq('session_id', session_id)
            .eq('module_number', 5)
            .eq('question_index', currentQuestionIndex);
          console.log('[Level1Analysis] DB result:', { data, error });
          if (error) {
            console.error('[Level1Analysis] Supabase error:', error);
          }
          if (!data || data.length === 0) {
            console.warn('[Level1Analysis] No data found for query');
          } else {
            console.log('[Level1Analysis] Found answer:', data[0].answer);
            setLevel1Answers({
              violation: data[0].answer.violation,
              rootCause: data[0].answer.rootCause,
            });
          }
        } catch (err) {
          console.error('[Level1Analysis] Exception during fetch:', err);
        }
      }
    }
    fetchLevel1Answers();
  }, [level, currentAnswer, currentQuestionIndex]);

  // Debug logging for state tracing
  React.useEffect(() => {
    console.log('[QuestionCard] currentAnswer:', currentAnswer);
    console.log('[QuestionCard] selectedViolation:', selectedViolation);
    console.log('[QuestionCard] selectedRootCause:', selectedRootCause);
  }, [currentAnswer, selectedViolation, selectedRootCause]);

  // Reset local state when currentAnswer changes (fixes drag-and-drop not clearing)
  React.useEffect(() => {
    setSelectedViolation(currentAnswer?.violation || '');
    setSelectedRootCause(currentAnswer?.rootCause || '');
    setSelectedSolution(currentAnswer?.solution || '');
  }, [currentAnswer]);

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
  } // removed stray JSX

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, solution: string) => {
    e.dataTransfer.setData('text/plain', solution);
    e.dataTransfer.effectAllowed = 'move';
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
    if (draggedItem && isDragOver) {
      handleSolutionSelect(draggedItem);
    }
    setDraggedItem(null);
    setIsDragOver(false);
  };

  const canProceed = level === 1 
    ? selectedViolation && selectedRootCause
    : selectedSolution;

  if (level === 1) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Case File Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8" />
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Deviation Case File #{question.id}</h2>
              <p className="text-red-100 text-sm lg:text-base">Level 1: Violation & Root Cause Analysis</p>
            </div>
          </div>
        </div>

        {/* Manufacturing Facility Visual */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 lg:p-6 border-b">
          <div className="flex items-center justify-center space-x-4 lg:space-x-8 py-2 lg:py-4">
            <div className="text-center">
              <Factory className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600 mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-gray-600">Manufacturing Facility</p>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-red-400 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold">
                DEVIATION DETECTED
              </div>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 lg:w-16 lg:h-16 text-red-500 mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-gray-600">Investigation Required</p>
            </div>
          </div>
        </div>

        {/* Case Description */}
        <div className="p-4 lg:p-6 border-b bg-gray-50">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Case Description:</h3>
          <div className="bg-white p-3 lg:p-4 rounded-lg border-l-4 border-red-500">
            <p className="text-gray-800 text-sm lg:text-lg leading-relaxed">{question.caseFile}</p>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
          {/* Violation Selection */}
          <div>
            <div className="flex items-center space-x-2 lg:space-x-3 mb-4">
              <Search className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Identify the Violation Type</h3>
              <span className="text-xs lg:text-sm text-gray-500">(10 points)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
              {question.violationOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleViolationSelect(option)}
                  className={`p-3 lg:p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedViolation === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm font-medium">{option}</span>
                    {selectedViolation === option && (
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Root Cause Selection */}
          <div>
            <div className="flex items-center space-x-2 lg:space-x-3 mb-4">
              <Search className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Identify the Root Cause</h3>
              <span className="text-xs lg:text-sm text-gray-500">(10 points)</span>
            </div>
            <div className="grid grid-cols-1 gap-2 lg:gap-3">
              {question.rootCauseOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleRootCauseSelect(option)}
                  className={`p-3 lg:p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedRootCause === option
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm font-medium">{option}</span>
                    {selectedRootCause === option && (
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4 lg:pt-6 border-t">
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-all duration-200 ${
                canProceed
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="text-sm lg:text-base">Next Question</span>
              <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level 2 - Drag & Drop Solution Selection
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Solution Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 lg:p-6">
        <div className="flex items-center space-x-3">
          <Wrench className="w-6 h-6 lg:w-8 lg:h-8" />
          <div>
            <h2 className="text-xl lg:text-2xl font-bold">Case #{question.id} - {question.caseFile}</h2>
          </div>
        </div>
      </div>

      {/* Previous Selections Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 lg:p-6 border-b">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Your Level 1 Analysis:</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <div className={`bg-white p-3 lg:p-4 rounded-lg border-l-4 ${((level1Answers ? level1Answers.violation : selectedViolation) === question.correctViolation) ? 'border-green-500' : 'border-red-500'}`}>
            <h4 className={`font-semibold mb-2 text-sm lg:text-base ${((level1Answers ? level1Answers.violation : selectedViolation) === question.correctViolation) ? 'text-green-900' : 'text-red-900'}`}>Identified Violation:</h4>
            <p className="text-gray-800 text-xs lg:text-sm">{level1Answers ? level1Answers.violation : selectedViolation}</p>
          </div>
          <div className={`bg-white p-3 lg:p-4 rounded-lg border-l-4 ${((level1Answers ? level1Answers.rootCause : selectedRootCause) === question.correctRootCause) ? 'border-green-500' : 'border-red-500'}`}>
            <h4 className={`font-semibold mb-2 text-sm lg:text-base ${((level1Answers ? level1Answers.rootCause : selectedRootCause) === question.correctRootCause) ? 'text-green-900' : 'text-red-900'}`}>Root Cause:</h4>
            <p className="text-gray-800 text-xs lg:text-sm">{level1Answers ? level1Answers.rootCause : selectedRootCause}</p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Drop Zone */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-4">
            <Target className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Solution Drop Zone</h3>
            <span className="text-xs lg:text-sm text-gray-500">(20 points)</span>
          </div>
          
          <div
            ref={dropZoneRef}
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
            className={`min-h-24 lg:min-h-32 border-4 border-dashed rounded-xl p-4 lg:p-6 transition-all duration-300 ${
              isDragOver
                ? 'border-green-500 bg-green-50'
                : selectedSolution
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {selectedSolution ? (
              <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  <span className="font-medium text-green-900 text-sm lg:text-base">{selectedSolution}</span>
                </div>
                <button
                  onClick={() => handleSolutionSelect('')}
                  className="text-red-500 hover:text-red-700 text-xs lg:text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Target className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm lg:text-base font-medium">Drag a solution here</p>
                <p className="text-xs lg:text-sm">or tap on mobile</p>
              </div>
            )}
          </div>
        </div>

        {/* Solution Options */}
        <div>
          <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Available Solutions:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
            {question.solutionOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={(e) => handleDragStart(e, option)}
                onTouchStart={() => handleTouchStart(option)}
                onTouchEnd={handleTouchEnd}
                onClick={() => handleSolutionSelect(option)}
                className={`p-3 lg:p-4 rounded-lg border-2 cursor-move transition-all duration-200 select-none ${
                  draggedItem === option
                    ? 'border-green-500 bg-green-100 opacity-50'
                    : selectedSolution === option
                    ? 'border-green-400 bg-green-50 opacity-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm lg:text-base">{option}</span>
                  <div className="flex items-center space-x-2">
                    {selectedSolution === option && (
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                    )}
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 lg:p-4 bg-blue-50 rounded-lg">
          <p className="text-xs lg:text-sm text-blue-800">
            <strong>Instructions:</strong> Drag and drop the most appropriate solution to the drop zone above, 
            or simply tap/click on a solution on mobile devices.
          </p>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4 lg:pt-6 border-t mt-6 lg:mt-8">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-all duration-200 ${
              canProceed
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="text-sm lg:text-base">Submit & Continue</span>
            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};