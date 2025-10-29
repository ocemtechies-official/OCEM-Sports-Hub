# Enhanced Authentication Guide for OCEM Sports Hub

## Overview

The OCEM Sports Hub implements a robust authentication system built on Supabase Auth with enhanced security features, social login integration, and comprehensive error handling. This guide explains how the authentication system works and how to manage user accounts.

## Authentication Architecture

### Core Components

The authentication system consists of several key components:

1. **Auth Provider** (`components/auth/auth-provider.tsx`) - Main authentication context provider
2. **Login Form** (`components/auth/login-form.tsx`) - User login interface
3. **Signup Form** (`components/auth/signup-form.tsx`) - User registration interface
4. **Auth Middleware** (`lib/supabase/middleware.ts`) - Server-side authentication validation
5. **Auth Library** (`lib/auth.ts`) - Helper functions for authentication checks
6. **Database Functions** - Server-side functions for role validation

### Authentication Flow

1. **User Registration**
   - User signs up through the signup form
   - Supabase creates an auth user and sends verification email
   - Profile is automatically created via database trigger
   - User must verify email before logging in

2. **User Login**
   - User provides email and password
   - Supabase validates credentials
   - User session is created
   - Profile data is fetched
   - User is redirected to appropriate page

3. **Social Login**
   - User selects Google or GitHub login
   - OAuth flow redirects to provider
   - Provider redirects back with authorization code
   - Supabase exchanges code for session
   - User is logged in and redirected

4. **Session Management**
   - Session persistence based on "Remember Me" setting
   - Automatic session refresh
   - Logout functionality

## Role-Based Access Control

### User Roles

The system implements a three-tier role system:

1. **Admin** - Full system access
2. **Moderator** - Limited access to assigned sports/venues
3. **Viewer** - Standard user access

### Role Assignment

Roles are stored in the `profiles` table and can be managed through:

- Direct database updates (for initial setup)
- Admin panel (for ongoing management)

### Role Validation

Role validation occurs at multiple levels:

- **Client-side**: UI elements are hidden/shown based on role
- **Server-side**: API routes validate user permissions
- **Database-level**: Row-level security policies enforce access control

## Security Features

### Rate Limiting

The authentication system implements rate limiting to prevent brute force attacks:

- **Login Attempts**: Maximum 5 failed attempts per 15 minutes
- **Signup Attempts**: Maximum 5 failed attempts per 15 minutes
- **Resend Verification**: Rate limited to prevent email spam
- **Blocking Duration**: 1 hour block after exceeding limits

### Password Security

- Password strength validation during signup
- Secure password storage via Supabase Auth
- Password reset functionality

### Session Security

- Secure session tokens
- Session persistence options
- Automatic session cleanup

### Email Verification

- All new accounts require email verification
- Resend verification functionality
- Rate limiting on verification requests

## Social Login Integration

### Supported Providers

1. **Google OAuth**
2. **GitHub OAuth**

### Implementation Details

Social login is implemented using Supabase OAuth:

- OAuth providers are configured in Supabase dashboard
- Redirect URLs are properly configured
- User data is automatically synced with profiles

### User Experience

- Consistent styling across all login options
- Clear error messaging
- Smooth transitions between authentication states

## API Integration

### Authentication Context

The `AuthProvider` component provides a React context with the following functions:

```typescript
interface AuthContextType {
  user: User | null
  profile: any | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithGithub: () => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  resendVerificationEmail: (email: string) => Promise<any>
  signOut: () => Promise<void>
  loading: boolean
  isAdmin: boolean
  testConnection: () => Promise<boolean>
}
```

### Server-Side Authentication

Server components can validate authentication using helper functions:

```typescript
// Check if user is authenticated
const { user, profile } = await requireAuth()

// Check if user is admin
const { user, profile, isAdmin } = await requireAdmin()

// Check if user is moderator
const { user, profile, isModerator } = await requireModerator()
```

## Database Schema

### Profiles Table

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'moderator', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Additional Moderator Fields

For moderator functionality, additional fields are added:

```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_sports TEXT[],
ADD COLUMN IF NOT EXISTS assigned_venues TEXT[],
ADD COLUMN IF NOT EXISTS moderator_notes TEXT;
```

