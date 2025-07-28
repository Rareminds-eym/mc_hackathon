/**
 * Complete Level 3 Database Fix and Test Script
 * 
 * This script will:
 * 1. Set up the database table if missing
 * 2. Test the save functionality
 * 3. Monitor the actual completion process
 * 4. Provide step-by-step instructions
 */

// Step 1: Database Setup SQL
const DATABASE_SETUP_SQL = `
-- Level 3 Progress Table Setup
CREATE TABLE IF NOT EXISTS level3_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 3,
  scenario_index INTEGER NOT NULL DEFAULT 0,
  score INTEGER[] NOT NULL DEFAULT '{}',
  placed_pieces JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  current_score INTEGER DEFAULT 0,
  time_taken INTEGER,
  total_attempts INTEGER DEFAULT 0,
  score_history INTEGER[] DEFAULT '{}',
  time_history INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module, level, scenario_index)
);

-- Enable Row Level Security
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own progress" ON level3_progress;
CREATE POLICY "Users can view own progress" ON level3_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON level3_progress;
CREATE POLICY "Users can insert own progress" ON level3_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON level3_progress;
CREATE POLICY "Users can update own progress" ON level3_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_id ON level3_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_progress_module_level_scenario ON level3_progress(module, level, scenario_index);
CREATE INDEX IF NOT EXISTS idx_level3_progress_is_completed ON level3_progress(is_completed);
`;

async function setupDatabase() {
  console.log('🔧 Setting up Level 3 database...');
  
  console.log('\n📝 SQL to run in Supabase SQL Editor:');
  console.log('='.repeat(60));
  console.log(DATABASE_SETUP_SQL);
  console.log('='.repeat(60));
  
  console.log('\n💡 Instructions:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to your Supabase dashboard');
  console.log('3. Navigate to SQL Editor');
  console.log('4. Paste and run the SQL');
  console.log('5. Come back and run: testDatabaseSetup()');
}

async function testDatabaseSetup() {
  console.log('🧪 Testing Level 3 Database Setup...');
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

    // 2. Test table access
    console.log('\n2️⃣ Testing table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table not accessible:', tableError.message);
      console.log('💡 Run setupDatabase() first');
      return false;
    }
    
    console.log('✅ Table accessible');

    // 3. Test save with your actual completion data (83/100 score)
    console.log('\n3️⃣ Testing save with your completion data...');
    
    const testSaveData = {
      user_id: userId,
      module: '1',
      level: 3,
      scenario_index: 2, // Last scenario
      score: [83], // Your final score
      placed_pieces: {
        scenarioResults: [
          { score: 100, combo: 1, health: 55 },
          { score: 99, combo: 2, health: 90 },
          { score: 100, combo: 1, health: 90 }
        ],
        finalStats: {
          totalScore: 299,
          finalScore: 83,
          totalTime: 32
        },
        timestamp: new Date().toISOString()
      },
      is_completed: true,
      current_score: 83,
      time_taken: 32,
      total_attempts: 1,
      score_history: [83],
      time_history: [32]
    };

    console.log('📤 Saving test data:', testSaveData);

    const { data: saveResult, error: saveError } = await supabase
      .from('level3_progress')
      .upsert(testSaveData, { 
        onConflict: 'user_id,module,level,scenario_index',
        ignoreDuplicates: false 
      })
      .select();

    if (saveError) {
      console.error('❌ Save failed:', saveError);
      console.error('Error details:', {
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint
      });
      return false;
    }

    console.log('✅ Save successful!', saveResult);

    // 4. Verify the save
    console.log('\n4️⃣ Verifying saved data...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('level3_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module', '1')
      .eq('level', 3)
      .eq('scenario_index', 2);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return false;
    }

    if (verifyData.length === 0) {
      console.error('❌ No data found after save');
      return false;
    }

    const savedRecord = verifyData[0];
    console.log('✅ Data verified successfully:', {
      id: savedRecord.id,
      current_score: savedRecord.current_score,
      time_taken: savedRecord.time_taken,
      is_completed: savedRecord.is_completed,
      created_at: savedRecord.created_at
    });

    console.log('\n🎉 Database setup and test completed successfully!');
    console.log('💡 Your Level 3 completion should now save properly');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Monitor the actual completion process
