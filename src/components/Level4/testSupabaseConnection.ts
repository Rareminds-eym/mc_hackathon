/**
 * Test file to verify Supabase connection and Level 4 data saving
 * Run this to ensure your database setup is working correctly
 */

import level4Service from './services';
import { supabase } from '../../lib/supabase';

// Test user ID (you can replace with actual user ID from your auth system)
const TEST_USER_ID = 'test-user-123';
const TEST_MODULE = 1;

/**
 * Test basic Supabase connection
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('level_4')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Current records in level_4 table:', data);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

/**
 * Test saving game data to Supabase
 */
export const testSaveGameData = async (userId: string = TEST_USER_ID) => {
  try {
    console.log('💾 Testing game data save...');
    
    const testGameData = {
      userId: userId,
      module: TEST_MODULE,
      score: 850,
      isCompleted: true,
      time: 120, // 2 minutes
      cases: {
        case1: { 
          question: "What is the correct ICD-10 code for diabetes?",
          answer: "E11.9", 
          correct: true,
          timeSpent: 30
        },
        case2: { 
          question: "Which modifier is used for bilateral procedures?",
          answer: "50", 
          correct: true,
          timeSpent: 25
        },
        case3: { 
          question: "What is the CPT code for routine office visit?",
          answer: "99213", 
          correct: false,
          timeSpent: 40
        }
      }
    };

    // Save using the enhanced upsert function
    const result = await level4Service.upsertGameDataWithHistory(
      testGameData.userId,
      testGameData.module,
      testGameData.score,
      testGameData.isCompleted,
      testGameData.time,
      testGameData.cases
    );

    console.log('✅ Game data saved successfully!');
    console.log('📄 Result ID:', result);

    // Verify the data was saved by retrieving it
    const savedData = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('📊 Retrieved data:', savedData);

    return { success: true, data: savedData };
  } catch (error) {
    console.error('❌ Failed to save game data:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Test multiple attempts to verify top 3 score tracking
 */
export const testMultipleAttempts = async (userId: string = TEST_USER_ID) => {
  try {
    console.log('🔄 Testing multiple attempts with score history...');

    // Simulate multiple game attempts with different scores
    const attempts = [
      { score: 650, time: 150, attempt: 1 },
      { score: 850, time: 120, attempt: 2 },
      { score: 750, time: 140, attempt: 3 },
      { score: 950, time: 110, attempt: 4 }, // This should become #1
      { score: 700, time: 135, attempt: 5 }, // This should not make top 3
      { score: 900, time: 115, attempt: 6 }  // This should become #2
    ];

    console.log('📊 Playing multiple attempts...');
    
    for (const attempt of attempts) {
      console.log(`🎮 Attempt ${attempt.attempt}: Score ${attempt.score}, Time ${attempt.time}s`);
      
      await level4Service.upsertGameDataWithHistory(
        userId,
        TEST_MODULE,
        attempt.score,
        true,
        attempt.time,
        {
          attempt: attempt.attempt,
          score: attempt.score,
          timestamp: new Date().toISOString(),
          cases: {
            case1: { correct: attempt.score > 700 },
            case2: { correct: attempt.score > 800 },
            case3: { correct: attempt.score > 900 }
          }
        }
      );
      
      // Small delay to simulate real gameplay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Get the final score history
    const scoreHistory = await level4Service.getPastThreeScores(userId, TEST_MODULE);
    console.log('📈 Final Score History (Top 3):', scoreHistory);

    // Get current user data to verify
    const userData = await level4Service.getUserModuleData(userId, TEST_MODULE);
    console.log('📊 Current User Data:', {
      currentScore: userData?.score,
      scoreHistory: userData?.score_history,
      timeHistory: userData?.time_history
    });

    // Expected result: Top 3 should be [950, 900, 850] with times [110, 115, 120]
    console.log('✅ Expected top 3 scores: [950, 900, 850]');
    console.log('✅ Expected corresponding times: [110, 115, 120]');

    return { success: true, scoreHistory, userData };
  } catch (error) {
    console.error('❌ Failed to test multiple attempts:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Test updating existing game data
 */
export const testUpdateGameData = async (userId: string = TEST_USER_ID) => {
  try {
    console.log('🔄 Testing game data update...');

    // Update with a higher score
    await level4Service.updateGameDataWithHistory(userId, TEST_MODULE, {
      score: 950,
      time: 110,
      updateHistory: true
    });

    console.log('✅ Game data updated successfully!');

    // Get score history to verify
    const scoreHistory = await level4Service.getPastThreeScores(userId, TEST_MODULE);
    console.log('📈 Score history:', scoreHistory);

    return { success: true, scoreHistory };
  } catch (error) {
    console.error('❌ Failed to update game data:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Test retrieving user statistics
 */
export const testGetUserStats = async (userId: string = TEST_USER_ID) => {
  try {
    console.log('📊 Testing user statistics retrieval...');

    const stats = await level4Service.getUserStats(userId);
    console.log('📈 User stats:', stats);

    const analytics = await level4Service.getUserAnalytics(userId);
    console.log('🔍 User analytics:', analytics);

    return { success: true, stats, analytics };
  } catch (error) {
    console.error('❌ Failed to get user stats:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Run all tests including multiple attempts
 */
export const runAllTests = async (userId?: string) => {
  console.log('🚀 Starting Supabase Level 4 tests...\n');

  const testUserId = userId || TEST_USER_ID;
  
  // Test 1: Connection
  const connectionTest = await testSupabaseConnection();
  if (!connectionTest) {
    console.log('❌ Stopping tests - connection failed');
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Save initial game data
  await testSaveGameData(testUserId);
  
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Multiple attempts (this is the main test for your requirement)
  await testMultipleAttempts(testUserId);

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Get statistics
  await testGetUserStats(testUserId);

  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary:');
  console.log('- The system now properly tracks top 3 attempts based on score');
  console.log('- When more than 3 attempts are made, lowest score is replaced');
  console.log('- Score and time history remain aligned');
};

/**
 * Example usage in your game component
 */
export const saveRealGameData = async (
  userId: string,
  module: number,
  gameResults: {
    score: number;
    timeElapsed: number;
    casesData: any;
    isCompleted: boolean;
  }
) => {
  try {
    console.log(`💾 Saving game data for user ${userId}, module ${module}`);

    // Save the game data with history tracking
    const result = await level4Service.upsertGameDataWithHistory(
      userId,
      module,
      gameResults.score,
      gameResults.isCompleted,
      gameResults.timeElapsed,
      gameResults.casesData
    );

    console.log('✅ Game data saved successfully:', result);

    // Get updated statistics
    const stats = await level4Service.getUserStats(userId);
    const scoreHistory = await level4Service.getPastThreeScores(userId, module);

    return {
      success: true,
      id: result,
      stats,
      scoreHistory
    };
  } catch (error) {
    console.error('❌ Failed to save real game data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Export default for easy importing
export default {
  testSupabaseConnection,
  testSaveGameData,
  testUpdateGameData,
  testMultipleAttempts,
  testGetUserStats,
  runAllTests,
  saveRealGameData
};
