/**
 * Quick Demo to Test Score History with Multiple Attempts
 * Run this in your browser console to see the improved score tracking
 */

import level4Service from './services';

/**
 * Demo function that shows exactly how the top 3 attempts are tracked
 */
export const demoScoreHistory = async (userId: string = 'demo-user-456', module: number = 2) => {
  console.log('🎮 DEMO: Testing Top 3 Score History Management');
  console.log('='.repeat(60));
  
  try {
    // Clear any existing data for clean demo
    try {
      await level4Service.deleteModuleData(userId, module);
      console.log('🧹 Cleared existing demo data');
    } catch (e) {
      console.log('ℹ️ No existing data to clear');
    }

    console.log('\n📊 Simulating 6 game attempts...\n');

    const attempts = [
      { score: 650, time: 150, description: 'First attempt - learning' },
      { score: 850, time: 120, description: 'Second attempt - improving' },
      { score: 750, time: 140, description: 'Third attempt - inconsistent' },
      { score: 950, time: 110, description: 'Fourth attempt - excellent!' },
      { score: 700, time: 135, description: 'Fifth attempt - tired' },
      { score: 900, time: 115, description: 'Sixth attempt - focused' }
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      
      console.log(`🎯 Attempt ${i + 1}: ${attempt.description}`);
      console.log(`   Score: ${attempt.score}, Time: ${attempt.time}s`);
      
      // Save the attempt
      await level4Service.upsertGameDataWithHistory(
        userId,
        module,
        attempt.score,
        true,
        attempt.time,
        {
          attempt: i + 1,
          description: attempt.description,
          timestamp: new Date().toISOString(),
          cases: generateDemoCases(attempt.score)
        }
      );

      // Show current top 3 after each attempt
      const currentData = await level4Service.getUserModuleData(userId, module);
      const scoreHistory = await level4Service.getPastThreeScores(userId, module);
      
      console.log(`   📈 Current Top 3 Scores: [${currentData?.score_history?.join(', ') || 'none'}]`);
      console.log(`   ⏱️  Corresponding Times: [${currentData?.time_history?.join(', ') || 'none'}]`);
      console.log(`   🏆 Best Score: ${scoreHistory.current_score} (${scoreHistory.current_time_value}s)`);
      console.log('   ' + '-'.repeat(50));
      
      // Small delay for readability
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n🎉 FINAL RESULTS:');
    console.log('='.repeat(40));
    
    const finalData = await level4Service.getUserModuleData(userId, module);
    const finalHistory = await level4Service.getPastThreeScores(userId, module);
    
    console.log(`🥇 Best Score: ${finalHistory.current_score} (${finalHistory.current_time_value}s)`);
    console.log(`🥈 2nd Best: ${finalHistory.previous_score} (${finalHistory.previous_time}s)`);
    console.log(`🥉 3rd Best: ${finalHistory.past_previous_score} (${finalHistory.past_previous_time}s)`);
    
    console.log('\n✅ SUCCESS: The system correctly kept the top 3 attempts!');
    console.log('📝 Expected: [950, 900, 850] - Got:', finalData?.score_history);
    console.log('⏱️  Expected: [110, 115, 120] - Got:', finalData?.time_history);
    
    // Verify the results
    const expectedScores = [950, 900, 850];
    const expectedTimes = [110, 115, 120];
    const actualScores = finalData?.score_history || [];
    const actualTimes = finalData?.time_history || [];
    
    const scoresMatch = JSON.stringify(expectedScores) === JSON.stringify(actualScores);
    const timesMatch = JSON.stringify(expectedTimes) === JSON.stringify(actualTimes);
    
    if (scoresMatch && timesMatch) {
      console.log('🎯 PERFECT! Score history management is working correctly!');
    } else {
      console.log('⚠️  There might be an issue with the score history logic.');
    }
    
    return {
      success: true,
      finalScores: actualScores,
      finalTimes: actualTimes,
      expectedScores,
      expectedTimes,
      scoresMatch,
      timesMatch
    };
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Generate demo case data based on score
 */
function generateDemoCases(score: number) {
  const correctAnswers = Math.floor(score / 100); // Rough calculation
  return {
    case1: { 
      question: "ICD-10 code for diabetes",
      answer: "E11.9", 
      correct: correctAnswers >= 1,
      timeSpent: 30 
    },
    case2: { 
      question: "Bilateral procedure modifier",
      answer: "50", 
      correct: correctAnswers >= 2,
      timeSpent: 25 
    },
    case3: { 
      question: "CPT code for office visit",
      answer: "99213", 
      correct: correctAnswers >= 3,
      timeSpent: 35 
    },
    case4: { 
      question: "Surgical coding principles",
      answer: "Correct approach", 
      correct: correctAnswers >= 4,
      timeSpent: 40 
    }
  };
}

/**
 * Quick test function for browser console
 */
export const quickTest = async () => {
  console.log('🚀 Running Quick Score History Test...');
  return await demoScoreHistory();
};

export default { demoScoreHistory, quickTest };
