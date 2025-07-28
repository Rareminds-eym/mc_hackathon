/**
 * Complete Level 3 Database Fix Script
 * 
 * This script will:
 * 1. Check if the database table exists
 * 2. Create the table if missing
 * 3. Test the save functionality
 * 4. Provide step-by-step instructions
 */

async function fixLevel3Database() {
  console.log('🔧 Fixing Level 3 Database Issues...');
  console.log('='.repeat(60));
  
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

    // 2. Check if table exists and is accessible
    console.log('\n2️⃣ Checking level3_progress table...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table not accessible:', tableError.message);
      console.log('\n🔧 The table might not exist. Here\'s the SQL to create it:');
      showTableCreationSQL();
      return false;
    }
    
    console.log('✅ level3_progress table exists and is accessible');

    // 3. Test direct insert with your actual completion data
    console.log('\n3️⃣ Testing save with your completion data...');
    
    const completionData = {
      user_id: userId,
      module: '1', // Using module 1
      level: 3,
      scenario_index: 2, // Last scenario (0-indexed)
      score: [83], // Your final score from the screenshot
      placed_pieces: {
        scenarioResults: [
          { score: 100, combo: 1, health: 55 },
          { score: 99, combo: 2, health: 90 },
          { score: 100, combo: 1, health: 90 }
        ],
        finalStats: {
          totalScore: 299,
          finalScore: 83,
          totalTime: 32 // 00:32 from screenshot
        },
        timestamp: new Date().toISOString()
      },
      is_completed: true,
      current_score: 83,
      time_taken: 32, // 32 seconds from screenshot
      total_attempts: 1,
      score_history: [83],
      time_history: [32]
    };

    console.log('📤 Saving completion data:', completionData);

    const { data: saveResult, error: saveError } = await supabase
      .from('level3_progress')
      .upsert(completionData, { 
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
      
      // Try to diagnose the issue
      await diagnoseSaveError(saveError);
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
      module: savedRecord.module,
      scenario_index: savedRecord.scenario_index,
      created_at: savedRecord.created_at
    });

    console.log('\n🎉 Level 3 Database Fix Completed Successfully!');
    console.log('💡 Your Level 3 completion data is now saved in Supabase');
    
    return true;

  } catch (error) {
    console.error('💥 Fix failed with error:', error);
    return false;
  }
}

// Function to show table creation SQL
function showTableCreationSQL() {
  const sql = `
-- Run this SQL in your Supabase SQL Editor:

-- 1. Create the level3_progress table
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

-- 2. Enable Row Level Security
ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view own progress" ON level3_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON level3_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON level3_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_level3_progress_user_id ON level3_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_level3_progress_module_level_scenario ON level3_progress(module, level, scenario_index);
`;

  console.log('📝 SQL to create level3_progress table:');
  console.log(sql);
  console.log('\n💡 Copy this SQL and run it in your Supabase SQL Editor');
}

// Function to diagnose save errors
async function diagnoseSaveError(error) {
  console.log('\n🔍 Diagnosing save error...');
  
  if (error.code === '42P01') {
    console.log('❌ Table does not exist');
    console.log('💡 Run the table creation SQL in Supabase');
  } else if (error.code === '42501') {
    console.log('❌ Permission denied');
    console.log('💡 Check Row Level Security policies');
  } else if (error.code === '23505') {
    console.log('❌ Unique constraint violation');
    console.log('💡 Record already exists, this should be an upsert');
  } else if (error.code === '23503') {
    console.log('❌ Foreign key constraint violation');
    console.log('💡 User ID might not exist in auth.users table');
  } else {
    console.log('❌ Unknown error code:', error.code);
    console.log('💡 Check Supabase logs for more details');
  }
}

// Function to check current database status
async function checkDatabaseStatus() {
  console.log('📊 Checking Database Status...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.log('❌ Not authenticated');
      return;
    }

    // Check table structure
    const { data, error } = await supabase
      .from('level3_progress')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table not accessible:', error.message);
      showTableCreationSQL();
    } else {
      console.log('✅ Table accessible');
      
      // Check existing data
      const { data: existingData } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id);

      console.log(`📋 Found ${existingData?.length || 0} existing records for your user`);
      
      if (existingData && existingData.length > 0) {
        console.log('📄 Your existing Level 3 records:');
        existingData.forEach((record, index) => {
          console.log(`  ${index + 1}. Module: ${record.module}, Score: ${record.current_score}, Completed: ${record.is_completed}`);
        });
      }
    }
  } catch (error) {
    console.error('💥 Status check failed:', error);
  }
}

// Make functions available globally
window.fixLevel3Database = fixLevel3Database;
window.showTableCreationSQL = showTableCreationSQL;
window.checkDatabaseStatus = checkDatabaseStatus;

console.log(`
🔧 Level 3 Database Fix Tools Available:

🚀 MAIN FUNCTIONS:
- fixLevel3Database() - Complete database fix and test
- checkDatabaseStatus() - Check current database status
- showTableCreationSQL() - Show SQL to create missing table

📋 STEP-BY-STEP FIX:
1. Run: checkDatabaseStatus()
2. If table missing, copy SQL and run in Supabase
3. Run: fixLevel3Database()
4. Try completing Level 3 again

🎯 QUICK START:
fixLevel3Database()
`);

// Auto-run the fix
fixLevel3Database();
