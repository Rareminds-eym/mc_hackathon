/**
 * Test Score and Time Display
 * 
 * This script tests the new Score + Time display in the best scores section
 */

async function testScoreTimeDisplay() {
  console.log('🕒 Testing Score and Time Display...');
  console.log('='.repeat(50));
  
  try {
    const { supabase, Level3Service } = window;
    
    if (!supabase) {
      console.error('❌ Supabase not available');
      return false;
    }
    
    if (!Level3Service) {
      console.error('❌ Level3Service not available');
      console.log('💡 Make sure you\'re on the Level 3 page');
      return false;
    }

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError?.message);
      return false;
    }
    
    console.log('✅ User authenticated:', userData.user.email);

    // Add test data with specific scores and times
    const testData = [
      { scenario: 0, score: 95, time: 45 }, // 45 seconds = 0:45
      { scenario: 1, score: 88, time: 72 }, // 72 seconds = 1:12
      { scenario: 2, score: 92, time: 38 }  // 38 seconds = 0:38
    ];

    console.log('\n📤 Adding test data with specific times...');

    for (const test of testData) {
      try {
        const completionData = {
          userId: userData.user.id,
          module: '1',
          level: 3,
          scenario_index: test.scenario,
          finalScore: test.score,
          finalTime: test.time,
          placedPieces: {
            testData: true,
            timestamp: new Date().toISOString()
          },
          isCompleted: true
        };

        const result = await Level3Service.saveGameCompletion(completionData);
        
        if (result.error) {
          console.error(`❌ Failed to save scenario ${test.scenario + 1}:`, result.error);
        } else {
          const timeFormatted = `${Math.floor(test.time / 60)}:${(test.time % 60).toString().padStart(2, '0')}`;
          console.log(`✅ Scenario ${test.scenario + 1}: Score ${test.score}, Time ${timeFormatted} saved`);
        }
      } catch (error) {
        console.error(`❌ Exception saving scenario ${test.scenario + 1}:`, error);
      }
    }

    // Verify the data can be retrieved with correct formatting
    console.log('\n🔍 Verifying retrieval and formatting...');
    
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
        if (result.data) {
          const score = result.data.current_score;
          const time = result.data.time_taken;
          const timeFormatted = time > 0 ? 
            `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}` : 
            '--';
          
          console.log(`📊 Scenario ${scenarioIndex + 1}: Score: ${score}, Time: ${timeFormatted}`);
        } else {
          console.log(`⚠️ No data for scenario ${scenarioIndex + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error retrieving scenario ${scenarioIndex + 1}:`, error);
      }
    }

    // Test the formatBestTime function logic
    console.log('\n🧪 Testing time formatting logic...');
    
    const testTimes = [0, 30, 45, 72, 125, 3661]; // Various test times
    testTimes.forEach(seconds => {
      const formatted = seconds > 0 ? 
        `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}` : 
        '--';
      console.log(`⏱️ ${seconds} seconds → ${formatted}`);
    });

    console.log('\n🎉 Score and Time display test completed!');
    console.log('💡 Now complete Level 3 to see "Score" and "Time" in the best scores popup');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Test the component's best scores fetching with the new format
async function simulateComponentBestScores() {
  console.log('🎭 Simulating Component Best Scores Logic...');
  
  try {
    const { Level3Service } = window;
    const moduleId = '1';
    
    // Simulate the component's logic
    const bestScores = [];
    
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore(moduleId, scenarioIndex);
        
        if (result.data) {
          const score = result.data.current_score || 0;
          const time = result.data.time_taken || 0;
          
          bestScores.push({
            scenarioIndex,
            score,
            time
          });
        } else {
          bestScores.push({
            scenarioIndex,
            score: 0,
            time: 0
          });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to get best score for scenario ${scenarioIndex}:`, error);
        bestScores.push({
          scenarioIndex,
          score: 0,
          time: 0
        });
      }
    }

    console.log('\n📊 Component would display:');
    bestScores.forEach((bestScore, index) => {
      const formatBestTime = (seconds) => {
        if (seconds <= 0) return '--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      };

      console.log(`🎮 SCENARIO ${index + 1}`);
      console.log(`   Score: ${bestScore.score > 0 ? bestScore.score : '--'}`);
      console.log(`   Time: ${formatBestTime(bestScore.time)}`);
    });

    return true;

  } catch (error) {
    console.error('💥 Simulation failed:', error);
    return false;
  }
}

// Make functions available
window.testScoreTimeDisplay = testScoreTimeDisplay;
window.simulateComponentBestScores = simulateComponentBestScores;

console.log(`
🕒 Score and Time Display Test Tools:

🚀 FUNCTIONS:
- testScoreTimeDisplay() - Add test data and verify score/time display
- simulateComponentBestScores() - Simulate what the component will show

🎯 QUICK START:
testScoreTimeDisplay()
`);

// Auto-run the test
testScoreTimeDisplay();
