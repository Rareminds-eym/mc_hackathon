# Fix for Localhost Email Links in Production

## 🚨 Problem
Password reset emails are showing `http://localhost:3000` links even in production, instead of the actual production domain.

## 🔍 Root Cause
The issue is in your **Supabase project configuration**, not in the application code. Supabase has its own "Site URL" setting that overrides the redirect URLs in email templates.

## ✅ IMMEDIATE FIX (Required)

### Step 1: Update Supabase Site URL
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Find **Site URL** field
5. Change from `http://localhost:3000` to your production domain
6. Example: `https://your-actual-domain.com`
7. Click **Save**

### Step 2: Update Redirect URLs
1. In the same settings page, find **Redirect URLs**
2. Add your production domain: `https://your-actual-domain.com/**`
3. Keep localhost for development: `http://localhost:3000/**`
4. Add Vite dev server: `http://localhost:5173/**`
5. Click **Save**

### Step 3: Clear Cache & Test
1. Clear browser cache
2. Wait 5-10 minutes for Supabase to update
3. Test password reset in incognito mode
4. Email links should now use production domain

## 🔧 Code Improvements (Already Applied)

I've also updated the code to be more robust:

### Enhanced Domain Detection
- Created `src/utils/getCorrectDomain.js` utility
- Automatically upgrades HTTP to HTTPS for production
- Better handling of different environments

### Updated Functions
- `resetPassword()` in `AuthContext.tsx`
- `signUp()` in `AuthContext.tsx` 
- `handleResendVerification()` in `AuthForm.tsx`

## 🧪 Testing Tools

### Diagnostic Tool
Run in browser console:
```javascript
// Import and run diagnostic
import { diagnoseSupabaseConfiguration } from './src/utils/diagnoseSupabaseConfig.js';
diagnoseSupabaseConfiguration();
```

### Manual Test
1. Go to your production site
2. Click "Forgot Password"
3. Enter email and submit
4. Check email - link should use production domain

## 🚨 Common Issues & Solutions

### Still Getting Localhost Links?
- **Check**: Supabase Site URL setting
- **Wait**: 10-15 minutes for changes to propagate
- **Clear**: Browser cache completely
- **Test**: In incognito/private mode

### "Invalid Redirect URL" Error?
- **Add**: Your domain to Supabase Redirect URLs
- **Format**: `https://yourdomain.com/**`
- **Include**: All subdomains if needed

### Mixed HTTP/HTTPS Issues?
- **Use**: HTTPS for all production URLs
- **Check**: SSL certificate is valid
- **Ensure**: Consistent protocol usage

## ✅ Verification Checklist

- [ ] Supabase Site URL updated to production domain
- [ ] Production domain added to Redirect URLs  
- [ ] Browser cache cleared
- [ ] Waited 10+ minutes for propagation
- [ ] Tested in incognito mode
- [ ] Password reset email uses production domain
- [ ] Email verification uses production domain

## 🎯 Expected Result

After fixing Supabase configuration:
- Password reset: `https://yourdomain.com/reset-password?token=...`
- Email verification: `https://yourdomain.com/auth?token=...`
- No more localhost links in production!

## 📞 Still Need Help?

If localhost links persist after following all steps:
1. Double-check you're updating the correct Supabase project
2. Verify the Site URL was actually saved
3. Test with a completely different browser
4. Check if you have multiple environments pointing to the same Supabase project

The key is updating the **Supabase Site URL setting** - this is what controls the email template URLs, not just the application code.
