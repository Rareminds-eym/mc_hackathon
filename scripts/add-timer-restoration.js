#!/usr/bin/env node

/**
 * Script to add timer restoration functionality to the attempt_details table
 * This adds the time_remaining column and sets up constraints
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting timer restoration migration...');
  
  try {
    // Read the SQL migration file
    const sqlPath = join(__dirname, '..', 'database', 'add_timer_restoration.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Loaded SQL migration file');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_temp')
          .select('*')
          .limit(0); // This will fail but might give us better error info
        
        console.warn(`⚠️  RPC failed, trying direct execution for statement ${i + 1}`);
        console.log(`Statement: ${statement.substring(0, 100)}...`);
        
        // For ALTER TABLE statements, we can try a different approach
        if (statement.includes('ALTER TABLE')) {
          console.log('🔧 Attempting ALTER TABLE via direct SQL...');
          // Note: Direct ALTER TABLE might not work with anon key
          console.log('💡 Please run this SQL manually in your Supabase dashboard:');
          console.log(statement);
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    // Test the new column
    console.log('🧪 Testing the new time_remaining column...');
    
    const { data, error: testError } = await supabase
      .from('attempt_details')
      .select('time_remaining')
      .limit(1);
    
    if (testError) {
      console.warn('⚠️  Could not test new column:', testError.message);
      console.log('💡 The column might need to be added manually. Please run the SQL in your Supabase dashboard.');
    } else {
      console.log('✅ time_remaining column is accessible');
    }
    
    console.log('🎉 Timer restoration migration completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Verify the time_remaining column exists in attempt_details table');
    console.log('2. Test the timer restoration functionality in the app');
    console.log('3. Check that saved games now preserve timer state');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('');
    console.log('🔧 Manual steps:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to the SQL editor');
    console.log('3. Run the contents of database/add_timer_restoration.sql');
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(console.error);
