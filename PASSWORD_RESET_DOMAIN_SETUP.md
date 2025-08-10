# Automatic Email Domain Detection

## Problem
When users request password resets or email verifications, the email links needed to redirect to the correct domain for the application.

## Solution
All email-related authentication functions now automatically detect the correct domain using `window.location.origin`, which works seamlessly across all environments (development, staging, production) without any manual configuration.

## How It Works - No Setup Required! 🎉

The application now automatically detects the correct domain from the current URL. This means:

- **Development**: Automatically uses `http://localhost:5173` (or your dev server URL)
- **Staging**: Automatically uses your staging domain
- **Production**: Automatically uses your production domain
- **Any Environment**: Works seamlessly without configuration

### 3. How It Works

The following functions in the authentication system now use the configurable domain:

#### Password Reset (`src/contexts/AuthContext.tsx`)
```typescript
const resetPassword = async (email: string) => {
  try {
    // Automatically detect the correct app URL
    const baseUrl = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
      captchaToken: undefined
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}
```

#### User Signup (`src/contexts/AuthContext.tsx`)
```typescript
const signUp = async (email: string, password: string, fullName: string, extraFields?: SignupExtraFields) => {
  try {
    // Automatically detect the correct app URL
    const baseUrl = window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth`,
        data: { /* user data */ }
      }
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}
```

#### Resend Verification Email (`src/components/auth/AuthForm.tsx`)
```typescript
const handleResendVerification = async () => {
  // Automatically detect the correct app URL
  const baseUrl = window.location.origin;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: formData.email,
    options: {
      emailRedirectTo: `${baseUrl}/auth`
    }
  });
}
```

### 4. Behavior

- **Development**: Automatically uses `http://localhost:5173` (or your dev server URL)
- **Staging**: Automatically uses your staging domain (e.g., `https://staging.yourapp.com`)
- **Production**: Automatically uses your production domain (e.g., `https://yourapp.com`)
- **Email Links**: All authentication emails (password reset, email verification, resend verification) will redirect to the current domain

### 5. Testing

1. **Development Testing**:
   - Start your dev server (`npm run dev`)
   - Test password reset functionality - links will use `http://localhost:5173`

2. **Production Testing**:
   - Deploy to your production environment
   - Test all email functionalities - links will automatically use your production domain:
     - Password reset emails
     - Email verification during signup
     - Resend verification emails

### 6. Benefits

- ✅ **Zero Configuration**: No environment variables needed
- ✅ **Works Everywhere**: Automatically adapts to any domain
- ✅ **No Manual Updates**: No need to update URLs when changing domains
- ✅ **Environment Agnostic**: Works in dev, staging, and production
- ✅ **Maintenance Free**: No configuration to maintain or update

### 7. How Domain Detection Works

The app uses `window.location.origin` which automatically provides:
- Protocol: `http://` or `https://`
- Domain: `localhost`, `yourapp.com`, `staging.yourapp.com`, etc.
- Port: `:5173`, `:3000`, or none for standard ports

This ensures email links always point to the exact same URL the user is currently using.
