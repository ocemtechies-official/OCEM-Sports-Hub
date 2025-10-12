-- ==========================================
-- OCEM Sports Hub - Debug Authentication Issues
-- ==========================================
-- This script helps debug authentication issues
-- Run this in your Supabase SQL Editor

-- ==========================================
-- CHECK IF USER HAS A PROFILE
-- ==========================================

-- Check if the current user has a profile
SELECT 
  'Profile Check' as test_name,
  auth.uid() as user_id,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN 'Profile exists'
    ELSE 'Profile does not exist'
  END as profile_status,
  (SELECT COUNT(*) FROM public.profiles WHERE id = auth.uid()) as profile_count;

-- ==========================================
-- CHECK PROFILE DATA
-- ==========================================

-- Get the current user's profile data
SELECT 
  'Profile Data' as test_name,
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at,
  deleted_at
FROM public.profiles 
WHERE id = auth.uid();

-- ==========================================
-- TEST RPC FUNCTIONS
-- ==========================================

-- Test the get_user_profile_simple function
SELECT 
  'RPC Function Test' as test_name,
  public.get_user_profile_simple(auth.uid()) as profile_data;

-- ==========================================
-- CHECK AUTHENTICATION STATE
-- ==========================================

-- Test the validate_auth_state function
SELECT 
  'Auth State Test' as test_name,
  public.validate_auth_state() as auth_state;

-- ==========================================
-- CHECK RLS POLICIES
-- ==========================================

-- Check if RLS is enabled and what policies exist
SELECT 
  'RLS Status' as test_name,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check policies on profiles table
SELECT 
  'RLS Policies' as test_name,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_using_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- CHECK FOR INFINITE RECURSION
-- ==========================================

-- Test if we can access profiles without recursion
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
-- CHECK USER PERMISSIONS
-- ==========================================

-- Check if the current user has the right permissions
SELECT 
  'Permission Check' as test_name,
  auth.uid() as user_id,
  auth.role() as auth_role,
  public.get_user_role_safe(auth.uid()) as user_role,
  public.is_admin_safe(auth.uid()) as is_admin,
  public.is_moderator_safe(auth.uid()) as is_moderator;

-- ==========================================
-- SUMMARY
-- ==========================================

-- This will give you a summary of all checks
SELECT 
  'Debug Summary' as test_name,
  'Check the results above for any issues' as note,
  'If profile does not exist, you may need to create one' as suggestion;
