/**
 * Test Best Scores Functionality
 * 
 * This script tests the new best scores feature for Level 3
 */

async function testBestScores() {
  console.log('🧪 Testing Best Scores Functionality...');
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
    const moduleId = '1'; // Test with module 1

    // Test 1: Get level summary
    console.log('\n1️⃣ Testing Level Summary...');
    try {
      const summaryResult = await Level3Service.getLevelSummary(moduleId);
      if (summaryResult.error) {
        console.error('❌ Level summary error:', summaryResult.error);
      } else {
        console.log('✅ Level summary:', summaryResult.data);
      }
    } catch (error) {
      console.error('❌ Level summary exception:', error);
    }

    // Test 2: Get best scores for each scenario
    console.log('\n2️⃣ Testing Individual Best Scores...');
    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        console.log(`\n📊 Scenario ${scenarioIndex + 1}:`);
        const result = await Level3Service.getBestScore(moduleId, scenarioIndex);
        
        if (result.error) {
          console.error(`❌ Error for scenario ${scenarioIndex}:`, result.error);
        } else if (result.data) {
          console.log(`✅ Best score data:`, {
            current_score: result.data.current_score,
            time_taken: result.data.time_taken,
            is_completed: result.data.is_completed,
            total_attempts: result.data.total_attempts,
            placed_pieces: result.data.placed_pieces ? 'Available' : 'None'
          });
          
          // Try to extract scenario-specific data from placed_pieces
          if (result.data.placed_pieces && result.data.placed_pieces.scenarioResults) {
            const scenarioResult = result.data.placed_pieces.scenarioResults.find(sr => sr.scenarioIndex === scenarioIndex);
            if (scenarioResult) {
              console.log(`📈 Scenario-specific data:`, {
                score: scenarioResult.score,
                combo: scenarioResult.combo,
                health: scenarioResult.health
              });
            } else {
              console.log('⚠️ No scenario-specific data found in placed_pieces');
            }
          }
        } else {
          console.log(`ℹ️ No data found for scenario ${scenarioIndex}`);
        }
      } catch (error) {
        console.error(`❌ Exception for scenario ${scenarioIndex}:`, error);
      }
    }

    // Test 3: Simulate the best scores fetching logic from the component
    console.log('\n3️⃣ Testing Component Logic...');
    
    const bestScores = [];
    
    // Try level summary first
    try {
      const summaryResult = await Level3Service.getLevelSummary(moduleId);
      if (summaryResult.data && summaryResult.data.length > 0) {
        console.log('✅ Using level summary data');
        
        for (let i = 0; i < 3; i++) {
          const summary = summaryResult.data[i];
          if (summary) {
            bestScores.push({
              scenarioIndex: i,
              score: summary.best_score || 0,
              time: 0
            });
          } else {
            bestScores.push({
              scenarioIndex: i,
              score: 0,
              time: 0
            });
          }
        }
      } else {
        console.log('⚠️ Level summary empty, using individual scores');
        
        // Fallback to individual scores
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
                combo: 0,
                health: 0,
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
      }
    } catch (error) {
      console.error('❌ Component logic failed:', error);
      return false;
    }

    console.log('\n📊 Final Best Scores Result:');
    bestScores.forEach((score, index) => {
      const timeFormatted = score.time > 0 ? `${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')}` : '--';
      console.log(`Scenario ${index + 1}: Score: ${score.score}, Time: ${timeFormatted}`);
    });

    // Test 4: Check if any scores exist
    const hasAnyScores = bestScores.some(score => score.score > 0);
    if (hasAnyScores) {
      console.log('\n✅ Best scores functionality working - found existing scores');
    } else {
      console.log('\n⚠️ No existing scores found - this is normal for new users');
      console.log('💡 Complete Level 3 to see best scores in action');
    }

    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Test the database setup for best scores
async function testDatabaseForBestScores() {
  console.log('🔧 Testing Database Setup for Best Scores...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    // Check if level3_progress table exists
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table not accessible:', tableError.message);
      console.log('💡 Run the database setup script first');
      return false;
    }
    
    console.log('✅ level3_progress table accessible');

    // Check if RPC functions exist
    try {
      const { error: rpcError } = await supabase.rpc('get_level3_level_summary', {
        p_user_id: userData.user.id,
        p_module: '1',
        p_level: 3
      });
      
      if (rpcError) {
        console.error('❌ RPC function error:', rpcError.message);
        console.log('💡 Database functions might be missing');
        return false;
      }
      
      console.log('✅ RPC functions working');
    } catch (error) {
      console.error('❌ RPC function test failed:', error);
      return false;
    }

    console.log('\n🎉 Database setup looks good for best scores!');
    return true;

  } catch (error) {
    console.error('💥 Database test failed:', error);
    return false;
  }
}

// Make functions available
window.testBestScores = testBestScores;
window.testDatabaseForBestScores = testDatabaseForBestScores;

console.log(`
🧪 Best Scores Test Tools:

🚀 FUNCTIONS:
- testBestScores() - Test the best scores functionality
- testDatabaseForBestScores() - Test database setup

🎯 QUICK START:
testBestScores()
`);

// Auto-run the test
testBestScores();
