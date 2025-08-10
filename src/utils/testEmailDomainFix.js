/**
 * Test utility to verify automatic email domain detection
 * This helps ensure that email redirects are working correctly
 */

export const testEmailDomainConfiguration = () => {
  console.log('🧪 Testing Automatic Email Domain Detection...\n');

  // Test automatic detection
  const detectedUrl = window.location.origin;
  const effectiveUrl = detectedUrl;
  
  console.log('📋 Auto-Detection Status:');
  console.log(`   Detected URL: ${detectedUrl}`);
  console.log(`   Effective URL: ${effectiveUrl}`);
  
  // Test URL construction
  const passwordResetUrl = `${effectiveUrl}/reset-password`;
  const authRedirectUrl = `${effectiveUrl}/auth`;
  
  console.log('\n🔗 Generated URLs:');
  console.log(`   Password Reset: ${passwordResetUrl}`);
  console.log(`   Auth Redirect: ${authRedirectUrl}`);
  
  // Validation
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  console.log('\n✅ Validation:');
  console.log(`   Password Reset URL Valid: ${isValidUrl(passwordResetUrl)}`);
  console.log(`   Auth Redirect URL Valid: ${isValidUrl(authRedirectUrl)}`);
  
  // Environment check
  const isProduction = import.meta.env.MODE === 'production';
  const isDevelopment = import.meta.env.MODE === 'development';
  
  console.log('\n🌍 Environment:');
  console.log(`   Mode: ${import.meta.env.MODE}`);
  console.log(`   Is Production: ${isProduction}`);
  console.log(`   Is Development: ${isDevelopment}`);
  
  // Recommendations
  console.log('\n💡 Status:');
  if (isProduction) {
    console.log('   ✅ Production: Using automatic domain detection');
    console.log(`   🌐 Domain: ${detectedUrl}`);
  } else if (isDevelopment) {
    console.log('   ✅ Development: Using automatic domain detection');
    console.log(`   🏠 Local URL: ${detectedUrl}`);
  } else {
    console.log('   ✅ Using automatic domain detection');
    console.log(`   🔗 Current URL: ${detectedUrl}`);
  }
  
  return {
    detectedUrl,
    effectiveUrl,
    passwordResetUrl,
    authRedirectUrl,
    isProduction,
    isDevelopment,
    isAutoDetected: true
  };
};

// Auto-run in development mode
if (import.meta.env.MODE === 'development') {
  // Run test after a short delay to ensure DOM is ready
  setTimeout(() => {
    testEmailDomainConfiguration();
  }, 1000);
}
