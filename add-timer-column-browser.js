/**
 * Browser Console Script to Add Timer Restoration Column
 * 
 * Run this in the browser console while logged into the GMP application
 * to add the time_remaining column to the attempt_details table
 */

async function addTimerRestorationColumn() {
  console.log('🔧 Adding Timer Restoration Column...');
  console.log('='.repeat(50));
  
  try {
    // Check if supabase is available
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase not available. Make sure you are on the GMP application page.');
      return false;
    }

    // Check authentication first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('❌ Authentication failed:', userError?.message);
      console.log('💡 Please log in to the application first');
      return false;
    }
    
    console.log('✅ User authenticated:', userData.user.email);

    // Step 1: Check if column already exists
    console.log('\n1️⃣ Checking if time_remaining column exists...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('attempt_details')
        .select('time_remaining')
        .limit(1);
      
      if (!testError) {
        console.log('✅ time_remaining column already exists!');
        console.log('🎉 Timer restoration is already set up.');
        return true;
      }
    } catch (e) {
      // Column doesn't exist, continue with creation
    }

    // Step 2: Add the column (this might require admin privileges)
    console.log('\n2️⃣ Attempting to add time_remaining column...');
    
    // Try using a simple insert to test if we can modify the table
    const testEmail = 'timer-test-' + Date.now() + '@example.com';
    const testSessionId = 'test-session-' + Date.now();
    
    try {
      // First, try to insert a record with the new column
      const { error: insertError } = await supabase
        .from('attempt_details')
        .insert([
          {
            email: testEmail,
            session_id: testSessionId,
            module_number: 5,
            question_index: 0,
            question: { id: 'test', caseFile: 'Test case' },
            answer: { violation: '', rootCause: '', solution: '' },
            time_remaining: 5400
          }
        ]);
      
      if (insertError) {
        if (insertError.message.includes('column "time_remaining" of relation "attempt_details" does not exist')) {
          console.log('❌ Column does not exist and cannot be added via client');
          console.log('\n🔧 Manual Database Setup Required:');
          console.log('Please run the following SQL in your Supabase dashboard:');
          console.log('\n' + '='.repeat(60));
          console.log(`
-- Add time_remaining column to attempt_details table
ALTER TABLE public.attempt_details 
ADD COLUMN IF NOT EXISTS time_remaining INTEGER DEFAULT 5400;

-- Add comment to explain the column
COMMENT ON COLUMN public.attempt_details.time_remaining IS 'Timer state in seconds remaining (default 5400 = 1.5 hours)';

-- Update existing records to have default timer value
UPDATE public.attempt_details 
SET time_remaining = 5400 
WHERE time_remaining IS NULL;

-- Make the column NOT NULL
ALTER TABLE public.attempt_details 
ALTER COLUMN time_remaining SET NOT NULL;

-- Add constraint to ensure timer value is reasonable
ALTER TABLE public.attempt_details 
ADD CONSTRAINT check_time_remaining_range 
CHECK (time_remaining >= 0 AND time_remaining <= 5400);
          `);
          console.log('='.repeat(60));
          console.log('\n📋 Steps:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Navigate to SQL Editor');
          console.log('3. Copy and paste the SQL above');
          console.log('4. Run the SQL');
          console.log('5. Refresh this page and test timer restoration');
          return false;
        } else {
          console.error('❌ Unexpected error:', insertError.message);
          return false;
        }
      } else {
        console.log('✅ Successfully inserted test record with timer!');
        
        // Clean up test record
        await supabase
          .from('attempt_details')
          .delete()
          .eq('email', testEmail)
          .eq('session_id', testSessionId);
        
        console.log('✅ Test record cleaned up');
      }
    } catch (error) {
      console.error('❌ Error testing column:', error.message);
      return false;
    }

    // Step 3: Verify the setup
    console.log('\n3️⃣ Verifying timer restoration setup...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('attempt_details')
      .select('time_remaining')
      .limit(1);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return false;
    }
    
    console.log('✅ Timer restoration column is working!');
    
    // Step 4: Check existing data
    console.log('\n4️⃣ Checking existing records...');
    
    const { data: existingData, error: existingError } = await supabase
      .from('attempt_details')
      .select('email, session_id, module_number, question_index, time_remaining')
      .not('time_remaining', 'is', null)
      .limit(5);
    
    if (existingError) {
      console.warn('⚠️  Could not check existing records:', existingError.message);
    } else if (existingData && existingData.length > 0) {
      console.log(`✅ Found ${existingData.length} records with timer data`);
    } else {
      console.log('ℹ️  No existing records with timer data (normal for new setup)');
    }

    console.log('\n🎉 Timer restoration setup completed successfully!');
    console.log('\n📋 What happens now:');
    console.log('✅ Timer state will be saved when you answer questions');
    console.log('✅ Timer state will be restored when you continue a saved game');
    console.log('✅ You can no longer gain extra time by refreshing the page');
    
    console.log('\n🧪 To test:');
    console.log('1. Start a new game');
    console.log('2. Answer a few questions');
    console.log('3. Close the browser tab');
    console.log('4. Reopen and continue the game');
    console.log('5. Verify the timer continues from where you left off');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n💡 If you see permission errors, you may need to:');
    console.log('1. Use the Supabase dashboard to run the SQL manually');
    console.log('2. Contact your database administrator');
    console.log('3. Check your Supabase project permissions');
    return false;
  }
}

// Auto-run the function
console.log('🚀 Starting timer restoration setup...');
addTimerRestorationColumn().then(success => {
  if (success) {
    console.log('\n✅ Setup completed successfully!');
  } else {
    console.log('\n❌ Setup failed. Please follow the manual instructions above.');
  }
}).catch(error => {
  console.error('❌ Setup error:', error);
});
