/**
 * Complete Test Suite for Level 4 Score History Fix
 * This tests the exact scenario you described: playing twice and storing 3 attempts
 */

import level4Service from './services';

// Test configuration
const TEST_USER_ID = 'fix-test-user-789';
const TEST_MODULE = 3;

/**
 * Test the exact scenario: Playing twice should store both attempts
 */
export const testTwoAttempts = async (userId: string = TEST_USER_ID) => {
  try {
    console.log('🎯 TESTING: Two Attempts Should Store Both');
    console.log('=' .repeat(50));
    
    // Clear any existing data
    try {
      await level4Service.deleteModuleData(userId, TEST_MODULE);
      console.log('🧹 Cleared existing test data');
    } catch (e) {
      console.log('ℹ️ No existing data to clear');
    }

    console.log('\n📊 ATTEMPT 1: Playing first time...');
    // First attempt - lower score
    const attempt1 = await level4Service.upsertGameDataWithHistory(
      userId,
      TEST_MODULE,
      750,  // Score: 750
      true,
      140,  // Time: 140s
      {
        attempt: 1,
        description: 'First attempt',
        cases: { case1: true, case2: false, case3: true }
      }
    );

    console.log('✅ First attempt saved, ID:', attempt1);

    // Check what's stored after first attempt
    const afterFirst = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('📈 After first attempt:');
    console.log('   Current score:', afterFirst?.score);
    console.log('   Score history:', afterFirst?.score_history);
    console.log('   Time history:', afterFirst?.time_history);

    console.log('\n📊 ATTEMPT 2: Playing second time...');
    // Second attempt - higher score
    const attempt2 = await level4Service.upsertGameDataWithHistory(
      userId,
      TEST_MODULE,
      850,  // Score: 850 (higher)
      true,
      120,  // Time: 120s (faster)
      {
        attempt: 2,
        description: 'Second attempt - improved!',
        cases: { case1: true, case2: true, case3: true }
      }
    );

    console.log('✅ Second attempt saved, ID:', attempt2);

    // Check what's stored after second attempt
    const afterSecond = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('📈 After second attempt:');
    console.log('   Current score:', afterSecond?.score);
    console.log('   Score history:', afterSecond?.score_history);
    console.log('   Time history:', afterSecond?.time_history);

    // Verify the results
    const expectedScoreHistory = [850, 750]; // Should be sorted: highest first
    const expectedTimeHistory = [120, 140];  // Corresponding times
    const actualScoreHistory = afterSecond?.score_history || [];
    const actualTimeHistory = afterSecond?.time_history || [];

    console.log('\n🎯 VERIFICATION:');
    console.log('Expected score history:', expectedScoreHistory);
    console.log('Actual score history  :', actualScoreHistory);
    console.log('Expected time history :', expectedTimeHistory);
    console.log('Actual time history   :', actualTimeHistory);

    const scoresMatch = JSON.stringify(expectedScoreHistory) === JSON.stringify(actualScoreHistory);
    const timesMatch = JSON.stringify(expectedTimeHistory) === JSON.stringify(actualTimeHistory);

    if (scoresMatch && timesMatch) {
      console.log('✅ SUCCESS: Both attempts are correctly stored!');
      console.log('✅ Best score (850) is current score');
      console.log('✅ Score-time alignment is correct');
    } else {
      console.log('❌ PROBLEM: Score history not working correctly');
      console.log('❌ Expected 2 attempts to be stored, got:', actualScoreHistory.length);
    }

    return {
      success: scoresMatch && timesMatch,
      afterFirst,
      afterSecond,
      expectedScoreHistory,
      actualScoreHistory,
      expectedTimeHistory,
      actualTimeHistory
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Test the full scenario: 5 attempts, should keep top 3
 */
export const testFiveAttemptsKeepTop3 = async (userId: string = TEST_USER_ID + '-full') => {
  try {
    console.log('\n🎯 TESTING: Five Attempts Should Keep Top 3');
    console.log('=' .repeat(50));
    
    // Clear any existing data
    try {
      await level4Service.deleteModuleData(userId, TEST_MODULE);
    } catch (e) {
      // Ignore if no data exists
    }

    const attempts = [
      { score: 650, time: 150, description: 'First try - learning' },
      { score: 850, time: 120, description: 'Second try - much better!' },
      { score: 750, time: 140, description: 'Third try - inconsistent' },
      { score: 950, time: 110, description: 'Fourth try - excellent!' },
      { score: 700, time: 135, description: 'Fifth try - tired' }
    ];

    console.log('\n📊 Playing 5 attempts:');

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      console.log(`\n🎮 Attempt ${i + 1}: ${attempt.description}`);
      console.log(`   Score: ${attempt.score}, Time: ${attempt.time}s`);

      await level4Service.upsertGameDataWithHistory(
        userId,
        TEST_MODULE,
        attempt.score,
        true,
        attempt.time,
        {
          attempt: i + 1,
          description: attempt.description,
          timestamp: new Date().toISOString()
        }
      );

      const current = await level4Service.getUserModuleData(userId, TEST_MODULE);
      console.log(`   📈 Current top scores: [${current?.score_history?.join(', ') || 'none'}]`);
    }

    // Final verification
    const final = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('\n🎉 FINAL RESULTS:');
    console.log('Final score history:', final?.score_history);
    console.log('Final time history:', final?.time_history);

    // Expected: [950, 850, 750] (top 3 scores)
    // Expected times: [110, 120, 140] (corresponding times)
    const expectedTop3Scores = [950, 850, 750];
    const expectedTop3Times = [110, 120, 140];
    const actualScores = final?.score_history || [];
    const actualTimes = final?.time_history || [];

    const top3Match = JSON.stringify(expectedTop3Scores) === JSON.stringify(actualScores);
    const timesMatch = JSON.stringify(expectedTop3Times) === JSON.stringify(actualTimes);

    console.log('\n🎯 VERIFICATION:');
    console.log('Expected top 3 scores:', expectedTop3Scores);
    console.log('Actual scores        :', actualScores);
    console.log('Expected times       :', expectedTop3Times);
    console.log('Actual times         :', actualTimes);

    if (top3Match && timesMatch) {
      console.log('✅ PERFECT: Top 3 tracking works correctly!');
      console.log('✅ Lowest scores (650, 700) were properly excluded');
      console.log('✅ Score-time alignment is perfect');
    } else {
      console.log('❌ ISSUE: Top 3 tracking not working as expected');
    }

    return {
      success: top3Match && timesMatch,
      final,
      expectedTop3Scores,
      actualScores,
      expectedTop3Times,
      actualTimes
    };

  } catch (error) {
    console.error('❌ Five attempts test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Test using the update function (this was causing the issue)
 */
export const testUpdateFunction = async (userId: string = TEST_USER_ID + '-update') => {
  try {
    console.log('\n🎯 TESTING: Update Function (was causing issues)');
    console.log('=' .repeat(50));
    
    // Clear existing data
    try {
      await level4Service.deleteModuleData(userId, TEST_MODULE);
    } catch (e) {
      // Ignore
    }

    // Create initial record
    console.log('📊 Creating initial record...');
    await level4Service.upsertGameDataWithHistory(
      userId,
      TEST_MODULE,
      600,
      false,
      160,
      { initial: true }
    );

    let current = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('Initial state:', current?.score_history);

    // Test multiple updates
    const updateScores = [750, 900, 650, 850];
    
    for (let i = 0; i < updateScores.length; i++) {
      const score = updateScores[i];
      console.log(`\n🔄 Update ${i + 1}: Adding score ${score}`);
      
      await level4Service.updateGameDataWithHistory(userId, TEST_MODULE, {
        score: score,
        time: 120 + (i * 10),
        updateHistory: true
      });

      current = await level4Service.getUserModuleData(userId, TEST_MODULE);
      console.log(`   📈 Score history: [${current?.score_history?.join(', ') || 'none'}]`);
    }

    // Final verification
    console.log('\n🎉 FINAL UPDATE TEST RESULTS:');
    console.log('Final score history:', current?.score_history);
    
    // Expected: top 3 from [600, 750, 900, 650, 850] = [900, 850, 750]
    const expectedScores = [900, 850, 750];
    const actualScores = current?.score_history || [];
    const updateWorking = JSON.stringify(expectedScores) === JSON.stringify(actualScores);

    if (updateWorking) {
      console.log('✅ UPDATE FUNCTION FIXED: Now properly maintains score history!');
    } else {
      console.log('❌ UPDATE FUNCTION STILL HAS ISSUES');
      console.log('Expected:', expectedScores);
      console.log('Actual:', actualScores);
    }

    return { success: updateWorking, current, expectedScores, actualScores };

  } catch (error) {
    console.error('❌ Update function test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Run all tests to verify the fix
 */
export const runAllFixTests = async () => {
  console.log('🚀 RUNNING COMPLETE FIX VERIFICATION');
  console.log('='.repeat(60));
  console.log('Testing the exact issue: "played twice but only one data stored"');
  console.log('='.repeat(60));

  const results = {
    twoAttempts: await testTwoAttempts(),
    fiveAttempts: await testFiveAttemptsKeepTop3(),
    updateFunction: await testUpdateFunction()
  };

  console.log('\n📋 SUMMARY OF ALL TESTS:');
  console.log('='.repeat(40));
  console.log('✅ Two attempts test:', results.twoAttempts.success ? 'PASSED' : 'FAILED');
  console.log('✅ Five attempts test:', results.fiveAttempts.success ? 'PASSED' : 'FAILED');
  console.log('✅ Update function test:', results.updateFunction.success ? 'PASSED' : 'FAILED');

  const allPassed = results.twoAttempts.success && 
                   results.fiveAttempts.success && 
                   results.updateFunction.success;

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Your issue is fixed!');
    console.log('✅ Playing twice now stores both attempts');
    console.log('✅ Top 3 attempts are maintained correctly');
    console.log('✅ Lowest scores are replaced when needed');
    console.log('✅ Score-time alignment is perfect');
  } else {
    console.log('\n⚠️ Some tests failed. Please run the SQL updates.');
  }

  return results;
};

// Quick test for browser console
export const quickFixTest = async () => {
  console.log('🚀 Quick Fix Test - Testing Two Attempts');
  return await testTwoAttempts();
};

export default {
  testTwoAttempts,
  testFiveAttemptsKeepTop3,
  testUpdateFunction,
  runAllFixTests,
  quickFixTest
};
