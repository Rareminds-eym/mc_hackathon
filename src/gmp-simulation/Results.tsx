import React from 'react';
import { Award, Trophy, CheckCircle, XCircle, RefreshCw, Factory } from 'lucide-react';
import { GameState } from './GmpSimulation';

interface ResultsProps {
  gameState: GameState;
  canAccessModule6?: boolean;
}

export const Results: React.FC<ResultsProps> = ({ gameState, canAccessModule6 }) => {
  const maxScore = 1200; // 30 questions × 40 points each
  const percentage = Math.round((gameState.score / maxScore) * 100);
  
  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const grade = getGrade();

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding! You've mastered GMP principles.";
    if (percentage >= 80) return "Excellent work! Strong understanding of GMP.";
    if (percentage >= 70) return "Good job! Room for some improvement.";
    if (percentage >= 60) return "Fair performance. Consider additional training.";
    return "Needs improvement. Please review GMP guidelines thoroughly.";
  };

  // Calculate detailed results
  const detailedResults = gameState.answers.map((answer, index) => {
    const question = gameState.questions[index];
    if (!question || !answer) return null;

    const violationCorrect = answer.violation === question.correctViolation;
    const rootCauseCorrect = answer.rootCause === question.correctRootCause;
    const solutionCorrect = answer.solution === question.correctSolution;
    
    const questionScore = (violationCorrect ? 10 : 0) + (rootCauseCorrect ? 10 : 0) + (solutionCorrect ? 20 : 0);

    return {
      questionNumber: index + 1,
      caseFile: question.caseFile,
      violationCorrect,
      rootCauseCorrect,
      solutionCorrect,
      score: questionScore,
      maxScore: 40
    };
  }).filter(Boolean);

  const correctAnswers = detailedResults.reduce((acc, result) => {
    return acc + (result?.violationCorrect ? 1 : 0) + (result?.rootCauseCorrect ? 1 : 0) + (result?.solutionCorrect ? 1 : 0);
  }, 0);

  const totalQuestions = detailedResults.length * 3; // 3 parts per question

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 p-2 lg:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-8 mb-4 lg:mb-6 text-center">
          <div className="flex justify-center mb-6">
            {percentage >= 80 ? (
              <Trophy className="w-16 h-16 lg:w-20 lg:h-20 text-yellow-500" />
            ) : (
              <Award className="w-16 h-16 lg:w-20 lg:h-20 text-blue-500" />
            )}
          </div>
          
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">Simulation Complete!</h1>
          <p className="text-base lg:text-xl text-gray-600 mb-6 lg:mb-8">GMP Training Assessment Results</p>
          {/* Module 6 Access Status */}
          {typeof canAccessModule6 !== 'undefined' && (
            <div className={`mb-4 p-3 rounded-xl ${canAccessModule6 ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <span className={`font-semibold text-lg ${canAccessModule6 ? 'text-green-700' : 'text-yellow-700'}`}>
                {canAccessModule6
                  ? 'Your team has unlocked Module 6!'
                  : 'Module 6 is locked. Awaiting team qualification.'}
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <div className={`p-4 lg:p-6 rounded-xl ${grade.bg}`}>
              <div className={`text-2xl lg:text-4xl font-bold ${grade.color} mb-2`}>{grade.grade}</div>
              <div className="text-sm lg:text-base text-gray-600">Grade</div>
            </div>
            
            <div className="bg-blue-50 p-4 lg:p-6 rounded-xl">
              <div className="text-2xl lg:text-4xl font-bold text-blue-600 mb-2">{gameState.score}</div>
              <div className="text-sm lg:text-base text-gray-600">Total Score</div>
            </div>
            
            <div className="bg-green-50 p-4 lg:p-6 rounded-xl">
              <div className="text-2xl lg:text-4xl font-bold text-green-600 mb-2">{percentage}%</div>
              <div className="text-sm lg:text-base text-gray-600">Percentage</div>
            </div>
            
            <div className="bg-purple-50 p-4 lg:p-6 rounded-xl">
              <div className="text-2xl lg:text-4xl font-bold text-purple-600 mb-2">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm lg:text-base text-gray-600">Correct</div>
            </div>
          </div>
          
          <div className={`p-4 lg:p-6 rounded-xl ${grade.bg} mb-6`}>
            <p className={`text-base lg:text-xl font-semibold ${grade.color}`}>{getPerformanceMessage()}</p>
          </div>
          
          <button
            onClick={restartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Take Assessment Again</span>
          </button>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 lg:p-6">
            <div className="flex items-center space-x-3">
              <Factory className="w-6 h-6 lg:w-8 lg:h-8" />
              <div>
                <h2 className="text-xl lg:text-2xl font-bold">Detailed Question Analysis</h2>
                <p className="text-sm lg:text-base text-blue-100">Review your performance on each case</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 lg:p-6">
            <div className="grid gap-4">
              {detailedResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 lg:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2">
                        Question {result?.questionNumber}: Case #{result?.questionNumber}
                      </h3>
                      <p className="text-gray-600 text-xs lg:text-sm mb-3">{result?.caseFile}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg lg:text-xl font-bold text-blue-600">
                        {result?.score}/{result?.maxScore}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">points</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
                    <div className="flex items-center space-x-2">
                      {result?.violationCorrect ? (
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      )}
                      <span className="text-xs lg:text-sm">
                        Violation {result?.violationCorrect ? '(10 pts)' : '(0 pts)'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {result?.rootCauseCorrect ? (
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      )}
                      <span className="text-xs lg:text-sm">
                        Root Cause {result?.rootCauseCorrect ? '(10 pts)' : '(0 pts)'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {result?.solutionCorrect ? (
                        <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                      )}
                      <span className="text-xs lg:text-sm">
                        Solution {result?.solutionCorrect ? '(20 pts)' : '(0 pts)'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};