-- ==========================================
-- OCEM Sports Hub - Fix Authentication Functions
-- ==========================================
-- This script ensures all authentication functions exist and work properly
-- Run this in your Supabase SQL Editor

BEGIN;

-- ==========================================
-- ENSURE ALL HELPER FUNCTIONS EXIST
-- ==========================================

-- Create or replace the is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
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
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
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

-- ==========================================
-- CREATE SAFE AUTHENTICATION FUNCTIONS
-- ==========================================

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

-- Create a simpler version that returns a single record
CREATE OR REPLACE FUNCTION public.get_user_profile_simple(user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_data JSONB;
BEGIN
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

-- Create a function to validate authentication state
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
-- GRANT PERMISSIONS
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
-- CREATE TESTING FUNCTIONS
-- ==========================================

-- Function to test all authentication functions
CREATE OR REPLACE FUNCTION public.test_auth_functions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  test_results JSONB;
BEGIN
  current_user_id := auth.uid();
  
  test_results := jsonb_build_object(
    'user_id', current_user_id,
    'is_admin', public.is_admin_safe(current_user_id),
    'is_moderator', public.is_moderator_safe(current_user_id),
    'user_role', public.get_user_role_safe(current_user_id),
    'profile_simple', public.get_user_profile_simple(current_user_id),
    'auth_state', public.validate_auth_state(),
    'timestamp', NOW()
  );
  
  RETURN test_results;
END;
$$;

GRANT EXECUTE ON FUNCTION public.test_auth_functions() TO authenticated;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Test the functions
-- SELECT * FROM public.test_auth_functions();
-- SELECT public.validate_auth_state();
