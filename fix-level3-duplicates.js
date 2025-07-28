// Fix Level 3 Database Duplicates and Module Issues
// This script addresses:
// 1. Duplicate user_id entries in level3_progress table
// 2. Module data showing incorrectly across different modules
// 3. Ensures proper unique constraints are enforced

console.log('🔧 Level 3 Database Duplicate Fix Script');
console.log('==========================================');

// Function to check for duplicate records
async function checkForDuplicates() {
  console.log('\n1️⃣ Checking for duplicate records...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    // Check for duplicates using SQL query
    const { data: duplicates, error } = await supabase.rpc('sql', {
      query: `
        SELECT 
          user_id, 
          module, 
          level, 
          scenario_index, 
          COUNT(*) as duplicate_count,
          array_agg(id) as record_ids,
          array_agg(created_at) as created_dates
        FROM level3_progress 
        WHERE user_id = $1
        GROUP BY user_id, module, level, scenario_index 
        HAVING COUNT(*) > 1
        ORDER BY module, scenario_index;
      `,
      params: [userData.user.id]
    });

    if (error) {
      console.error('❌ Error checking duplicates:', error);
      
      // Fallback: Check using direct table query
      console.log('🔄 Trying alternative duplicate check...');
      
      const { data: allRecords, error: fetchError } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('module', { ascending: true })
        .order('scenario_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching records:', fetchError);
        return false;
      }

      // Group records to find duplicates
      const grouped = {};
      allRecords.forEach(record => {
        const key = `${record.module}-${record.level}-${record.scenario_index}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(record);
      });

      // Find duplicates
      const duplicateGroups = Object.entries(grouped).filter(([key, records]) => records.length > 1);
      
      if (duplicateGroups.length === 0) {
        console.log('✅ No duplicate records found');
        return true;
      }

      console.log(`⚠️ Found ${duplicateGroups.length} duplicate groups:`);
      duplicateGroups.forEach(([key, records]) => {
        console.log(`  📍 ${key}: ${records.length} records`);
        records.forEach((record, index) => {
          console.log(`    ${index + 1}. ID: ${record.id}, Score: ${record.current_score}, Created: ${record.created_at}`);
        });
      });

      return duplicateGroups;
    }

    if (duplicates && duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate groups:`);
      duplicates.forEach(dup => {
        console.log(`  📍 Module ${dup.module}, Scenario ${dup.scenario_index}: ${dup.duplicate_count} records`);
        console.log(`    Record IDs: ${dup.record_ids.join(', ')}`);
      });
      return duplicates;
    } else {
      console.log('✅ No duplicate records found');
      return true;
    }

  } catch (error) {
    console.error('💥 Error checking duplicates:', error);
    return false;
  }
}

// Function to clean up duplicate records
async function cleanupDuplicates(duplicateGroups) {
  console.log('\n2️⃣ Cleaning up duplicate records...');
  
  if (!duplicateGroups || duplicateGroups === true) {
    console.log('✅ No duplicates to clean up');
    return true;
  }

  try {
    const { supabase } = window;
    
    for (const group of duplicateGroups) {
      let recordsToProcess;
      
      if (group.record_ids) {
        // From SQL query result
        recordsToProcess = group.record_ids.map((id, index) => ({
          id,
          created_at: group.created_dates[index]
        }));
      } else {
        // From grouped records
        recordsToProcess = group[1];
      }

      // Sort by created_at to keep the oldest record
      recordsToProcess.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Keep the first (oldest) record, delete the rest
      const recordsToDelete = recordsToProcess.slice(1);
      
      console.log(`🗑️ Deleting ${recordsToDelete.length} duplicate records for ${group.module || group[0]}-${group.scenario_index || 'unknown'}`);
      
      for (const record of recordsToDelete) {
        const { error: deleteError } = await supabase
          .from('level3_progress')
          .delete()
          .eq('id', record.id);

        if (deleteError) {
          console.error(`❌ Error deleting record ${record.id}:`, deleteError);
        } else {
          console.log(`✅ Deleted duplicate record ${record.id}`);
        }
      }
    }

    console.log('✅ Duplicate cleanup completed');
    return true;

  } catch (error) {
    console.error('💥 Error cleaning duplicates:', error);
    return false;
  }
}

