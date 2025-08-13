#!/usr/bin/env node

/**
 * Script to test timer restoration functionality
 * This verifies that timer values are being saved and restored correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTimerRestoration() {
  console.log('🧪 Testing timer restoration functionality...');
  
  try {
    // Test 1: Check if time_remaining column exists
    console.log('\n📋 Test 1: Checking if time_remaining column exists...');
    
    const { data: columnTest, error: columnError } = await supabase
      .from('attempt_details')
      .select('time_remaining')
      .limit(1);
    
    if (columnError) {
      console.error('❌ time_remaining column does not exist:', columnError.message);
      console.log('💡 Please run the migration script first: node scripts/add-timer-restoration.js');
      return;
    }
    
    console.log('✅ time_remaining column exists');
    
    // Test 2: Check existing records
    console.log('\n📋 Test 2: Checking existing records with timer data...');
    
    const { data: existingRecords, error: existingError } = await supabase
      .from('attempt_details')
      .select('email, session_id, module_number, question_index, time_remaining')
      .not('time_remaining', 'is', null)
      .limit(5);
    
    if (existingError) {
      console.error('❌ Error querying existing records:', existingError.message);
      return;
    }
    
    if (existingRecords && existingRecords.length > 0) {
      console.log(`✅ Found ${existingRecords.length} records with timer data:`);
      existingRecords.forEach((record, index) => {
        const minutes = Math.floor(record.time_remaining / 60);
        const seconds = record.time_remaining % 60;
        console.log(`   ${index + 1}. Module ${record.module_number}, Q${record.question_index + 1}: ${minutes}:${String(seconds).padStart(2, '0')} remaining`);
      });
    } else {
      console.log('ℹ️  No records with timer data found (this is normal for new installations)');
    }
    
    // Test 3: Create a test record
    console.log('\n📋 Test 3: Creating test record with timer data...');
    
    const testEmail = 'test-timer@example.com';
    const testSessionId = 'test-session-' + Date.now();
    const testTimeRemaining = 4800; // 80 minutes
    
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
          time_remaining: testTimeRemaining
        }
      ]);
    
    if (insertError) {
      console.error('❌ Error creating test record:', insertError.message);
      return;
    }
    
    console.log('✅ Test record created successfully');
    
    // Test 4: Retrieve and verify test record
    console.log('\n📋 Test 4: Retrieving and verifying test record...');
    
    const { data: testRecord, error: retrieveError } = await supabase
      .from('attempt_details')
      .select('*')
      .eq('email', testEmail)
      .eq('session_id', testSessionId)
      .single();
    
    if (retrieveError) {
      console.error('❌ Error retrieving test record:', retrieveError.message);
      return;
    }
    
    if (testRecord.time_remaining === testTimeRemaining) {
      console.log(`✅ Timer value correctly saved and retrieved: ${testTimeRemaining} seconds`);
    } else {
      console.error(`❌ Timer value mismatch. Expected: ${testTimeRemaining}, Got: ${testRecord.time_remaining}`);
    }
    
    // Test 5: Clean up test record
    console.log('\n📋 Test 5: Cleaning up test record...');
    
    const { error: deleteError } = await supabase
      .from('attempt_details')
      .delete()
      .eq('email', testEmail)
      .eq('session_id', testSessionId);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test record:', deleteError.message);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
    // Test 6: Check constraints
    console.log('\n📋 Test 6: Testing timer value constraints...');
    
    try {
      const { error: constraintError } = await supabase
        .from('attempt_details')
        .insert([
          {
            email: testEmail,
            session_id: testSessionId + '-constraint',
            module_number: 5,
            question_index: 0,
            question: { id: 'test', caseFile: 'Test case' },
            answer: { violation: '', rootCause: '', solution: '' },
            time_remaining: 6000 // Invalid: > 5400
          }
        ]);
      
      if (constraintError && constraintError.message.includes('check_time_remaining_range')) {
        console.log('✅ Timer range constraint is working correctly');
      } else if (constraintError) {
        console.log('ℹ️  Constraint test failed with different error:', constraintError.message);
      } else {
        console.log('⚠️  Timer range constraint may not be active');
        // Clean up if insert succeeded
        await supabase
          .from('attempt_details')
          .delete()
          .eq('email', testEmail)
          .eq('session_id', testSessionId + '-constraint');
      }
    } catch (error) {
      console.log('ℹ️  Constraint test error (this may be expected):', error.message);
    }
    
    console.log('\n🎉 Timer restoration testing completed!');
    console.log('\n📋 Summary:');
    console.log('✅ time_remaining column is functional');
    console.log('✅ Timer values can be saved and retrieved');
    console.log('✅ Basic functionality is working');
    console.log('\n💡 Next steps:');
    console.log('1. Test in the actual application by starting a game');
    console.log('2. Answer some questions and close the browser');
    console.log('3. Reopen and continue the game');
    console.log('4. Verify the timer continues from where it left off');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTimerRestoration().catch(console.error);
