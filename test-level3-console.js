/**
 * Level 3 Database Test Script
 * 
 * Copy and paste this into the browser console to test Level 3 database functionality.
 * Make sure you're logged in to the application first.
 */

// Test Level 3 Database Functionality
async function testLevel3Database() {
  console.log('🧪 Starting Level 3 Database Tests...');
  
  try {
    // Import required modules (assuming they're available globally)
    const { supabase } = window;
    const { Level3Service } = window;
    
    if (!supabase) {
      console.error('❌ Supabase not available. Make sure you\'re on the application page.');
      return false;
    }
    
    if (!Level3Service) {
      console.error('❌ Level3Service not available. Make sure you\'re on the Level 3 page.');
      return false;
    }

    // Enable debug mode
    Level3Service.enableDebugMode();
    Level3Service.clearDebounceCache();

    // Test 1: Authentication
    console.log('\n1️⃣ Testing Authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('❌ Authentication failed:', authError);
      return false;
    }
    
    console.log('✅ User authenticated:', authData.user.email);

    // Test 2: Table Access
    console.log('\n2️⃣ Testing Table Access...');
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError);
      return false;
    }
    
    console.log('✅ Table accessible');

    // Test 3: RPC Function Direct Call
    console.log('\n3️⃣ Testing RPC Function...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('upsert_level3_progress_with_history', {
      p_user_id: authData.user.id,
      p_module: 'console-test',
      p_level: 3,
      p_scenario_index: 0,
      p_score: 100,
      p_placed_pieces: { test: true, timestamp: new Date().toISOString() },
      p_is_completed: true,
      p_time_taken: 60
    });
    
    if (rpcError) {
      console.error('❌ RPC function failed:', rpcError);
      return false;
    }
    
    console.log('✅ RPC function successful:', rpcData);

    // Test 4: Level3Service.saveGameCompletion
    console.log('\n4️⃣ Testing Level3Service...');
    const testData = {
      userId: authData.user.id,
      module: 'console-service-test',
      level: 3,
      scenario_index: 1,
      finalScore: 150,
      finalTime: 90,
      placedPieces: { 
        test: true,
        scenario: 1,
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    const serviceResult = await Level3Service.saveGameCompletion(testData);
    
    if (serviceResult.error) {
      console.error('❌ Service failed:', serviceResult.error);
      return false;
    }
    
    console.log('✅ Service successful:', serviceResult);

    // Test 5: Data Verification
    console.log('\n5️⃣ Verifying Saved Data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('level3_progress')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('module', 'console-service-test')
      .eq('scenario_index', 1);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return false;
    }
    
    console.log('✅ Data verified:', verifyData);

    // Test 6: Game Completion Simulation
    console.log('\n6️⃣ Testing Game Completion Simulation...');
    const gameCompletionData = {
      userId: authData.user.id,
      module: '1', // Module 1
      level: 3,
      scenario_index: 2, // Scenario 3
      finalScore: 200,
      finalTime: 120,
      placedPieces: {
        violations: ['v1', 'v2'],
        actions: ['a1', 'a2'],
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    const gameResult = await Level3Service.saveGameCompletion(gameCompletionData);
    
    if (gameResult.error) {
      console.error('❌ Game completion failed:', gameResult.error);
      return false;
    }
    
    console.log('✅ Game completion successful:', gameResult);

    console.log('\n🎉 All Level 3 Database Tests Passed!');
    
    // Disable debug mode
    Level3Service.disableDebugMode();
    
    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

// Test specific save functionality
async function testSaveGameCompletion(moduleId = '1', scenarioIndex = 0, score = 100) {
  console.log('🎮 Testing Save Game Completion...');
  
  try {
    const { Level3Service } = window;
    
    if (!Level3Service) {
      console.error('❌ Level3Service not available');
      return false;
    }

    Level3Service.enableDebugMode();
    Level3Service.clearDebounceCache();

    const testData = {
      userId: 'will-be-overridden',
      module: moduleId,
      level: 3,
      scenario_index: scenarioIndex,
      finalScore: score,
      finalTime: 60,
      placedPieces: {
        violations: ['test-violation'],
        actions: ['test-action'],
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    console.log('📤 Sending data:', testData);

    const result = await Level3Service.saveGameCompletion(testData);
    
    if (result.error) {
      console.error('❌ Save failed:', result.error);
      return false;
    }
    
    console.log('✅ Save successful:', result);
    
    Level3Service.disableDebugMode();
    return true;

  } catch (error) {
    console.error('💥 Save test failed:', error);
    return false;
  }
}

// Check database status
async function checkLevel3DatabaseStatus() {
  console.log('🔍 Checking Level 3 Database Status...');
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase not available');
      return;
    }

    // Check authentication
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('👤 Auth Status:', authError ? '❌ Failed' : '✅ OK', authData?.user?.email || 'No user');

    // Check table
    const { error: tableError } = await supabase.from('level3_progress').select('count', { count: 'exact', head: true });
    console.log('📊 Table Status:', tableError ? '❌ Failed' : '✅ OK');

    // Check functions
    const { error: funcError } = await supabase.rpc('get_level3_user_analytics', { p_user_id: authData?.user?.id || 'test', p_module: null });
    console.log('⚙️ Functions Status:', funcError ? '❌ Failed' : '✅ OK');

    if (tableError) console.error('Table Error:', tableError);
    if (funcError) console.error('Function Error:', funcError);

  } catch (error) {
    console.error('💥 Status check failed:', error);
  }
}

// Make functions available globally
window.testLevel3Database = testLevel3Database;
window.testSaveGameCompletion = testSaveGameCompletion;
window.checkLevel3DatabaseStatus = checkLevel3DatabaseStatus;

console.log(`
🧪 Level 3 Database Test Functions Available:

1. testLevel3Database() - Run all tests
2. testSaveGameCompletion(moduleId, scenarioIndex, score) - Test save functionality
3. checkLevel3DatabaseStatus() - Quick status check

Example usage:
- testLevel3Database()
- testSaveGameCompletion('1', 0, 150)
- checkLevel3DatabaseStatus()
`);
