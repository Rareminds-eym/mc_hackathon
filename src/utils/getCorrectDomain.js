/**
 * Utility to get the correct domain for email redirects
 * This helps ensure we always use the right domain, even if Supabase is misconfigured
 */

/**
 * Get the correct base URL for email redirects
 * @returns {string} The correct base URL to use
 */
export const getCorrectBaseUrl = () => {
  const currentOrigin = window.location.origin;
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If we're on localhost, use localhost (development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return currentOrigin;
  }
  
  // For production, always use HTTPS if available
  if (protocol === 'http:' && hostname !== 'localhost') {
    // Try to upgrade to HTTPS for production domains
    return `https://${hostname}`;
  }
  
  // Use the current origin as-is
  return currentOrigin;
};

/**
 * Get the password reset URL
 * @returns {string} Complete password reset URL
 */
export const getPasswordResetUrl = () => {
  return `${getCorrectBaseUrl()}/reset-password`;
};

/**
 * Get the auth redirect URL
 * @returns {string} Complete auth redirect URL
 */
export const getAuthRedirectUrl = () => {
  return `${getCorrectBaseUrl()}/auth`;
};

/**
 * Log the URLs being used (for debugging)
 */
export const logEmailUrls = () => {
  console.log('📧 Email URLs:');
  console.log(`   Base URL: ${getCorrectBaseUrl()}`);
  console.log(`   Password Reset: ${getPasswordResetUrl()}`);
  console.log(`   Auth Redirect: ${getAuthRedirectUrl()}`);
};

// Export for easy importing
export default {
  getCorrectBaseUrl,
  getPasswordResetUrl,
  getAuthRedirectUrl,
  logEmailUrls
};
