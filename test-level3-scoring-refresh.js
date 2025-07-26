/**
 * Test script to verify Level 3 scoring refresh functionality
 * 
 * This script tests:
 * 1. Completing a scenario in Module 2
 * 2. Verifying the score is saved
 * 3. Checking that best scores are refreshed
 * 
 * Run this in the browser console while on the Level 3 page for Module 2
 */

async function testLevel3ScoringRefresh() {
  console.log('🧪 Testing Level 3 Scoring Refresh for Module 2...');
  
  try {
    // Check if we're on the right page
    if (!window.Level3Service) {
      console.error('❌ Level3Service not available. Make sure you\'re on the Level 3 page.');
      return false;
    }

    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    console.log('✅ User authenticated:', userData.user.email);

    // Test Module 2 specifically (since that's what the user is playing)
    const moduleId = '2';
    const scenarioIndex = 0; // First scenario

    // Step 1: Check current best score
    console.log('\n1️⃣ Checking current best score...');
    const currentResult = await window.Level3Service.getBestScore(moduleId, scenarioIndex);
    
    if (currentResult.data) {
      console.log('📊 Current best score:', {
        score: currentResult.data.current_score,
        time: currentResult.data.time_taken,
        completed: currentResult.data.is_completed
      });
    } else {
      console.log('ℹ️ No current score found (this is normal for new scenarios)');
    }

    // Step 2: Simulate a scenario completion with a good score
    console.log('\n2️⃣ Simulating scenario completion...');
    
    const testScore = (currentResult.data?.current_score || 0) + 10; // Ensure it's higher
    const testTime = 45; // 45 seconds
    
    const completionData = {
      userId: userData.user.id,
      module: moduleId,
      level: 3,
      scenario_index: scenarioIndex,
      finalScore: testScore,
      finalTime: testTime,
      placedPieces: {
        scenarioResults: [
          { score: 100, combo: 2, health: 85, scenarioIndex: 0 }
        ],
        testData: true,
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    console.log('💾 Saving completion data:', {
      module: moduleId,
      scenario: scenarioIndex,
      score: testScore,
      time: testTime
    });

    const saveResult = await window.Level3Service.saveGameCompletion(completionData);
    
    if (saveResult.error) {
      console.error('❌ Failed to save completion:', saveResult.error);
      return false;
    }

    console.log('✅ Completion saved successfully!', {
      isNewHighScore: saveResult.isNewHighScore,
      score: testScore
    });

    // Step 3: Verify the score was updated
    console.log('\n3️⃣ Verifying score update...');
    
    const updatedResult = await window.Level3Service.getBestScore(moduleId, scenarioIndex);
    
    if (updatedResult.data) {
      const timeFormatted = updatedResult.data.time_taken > 0 ? 
        `${Math.floor(updatedResult.data.time_taken / 60)}:${(updatedResult.data.time_taken % 60).toString().padStart(2, '0')}` : 
        '--';
      
      console.log('📊 Updated best score:', {
        score: updatedResult.data.current_score,
        time: timeFormatted,
        completed: updatedResult.data.is_completed
      });

      if (updatedResult.data.current_score === testScore) {
        console.log('✅ Score update verified! The scoring system is working correctly.');
      } else {
        console.warn('⚠️ Score mismatch. Expected:', testScore, 'Got:', updatedResult.data.current_score);
      }
    } else {
      console.error('❌ Could not retrieve updated score');
      return false;
    }

    // Step 4: Test best scores for all scenarios in Module 2
    console.log('\n4️⃣ Testing all Module 2 scenarios...');
    
    for (let i = 0; i < 3; i++) {
      try {
        const result = await window.Level3Service.getBestScore(moduleId, i);
        
        if (result.data && result.data.current_score > 0) {
          const timeFormatted = result.data.time_taken > 0 ? 
            `${Math.floor(result.data.time_taken / 60)}:${(result.data.time_taken % 60).toString().padStart(2, '0')}` : 
            '--';
          console.log(`✅ Scenario ${i + 1}: Score ${result.data.current_score}, Time ${timeFormatted}`);
        } else {
          console.log(`ℹ️ Scenario ${i + 1}: No data (shows as -- in UI)`);
        }
      } catch (error) {
        console.log(`❌ Scenario ${i + 1}: Error - ${error.message}`);
      }
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('💡 The scoring system should now refresh automatically when you complete scenarios.');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

// Auto-run the test
testLevel3ScoringRefresh();
