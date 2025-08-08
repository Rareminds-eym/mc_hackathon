// Test script to demonstrate the scoring issue in FeedbackPanel

// Simulate Module 4 case (2 questions - no violation)
const module4Case = {
  questions: {
    // No violation question
    rootCause: { correct: 0 },
    impact: { correct: 0 }
  }
};

// Simulate correct answers for Module 4
const correctAnswersModule4 = {
  violation: null,
  rootCause: 0,
  impact: 0
};

// Current BUGGY logic from FeedbackPanel.tsx (hardcoded + 1 + 1)
function calculateScoreBuggy(currentCase, answers) {
  const totalQuestions = (currentCase.questions.violation ? 1 : 0) + 1 + 1; // BUG: hardcoded + 1 + 1
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
    correctAnswers: correctAnswers
  };
}

// Fixed logic - properly checks if questions exist
function calculateScoreFixed(currentCase, answers) {
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
    correctAnswers: correctAnswers
  };
}

console.log("=== TESTING MODULE 4 SCENARIO ===");
console.log("Module 4 case structure:", JSON.stringify(module4Case, null, 2));
console.log("Correct answers:", JSON.stringify(correctAnswersModule4, null, 2));

console.log("\n=== CURRENT (BUGGY) LOGIC ===");
const buggyResult = calculateScoreBuggy(module4Case, correctAnswersModule4);
console.log(`Total Questions (buggy): ${buggyResult.totalQuestions}`);
console.log(`Correct Answers: ${buggyResult.correctAnswers}`);
console.log(`Score: ${buggyResult.caseScore}/${buggyResult.totalQuestions} = ${buggyResult.accuracy}%`);

console.log("\n=== FIXED LOGIC ===");
const fixedResult = calculateScoreFixed(module4Case, correctAnswersModule4);
console.log(`Total Questions (fixed): ${fixedResult.totalQuestions}`);
console.log(`Correct Answers: ${fixedResult.correctAnswers}`);
console.log(`Score: ${fixedResult.caseScore}/${fixedResult.totalQuestions} = ${fixedResult.accuracy}%`);

// Expected: Module 4 should show 2/2 = 100%, but buggy version shows 2/2 = 100% anyway because rootCause and impact exist
// The real bug might be that it's showing 2/3 somewhere in the UI

// Let's test what happens if a question was missing
const problematicCase = {
  questions: {
    // Only rootCause, missing impact
    rootCause: { correct: 0 }
  }
};

const problematicAnswers = {
  violation: null,
  rootCause: 0,
  impact: null // No impact question answered
};

console.log("\n=== TESTING PROBLEMATIC CASE (missing impact question) ===");
console.log("\n=== BUGGY LOGIC ===");
const buggyProblematic = calculateScoreBuggy(problematicCase, problematicAnswers);
console.log(`Score: ${buggyProblematic.caseScore}/${buggyProblematic.totalQuestions} = ${buggyProblematic.accuracy}%`);

console.log("\n=== FIXED LOGIC ===");
const fixedProblematic = calculateScoreFixed(problematicCase, problematicAnswers);
console.log(`Score: ${fixedProblematic.caseScore}/${fixedProblematic.totalQuestions} = ${fixedProblematic.accuracy}%`);
