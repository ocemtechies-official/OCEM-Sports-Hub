-- ==========================================
-- OCEM Sports Hub - Create User Profile
-- ==========================================
-- This script creates a profile for the current user if it doesn't exist
-- Run this in your Supabase SQL Editor while logged in

-- ==========================================
-- CHECK IF USER HAS A PROFILE
-- ==========================================

-- First, check if the current user has a profile
SELECT 
  'Current User Check' as test_name,
  auth.uid() as user_id,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN 'Profile exists'
    ELSE 'Profile does not exist - will create one'
  END as profile_status;

-- ==========================================
-- CREATE PROFILE IF IT DOESN'T EXIST
-- ==========================================

-- Create a profile for the current user if it doesn't exist
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  auth.uid(),
  auth.email(),
  COALESCE(auth.raw_user_meta_data->>'full_name', auth.email()),
  'viewer', -- Default role
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid()
);

-- ==========================================
-- VERIFY PROFILE CREATION
-- ==========================================

-- Check if the profile was created successfully
SELECT 
  'Profile Creation Result' as test_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN 'Profile created successfully'
    ELSE 'Profile creation failed'
  END as result;

-- ==========================================
-- SHOW PROFILE DATA
-- ==========================================

-- Show the created profile data
SELECT 
  'Profile Data' as test_name,
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
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
-- TEST AUTHENTICATION STATE
-- ==========================================

-- Test the validate_auth_state function
SELECT 
  'Auth State Test' as test_name,
  public.validate_auth_state() as auth_state;

-- ==========================================
-- SUMMARY
-- ==========================================

-- This will give you a summary
SELECT 
  'Profile Creation Summary' as test_name,
  'Profile should now exist and be accessible' as status,
  'Try logging in to your application again' as next_step;
