/**
 * Direct Database Setup Script
 * 
 * This script attempts to run the database setup directly through Supabase client
 */

async function runDatabaseSetup() {
  console.log('🔧 Running Level 3 Database Setup...');
  console.log('='.repeat(50));
  
  try {
    const { supabase } = window;
    
    if (!supabase) {
      console.error('❌ Supabase not available');
      return false;
    }

    // Check authentication first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError?.message);
      return false;
    }
    
    console.log('✅ User authenticated:', userData.user.email);

    // Try to create the table using SQL
    console.log('\n1️⃣ Creating level3_progress table...');
    
    const createTableSQL = `
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
    `;

    // Try to execute SQL directly
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.log('⚠️ Direct SQL execution not available, using manual setup...');
      showManualSetupInstructions();
      return false;
    }

    console.log('✅ Table created successfully');

    // Enable RLS
    console.log('\n2️⃣ Setting up Row Level Security...');
    
    const rlsSQL = `
      ALTER TABLE level3_progress ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view own progress" ON level3_progress;
      CREATE POLICY "Users can view own progress" ON level3_progress
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own progress" ON level3_progress;
      CREATE POLICY "Users can insert own progress" ON level3_progress
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own progress" ON level3_progress;
      CREATE POLICY "Users can update own progress" ON level3_progress
        FOR UPDATE USING (auth.uid() = user_id);
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    
    if (rlsError) {
      console.warn('⚠️ RLS setup failed, but table should still work:', rlsError.message);
    } else {
      console.log('✅ RLS policies created');
    }

    // Test the setup
    console.log('\n3️⃣ Testing the setup...');
    
    const testData = {
      user_id: userData.user.id,
      module: 'setup-test',
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

    const { data: testResult, error: testError } = await supabase
      .from('level3_progress')
      .upsert(testData, { 
        onConflict: 'user_id,module,level,scenario_index',
        ignoreDuplicates: false 
      })
      .select();

    if (testError) {
      console.error('❌ Test insert failed:', testError);
      showManualSetupInstructions();
      return false;
    }

    console.log('✅ Test insert successful:', testResult);

    // Clean up test data
    await supabase
      .from('level3_progress')
      .delete()
      .eq('module', 'setup-test');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('💡 Level 3 completion should now save properly');
    
    return true;

  } catch (error) {
    console.error('💥 Setup failed:', error);
    showManualSetupInstructions();
    return false;
  }
}

function showManualSetupInstructions() {
  console.log('\n📝 Manual Setup Required:');
  console.log('='.repeat(50));
  
  const sql = `
-- Copy and paste this SQL into your Supabase SQL Editor:

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
`;

  console.log(sql);
  console.log('\n💡 Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Paste the SQL above');
  console.log('5. Click "Run"');
  console.log('6. Come back and run: testAfterSetup()');
}

async function testAfterSetup() {
  console.log('🧪 Testing after manual setup...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    // Test table access
    const { data: tableData, error: tableError } = await supabase
      .from('level3_progress')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ Table still not accessible:', tableError.message);
      console.log('💡 Make sure you ran the SQL in Supabase SQL Editor');
      return false;
    }
    
    console.log('✅ Table accessible');

    // Test insert with your completion data
    const testData = {
      user_id: userData.user.id,
      module: '1',
      level: 3,
      scenario_index: 2,
      score: [83],
      placed_pieces: {
        scenarioResults: [
          { score: 100, combo: 1, health: 55 },
          { score: 99, combo: 2, health: 90 },
          { score: 100, combo: 1, health: 90 }
        ],
        finalStats: { totalScore: 299, finalScore: 83, totalTime: 32 },
        timestamp: new Date().toISOString()
      },
      is_completed: true,
      current_score: 83,
      time_taken: 32,
      total_attempts: 1,
      score_history: [83],
      time_history: [32]
    };

    const { data: saveResult, error: saveError } = await supabase
      .from('level3_progress')
      .upsert(testData, { 
        onConflict: 'user_id,module,level,scenario_index',
        ignoreDuplicates: false 
      })
      .select();

    if (saveError) {
      console.error('❌ Save test failed:', saveError);
      return false;
    }

    console.log('✅ Save test successful!', saveResult);
    console.log('\n🎉 Setup verified! Level 3 completion should now save properly.');
    
    return true;

  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

// Make functions available
window.runDatabaseSetup = runDatabaseSetup;
window.showManualSetupInstructions = showManualSetupInstructions;
window.testAfterSetup = testAfterSetup;

console.log(`
🔧 Database Setup Tools:

🚀 FUNCTIONS:
- runDatabaseSetup() - Try automatic setup
- showManualSetupInstructions() - Show manual SQL
- testAfterSetup() - Test after manual setup

🎯 QUICK START:
runDatabaseSetup()
`);

// Auto-run setup
runDatabaseSetup();
