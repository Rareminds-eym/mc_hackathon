/**
 * Test script to verify Level 3 final score calculation
 * 
 * Copy and paste this into the browser console to test the final score calculation.
 */

// Test the final score calculation logic
function testFinalScoreCalculation() {
  console.log('🧮 Testing Level 3 Final Score Calculation...');
  
  // Mock data similar to what you showed in the screenshot
  const mockScenarioResults = [
    { score: 100, combo: 2, health: 80 }, // Scenario 1
    { score: 99, combo: 3, health: 100 }, // Scenario 2  
    { score: 100, combo: 1, health: 90 }  // Scenario 3
  ];
  
  const mockOverallStats = {
    totalScore: 299, // Sum of scenario scores
    totalCombo: 6,   // Sum of combos
    avgHealth: 90    // Average health
  };
  
  // Replicate the calculation logic from the component
  const calculateFinalScore = (scenarioResults, overallStats) => {
    const maxPossibleScore = scenarioResults.length * 100; // 100 points per scenario
    const maxPossibleCombo = scenarioResults.length * 5; // Assume max 5 combo per scenario
    const maxHealth = 100; // Health is always out of 100

    // Calculate weighted percentages
    const scorePart = Math.round((overallStats.totalScore / maxPossibleScore) * 70);
    const comboPart = Math.round((overallStats.totalCombo / maxPossibleCombo) * 20);
    const healthPart = Math.round((overallStats.avgHealth / maxHealth) * 10);

    console.log('📊 Calculation Breakdown:', {
      maxPossibleScore,
      maxPossibleCombo,
      maxHealth,
      scorePart: `${overallStats.totalScore}/${maxPossibleScore} * 70 = ${scorePart}`,
      comboPart: `${overallStats.totalCombo}/${maxPossibleCombo} * 20 = ${comboPart}`,
      healthPart: `${overallStats.avgHealth}/${maxHealth} * 10 = ${healthPart}`,
      total: scorePart + comboPart + healthPart
    });

    return Math.min(scorePart + comboPart + healthPart, 100);
  };
  
  const finalScore = calculateFinalScore(mockScenarioResults, mockOverallStats);
  
  console.log('🎯 Final Score Result:', {
    finalScore: `${finalScore} / 100`,
    expectedFromScreenshot: '87 / 100',
    matches: finalScore === 87 ? '✅ MATCHES!' : '❌ Different'
  });
  
  return finalScore;
}

// Test with different scenarios
function testVariousScenarios() {
  console.log('\n🔄 Testing Various Scenarios...');
  
  const testCases = [
    {
      name: 'Perfect Score',
      scenarioResults: [
        { score: 100, combo: 5, health: 100 },
        { score: 100, combo: 5, health: 100 },
        { score: 100, combo: 5, health: 100 }
      ],
      overallStats: { totalScore: 300, totalCombo: 15, avgHealth: 100 }
    },
    {
      name: 'Poor Performance',
      scenarioResults: [
        { score: 50, combo: 1, health: 60 },
        { score: 40, combo: 0, health: 50 },
        { score: 60, combo: 2, health: 70 }
      ],
      overallStats: { totalScore: 150, totalCombo: 3, avgHealth: 60 }
    },
    {
      name: 'Your Screenshot Data',
      scenarioResults: [
        { score: 100, combo: 2, health: 80 },
        { score: 99, combo: 3, health: 100 },
        { score: 100, combo: 1, health: 90 }
      ],
      overallStats: { totalScore: 299, totalCombo: 6, avgHealth: 90 }
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n📋 Testing: ${testCase.name}`);
    const finalScore = calculateFinalScore(testCase.scenarioResults, testCase.overallStats);
    console.log(`Result: ${finalScore} / 100`);
  });
}

// Helper function (same as in component)
function calculateFinalScore(scenarioResults, overallStats) {
  const maxPossibleScore = scenarioResults.length * 100;
  const maxPossibleCombo = scenarioResults.length * 5;
  const maxHealth = 100;

  const scorePart = Math.round((overallStats.totalScore / maxPossibleScore) * 70);
  const comboPart = Math.round((overallStats.totalCombo / maxPossibleCombo) * 20);
  const healthPart = Math.round((overallStats.avgHealth / maxHealth) * 10);

  return Math.min(scorePart + comboPart + healthPart, 100);
}

// Make functions available globally
window.testFinalScoreCalculation = testFinalScoreCalculation;
window.testVariousScenarios = testVariousScenarios;
window.calculateFinalScore = calculateFinalScore;

console.log(`
🧮 Level 3 Final Score Test Functions Available:

1. testFinalScoreCalculation() - Test with your screenshot data
2. testVariousScenarios() - Test multiple scenarios
3. calculateFinalScore(scenarioResults, overallStats) - Manual calculation

Example usage:
- testFinalScoreCalculation()
- testVariousScenarios()
`);

// Auto-run the main test
testFinalScoreCalculation();
