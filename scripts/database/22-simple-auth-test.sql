-- ==========================================
-- OCEM Sports Hub - Simple Authentication Test
-- ==========================================
-- This script tests the basic authentication functions that exist from script 18
-- Run this in your Supabase SQL Editor to verify everything is working

-- ==========================================
-- TEST 1: CHECK IF CORE FUNCTIONS EXIST
-- ==========================================

SELECT 
  'Function Check' as test_name,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'is_admin_user',
    'is_moderator_user', 
    'get_user_role_safe',
    'is_admin_safe',
    'is_moderator_safe',
    'get_user_profile',
    'get_user_profile_simple',
    'validate_auth_state'
  )
ORDER BY routine_name;

-- ==========================================
-- TEST 2: TEST AUTHENTICATION STATE
-- ==========================================

-- This will show your current authentication state
SELECT 
  'Authentication State' as test_name,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User is authenticated'
    ELSE 'User is not authenticated'
  END as auth_status;

-- ==========================================
-- TEST 3: TEST USER ROLE CHECKING
-- ==========================================

-- This will show your user role and permissions
SELECT 
  'User Role Check' as test_name,
  auth.uid() as user_id,
  public.get_user_role_safe(auth.uid()) as user_role,
  public.is_admin_safe(auth.uid()) as is_admin,
  public.is_moderator_safe(auth.uid()) as is_moderator;

-- ==========================================
-- TEST 4: TEST PROFILE ACCESS
-- ==========================================

-- This will show your profile data
SELECT 
  'Profile Access' as test_name,
  CASE 
    WHEN public.get_user_profile_simple(auth.uid()) != '{}'::JSONB THEN 'Profile accessible'
    ELSE 'Profile not accessible'
  END as profile_status,
  public.get_user_profile_simple(auth.uid()) as profile_data;

-- ==========================================
-- TEST 5: TEST AUTHENTICATION STATE FUNCTION
-- ==========================================

-- This will show the complete authentication state
SELECT 
  'Complete Auth State' as test_name,
  public.validate_auth_state() as auth_state;

-- ==========================================
-- TEST 6: CHECK PROFILES TABLE ACCESS
-- ==========================================

-- This will show if the profiles table is accessible
SELECT 
  'Profiles Table Access' as test_name,
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_profiles
FROM public.profiles;

-- ==========================================
-- TEST 7: CHECK RLS POLICIES
-- ==========================================

-- This will show the current RLS policies on profiles table
SELECT 
  'RLS Policies' as test_name,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as has_with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- TEST 8: VERIFY NO INFINITE RECURSION
-- ==========================================

-- This will test if we can access profiles without recursion
SELECT 
  'Recursion Test' as test_name,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND deleted_at IS NULL
    ) THEN 'Profiles accessible without recursion'
    ELSE 'Profiles not accessible'
  END as recursion_test_result;

-- ==========================================
-- SUMMARY
-- ==========================================

-- This will give you a summary of all tests
SELECT 
  'Test Summary' as test_name,
  'If you see this, the basic functions are working' as status,
  'Check the results above for any errors' as note;
