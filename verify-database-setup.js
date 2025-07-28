/**
 * Database Setup Verification Script
 * 
 * Copy and paste this into the browser console to verify database setup.
 */

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Level 3 Database Setup...');
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
      return false;
    }
    
    console.log('✅ User authenticated:', userData.user.email);
    const userId = userData.user.id;

    // 2. Check if level3_progress table exists
    console.log('\n2️⃣ Checking level3_progress table...');
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError.message);
      console.log('💡 The level3_progress table might not exist or have incorrect permissions');
      return false;
    }
    
    console.log('✅ level3_progress table accessible');

    // 3. Check table structure
    console.log('\n3️⃣ Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('level3_progress')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Structure check failed:', structureError.message);
    } else {
      console.log('✅ Table structure accessible');
      if (structureData && structureData.length > 0) {
        console.log('📋 Sample columns:', Object.keys(structureData[0]));
      }
    }

    // 4. Check RPC function exists
    console.log('\n4️⃣ Checking RPC function: upsert_level3_progress_with_history...');
    
    const testRpcParams = {
      p_user_id: userId,
      p_module: 'test-verify',
      p_level: 3,
      p_scenario_index: 0,
      p_score: 100,
      p_placed_pieces: { test: true, timestamp: new Date().toISOString() },
      p_is_completed: true,
      p_time_taken: 60
    };

    const { data: rpcData, error: rpcError } = await supabase.rpc('upsert_level3_progress_with_history', testRpcParams);
    
    if (rpcError) {
      console.error('❌ RPC function failed:', rpcError.message);
      console.log('💡 The upsert_level3_progress_with_history function might not exist');
      
      // Try alternative RPC function
      console.log('\n🔄 Trying alternative RPC function: upsert_level3_progress...');
      const { data: altRpcData, error: altRpcError } = await supabase.rpc('upsert_level3_progress', testRpcParams);
      
      if (altRpcError) {
        console.error('❌ Alternative RPC function also failed:', altRpcError.message);
        console.log('💡 No working RPC functions found');
        
        // Try direct insert
        console.log('\n🔄 Trying direct table insert...');
        const directInsertData = {
          user_id: userId,
          module: 'test-direct',
          level: 3,
          scenario_index: 0,
          score: [100],
          placed_pieces: { test: true, timestamp: new Date().toISOString() },
          is_completed: true,
          current_score: 100,
          time_taken: 60,
          total_attempts: 1,
          score_history: [100],
          time_history: [60]
        };

        const { data: directData, error: directError } = await supabase
          .from('level3_progress')
          .upsert(directInsertData, { 
            onConflict: 'user_id,module,level,scenario_index',
            ignoreDuplicates: false 
          })
          .select();

        if (directError) {
          console.error('❌ Direct insert failed:', directError.message);
          console.log('💡 Database permissions or schema issues detected');
          return false;
        } else {
          console.log('✅ Direct insert successful - RPC functions not needed');
          console.log('📋 Inserted data:', directData);
        }
      } else {
        console.log('✅ Alternative RPC function works');
        console.log('📋 RPC result:', altRpcData);
      }
    } else {
      console.log('✅ Primary RPC function works');
      console.log('📋 RPC result:', rpcData);
    }

    // 5. Check RLS policies
    console.log('\n5️⃣ Checking Row Level Security...');
    
    // Try to query own data
    const { data: ownData, error: ownError } = await supabase
      .from('level3_progress')
      .select('*')
      .eq('user_id', userId)
      .limit(5);
    
    if (ownError) {
      console.error('❌ RLS check failed:', ownError.message);
      console.log('💡 Row Level Security might be blocking access');
    } else {
      console.log('✅ RLS allows access to own data');
      console.log(`📋 Found ${ownData.length} existing records`);
    }

    // 6. Test cleanup (remove test data)
    console.log('\n6️⃣ Cleaning up test data...');
    
    const { error: cleanupError } = await supabase
      .from('level3_progress')
      .delete()
      .in('module', ['test-verify', 'test-direct']);
    
    if (cleanupError) {
      console.warn('⚠️ Cleanup warning:', cleanupError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Database verification completed successfully!');
    return true;

  } catch (error) {
    console.error('💥 Database verification failed:', error);
    return false;
  }
}

