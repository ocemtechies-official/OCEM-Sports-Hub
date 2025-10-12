-- ==========================================
-- OCEM Sports Hub - Cleanup Conflicting RLS Policies
-- ==========================================
-- This script removes all conflicting and duplicate RLS policies
-- that are causing the authentication system to hang
-- 
-- Run this in your Supabase SQL Editor

BEGIN;

-- ==========================================
-- STEP 1: DROP ALL EXISTING PROFILES POLICIES
-- ==========================================

-- Drop all policies that might be causing conflicts
-- These come from various scripts (02, 11, 14, 18)

-- From script 02 (enable-rls.sql)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- From script 11 (moderator-rls-policies.sql) - THESE CAUSE RECURSION!
DROP POLICY IF EXISTS "admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "users can update own profile" ON public.profiles;

-- From script 14 (complete-auth-fix-supabase.sql)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Drop any other potential conflicting policies
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- ==========================================
-- STEP 2: DROP PROBLEMATIC POLICIES FROM OTHER TABLES
-- ==========================================

-- Drop policies that reference profiles table and might cause recursion
-- These are from script 11 (moderator-rls-policies.sql)

-- Drop the problematic moderator policies that query profiles table
DROP POLICY IF EXISTS "admins can view all match updates" ON public.match_updates;
DROP POLICY IF EXISTS "moderators can view own match updates" ON public.match_updates;
DROP POLICY IF EXISTS "users can view match updates for visible fixtures" ON public.match_updates;
DROP POLICY IF EXISTS "system can insert match updates" ON public.match_updates;
DROP POLICY IF EXISTS "admins can manage fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "moderators can update fixtures via RPC" ON public.fixtures;

-- ==========================================
-- STEP 3: VERIFY ALL POLICIES ARE DROPPED
-- ==========================================

-- Check that all profiles policies are gone
SELECT 
  'Cleanup Verification' as test_name,
  COUNT(*) as remaining_policies,
  CASE 
    WHEN COUNT(*) = 0 THEN 'SUCCESS: All profiles policies removed'
    ELSE 'WARNING: Some policies still exist'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles';

-- ==========================================
-- STEP 4: CHECK FOR ANY REMAINING RECURSIVE POLICIES
-- ==========================================

-- Check if any remaining policies have recursive queries
SELECT 
  'Recursive Policy Check' as test_name,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%profiles%' OR with_check LIKE '%profiles%' THEN 'STILL HAS RECURSION'
    ELSE 'OK'
  END as recursion_risk
FROM pg_policies 
WHERE tablename = 'profiles'
  AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%');

-- ==========================================
-- STEP 5: DISABLE RLS TEMPORARILY (OPTIONAL)
-- ==========================================

-- Uncomment this if you want to completely disable RLS temporarily
-- This will allow the auth system to work while we fix the policies
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 6: VERIFY TABLE ACCESS WORKS
-- ==========================================

-- Test that we can access the profiles table without recursion
-- This should work now that problematic policies are removed
SELECT 
  'Table Access Test' as test_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE deleted_at IS NULL) 
    THEN 'SUCCESS: Can access profiles table'
    ELSE 'FAILED: Cannot access profiles table'
  END as access_result,
  COUNT(*) as total_profiles
FROM public.profiles 
WHERE deleted_at IS NULL;

-- ==========================================
-- STEP 7: CHECK HELPER FUNCTIONS STILL WORK
-- ==========================================

-- Test that our helper functions still work
-- These should not be affected by policy cleanup
SELECT 
  'Helper Functions Test' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      CASE 
        WHEN public.get_user_role_safe(auth.uid()) IS NOT NULL THEN 'SUCCESS: Helper functions work'
        ELSE 'FAILED: Helper functions not working'
      END
    ELSE 'SKIPPED: User not authenticated'
  END as functions_result,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN public.get_user_role_safe(auth.uid())
    ELSE 'Not authenticated'
  END as user_role;

COMMIT;

-- ==========================================
-- SUMMARY
-- ==========================================

SELECT 
  'Cleanup Complete' as test_name,
  'All conflicting policies have been removed' as status,
  'Next step: Run script 27-fix-auth-complete.sql to create correct policies' as next_step,
  'The auth system should work better now, but may need proper policies' as note;
