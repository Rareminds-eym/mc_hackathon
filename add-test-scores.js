/**
 * Add Test Scores for Best Scores Feature
 * 
 * This script adds some test completion data so you can see the best scores feature in action
 */

async function addTestScores() {
  console.log('🎯 Adding Test Scores for Best Scores Feature...');
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

    // Test completion data for all 3 scenarios
    const testCompletions = [
      {
        module: '1',
        scenario_index: 0,
        finalScore: 95,
        finalTime: 45,
        placedPieces: {
          scenarioResults: [
            { scenarioIndex: 0, score: 95, combo: 2, health: 85 }
          ],
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      },
      {
        module: '1',
        scenario_index: 1,
        finalScore: 88,
        finalTime: 52,
        placedPieces: {
          scenarioResults: [
            { scenarioIndex: 1, score: 88, combo: 1, health: 70 }
          ],
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      },
      {
        module: '1',
        scenario_index: 2,
        finalScore: 92,
        finalTime: 38,
        placedPieces: {
          scenarioResults: [
            { scenarioIndex: 2, score: 92, combo: 3, health: 95 }
          ],
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      }
    ];

    console.log('\n📤 Adding test completion data...');

    for (let i = 0; i < testCompletions.length; i++) {
      const completion = testCompletions[i];
      
      console.log(`\n${i + 1}️⃣ Adding Scenario ${completion.scenario_index + 1} completion...`);
      
      try {
        const completionData = {
          userId: userData.user.id,
          module: completion.module,
          level: 3,
          scenario_index: completion.scenario_index,
          finalScore: completion.finalScore,
          finalTime: completion.finalTime,
          placedPieces: completion.placedPieces,
          isCompleted: completion.isCompleted
        };

        const result = await Level3Service.saveGameCompletion(completionData);

        if (result.error) {
          console.error(`❌ Failed to save scenario ${completion.scenario_index + 1}:`, result.error);
        } else {
          console.log(`✅ Scenario ${completion.scenario_index + 1} saved successfully:`, {
            score: completion.finalScore,
            time: completion.finalTime,
            isNewHighScore: result.isNewHighScore
          });
        }
      } catch (error) {
        console.error(`❌ Exception saving scenario ${completion.scenario_index + 1}:`, error);
      }
    }

    // Verify the test data was saved
    console.log('\n🔍 Verifying saved test data...');
    
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
        if (result.data) {
          console.log(`✅ Scenario ${scenarioIndex + 1} verified:`, {
            best_score: result.data.current_score,
            time_taken: result.data.time_taken,
            is_completed: result.data.is_completed
          });
        } else {
          console.log(`⚠️ No data found for scenario ${scenarioIndex + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error verifying scenario ${scenarioIndex + 1}:`, error);
      }
    }

    console.log('\n🎉 Test scores added successfully!');
    console.log('💡 Now complete Level 3 to see the best scores feature in action');
    
    return true;

  } catch (error) {
    console.error('💥 Failed to add test scores:', error);
    return false;
  }
}

// Add some varied test scores to show the feature better
async function addVariedTestScores() {
  console.log('🎲 Adding Varied Test Scores...');
  
  try {
    const { Level3Service } = window;
    const { data: userData } = await window.supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    // Add multiple attempts with different scores to show history
    const attempts = [
      // First attempts (lower scores)
      { scenario: 0, score: 75, time: 60, combo: 1, health: 60 },
      { scenario: 1, score: 70, time: 65, combo: 1, health: 55 },
      { scenario: 2, score: 80, time: 55, combo: 1, health: 75 },
      
      // Second attempts (better scores)
      { scenario: 0, score: 85, time: 50, combo: 2, health: 80 },
      { scenario: 1, score: 82, time: 48, combo: 2, health: 75 },
      { scenario: 2, score: 90, time: 45, combo: 2, health: 85 },
      
      // Third attempts (best scores)
      { scenario: 0, score: 95, time: 42, combo: 3, health: 90 },
      { scenario: 1, score: 88, time: 40, combo: 2, health: 85 },
      { scenario: 2, score: 98, time: 38, combo: 3, health: 95 }
    ];

    console.log('\n📊 Adding multiple attempts to build score history...');

    for (const attempt of attempts) {
      try {
        const completionData = {
          userId: userData.user.id,
          module: '1',
          level: 3,
          scenario_index: attempt.scenario,
          finalScore: attempt.score,
          finalTime: attempt.time,
          placedPieces: {
            scenarioResults: [
              { 
                scenarioIndex: attempt.scenario, 
                score: attempt.score, 
                combo: attempt.combo, 
                health: attempt.health 
              }
            ],
            timestamp: new Date().toISOString()
          },
          isCompleted: true
        };

        const result = await Level3Service.saveGameCompletion(completionData);
        
        if (result.error) {
          console.error(`❌ Failed attempt:`, result.error);
        } else {
          console.log(`✅ Scenario ${attempt.scenario + 1}: ${attempt.score} points (${result.isNewHighScore ? 'NEW HIGH SCORE!' : 'saved'})`);
        }
        
        // Small delay to ensure proper ordering
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Exception:`, error);
      }
    }

    console.log('\n🎉 Varied test scores added!');
    console.log('💡 The best scores should now show the highest scores for each scenario');
    
    return true;

  } catch (error) {
    console.error('💥 Failed to add varied test scores:', error);
    return false;
  }
}

// Clear test data
async function clearTestData() {
  console.log('🧹 Clearing Test Data...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('level3_progress')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('module', '1');

    if (error) {
      console.error('❌ Failed to clear test data:', error);
      return false;
    }

    console.log('✅ Test data cleared successfully');
    return true;

  } catch (error) {
    console.error('💥 Failed to clear test data:', error);
    return false;
  }
}

// Make functions available
window.addTestScores = addTestScores;
window.addVariedTestScores = addVariedTestScores;
window.clearTestData = clearTestData;

console.log(`
🎯 Test Scores Tools:

🚀 FUNCTIONS:
- addTestScores() - Add basic test completion data
- addVariedTestScores() - Add multiple attempts with score progression
- clearTestData() - Clear all test data for module 1

🎯 QUICK START:
addVariedTestScores()
`);

// Auto-run varied test scores
addVariedTestScores();
