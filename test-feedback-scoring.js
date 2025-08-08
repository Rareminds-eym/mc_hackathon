// Test script to demonstrate the scoring issue in FeedbackPanel

// Simulate Module 1 case (3 questions)
const module1Case = {
  questions: {
    violation: { correct: 1 },
    rootCause: { correct: 0 },
    impact: { correct: 0 }
  }
};

// Simulate Module 4 case (2 questions - no violation)
const module4Case = {
  questions: {
    rootCause: { correct: 0 },
    impact: { correct: 0 }
  }
};

// Simulate correct answers for all questions
const correctAnswersModule1 = {
  violation: 1,
  rootCause: 0,
  impact: 0
};

const correctAnswersModule4 = {
  violation: null,
  rootCause: 0,
  impact: 0
};

// Current logic from FeedbackPanel.tsx
function calculateScore(currentCase, answers) {
  // Calculate total questions based on what exists
  const totalQuestions = (currentCase.questions.violation ? 1 : 0) + 1 + 1; // violation (optional) + rootCause + impact
  const correctAnswers = [
    ...(currentCase.questions.violation ? [answers.violation === currentCase.questions.violation.correct] : []),
    answers.rootCause === currentCase.questions.rootCause.correct,
    answers.impact === currentCase.questions.impact.correct
  ];
  const caseScore = correctAnswers.filter(Boolean).length;
  const accuracy = Math.round((caseScore / totalQuestions) * 100);
  
  return {
    totalQuestions,
    caseScore,
    accuracy,
    correctAnswers
  };
}

// Fixed logic 
function calculateScoreFixed(currentCase, answers) {
  // Calculate total questions based on what actually exists
  const totalQuestions = (currentCase.questions.violation ? 1 : 0) + 
                        (currentCase.questions.rootCause ? 1 : 0) + 
                        (currentCase.questions.impact ? 1 : 0);
  const correctAnswers = [
    ...(currentCase.questions.violation ? [answers.violation === currentCase.questions.violation.correct] : []),
    ...(currentCase.questions.rootCause ? [answers.rootCause === currentCase.questions.rootCause.correct] : []),
    ...(currentCase.questions.impact ? [answers.impact === currentCase.questions.impact.correct] : [])
  ];
  const caseScore = correctAnswers.filter(Boolean).length;
  const accuracy = Math.round((caseScore / totalQuestions) * 100);
  
  return {
    totalQuestions,
    caseScore,
    accuracy,
    correctAnswers
  };
}

console.log("=== CURRENT (BROKEN) LOGIC ===");
console.log("Module 1 (3 questions, all correct):");
const module1Current = calculateScore(module1Case, correctAnswersModule1);
console.log(`Score: ${module1Current.caseScore}/${module1Current.totalQuestions} = ${module1Current.accuracy}%`);

console.log("\nModule 4 (2 questions, all correct):");
const module4Current = calculateScore(module4Case, correctAnswersModule4);
console.log(`Score: ${module4Current.caseScore}/${module4Current.totalQuestions} = ${module4Current.accuracy}%`);

console.log("\n=== FIXED LOGIC ===");
console.log("Module 1 (3 questions, all correct):");
const module1Fixed = calculateScoreFixed(module1Case, correctAnswersModule1);
console.log(`Score: ${module1Fixed.caseScore}/${module1Fixed.totalQuestions} = ${module1Fixed.accuracy}%`);

console.log("\nModule 4 (2 questions, all correct):");
const module4Fixed = calculateScoreFixed(module4Case, correctAnswersModule4);
console.log(`Score: ${module4Fixed.caseScore}/${module4Fixed.totalQuestions} = ${module4Fixed.accuracy}%`);