## Error Handling

### Common Authentication Errors

1. **Invalid Credentials**
   - Displayed as "Invalid email or password"
   - Rate limiting applied after multiple failures

2. **Email Not Verified**
   - Automatic resend of verification email
   - Clear user guidance on next steps

3. **Account Already Exists**
   - Guidance to use login instead of signup
   - Option to resend verification if needed

4. **Password Too Weak**
   - Specific guidance on password requirements
   - Real-time password strength feedback

### Network Errors

- Connection timeout handling
- Offline detection
- Retry mechanisms

## User Interface Components

### Login Form

Features:

- Email and password fields
- "Remember me" option
- Social login buttons
- Password visibility toggle
- Forgot password link
- Signup link for new users

### Signup Form

Features:

- Full name, email, and password fields
- Password strength indicator
- Social signup options
- Terms and conditions agreement
- Login link for existing users

### Forgot Password Flow

1. User enters email on forgot password page
2. System sends password reset email
3. User clicks link in email
4. User enters new password
5. Password is updated and user is logged in

## Testing Checklist

### Authentication Flow Testing

- [ ] User can register with valid credentials
- [ ] User receives verification email
- [ ] User can verify email and log in
- [ ] User can log in with correct credentials
- [ ] User is blocked after too many failed attempts
- [ ] User can reset password
- [ ] Social login works correctly
- [ ] Session persistence works with "Remember Me"
- [ ] Logout clears session properly

### Role-Based Access Testing

- [ ] Admin users can access admin features
- [ ] Moderator users can access assigned fixtures
- [ ] Viewer users cannot access admin/moderator features
- [ ] Role changes are reflected immediately
- [ ] Unauthorized access attempts are blocked

### Security Testing

- [ ] Password strength requirements are enforced
- [ ] Rate limiting works correctly
- [ ] Session tokens are secure
- [ ] Email verification is required
- [ ] Social login providers are properly configured

## Troubleshooting

### Common Issues

**Login Failures**

1. Check if email is verified
2. Verify password is correct
3. Check rate limiting status
4. Ensure network connectivity

**Signup Issues**

1. Verify email is not already registered
2. Check password strength requirements
3. Ensure email provider is not blocking verification emails

**Social Login Problems**

1. Verify OAuth provider configuration
2. Check redirect URLs
3. Ensure provider credentials are correct

**Session Issues**

1. Check "Remember Me" setting
2. Verify browser storage permissions
3. Clear browser cache and cookies

### Diagnostic Tools

1. **Browser Console** - Check for JavaScript errors
2. **Network Tab** - Monitor API requests
3. **Database Queries** - Verify user data in profiles table
4. **Supabase Dashboard** - Check auth logs and user management

## Best Practices

### For Developers

1. Always validate authentication on both client and server
2. Use the provided helper functions for role checking
3. Implement proper error handling for all auth operations
4. Test all authentication flows regularly
5. Keep dependencies updated

### For Administrators

1. Monitor authentication logs for suspicious activity
2. Regularly review user roles and permissions
3. Ensure OAuth providers are properly configured
4. Keep backup admin accounts available
5. Educate users on password security

### For Users

1. Use strong, unique passwords
2. Enable two-factor authentication if available
3. Keep software updated
4. Be cautious of phishing attempts
5. Report suspicious activity immediately

## Future Enhancements

### Planned Improvements

1. **Two-Factor Authentication** - Add 2FA support for enhanced security
2. **Passwordless Login** - Implement magic link authentication
3. **Advanced Analytics** - Detailed authentication metrics and reporting
4. **Custom OAuth Providers** - Support for additional authentication providers
5. **Session Management** - User-facing session management interface
6. **Security Questions** - Additional account recovery options

## Support

For authentication-related issues:

1. Check the browser console for error messages
2. Verify network connectivity
3. Ensure environment variables are correctly configured
4. Review Supabase Auth settings
5. Consult the Supabase documentation for detailed information

The authentication system is designed to be secure, user-friendly, and extensible, providing a solid foundation for user management in the OCEM Sports Hub application.