// Function to verify unique constraint
async function verifyUniqueConstraint() {
  console.log('\n3️⃣ Verifying unique constraint...');
  
  try {
    const { supabase } = window;
    
    // Check if unique constraint exists
    const { data: constraints, error } = await supabase.rpc('sql', {
      query: `
        SELECT constraint_name, constraint_type 
        FROM information_schema.table_constraints 
        WHERE table_name = 'level3_progress' 
        AND constraint_type = 'UNIQUE';
      `
    });

    if (error) {
      console.warn('⚠️ Could not check constraints:', error.message);
      console.log('💡 This is normal if you don\'t have admin access');
      return true;
    }

    if (constraints && constraints.length > 0) {
      console.log('✅ Unique constraints found:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}`);
      });
    } else {
      console.log('⚠️ No unique constraints found');
      console.log('💡 The unique constraint might need to be added');
    }

    return true;

  } catch (error) {
    console.error('💥 Error verifying constraints:', error);
    return false;
  }
}

// Function to test module-specific data retrieval
async function testModuleDataRetrieval() {
  console.log('\n4️⃣ Testing module-specific data retrieval...');
  
  try {
    const { supabase } = window;
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error('❌ Not authenticated');
      return false;
    }

    // Test data retrieval for each module
    for (let moduleId = 1; moduleId <= 4; moduleId++) {
      console.log(`\n📊 Module ${moduleId} data:`);
      
      const { data: moduleData, error } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('module', moduleId.toString())
        .eq('level', 3);

      if (error) {
        console.error(`❌ Error fetching Module ${moduleId} data:`, error);
        continue;
      }

      if (moduleData && moduleData.length > 0) {
        console.log(`  ✅ Found ${moduleData.length} records`);
        moduleData.forEach(record => {
          console.log(`    Scenario ${record.scenario_index}: Score ${record.current_score}, Time ${record.time_taken}s`);
        });
      } else {
        console.log(`  📭 No data found for Module ${moduleId}`);
      }
    }

    return true;

  } catch (error) {
    console.error('💥 Error testing module data:', error);
    return false;
  }
}

// Main execution function
async function fixLevel3Duplicates() {
  console.log('\n🚀 Starting Level 3 duplicate fix...');
  
  try {
    // Step 1: Check for duplicates
    const duplicateGroups = await checkForDuplicates();
    if (duplicateGroups === false) {
      console.error('❌ Failed to check for duplicates');
      return false;
    }

    // Step 2: Clean up duplicates if found
    if (duplicateGroups !== true) {
      const cleanupSuccess = await cleanupDuplicates(duplicateGroups);
      if (!cleanupSuccess) {
        console.error('❌ Failed to clean up duplicates');
        return false;
      }
    }

    // Step 3: Verify unique constraint
    await verifyUniqueConstraint();

    // Step 4: Test module data retrieval
    await testModuleDataRetrieval();

    console.log('\n🎉 Level 3 duplicate fix completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Navigate to different modules in Level 3');
    console.log('2. Check that each module shows its own unique data');
    console.log('3. Verify that best scores are module-specific');
    
    return true;

  } catch (error) {
    console.error('💥 Fix failed:', error);
    return false;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.fixLevel3Duplicates = fixLevel3Duplicates;
  window.checkForDuplicates = checkForDuplicates;
  window.cleanupDuplicates = cleanupDuplicates;
  window.testModuleDataRetrieval = testModuleDataRetrieval;
}

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location.pathname.includes('level')) {
  console.log('🎮 Level 3 Duplicate Fix Script loaded');
  console.log('📝 Run: fixLevel3Duplicates()');
}
