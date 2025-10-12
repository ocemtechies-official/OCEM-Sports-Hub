-- ==========================================
-- OCEM Sports Hub - Diagnose Authentication Issues
-- ==========================================
-- This script diagnoses the current state of the authentication system
-- Run this in your Supabase SQL Editor while logged in
-- 
-- IMPORTANT: Run this while logged in as the user experiencing issues
-- User ID from logs: 717c1e76-6020-4a4c-a9e6-d0f1c5a8eb23

-- ==========================================
-- STEP 1: CHECK CURRENT USER AUTHENTICATION
-- ==========================================

SELECT 
  'Current User Check' as test_name,
  auth.uid() as current_user_id,
  auth.email() as current_user_email,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User is authenticated'
    ELSE 'User is NOT authenticated'
  END as auth_status;

-- ==========================================
-- STEP 2: CHECK IF USER HAS A PROFILE
-- ==========================================

SELECT 
  'Profile Existence Check' as test_name,
  auth.uid() as user_id,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN 'Profile exists'
    ELSE 'Profile does NOT exist'
  END as profile_status,
  (SELECT COUNT(*) FROM public.profiles WHERE id = auth.uid()) as profile_count;

-- ==========================================
-- STEP 3: CHECK PROFILE DATA (if exists)
-- ==========================================

SELECT 
  'Profile Data Check' as test_name,
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at,
  deleted_at,
  CASE 
    WHEN deleted_at IS NULL THEN 'Active'
    ELSE 'Deleted'
  END as status
FROM public.profiles 
WHERE id = auth.uid();

-- ==========================================
-- STEP 4: CHECK ALL RLS POLICIES ON PROFILES
-- ==========================================

SELECT 
  'RLS Policies Check' as test_name,
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
  END as has_with_check_clause,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- STEP 5: CHECK FOR DUPLICATE/CONFLICTING POLICIES
-- ==========================================

SELECT 
  'Duplicate Policies Check' as test_name,
  policyname,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 1 THEN 'DUPLICATE POLICY FOUND'
    ELSE 'OK'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- ==========================================
-- STEP 6: CHECK FOR RECURSIVE QUERIES IN POLICIES
-- ==========================================

SELECT 
  'Recursive Query Check' as test_name,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%profiles%' OR with_check LIKE '%profiles%' THEN 'POTENTIAL RECURSION'
    ELSE 'OK'
  END as recursion_risk,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
  AND (qual LIKE '%profiles%' OR with_check LIKE '%profiles%');

-- ==========================================
-- STEP 7: CHECK AUTHENTICATION HELPER FUNCTIONS
-- ==========================================

SELECT 
  'Helper Functions Check' as test_name,
  routine_name,
  routine_type,
  data_type,
  CASE 
    WHEN routine_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
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
-- STEP 8: TEST HELPER FUNCTIONS (if user is authenticated)
-- ==========================================

SELECT 
  'Helper Functions Test' as test_name,
  public.get_user_role_safe(auth.uid()) as user_role,
  public.is_admin_safe(auth.uid()) as is_admin,
  public.is_moderator_safe(auth.uid()) as is_moderator;

-- ==========================================
-- STEP 9: TEST PROFILE ACCESS METHODS
-- ==========================================

-- Test 1: Direct table access
SELECT 
  'Direct Table Access Test' as test_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL) 
    THEN 'SUCCESS'
    ELSE 'FAILED'
  END as direct_access_result;

-- Test 2: RPC function access (this might hang if there are issues)
SELECT 
  'RPC Function Test' as test_name,
  CASE 
    WHEN public.get_user_profile_simple(auth.uid()) != '{}'::JSONB 
    THEN 'SUCCESS'
    ELSE 'FAILED'
  END as rpc_access_result,
  public.get_user_profile_simple(auth.uid()) as profile_data;

-- ==========================================
-- STEP 10: TEST AUTHENTICATION STATE
-- ==========================================

SELECT 
  'Auth State Test' as test_name,
  public.validate_auth_state() as auth_state;

-- ==========================================
-- STEP 11: CHECK FOR INFINITE RECURSION
-- ==========================================

-- This test will help identify if there's infinite recursion
-- If this query hangs, there's likely a recursion issue
SELECT 
  'Recursion Test' as test_name,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND deleted_at IS NULL
    ) THEN 'Profiles accessible without recursion'
    ELSE 'Profiles not accessible - possible recursion'
  END as recursion_test_result;

-- ==========================================
-- STEP 12: CHECK TABLE PERMISSIONS
-- ==========================================

SELECT 
  'Table Permissions Check' as test_name,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN 'RLS is ENABLED'
    ELSE 'RLS is DISABLED'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'profiles';

-- ==========================================
-- STEP 13: SUMMARY AND RECOMMENDATIONS
-- ==========================================

SELECT 
  'Diagnosis Summary' as test_name,
  'Check the results above for any issues' as note,
  'Look for: duplicate policies, recursive queries, missing functions, missing profile' as things_to_check,
  'If profile is missing, run script 24-create-user-profile.sql' as recommendation_1,
  'If there are duplicate policies, run script 26-cleanup-conflicting-policies.sql' as recommendation_2,
  'If functions are missing, run script 27-fix-auth-complete.sql' as recommendation_3;
