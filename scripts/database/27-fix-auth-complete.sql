-- ==========================================
-- OCEM Sports Hub - Complete Authentication Fix
-- ==========================================
-- This script creates the correct RLS policies and ensures all auth functions work
-- Run this AFTER running script 26-cleanup-conflicting-policies.sql
-- 
-- IMPORTANT: Run this while logged in as the user experiencing issues
-- User ID from logs: 717c1e76-6020-4a4c-a9e6-d0f1c5a8eb23

BEGIN;

-- ==========================================
-- STEP 1: ENSURE ALL HELPER FUNCTIONS EXIST
-- ==========================================

-- Create or replace the is_admin_user function (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role directly from profiles table without triggering RLS
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false
    RETURN FALSE;
END;
$$;

-- Create or replace the is_moderator_user function
CREATE OR REPLACE FUNCTION public.is_moderator_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN user_role IN ('moderator', 'admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Create or replace the get_user_role_safe function
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN COALESCE(user_role, 'viewer');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'viewer';
END;
$$;

-- Create or replace the is_admin_safe function
CREATE OR REPLACE FUNCTION public.is_admin_safe(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_admin_user(user_id);
END;
$$;

-- Create or replace the is_moderator_safe function
CREATE OR REPLACE FUNCTION public.is_moderator_safe(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_moderator_user(user_id);
END;
$$;

-- Create or replace the get_user_profile function
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at,
    p.last_login,
    (p.deleted_at IS NULL) as is_active
  FROM public.profiles p
  WHERE p.id = user_id AND p.deleted_at IS NULL;
END;
$$;

-- Create or replace the get_user_profile_simple function (THIS IS THE KEY ONE!)
CREATE OR REPLACE FUNCTION public.get_user_profile_simple(user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_data JSONB;
BEGIN
  -- Get profile data directly without triggering RLS
  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'role', p.role,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'last_login', p.last_login,
    'is_active', (p.deleted_at IS NULL)
  ) INTO profile_data
  FROM public.profiles p
  WHERE p.id = user_id AND p.deleted_at IS NULL;
  
  RETURN COALESCE(profile_data, '{}'::JSONB);
EXCEPTION
  WHEN OTHERS THEN
    RETURN '{}'::JSONB;
END;
$$;

-- Create or replace the validate_auth_state function
CREATE OR REPLACE FUNCTION public.validate_auth_state()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
  is_valid BOOLEAN;
  result JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'role', 'anonymous',
      'valid', false
    );
  END IF;
  
  user_role := public.get_user_role_safe(current_user_id);
  
  is_valid := EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = current_user_id AND deleted_at IS NULL
  );
  
  result := jsonb_build_object(
    'authenticated', true,
    'user_id', current_user_id,
    'role', user_role,
    'valid', is_valid,
    'is_admin', user_role = 'admin',
    'is_moderator', user_role IN ('moderator', 'admin'),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$;

-- ==========================================
-- STEP 2: GRANT PERMISSIONS TO FUNCTIONS
-- ==========================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_auth_state() TO authenticated;

-- ==========================================
-- STEP 3: CREATE CORRECT RLS POLICIES
-- ==========================================

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Allow everyone to view non-deleted profiles
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (deleted_at IS NULL);

-- 2. INSERT Policy: Allow authenticated users to insert their own profile
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id AND 
    deleted_at IS NULL
  );

-- 3. UPDATE Policy: Users can update their own profile, admins can update any
-- This uses the helper function to avoid recursion
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (
    deleted_at IS NULL AND (
      auth.uid() = id OR 
      public.is_admin_user(auth.uid())
    )
  )
  WITH CHECK (
    deleted_at IS NULL AND (
      auth.uid() = id OR 
      public.is_admin_user(auth.uid())
    )
  );

-- 4. DELETE Policy: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy"
  ON public.profiles FOR DELETE
  USING (
    deleted_at IS NULL AND 
    public.is_admin_user(auth.uid())
  );

-- ==========================================
-- STEP 4: CREATE PROFILE FOR CURRENT USER IF MISSING (OPTIONAL)
-- ==========================================

-- Only try to create profile if user is authenticated
DO $$
DECLARE
  user_exists BOOLEAN;
  user_email TEXT;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Only proceed if user is authenticated
  IF current_user_id IS NOT NULL THEN
    -- Check if user has a profile
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = current_user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Get user email
      user_email := auth.email();
      
      -- Create a basic profile
      INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        created_at,
        updated_at
      ) VALUES (
        current_user_id,
        user_email,
        user_email, -- Use email as full_name if no metadata available
        'viewer', -- Default role
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Profile created for user: %', current_user_id;
    ELSE
      RAISE NOTICE 'Profile already exists for user: %', current_user_id;
    END IF;
  ELSE
    RAISE NOTICE 'No authenticated user - skipping profile creation';
  END IF;
END $$;

-- ==========================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_deleted 
  ON public.profiles(role, deleted_at) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_id_deleted 
  ON public.profiles(id, deleted_at) 
  WHERE deleted_at IS NULL;

-- ==========================================
-- STEP 6: TEST ALL FUNCTIONS
-- ==========================================

-- Test that all functions work
SELECT 
  'Function Test' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      CASE 
        WHEN public.get_user_profile_simple(auth.uid()) != '{}'::JSONB THEN 'SUCCESS'
        ELSE 'FAILED'
      END
    ELSE 'SKIPPED: User not authenticated'
  END as profile_function_test,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN public.get_user_role_safe(auth.uid())
    ELSE 'Not authenticated'
  END as user_role,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN public.is_admin_safe(auth.uid())
    ELSE false
  END as is_admin;

-- ==========================================
-- STEP 7: VERIFY POLICIES ARE CORRECT
-- ==========================================

-- Check that we have the correct policies
SELECT 
  'Policy Verification' as test_name,
  policyname,
  cmd,
  CASE 
    WHEN policyname IN ('profiles_select_policy', 'profiles_insert_policy', 'profiles_update_policy', 'profiles_delete_policy') 
    THEN 'CORRECT'
    ELSE 'UNEXPECTED'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ==========================================
-- STEP 8: TEST PROFILE ACCESS
-- ==========================================

-- Test that we can access the profile without hanging
SELECT 
  'Profile Access Test' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      CASE 
        WHEN EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL) 
        THEN 'SUCCESS: Profile accessible'
        ELSE 'FAILED: Profile not accessible'
      END
    ELSE 'SKIPPED: User not authenticated'
  END as direct_access_result;

-- Test the RPC function (this should not hang now)
SELECT 
  'RPC Function Test' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      CASE 
        WHEN public.get_user_profile_simple(auth.uid()) != '{}'::JSONB 
        THEN 'SUCCESS: RPC function works'
        ELSE 'FAILED: RPC function returns empty'
      END
    ELSE 'SKIPPED: User not authenticated'
  END as rpc_access_result;

COMMIT;

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

SELECT 
  'Fix Complete' as test_name,
  'Authentication system should now work properly' as status,
  'Try logging in to your application again' as next_step,
  'If issues persist, check the browser console for any remaining errors' as note;
