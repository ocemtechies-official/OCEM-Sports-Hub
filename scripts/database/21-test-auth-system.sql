-- ==========================================
-- OCEM Sports Hub - Test Authentication System
-- ==========================================
-- This script tests all authentication functions to ensure they work properly
-- Run this in your Supabase SQL Editor to verify everything is working

-- ==========================================
-- TEST ALL AUTHENTICATION FUNCTIONS
-- ==========================================

-- Test 1: Check if all functions exist
SELECT 
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

-- Test 2: Test authentication state (run this while logged in)
SELECT public.validate_auth_state();

-- Test 3: Test all auth functions (run this while logged in)
SELECT public.test_auth_functions();

-- Test 4: Check profiles policies
SELECT * FROM public.test_profiles_policies();

-- Test 5: Test user role checking (run this while logged in)
SELECT 
  auth.uid() as current_user_id,
  public.get_user_role_safe(auth.uid()) as user_role,
  public.is_admin_safe(auth.uid()) as is_admin,
  public.is_moderator_safe(auth.uid()) as is_moderator;

-- Test 6: Test profile fetching (run this while logged in)
SELECT public.get_user_profile_simple(auth.uid());

-- Test 7: Check if profiles table is accessible
SELECT COUNT(*) as total_profiles FROM public.profiles WHERE deleted_at IS NULL;

-- Test 8: Check RLS policies on profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- If you're logged in, these should return your user data
-- If you're not logged in, they should return null or false values

-- Check current authentication state
SELECT 
  'Authentication Test' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User is authenticated'
    ELSE 'User is not authenticated'
  END as auth_status,
  auth.uid() as user_id,
  public.get_user_role_safe(auth.uid()) as user_role;

-- Test profile access
SELECT 
  'Profile Access Test' as test_name,
  CASE 
    WHEN public.get_user_profile_simple(auth.uid()) != '{}'::JSONB THEN 'Profile accessible'
    ELSE 'Profile not accessible'
  END as profile_status;

-- Test admin/moderator checking
SELECT 
  'Permission Test' as test_name,
  public.is_admin_safe(auth.uid()) as is_admin,
  public.is_moderator_safe(auth.uid()) as is_moderator,
  public.get_user_role_safe(auth.uid()) as user_role;
