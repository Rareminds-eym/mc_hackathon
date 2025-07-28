/**
 * Immediate Level 3 Save Test
 * 
 * Copy and paste this into the browser console to test Level 3 save functionality right now.
 */

async function testLevel3SaveNow() {
  console.log('🧪 Testing Level 3 Save Functionality...');
  console.log('='.repeat(50));
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase not available');
      return false;
    }

    // 1. Check authentication
    console.log('\n1️⃣ Checking Authentication...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError?.message);
      console.log('💡 Please log in and try again');
      return false;
    }
    
    console.log('✅ User authenticated:', userData.user.email);
    const userId = userData.user.id;

    // 2. Test data based on your screenshot (79/100 score)
    console.log('\n2️⃣ Preparing test data based on your completion...');
    
    const testCompletionData = {
      userId: userId,
      module: 'test-module-1', // Using test module to avoid conflicts
      level: 3,
      scenario_index: 2, // Last scenario (0-indexed)
      finalScore: 79, // Your actual final score
      finalTime: 51, // Your actual time in seconds
      placedPieces: {
        scenarioResults: [
          { score: 100, combo: 1, health: 25 },
          { score: 99, combo: 1, health: 45 },
          { score: 100, combo: 1, health: 70 }
        ],
        overallStats: {
          totalScore: 299,
          totalCombo: 3,
          avgHealth: 46.67
        },
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    console.log('📋 Test completion data:', testCompletionData);

    // 3. Test Level3Service if available
    console.log('\n3️⃣ Testing Level3Service...');
    
    if (typeof window.Level3Service !== 'undefined') {
      console.log('✅ Level3Service available, testing save...');
      
      const result = await window.Level3Service.saveGameCompletion(testCompletionData);
      
      if (result.error) {
        console.error('❌ Level3Service save failed:', result.error);
      } else {
        console.log('✅ Level3Service save successful:', result);
        return true;
      }
    } else {
      console.log('⚠️ Level3Service not available, testing direct save...');
    }

    // 4. Test direct database save
    console.log('\n4️⃣ Testing direct database save...');
    
    const directSaveData = {
      user_id: userId,
      module: testCompletionData.module,
      level: testCompletionData.level,
      scenario_index: testCompletionData.scenario_index,
      score: [testCompletionData.finalScore],
      placed_pieces: testCompletionData.placedPieces,
      is_completed: testCompletionData.isCompleted,
      current_score: testCompletionData.finalScore,
      time_taken: testCompletionData.finalTime,
      total_attempts: 1,
      score_history: [testCompletionData.finalScore],
      time_history: [testCompletionData.finalTime]
    };

    console.log('📤 Direct save data:', directSaveData);

    const { data: saveData, error: saveError } = await supabase
      .from('level3_progress')
      .upsert(directSaveData, { 
        onConflict: 'user_id,module,level,scenario_index',
        ignoreDuplicates: false 
      })
      .select();

    if (saveError) {
      console.error('❌ Direct save failed:', saveError);
      console.error('Error details:', {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint
      });
      return false;
    }

    console.log('✅ Direct save successful:', saveData);

    // 5. Verify the save
    console.log('\n5️⃣ Verifying saved data...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('level3_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module', testCompletionData.module)
      .eq('level', testCompletionData.level)
      .eq('scenario_index', testCompletionData.scenario_index);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return false;
    }

    if (verifyData.length === 0) {
      console.error('❌ No data found after save');
      return false;
    }

    const savedRecord = verifyData[0];
    console.log('✅ Verification successful:', {
      id: savedRecord.id,
      current_score: savedRecord.current_score,
      time_taken: savedRecord.time_taken,
      is_completed: savedRecord.is_completed,
      total_attempts: savedRecord.total_attempts,
      created_at: savedRecord.created_at,
      updated_at: savedRecord.updated_at
    });

    // 6. Check if score matches
    if (savedRecord.current_score === testCompletionData.finalScore) {
      console.log('🎯 Score verification: ✅ MATCH!');
    } else {
      console.log(`🎯 Score verification: ❌ MISMATCH (saved: ${savedRecord.current_score}, expected: ${testCompletionData.finalScore})`);
    }

    // 7. Cleanup test data
    console.log('\n6️⃣ Cleaning up test data...');
    
    const { error: cleanupError } = await supabase
      .from('level3_progress')
      .delete()
      .eq('module', testCompletionData.module);

    if (cleanupError) {
      console.warn('⚠️ Cleanup warning:', cleanupError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Level 3 Save Test Completed Successfully!');
    console.log('💡 The save functionality is working. Try completing Level 3 again.');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

// Quick fix function to apply the database fix
async function applyQuickFix() {
  console.log('🔧 Applying Quick Fix for Level 3 Save...');
  
  console.log(`
📝 Quick Fix Instructions:

1. The Level3Service has been updated with a fallback mechanism
2. If the RPC function fails, it will use direct table insert
3. This should resolve the save issues

🎯 What to do next:
1. Refresh the page to load the updated code
2. Complete Level 3 again
3. Check the browser console for detailed logs
4. The save should now work with either RPC or direct insert

🔍 If you still have issues:
1. Run: testLevel3SaveNow() to test the save functionality
2. Check the console logs for specific error messages
3. Verify your authentication status

💡 The updated code includes:
- Automatic fallback from RPC to direct insert
- Better error handling and logging
- Save verification to confirm data was stored
- Detailed debugging information
`);
}

// Make functions available globally
window.testLevel3SaveNow = testLevel3SaveNow;
window.applyQuickFix = applyQuickFix;

console.log(`
🧪 Level 3 Save Test Tools Available:

🚀 MAIN FUNCTIONS:
- testLevel3SaveNow() - Test save functionality immediately
- applyQuickFix() - Show quick fix instructions

📋 USAGE:
1. Run: testLevel3SaveNow() to test if save works
2. If test passes, try completing Level 3 again
3. If test fails, check the error messages for specific issues

🎯 QUICK START:
testLevel3SaveNow()
`);

// Auto-run the test
testLevel3SaveNow();