function monitorLevel3Completion() {
  console.log('🔍 Monitoring Level 3 completion process...');
  
  // Override console.log to capture Level 3 related logs
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    const message = args.join(' ');
    if (message.includes('💾 Save result:') || 
        message.includes('Game completion') || 
        message.includes('Level3Service') ||
        message.includes('saveGameCompletion')) {
      originalLog('🔍 MONITOR:', ...args);
    }
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    const message = args.join(' ');
    if (message.includes('Level3') || 
        message.includes('saveGameCompletion') ||
        message.includes('Database')) {
      originalError('🔍 MONITOR ERROR:', ...args);
    }
  };
  
  console.log('✅ Monitoring active - complete Level 3 to see detailed logs');
}

// Test the Level3Service directly
async function testLevel3Service() {
  console.log('🧪 Testing Level3Service directly...');
  
  try {
    if (typeof window.Level3Service === 'undefined') {
      console.error('❌ Level3Service not available');
      console.log('💡 Make sure you\'re on the Level 3 page');
      return false;
    }

    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    const testData = {
      userId: userData.user.id,
      module: '1',
      level: 3,
      scenario_index: 2,
      finalScore: 83,
      finalTime: 32,
      placedPieces: {
        scenarioResults: [
          { score: 100, combo: 1, health: 55 },
          { score: 99, combo: 2, health: 90 },
          { score: 100, combo: 1, health: 90 }
        ],
        timestamp: new Date().toISOString()
      },
      isCompleted: true
    };

    console.log('📤 Testing Level3Service with data:', testData);

    const result = await window.Level3Service.saveGameCompletion(testData);

    if (result.error) {
      console.error('❌ Level3Service failed:', result.error);
      return false;
    }

    console.log('✅ Level3Service successful:', result);
    return true;

  } catch (error) {
    console.error('💥 Level3Service test failed:', error);
    return false;
  }
}

// Complete fix process
async function completeLevel3Fix() {
  console.log('🚀 Starting Complete Level 3 Fix Process...');
  console.log('='.repeat(60));
  
  console.log('\n📋 Fix Process:');
  console.log('1. setupDatabase() - Show SQL to run in Supabase');
  console.log('2. testDatabaseSetup() - Test if database works');
  console.log('3. testLevel3Service() - Test the service directly');
  console.log('4. monitorLevel3Completion() - Monitor actual completion');
  
  console.log('\n🎯 Quick Start:');
  console.log('1. Run: setupDatabase()');
  console.log('2. Copy SQL and run in Supabase SQL Editor');
  console.log('3. Run: testDatabaseSetup()');
  console.log('4. If test passes, complete Level 3 again');
  
  // Auto-run database setup
  setupDatabase();
}

// Make functions globally available
window.setupDatabase = setupDatabase;
window.testDatabaseSetup = testDatabaseSetup;
window.testLevel3Service = testLevel3Service;
window.monitorLevel3Completion = monitorLevel3Completion;
window.completeLevel3Fix = completeLevel3Fix;

console.log(`
🔧 Complete Level 3 Fix Tools Available:

🚀 MAIN FUNCTIONS:
- setupDatabase() - Show SQL to create database table
- testDatabaseSetup() - Test if database setup works
- testLevel3Service() - Test the service directly
- monitorLevel3Completion() - Monitor completion process

📋 STEP-BY-STEP FIX:
1. setupDatabase() - Copy SQL and run in Supabase
2. testDatabaseSetup() - Verify setup works
3. Complete Level 3 again - Should now save properly

🎯 QUICK START:
completeLevel3Fix()
`);

// Auto-run the complete fix
completeLevel3Fix();
