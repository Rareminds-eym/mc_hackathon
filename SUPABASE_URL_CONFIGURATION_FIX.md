# Supabase URL Configuration Fix

## 🚨 Problem Identified
The password reset email is still redirecting to `http://localhost:3000` in production, which indicates that your Supabase project has localhost configured as the Site URL.

## 🔍 Root Cause
Even though our code now automatically detects the domain using `window.location.origin`, Supabase has its own configuration that overrides this for email templates and redirects.

## ✅ Solution Steps

### Step 1: Update Supabase Site URL
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **General**
4. Find the **Site URL** field
5. Change it from `http://localhost:3000` to your production domain
6. Example: `https://your-production-domain.com`
7. Click **Save**

### Step 2: Update Redirect URLs
1. In the same **Settings** → **General** page
2. Find **Redirect URLs** section
3. Add your production domain: `https://your-production-domain.com/**`
4. You can keep localhost for development: `http://localhost:3000/**`
5. Click **Save**

### Step 3: Verify Email Templates (Optional)
1. Navigate to **Authentication** → **Email Templates**
2. Check the **Reset Password** template
3. Ensure it uses `{{ .SiteURL }}` variable (it should by default)
4. The template should look like: `{{ .SiteURL }}/reset-password?token={{ .Token }}`

### Step 4: Clear Browser Cache
1. Clear your browser cache and cookies
2. Or test in an incognito/private window
3. This ensures old cached redirects don't interfere

## 🧪 Testing the Fix

### Test Password Reset
1. Go to your production site
2. Click "Forgot Password"
3. Enter your email
4. Check the email you receive
5. The link should now use your production domain

### Test Email Verification
1. Create a new account on production
2. Check the verification email
3. The link should use your production domain

## 🔧 Advanced Configuration

### Multiple Environments
If you have staging and production environments:

**Site URL**: Use your primary production domain
**Redirect URLs**: Add all your domains:
- `https://your-production-domain.com/**`
- `https://staging.your-domain.com/**`
- `http://localhost:3000/**` (for development)
- `http://localhost:5173/**` (for Vite dev server)

### Custom Domains
If you're using a custom domain:
1. Make sure your custom domain is properly configured
2. Use the custom domain in Supabase Site URL
3. Test thoroughly after DNS propagation

## 🚨 Common Issues

### Issue 1: Still Getting Localhost Links
**Cause**: Browser cache or Supabase cache
**Solution**: 
- Clear browser cache
- Wait 5-10 minutes for Supabase to update
- Test in incognito mode

### Issue 2: "Invalid Redirect URL" Error
**Cause**: Domain not added to Redirect URLs
**Solution**: Add your domain to the Redirect URLs list

### Issue 3: HTTPS vs HTTP Issues
**Cause**: Mixed protocol configuration
**Solution**: Ensure all URLs use HTTPS in production

## ✅ Verification Checklist

- [ ] Supabase Site URL updated to production domain
- [ ] Production domain added to Redirect URLs
- [ ] Browser cache cleared
- [ ] Password reset email tested
- [ ] Email verification tested
- [ ] Links use production domain (not localhost)

## 📞 Need Help?

If you're still seeing localhost links after following these steps:
1. Double-check the Supabase Site URL setting
2. Wait 10-15 minutes for changes to propagate
3. Test in a completely fresh browser session
4. Check if you have multiple Supabase projects and ensure you're updating the correct one

## 🎯 Expected Result

After this fix:
- Password reset emails will use: `https://your-domain.com/reset-password?token=...`
- Email verification will use: `https://your-domain.com/auth?token=...`
- No more localhost links in production emails!
