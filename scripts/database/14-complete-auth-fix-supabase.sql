-- ==========================================
-- OCEM Sports Hub - Complete Authentication Fix for Supabase
-- ==========================================
-- This script fixes the infinite recursion issue in profiles RLS policies
-- and enhances the authentication system
-- 
-- Run this entire script in your Supabase SQL Editor

BEGIN;

-- ==========================================
-- DROP ALL EXISTING PROFILES POLICIES
-- ==========================================

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "users can update own profile" ON public.profiles;

-- ==========================================
-- CREATE HELPER FUNCTIONS FIRST (BEFORE POLICIES)
-- ==========================================

-- Create a function to check if a user is admin without causing RLS recursion
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
  -- by using SECURITY DEFINER and bypassing RLS
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

-- Create a function to check if a user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_user(user_id UUID)
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
  
  RETURN user_role IN ('moderator', 'admin');
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_moderator_user(UUID) TO authenticated;

-- ==========================================
-- CREATE SIMPLIFIED PROFILES POLICIES
-- ==========================================

-- 1. SELECT Policy: Allow everyone to view profiles (public data)
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
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  USING (
    deleted_at IS NULL AND (
      auth.uid() = id OR 
      -- Use a function to check admin role to avoid circular dependency
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
-- UPDATE OTHER TABLES TO USE HELPER FUNCTIONS
-- ==========================================

-- Update sports policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage sports" ON public.sports;
CREATE POLICY "sports_admin_policy"
  ON public.sports FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update teams policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage teams" ON public.teams;
CREATE POLICY "teams_admin_policy"
  ON public.teams FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update players policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage players" ON public.players;
CREATE POLICY "players_admin_policy"
  ON public.players FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update fixtures policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage fixtures" ON public.fixtures;
DROP POLICY IF EXISTS "Admins can manage fixtures" ON public.fixtures;
CREATE POLICY "fixtures_admin_policy"
  ON public.fixtures FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update quizzes policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
CREATE POLICY "quizzes_admin_policy"
  ON public.quizzes FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update quiz questions policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage quiz questions" ON public.quiz_questions;
CREATE POLICY "quiz_questions_admin_policy"
  ON public.quiz_questions FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Update chess games policies to use helper function
DROP POLICY IF EXISTS "Players can update their games" ON public.chess_games;
CREATE POLICY "chess_games_update_policy"
  ON public.chess_games FOR UPDATE
  USING (
    auth.uid() = white_player_id OR 
    auth.uid() = black_player_id OR 
    public.is_admin_user(auth.uid())
  );

-- Update leaderboards policies to use helper function
DROP POLICY IF EXISTS "Only admins can manage leaderboards" ON public.leaderboards;
CREATE POLICY "leaderboards_admin_policy"
  ON public.leaderboards FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- ==========================================
-- CREATE SAFE AUTHENTICATION FUNCTIONS
-- ==========================================

-- Function to safely check if user is admin (for middleware)
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

-- Function to safely check if user is moderator (for middleware)
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

-- Function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- This function bypasses RLS to avoid recursion
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id AND deleted_at IS NULL;
  
  RETURN COALESCE(user_role, 'viewer');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'viewer';
END;
$$;

-- Function to get user profile safely
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

-- Function to validate authentication state
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
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', null,
      'role', 'anonymous',
      'valid', false
    );
  END IF;
  
  -- Get user role safely
  user_role := public.get_user_role_safe(current_user_id);
  
  -- Check if user is valid
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
GRANT EXECUTE ON FUNCTION public.is_admin_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_auth_state() TO authenticated;

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Create indexes to improve performance of the helper functions
CREATE INDEX IF NOT EXISTS idx_profiles_role_deleted 
  ON public.profiles(role, deleted_at) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_id_deleted 
  ON public.profiles(id, deleted_at) 
  WHERE deleted_at IS NULL;

-- ==========================================
-- CREATE TESTING FUNCTIONS
-- ==========================================

-- Function to test the policies
CREATE OR REPLACE FUNCTION public.test_profiles_policies()
RETURNS TABLE (
  policy_name TEXT,
  policy_type TEXT,
  policy_definition TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pol.polname::TEXT as policy_name,
    pol.polcmd::TEXT as policy_type,
    pol.polqual::TEXT as policy_definition
  FROM pg_policy pol
  JOIN pg_class cls ON pol.polrelid = cls.oid
  WHERE cls.relname = 'profiles'
  ORDER BY pol.polname;
END;
$$;

-- Function to test the complete authentication system
CREATE OR REPLACE FUNCTION public.test_auth_system()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_results JSONB;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  test_results := jsonb_build_object(
    'user_id', current_user_id,
    'auth_state', public.validate_auth_state(),
    'is_admin', public.is_admin_safe(current_user_id),
    'is_moderator', public.is_moderator_safe(current_user_id),
    'user_role', public.get_user_role_safe(current_user_id),
    'timestamp', NOW()
  );
  
  RETURN test_results;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.test_profiles_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_auth_system() TO authenticated;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES (Optional - run these to test)
-- ==========================================

-- Uncomment these to verify the policies are working correctly
-- SELECT * FROM public.test_profiles_policies();
-- SELECT public.validate_auth_state();
-- SELECT * FROM public.test_auth_system();
