# Authentication System Fix Guide

## Problem Summary

The authentication system was stuck in a loading state due to:
1. **Profile fetch timeout**: `get_user_profile_simple` RPC call hanging for 10+ seconds
2. **Conflicting RLS policies**: Multiple database scripts created duplicate/conflicting policies
3. **Infinite recursion**: Script 11 had recursive subqueries in RLS policies
4. **Missing profiles**: Some users didn't have profiles created

## Solution Overview

We've created three scripts to fix the authentication system:

1. **Script 25**: Diagnose the current state
2. **Script 26**: Clean up conflicting policies  
3. **Script 27**: Create correct policies and functions

## Step-by-Step Fix Instructions

### Step 1: Run Diagnostic Script

1. **Log into your Supabase dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the contents of `scripts/database/25-diagnose-auth.sql`**
4. **Run the script while logged in as the affected user**

This will show you:
- Current authentication state
- Whether the user has a profile
- All existing RLS policies
- Which functions exist
- Any recursive policy issues

### Step 2: Clean Up Conflicting Policies

1. **Copy and paste the contents of `scripts/database/26-cleanup-conflicting-policies.sql`**
2. **Run the script**

This will:
- Remove all duplicate/conflicting policies
- Remove policies with recursive queries
- Verify the cleanup worked

### Step 3: Apply the Complete Fix

1. **Copy and paste the contents of `scripts/database/27-fix-auth-complete.sql`**
2. **Run the script while logged in as the affected user**

This will:
- Create all necessary helper functions
- Create correct RLS policies (no recursion)
- Create a profile for the current user if missing
- Test all functions

### Step 4: Test the Application

1. **Refresh your application**
2. **Try logging in**
3. **Check the browser console for any remaining errors**

## What the Fix Does

### Database Changes

1. **Removes problematic policies** that caused infinite recursion
2. **Creates correct RLS policies** using SECURITY DEFINER functions
3. **Ensures all auth helper functions exist** and work properly
4. **Creates missing user profiles** automatically

### Frontend Changes

1. **Reduces timeout** from 10s to 5s for faster feedback
2. **Improves error handling** with better fallbacks
3. **Auto-creates profiles** if they don't exist
4. **Better logging** to identify issues

## Key Functions Created/Fixed

- `get_user_profile_simple(UUID)` - Returns user profile as JSONB
- `is_admin_user(UUID)` - Checks if user is admin (no recursion)
- `is_moderator_user(UUID)` - Checks if user is moderator (no recursion)
- `get_user_role_safe(UUID)` - Gets user role safely
- `validate_auth_state()` - Returns complete auth state

## RLS Policies Created

- `profiles_select_policy` - Allow viewing non-deleted profiles
- `profiles_insert_policy` - Allow users to create their own profile
- `profiles_update_policy` - Allow users to update own profile, admins to update any
- `profiles_delete_policy` - Only admins can delete profiles

## Troubleshooting

### If the issue persists:

1. **Check browser console** for any remaining errors
2. **Run script 25 again** to see if there are still issues
3. **Verify the user has a profile** in the profiles table
4. **Check that all functions exist** and are accessible

### Common Issues:

1. **"Function does not exist"** - Run script 27 again
2. **"Permission denied"** - Check that functions have proper grants
3. **"Profile not found"** - The user profile creation might have failed
4. **Still hanging** - There might be other recursive policies

### Manual Profile Creation:

If a user still doesn't have a profile, you can create one manually:

```sql
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE',
  'user@example.com',
  'User Name',
  'viewer',
  NOW(),
  NOW()
);
```

## Verification Checklist

- [ ] Script 25 runs without errors
- [ ] Script 26 removes all conflicting policies
- [ ] Script 27 creates all functions and policies
- [ ] User has a profile in the database
- [ ] `get_user_profile_simple` returns data quickly
- [ ] Application loads without hanging
- [ ] User can log in and access the app

## Prevention

To avoid this issue in the future:

1. **Always use SECURITY DEFINER functions** in RLS policies
2. **Avoid recursive queries** in policy definitions
3. **Test policies thoroughly** before deploying
4. **Use helper functions** instead of direct table queries in policies
5. **Run diagnostic scripts** when making auth changes

## Files Modified

- `scripts/database/25-diagnose-auth.sql` (new)
- `scripts/database/26-cleanup-conflicting-policies.sql` (new)  
- `scripts/database/27-fix-auth-complete.sql` (new)
- `components/auth/auth-provider.tsx` (updated)
- `docs/AUTH_SYSTEM_FIX_GUIDE.md` (new)

## Support

If you continue to have issues:

1. **Check the browser console** for specific error messages
2. **Run the diagnostic script** to see the current state
3. **Verify all scripts ran successfully** in Supabase
4. **Check that the user exists** in both auth.users and public.profiles tables
