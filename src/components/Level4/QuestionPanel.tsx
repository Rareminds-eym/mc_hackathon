import React from 'react';
import { Case } from './types';
import { CheckCircle, Circle, Target, AlertCircle, Zap, TrendingDown } from 'lucide-react';
import { DragDropZone } from './DragDropZone';

interface QuestionPanelProps {
  case: Case;
  currentQuestion: 'violation' | 'rootCause' | 'impact';
  selectedAnswers: {
    violation: number | null;
    rootCause: number | null;
    impact: number | null;
  };
  onAnswerSelect: (questionType: 'violation' | 'rootCause' | 'impact', answer: number) => void;
  showFeedback: boolean;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  case: currentCase,
  currentQuestion,
  selectedAnswers,
  onAnswerSelect,
  showFeedback
}) => {
  const question = currentCase.questions[currentQuestion];
  
  // Get animation class based on current question type
  const getAnimationClass = (questionType: string) => {
    switch (questionType) {
      case 'violation': return 'animate-slide-in-left';
      case 'rootCause': return 'animate-slide-in-option';
      case 'impact': return 'animate-slide-in-right';
      default: return 'animate-slide-in-up';
    }
  };
  
  const getQuestionConfig = (type: string) => {
    switch (type) {
      case 'violation': 
        return {
          title: 'Step 1: Identify GMP Violation',
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          gradient: 'from-red-500 to-red-600',
          bgGradient: 'from-red-50 to-pink-50',
          borderColor: 'border-red-300'
        };
      case 'rootCause': 
        return {
          title: 'Step 2: Root Cause Analysis',
          icon: <Target className="w-6 h-6 text-amber-500" />,
          gradient: 'from-amber-500 to-orange-600',
          bgGradient: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-300'
        };
      case 'impact': 
        return {
          title: 'Step 3: Impact Assessment',
          icon: <TrendingDown className="w-6 h-6 text-blue-500" />,
          gradient: 'from-blue-500 to-indigo-600',
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-300'
        };
      default: 
        return {
          title: '',
          icon: null,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-300'
        };
    }
  };

  const config = getQuestionConfig(currentQuestion);
  const isCorrect = (index: number) => question.correct === index;

  return (
    <div className="bg-black/40 rounded-2xl shadow-xl p-[4vw] pt-6 pb-28 flex flex-col w-[90vw] max-w-[370px] mx-auto mt-8 sm:mt-24 sm:mb-24 overflow-visible landscape:p-2 landscape:text-[9px] sm:text-xs lg:w-[520px] lg:max-w-[520px] xl:w-[600px] xl:max-w-[600px] lg:p-8 xl:p-12 transition-all duration-300 transform hover:scale-[1.01]">
      {/* QuestionPannelHeader */}
      <div className={`bg-gradient-to-r ${config.gradient} px-2 py-1 border-b-2 ${config.borderColor} landscape:px-2 landscape:py-2 sm:landscape:px-3 sm:landscape:py-2`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              {config.icon}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white lg:text-lg xl:text-xl">
              {config.title}
            </h3>
            <p className={`text-white/80 text-xs font-medium landscape:text-[9px] sm:landscape:text-xs lg:text-base xl:text-lg `}>
              Select the most appropriate answer
            </p>
          </div>
        </div>
      </div>

      <div className="px-1 py-1 flex-1 flex flex-col w-full">
        {/* Question */}
        <div className={`bg-gradient-to-r ${config.bgGradient} rounded-lg border-2 ${config.borderColor} px-2 py-2 lg:px-4 lg:py-2 xl:px-6 xl:py-3`}>
          <h4 className="text-xs font-bold text-gray-900 flex items-center lg:text-lg xl:text-xl">
            <Zap className="w-4 h-4 text-yellow-500 " />
            <span className="ml-1 lg:text-lg xl:text-xl">{question.question}</span>
          </h4>
        </div>
        {/* Options */}
        {currentQuestion === 'rootCause' ? (
          <div className="">
            {/* Drag and Drop for Step 2 */}
            <DragDropZone
              case={currentCase}
              selectedAnswer={selectedAnswers.rootCause}
              onAnswerSelect={answer => onAnswerSelect('rootCause', answer)}
              showFeedback={showFeedback}
              disabled={showFeedback}
            />
            {/* Feedback for drag and drop */}
            {showFeedback && selectedAnswers.rootCause !== null && (
              <div className="mt-2">
                {selectedAnswers.rootCause === question.correct ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                    ✓ Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                    ✗ Incorrect
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1 sm:max-h-[80vh]">
            {question.options.map((option: string, index: number) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              const optionLetter = String.fromCharCode(97 + index).toUpperCase();
              const animationClass = getAnimationClass(currentQuestion);
              
              return (
                <div
                  key={index}
                  className={`
                    group relative flex items-center rounded-lg border-2  lg:px-4 lg:py-2 xl:px-6 xl:py-3 min-w-0 w-full 
                    ${animationClass}
                    ${isSelected 
                      ? showFeedback
                        ? isCorrect(index)
                          ? 'border-green-400  bg-white/50 shadow-lg shadow-green-200/50'
                          : 'border-red-400 bg-white/50  shadow-lg shadow-red-200/50'
                        : 'border-blue-400 bg-white/50 shadow-lg shadow-blue-200/50'
                      : showFeedback && isCorrect(index)
                        ? 'border-green-400 bg-white/50 shadow-lg shadow-green-200/50'
                        : 'border-gray-200 bg-white/60 hover:border-gray-300 hover:shadow-md hover:shadow-gray-200/50'
                    }
                  `}
                  onClick={() => !showFeedback && onAnswerSelect(currentQuestion, index)}
                  style={{ 
                    minWidth: 0,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Option Letter Badge */}
                  <div className={`
                    flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold border-2 mr-3
                    lg:w-8 lg:h-8 lg:text-lg xl:w-10 xl:h-10 xl:text-xl
                    ${isSelected
                      ? showFeedback
                        ? isCorrect(index)
                          ? 'bg-green-500 border-green-600 text-white'
                          : 'bg-red-500 border-red-600 text-white'
                        : 'bg-blue-500 border-blue-600 text-white'
                      : showFeedback && isCorrect(index)
                        ? 'bg-green-500 border-green-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-black group-hover:bg-gray-200'
                  }`}>
                    {optionLetter}
                  </div>

                  {/* Selection Icon */}
                  <div className="flex-shrink-0 mr-2">
                    {isSelected ? (
                      <CheckCircle className={`w-5 h-5 ${
                        showFeedback
                          ? isCorrect(index) ? 'text-green-600' : 'text-red-600'
                          : 'text-blue-600'
                      }`} />
                    ) : showFeedback && isCorrect(index) ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-3 h-3  text-gray-400 group-hover:text-gray-500" />
                    )}
                  </div>

                  {/* Option Text */}
                  <span className={`flex-1 text-sm  lg:text-lg xl:text-xl break-words whitespace-normal font-normal min-w-0 ${
                    isSelected
                      ? showFeedback
                        ? isCorrect(index) ? 'text-green-900' : 'text-red-900'
                        : 'text-blue-900'
                      : showFeedback && isCorrect(index)
                        ? 'text-green-900'
                        : 'text-black group-hover:text-gray-900'
                  }`}>
                    {option}
                  </span>
                  
                  {/* Feedback Badges */}
                  {showFeedback && isCorrect(index) && (
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                        ✓ Correct
                      </span>
                    </div>
                  )}
                  
                  {showFeedback && isSelected && !isCorrect(index) && (
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        ✗ Incorrect
                      </span>
                    </div>
                  )}

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};