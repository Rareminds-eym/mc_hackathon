/**
 * Fix SQL Function for Best Scores
 * 
 * This script provides the corrected SQL to fix the ambiguous column reference error
 */

function showSQLFix() {
  console.log('🔧 SQL Fix for Best Scores Function');
  console.log('='.repeat(60));
  
  const fixedSQL = `
-- Fixed get_level3_best_performance function
-- This fixes the ambiguous column reference error

DROP FUNCTION IF EXISTS get_level3_best_performance(UUID, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION get_level3_best_performance(
    p_user_id UUID,
    p_module TEXT,
    p_level INTEGER,
    p_scenario_index INTEGER
)
RETURNS TABLE(
    best_score INTEGER,
    best_time INTEGER,
    total_attempts INTEGER,
    is_completed BOOLEAN,
    placed_pieces JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lp.current_score as best_score,
        lp.time_taken as best_time,
        lp.total_attempts,
        lp.is_completed,
        lp.placed_pieces
    FROM level3_progress lp
    WHERE lp.user_id = p_user_id
      AND lp.module = p_module
      AND lp.level = p_level
      AND lp.scenario_index = p_scenario_index;
END;
$$ LANGUAGE plpgsql;
`;

  console.log('📝 Copy and paste this SQL into your Supabase SQL Editor:');
  console.log(fixedSQL);
  
  console.log('\n💡 What this fixes:');
  console.log('- Adds table alias "lp" to all column references');
  console.log('- Eliminates the ambiguous "total_attempts" column reference');
  console.log('- Makes the function more explicit and reliable');
  
  console.log('\n🎯 Steps to apply the fix:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Paste the SQL above');
  console.log('5. Click "Run"');
  console.log('6. Test with: testSQLFix()');
}

async function testSQLFix() {
  console.log('🧪 Testing SQL Fix...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    console.log('✅ User authenticated, testing RPC function...');

    // Test the fixed RPC function
    const { data, error } = await supabase.rpc('get_level3_best_performance', {
      p_user_id: userData.user.id,
      p_module: '1',
      p_level: 3,
      p_scenario_index: 0
    });

    if (error) {
      console.error('❌ RPC function still has errors:', error);
      console.log('💡 Make sure you ran the SQL fix in Supabase SQL Editor');
      return false;
    }

    console.log('✅ RPC function works!');
    
    if (data && data.length > 0) {
      console.log('📊 Found data:', {
        best_score: data[0].best_score,
        best_time: data[0].best_time,
        total_attempts: data[0].total_attempts,
        is_completed: data[0].is_completed
      });
    } else {
      console.log('ℹ️ No data found for scenario 1 (this is normal for new users)');
    }

    // Test all scenarios
    console.log('\n🔍 Testing all scenarios...');
    for (let i = 0; i < 3; i++) {
      try {
        const { data: scenarioData, error: scenarioError } = await supabase.rpc('get_level3_best_performance', {
          p_user_id: userData.user.id,
          p_module: '1',
          p_level: 3,
          p_scenario_index: i
        });

        if (scenarioError) {
          console.error(`❌ Scenario ${i + 1} error:`, scenarioError);
        } else if (scenarioData && scenarioData.length > 0) {
          const timeFormatted = scenarioData[0].best_time > 0 ? 
            `${Math.floor(scenarioData[0].best_time / 60)}:${(scenarioData[0].best_time % 60).toString().padStart(2, '0')}` : 
            '--';
          console.log(`✅ Scenario ${i + 1}: Score ${scenarioData[0].best_score}, Time ${timeFormatted}`);
        } else {
          console.log(`ℹ️ Scenario ${i + 1}: No data`);
        }
      } catch (error) {
        console.error(`❌ Scenario ${i + 1} exception:`, error);
      }
    }

    console.log('\n🎉 SQL fix test completed!');
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Alternative: Test Level3Service with the fix
async function testLevel3ServiceAfterFix() {
  console.log('🎮 Testing Level3Service after SQL fix...');
  
  try {
    const { Level3Service } = window;
    
    if (!Level3Service) {
      console.error('❌ Level3Service not available');
      return false;
    }

    console.log('✅ Level3Service available, testing getBestScore...');

    for (let scenarioIndex = 0; scenarioIndex < 3; scenarioIndex++) {
      try {
        console.log(`\n📊 Testing Scenario ${scenarioIndex + 1}:`);
        const result = await Level3Service.getBestScore('1', scenarioIndex);
        
        if (result.error) {
          console.error(`❌ Error:`, result.error);
        } else if (result.data) {
          const timeFormatted = result.data.time_taken > 0 ? 
            `${Math.floor(result.data.time_taken / 60)}:${(result.data.time_taken % 60).toString().padStart(2, '0')}` : 
            '--';
          console.log(`✅ Success: Score ${result.data.current_score}, Time ${timeFormatted}`);
        } else {
          console.log(`ℹ️ No data (normal for new scenarios)`);
        }
      } catch (error) {
        console.error(`❌ Exception:`, error);
      }
    }

    console.log('\n🎉 Level3Service test completed!');
    return true;

  } catch (error) {
    console.error('💥 Level3Service test failed:', error);
    return false;
  }
}

// Make functions available
window.showSQLFix = showSQLFix;
window.testSQLFix = testSQLFix;
window.testLevel3ServiceAfterFix = testLevel3ServiceAfterFix;

console.log(`
🔧 SQL Fix Tools:

🚀 FUNCTIONS:
- showSQLFix() - Show the corrected SQL to run in Supabase
- testSQLFix() - Test if the SQL fix worked
- testLevel3ServiceAfterFix() - Test Level3Service after fix

📋 STEP-BY-STEP FIX:
1. showSQLFix() - Copy the SQL
2. Run SQL in Supabase SQL Editor
3. testSQLFix() - Verify it works
4. Complete Level 3 to see best scores

🎯 QUICK START:
showSQLFix()
`);

// Auto-show the SQL fix
showSQLFix();
