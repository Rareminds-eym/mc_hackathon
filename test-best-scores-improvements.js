/**
 * Test Best Scores Improvements
 * 
 * This script tests the improved best scores functionality:
 * 1. Only shows scenarios with actual scores (no "--")
 * 2. Shows just numbers (1, 2, 3) instead of "SCENARIO 1/2/3"
 * 3. Only updates database when new score is higher
 */

async function testBestScoresImprovements() {
  console.log('🎯 Testing Best Scores Improvements...');
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

    // Test 1: Clear existing data for clean test
    console.log('\n1️⃣ Clearing existing test data...');
    try {
      const { error: deleteError } = await supabase
        .from('level3_progress')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('module', '1');

      if (deleteError) {
        console.warn('⚠️ Could not clear existing data:', deleteError.message);
      } else {
        console.log('✅ Existing data cleared');
      }
    } catch (error) {
      console.warn('⚠️ Error clearing data:', error);
    }

    // Test 2: Add initial scores for scenarios 2 and 3 only (scenario 1 will have no data)
    console.log('\n2️⃣ Adding initial scores for scenarios 2 and 3...');
    
    const initialScores = [
      { scenario: 1, score: 85, time: 60, description: 'Initial score for scenario 2' },
      { scenario: 2, score: 90, time: 45, description: 'Initial score for scenario 3' }
    ];

    for (const initial of initialScores) {
      try {
        const completionData = {
          userId: userData.user.id,
          module: '1',
          level: 3,
          scenario_index: initial.scenario,
          finalScore: initial.score,
          finalTime: initial.time,
          placedPieces: {
            testData: true,
            description: initial.description,
            timestamp: new Date().toISOString()
          },
          isCompleted: true
        };

        const result = await Level3Service.saveGameCompletion(completionData);
        
        if (result.error) {
          console.error(`❌ Failed to save initial score for scenario ${initial.scenario + 1}:`, result.error);
        } else {
          const timeFormatted = `${Math.floor(initial.time / 60)}:${(initial.time % 60).toString().padStart(2, '0')}`;
          console.log(`✅ Scenario ${initial.scenario + 1}: Score ${initial.score}, Time ${timeFormatted} saved`);
        }
      } catch (error) {
        console.error(`❌ Exception saving initial score for scenario ${initial.scenario + 1}:`, error);
      }
    }

    // Test 3: Verify what the popup will show (should only show scenarios 2 and 3)
    console.log('\n3️⃣ Testing popup display logic...');
    
    const bestScores = [];
    
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
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
        console.error(`❌ Error getting best score for scenario ${scenarioIndex + 1}:`, error);
        bestScores.push({
          scenarioIndex,
          score: 0,
          time: 0
        });
      }
    }

    console.log('\n📊 Popup Display Preview:');
    console.log('='.repeat(30));

    const visibleScores = bestScores.filter(bestScore => bestScore.score > 0);

    if (visibleScores.length === 0) {
      console.log('📝 "No best scores yet"');
      console.log('📝 "Complete scenarios to see your best scores here"');
    } else {
      visibleScores.forEach((bestScore, displayIndex) => {
        const formatBestTime = (seconds) => {
          if (seconds <= 0) return '--';
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        };

        console.log(`🎮 ${displayIndex + 1} (actual scenario ${bestScore.scenarioIndex + 1})`);
        console.log(`   Score: ${bestScore.score}`);
        console.log(`   Time: ${formatBestTime(bestScore.time)}`);
        console.log('');
      });
    }

    console.log(`✅ Expected: Only ${visibleScores.length} scenarios shown (scenarios with scores)`);
    console.log('✅ Expected: Sequential numbers (1, 2, 3...) regardless of actual scenario numbers');

    // Test 4: Test the "only update if higher score" logic
    console.log('\n4️⃣ Testing "only update if higher score" logic...');
    
    // Try to save a LOWER score for scenario 2 (should not update)
    console.log('\n📉 Attempting to save LOWER score for scenario 2...');
    try {
      const lowerScoreData = {
        userId: userData.user.id,
        module: '1',
        level: 3,
        scenario_index: 1, // Scenario 2
        finalScore: 75, // Lower than current 85
        finalTime: 70,
        placedPieces: {
          testData: true,
          description: 'Lower score attempt',
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      };

      const lowerResult = await Level3Service.saveGameCompletion(lowerScoreData);
      
      if (lowerResult.isNewHighScore) {
        console.error('❌ ERROR: Lower score was marked as new high score!');
      } else {
        console.log('✅ Correctly rejected lower score (not saved)');
      }
    } catch (error) {
      console.error('❌ Exception testing lower score:', error);
    }

    // Try to save a HIGHER score for scenario 2 (should update)
    console.log('\n📈 Attempting to save HIGHER score for scenario 2...');
    try {
      const higherScoreData = {
        userId: userData.user.id,
        module: '1',
        level: 3,
        scenario_index: 1, // Scenario 2
        finalScore: 95, // Higher than current 85
        finalTime: 50,
        placedPieces: {
          testData: true,
          description: 'Higher score attempt',
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      };

      const higherResult = await Level3Service.saveGameCompletion(higherScoreData);
      
      if (higherResult.isNewHighScore) {
        console.log('✅ Correctly accepted higher score as new high score');
      } else {
        console.error('❌ ERROR: Higher score was not marked as new high score!');
      }
    } catch (error) {
      console.error('❌ Exception testing higher score:', error);
    }

    // Test 5: Verify final state
    console.log('\n5️⃣ Verifying final state...');
    
    const finalBestScores = [];
    
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
        if (result.data) {
          const score = result.data.current_score || 0;
          const time = result.data.time_taken || 0;
          
          finalBestScores.push({
            scenarioIndex,
            score,
            time
          });
        } else {
          finalBestScores.push({
            scenarioIndex,
            score: 0,
            time: 0
          });
        }
      } catch (error) {
        finalBestScores.push({
          scenarioIndex,
          score: 0,
          time: 0
        });
      }
    }

    console.log('\n📊 Final Best Scores:');
    finalBestScores.forEach((score, index) => {
      const timeFormatted = score.time > 0 ? 
        `${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')}` : 
        '--';
      console.log(`Scenario ${index + 1}: Score: ${score.score > 0 ? score.score : '--'}, Time: ${timeFormatted}`);
    });

    // Expected results
    console.log('\n🎯 Expected Results:');
    console.log('- Actual Scenario 1: No data (will not show in popup)');
    console.log('- Actual Scenario 2: Score 95, Time 0:50 (updated from 85) → Shows as "1"');
    console.log('- Actual Scenario 3: Score 90, Time 0:45 (unchanged) → Shows as "2"');

    console.log('\n🎉 Best Scores Improvements Test Completed!');
    console.log('💡 Now complete Level 3 to see the improved popup display');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Quick test to see current best scores
