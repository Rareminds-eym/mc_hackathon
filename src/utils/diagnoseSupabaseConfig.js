/**
 * Diagnostic utility to help identify Supabase configuration issues
 * Run this to understand why email links might be using localhost
 */

import { supabase } from '../lib/supabase';

export const diagnoseSupabaseConfiguration = async () => {
  console.log('🔍 Diagnosing Supabase Configuration...\n');
  
  // Current environment info
  const currentUrl = window.location.origin;
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
  const environment = import.meta.env.MODE;
  
  console.log('🌍 Current Environment:');
  console.log(`   Current URL: ${currentUrl}`);
  console.log(`   Hostname: ${currentHost}`);
  console.log(`   Protocol: ${currentProtocol}`);
  console.log(`   Is Localhost: ${isLocalhost}`);
  console.log(`   Environment: ${environment}`);
  
  // Supabase configuration
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('\n🔧 Supabase Configuration:');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
  
  // Test what URL would be used for password reset
  const passwordResetUrl = `${currentUrl}/reset-password`;
  const authRedirectUrl = `${currentUrl}/auth`;
  
  console.log('\n📧 Email Redirect URLs (What our code will send):');
  console.log(`   Password Reset: ${passwordResetUrl}`);
  console.log(`   Auth Redirect: ${authRedirectUrl}`);
  
  // Check authentication status
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('\n👤 Authentication Status:');
    if (error) {
      console.log(`   Error: ${error.message}`);
    } else if (session) {
      console.log(`   Logged in as: ${session.user.email}`);
      console.log(`   Session expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    } else {
      console.log('   Not logged in');
    }
  } catch (err) {
    console.log('\n👤 Authentication Status:');
    console.log(`   Error checking session: ${err.message}`);
  }
  
  // Recommendations
  console.log('\n💡 Diagnosis & Recommendations:');
  
  if (isLocalhost && environment === 'production') {
    console.log('   ⚠️  WARNING: Running in production mode on localhost!');
    console.log('   📝 This might indicate a build/deployment issue');
  }
  
  if (!isLocalhost && environment === 'development') {
    console.log('   ⚠️  WARNING: Running in development mode on production domain!');
    console.log('   📝 Make sure you\'re running the production build');
  }
  
  if (isLocalhost) {
    console.log('   🏠 Running on localhost - email links will use localhost');
    console.log('   📝 This is expected for development');
  } else {
    console.log('   🌐 Running on production domain - email links should use this domain');
    console.log('   📝 If emails still show localhost, check Supabase Site URL setting');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Check Supabase Dashboard → Settings → General → Site URL');
  console.log('   2. Ensure Site URL matches your production domain');
  console.log('   3. Add your domain to Redirect URLs');
  console.log('   4. Clear browser cache and test again');
  
  // Test password reset (simulation)
  console.log('\n🧪 To test password reset:');
  console.log('   1. Use the forgot password feature');
  console.log('   2. Check the email you receive');
  console.log('   3. Verify the link uses the correct domain');
  
  return {
    currentUrl,
    currentHost,
    currentProtocol,
    isLocalhost,
    environment,
    supabaseUrl,
    passwordResetUrl,
    authRedirectUrl,
    recommendations: {
      checkSupabaseSiteUrl: !isLocalhost,
      clearCache: true,
      testInIncognito: true
    }
  };
};

// Auto-run diagnostic in development
if (import.meta.env.MODE === 'development') {
  setTimeout(() => {
    diagnoseSupabaseConfiguration();
  }, 2000);
}

// Make it available globally for manual testing
if (typeof window !== 'undefined') {
  window.diagnoseSupabaseConfig = diagnoseSupabaseConfiguration;
}
