import React from 'react';
import { Case } from '../types';
import { CheckCircle, XCircle, Target, TrendingUp, BookOpen, Award, RotateCcw, ArrowRight, ChevronLeft } from 'lucide-react';

interface FeedbackPanelProps {
  case: Case;
  answers: {
    violation: number | null;
    rootCause: number | null;
    impact: number | null;
  };
  score: number;
  onNextCase: () => void;
  onRestart: () => void;
  isLastCase: boolean;
  onBack?: () => void;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  case: currentCase,
  answers,
  score,
  onNextCase,
  onRestart,
  isLastCase,
  onBack
}) => {
  const totalQuestions = 3;
  const correctAnswers = [
    answers.violation === currentCase.questions.violation.correct,
    answers.rootCause === currentCase.questions.rootCause.correct,
    answers.impact === currentCase.questions.impact.correct
  ];
  const caseScore = correctAnswers.filter(Boolean).length;
  const accuracy = Math.round((caseScore / totalQuestions) * 100);

  const getPerformanceConfig = (accuracy: number) => {
    if (accuracy >= 80) {
      return {
        color: 'green',
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-300',
        emoji: '🏆',
        title: 'Excellent Performance!'
      };
    } else if (accuracy >= 60) {
      return {
        color: 'yellow',
        gradient: 'from-yellow-500 to-amber-600',
        bgGradient: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-300',
        emoji: '👍',
        title: 'Good Performance!'
      };
    } else {
      return {
        color: 'red',
        gradient: 'from-red-500 to-pink-600',
        bgGradient: 'from-red-50 to-pink-50',
        borderColor: 'border-red-300',
        emoji: '📚',
        title: 'Needs Improvement'
      };
    }
  };

  const performanceConfig = getPerformanceConfig(accuracy);

  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 text-[7px] sm:text-[8px] md:text-[9px] flex flex-col z-50"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        width: '340px',
        height: '420px',
        minWidth: 0,
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2px',
      }}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${performanceConfig.gradient} px-0.5 py-0.5 border-b-2 ${performanceConfig.borderColor} overflow-visible`} style={{padding: '2px'}}>
        <div className="flex items-center space-x-0.5 overflow-visible" style={{padding: '0'}}>
          <div>
            <h3 className="text-[8px] font-bold text-white flex items-center space-x-0.5">
              <span>{performanceConfig.emoji}</span>
              <span>{performanceConfig.title}</span>
            </h3>
            <p className="text-white/80 text-[7px] font-medium">
              Case analysis complete - Review your results
            </p>
          </div>
        </div>
      </div>
      <div className="px-0.5 py-0.5 sm:px-0.5 sm:py-0.5 overflow-visible" style={{padding: '2px'}}>
        {/* Score Summary */}
        <div className={`flex items-center justify-between mb-0.5 p-0.5 bg-gradient-to-r ${performanceConfig.bgGradient} rounded-xl border ${performanceConfig.borderColor} shadow-lg text-[7px] overflow-visible`} style={{padding: '2px'}}>
          <div className="flex items-center space-x-0.5 overflow-visible" style={{padding: '0'}}>
            <div className={`w-3 h-3 bg-gradient-to-br ${performanceConfig.gradient} rounded-xl flex items-center justify-center shadow-lg overflow-visible`}>
              <Award className="w-1 h-1 text-white" />
            </div>
            <div className="overflow-visible">
              <h4 className="text-[8px] font-bold text-gray-900">
                {caseScore}/{totalQuestions} Correct
              </h4>
              <p className="text-gray-600 font-medium text-[7px]">
                Case Accuracy: {accuracy}%
              </p>
            </div>
          </div>
          <div className="text-right overflow-visible">
            <div className={`text-[8px] font-bold ${performanceConfig.color === 'green' ? 'text-green-600' : performanceConfig.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>{accuracy}%</div>
            <div className="text-[7px] text-gray-500 font-medium">Performance</div>
          </div>
        </div>
        {/* Detailed Feedback */}
        <div className="space-y-0.5 mb-0.5 text-[7px] overflow-visible" style={{padding: '2px'}}>
          <h5 className="text-[8px] font-bold text-gray-900 flex items-center space-x-0.5">
            <Target className="w-1.5 h-1.5 text-blue-500" />
            <span>Detailed Analysis</span>
          </h5>
          {/* Violation Question */}
          <div className={`flex items-start space-x-0.5 p-0.5 rounded-lg border ${correctAnswers[0] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-[7px]`}> 
            <div className="flex-shrink-0">
              {correctAnswers[0] ? (
                <div className="w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-1 h-1 text-white" />
                </div>
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-1 h-1 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h6 className="font-bold text-gray-900 mb-0.5 text-[7px]">🔍 GMP Violation Identification</h6>
              <p className="text-[7px] text-gray-700 font-medium mb-0.5">
                <strong>Correct:</strong> {currentCase.questions.violation.options[currentCase.questions.violation.correct]}
              </p>
              {!correctAnswers[0] && answers.violation !== null && (
                <p className="text-[7px] text-red-700 font-medium">
                  <strong>Your answer:</strong> {currentCase.questions.violation.options[answers.violation]}
                </p>
              )}
            </div>
          </div>
          {/* Root Cause Question */}
          <div className={`flex items-start space-x-0.5 p-0.5 rounded-lg border ${correctAnswers[1] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-[7px]`}> 
            <div className="flex-shrink-0">
              {correctAnswers[1] ? (
                <div className="w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-1 h-1 text-white" />
                </div>
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-1 h-1 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h6 className="font-bold text-gray-900 mb-0.5 text-[7px]">🎯 Root Cause Analysis</h6>
              <p className="text-[7px] text-gray-700 font-medium mb-0.5">
                <strong>Correct:</strong> {currentCase.questions.rootCause.options[currentCase.questions.rootCause.correct]}
              </p>
              {!correctAnswers[1] && answers.rootCause !== null && (
                <p className="text-[7px] text-red-700 font-medium">
                  <strong>Your answer:</strong> {currentCase.questions.rootCause.options[answers.rootCause]}
                </p>
              )}
            </div>
          </div>
          {/* Impact Question */}
          <div className={`flex items-start space-x-0.5 p-0.5 rounded-lg border ${correctAnswers[2] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-[7px]`}> 
            <div className="flex-shrink-0">
              {correctAnswers[2] ? (
                <div className="w-2 h-2 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-1 h-1 text-white" />
                </div>
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
                  <XCircle className="w-1 h-1 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h6 className="font-bold text-gray-900 mb-0.5 text-[7px]">⚡ Impact Assessment</h6>
              <p className="text-[7px] text-gray-700 font-medium mb-0.5">
                <strong>Correct:</strong> {currentCase.questions.impact.options[currentCase.questions.impact.correct]}
              </p>
              {!correctAnswers[2] && answers.impact !== null && (
                <p className="text-[7px] text-red-700 font-medium">
                  <strong>Your answer:</strong> {currentCase.questions.impact.options[answers.impact]}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Educational Insight */}
        <div className="p-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-0.5 shadow-lg text-[7px] overflow-visible" style={{padding: '2px'}}>
          <div className="flex items-start space-x-0.5">
            <div>
              <h5 className="text-[8px] font-bold text-blue-900 mb-0.5 flex items-center space-x-0.5">
                <span>💡 Learning Insight</span>
              </h5>
              <p className="text-blue-800 font-medium leading-relaxed text-[7px]">
                {caseScore === 3 
                  ? "🎉 Outstanding work! You've demonstrated excellent understanding of GMP principles, root cause analysis, and risk assessment."
                  : caseScore === 2
                    ? "👏 Good analysis! You correctly identified most aspects of this deviation. Focus on the areas you missed to strengthen your investigation methodology."
                    : caseScore === 1
                      ? "📖 Partial understanding demonstrated. Consider reviewing GMP documentation requirements, systematic root cause analysis techniques."
                      : "📚 This case highlights areas for improvement. Focus on understanding the interconnections between GMP violations and their underlying causes."
                }
              </p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-0.5 mt-0.5 text-[7px] overflow-visible" style={{padding: '2px'}}>
          {/* Removed Back button */}
          <div className="flex-1"></div>
          {isLastCase ? (
            <button
              onClick={onRestart}
              className="group px-0.5 py-0.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold text-[7px] flex items-center space-x-0.5 shadow-lg hover:shadow-xl transform hover:scale-105 order-3"
            >
              <RotateCcw className="w-1 h-1 group-hover:rotate-180 transition-transform duration-500" />
              <span>Start New Training</span>
            </button>
          ) : (
            <button
              onClick={onNextCase}
              disabled={caseScore !== 3}
              className={`group px-0.5 py-0.5 rounded-lg font-bold text-[7px] flex items-center space-x-0.5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 order-3 ${
                caseScore === 3
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Next Case</span>
              <ArrowRight className="w-1 h-1 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};