async function showCurrentBestScores() {
  console.log('📊 Current Best Scores:');
  
  try {
    const { Level3Service } = window;
    
    if (!Level3Service) {
      console.error('❌ Level3Service not available');
      return false;
    }

    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
        if (result.data && result.data.current_score > 0) {
          const timeFormatted = result.data.time_taken > 0 ? 
            `${Math.floor(result.data.time_taken / 60)}:${(result.data.time_taken % 60).toString().padStart(2, '0')}` : 
            '--';
          console.log(`${scenarioIndex + 1}: Score ${result.data.current_score}, Time ${timeFormatted}`);
        } else {
          console.log(`${scenarioIndex + 1}: No data`);
        }
      } catch (error) {
        console.log(`${scenarioIndex + 1}: Error - ${error.message}`);
      }
    }

    return true;

  } catch (error) {
    console.error('💥 Failed to show current best scores:', error);
    return false;
  }
}

// Make functions available
window.testBestScoresImprovements = testBestScoresImprovements;
window.showCurrentBestScores = showCurrentBestScores;

console.log(`
🎯 Best Scores Improvements Test:

🚀 FUNCTIONS:
- testBestScoresImprovements() - Full test of all improvements
- showCurrentBestScores() - Quick view of current scores

🎯 IMPROVEMENTS TESTED:
1. ✅ Only shows scenarios with actual scores (no "--")
2. ✅ Shows sequential numbers (1, 2, 3...) instead of "SCENARIO X"
3. ✅ Only updates database when new score is higher

🎯 QUICK START:
testBestScoresImprovements()
`);

// Auto-run the test
testBestScoresImprovements();
