/**
 * Debug script to identify Level 3 database issues
 */

import { supabase } from './src/lib/supabase';
import Level3Service from './src/components/l3/services/level3Service';

export async function debugLevel3Database() {
  console.log('🔍 Debugging Level 3 Database Issues...');
  
  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return false;
    }
    
    if (!authData.user) {
      console.error('❌ User not authenticated');
      return false;
    }
    
    console.log('✅ User authenticated:', {
      id: authData.user.id,
      email: authData.user.email
    });

    // Step 2: Check if table exists
    console.log('2. Checking if level3_progress table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return false;
    }
    
    console.log('✅ Table exists and accessible');

    // Step 3: Check if RPC functions exist
    console.log('3. Testing RPC functions...');
    
    // Test upsert function
    console.log('3a. Testing upsert_level3_progress_with_history...');
    const { data: upsertData, error: upsertError } = await supabase.rpc('upsert_level3_progress_with_history', {
      p_user_id: authData.user.id,
      p_module: 'test',
      p_level: 3,
      p_scenario_index: 0,
      p_score: 100,
      p_placed_pieces: { test: true },
      p_is_completed: true,
      p_time_taken: 60
    });
    
    if (upsertError) {
      console.error('❌ Upsert function error:', upsertError);
      return false;
    }
    
    console.log('✅ Upsert function works:', upsertData);

    // Test get function
    console.log('3b. Testing get_level3_best_performance...');
    const { data: getData, error: getError } = await supabase.rpc('get_level3_best_performance', {
      p_user_id: authData.user.id,
      p_module: 'test',
      p_level: 3,
      p_scenario_index: 0
    });
    
    if (getError) {
      console.error('❌ Get function error:', getError);
      return false;
    }
    
    console.log('✅ Get function works:', getData);

    // Step 4: Test Level3Service directly
    console.log('4. Testing Level3Service...');
    const testData = {
      userId: authData.user.id,
      module: 'test-module',
      level: 3,
      scenario_index: 1,
      finalScore: 150,
      finalTime: 90,
      placedPieces: { test: 'service-test' },
      isCompleted: true
    };

    const serviceResult = await Level3Service.saveGameCompletion(testData);
    
    if (serviceResult.error) {
      console.error('❌ Service error:', serviceResult.error);
      return false;
    }
    
    console.log('✅ Service works:', serviceResult);

    // Step 5: Check data was actually saved
    console.log('5. Verifying data was saved...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('level3_progress')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('module', 'test-module')
      .eq('scenario_index', 1);
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
      return false;
    }
    
    console.log('✅ Data saved successfully:', verifyData);

    console.log('🎉 All Level 3 database tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Debug failed with error:', error);
    return false;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).debugLevel3Database = debugLevel3Database;
}