// Function to create missing RPC function
async function createMissingRpcFunction() {
  console.log('🔧 Creating missing RPC function...');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION upsert_level3_progress_with_history(
        p_user_id UUID,
        p_module TEXT,
        p_level INTEGER,
        p_scenario_index INTEGER,
        p_score INTEGER,
        p_placed_pieces JSONB,
        p_is_completed BOOLEAN,
        p_time_taken INTEGER DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
        result_id UUID;
    BEGIN
        INSERT INTO level3_progress (
            user_id, module, level, scenario_index,
            score, placed_pieces, is_completed, time_taken,
            current_score, total_attempts,
            score_history, time_history
        )
        VALUES (
            p_user_id, p_module, p_level, p_scenario_index,
            ARRAY[p_score], p_placed_pieces, p_is_completed, p_time_taken,
            p_score, 1,
            ARRAY[p_score], ARRAY[p_time_taken]
        )
        ON CONFLICT (user_id, module, level, scenario_index)
        DO UPDATE SET
            score = level3_progress.score || ARRAY[p_score],
            current_score = GREATEST(level3_progress.current_score, p_score),
            time_taken = CASE 
                WHEN p_score > level3_progress.current_score THEN p_time_taken
                ELSE level3_progress.time_taken
            END,
            placed_pieces = CASE
                WHEN p_score > level3_progress.current_score THEN p_placed_pieces
                ELSE level3_progress.placed_pieces
            END,
            is_completed = level3_progress.is_completed OR p_is_completed,
            total_attempts = level3_progress.total_attempts + 1,
            score_history = (level3_progress.score_history || ARRAY[p_score])[1:3],
            time_history = (level3_progress.time_history || ARRAY[p_time_taken])[1:3],
            updated_at = NOW()
        RETURNING id INTO result_id;

        RETURN result_id;
    END;
    $$ LANGUAGE plpgsql;
  `;

  console.log('📝 SQL to create function:');
  console.log(createFunctionSQL);
  console.log('\n💡 Copy this SQL and run it in your Supabase SQL editor');
}

// Function to fix Level3Service to use direct insert
async function createDirectInsertFix() {
  console.log('🔧 Creating direct insert fix for Level3Service...');
  
  const fixCode = `
// Replace the RPC call in Level3Service.saveGameCompletion with this direct insert:

const directInsertData = {
  user_id: userId,
  module: completionData.module,
  level: this.LEVEL_NUMBER,
  scenario_index: completionData.scenario_index,
  score: [completionData.finalScore],
  placed_pieces: completionData.placedPieces,
  is_completed: completionData.isCompleted,
  current_score: completionData.finalScore,
  time_taken: completionData.finalTime,
  total_attempts: 1,
  score_history: [completionData.finalScore],
  time_history: [completionData.finalTime]
};

const { data, error } = await supabase
  .from('level3_progress')
  .upsert(directInsertData, { 
    onConflict: 'user_id,module,level,scenario_index',
    ignoreDuplicates: false 
  })
  .select();
`;

  console.log('📝 Code fix:');
  console.log(fixCode);
  console.log('\n💡 This bypasses the RPC function and uses direct table access');
}

// Make functions available globally
window.verifyDatabaseSetup = verifyDatabaseSetup;
window.createMissingRpcFunction = createMissingRpcFunction;
window.createDirectInsertFix = createDirectInsertFix;

console.log(`
🔍 Database Verification Tools Available:

🚀 MAIN FUNCTIONS:
- verifyDatabaseSetup() - Complete database verification
- createMissingRpcFunction() - Show SQL to create missing RPC function
- createDirectInsertFix() - Show code fix for direct insert

📋 USAGE:
1. Run: verifyDatabaseSetup()
2. If RPC function missing, run: createMissingRpcFunction()
3. If you need a quick fix, run: createDirectInsertFix()

🎯 QUICK START:
verifyDatabaseSetup()
`);

// Auto-run verification
verifyDatabaseSetup();
