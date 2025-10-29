-- Simple test script to check moderator system setup
-- Compatible with all PostgreSQL versions

-- Check if profiles table has moderator columns
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        AND column_name = 'assigned_sports'
    ) THEN '✅ assigned_sports column exists'
    ELSE '❌ assigned_sports column missing'
  END as assigned_sports_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
        AND table_schema = 'public'
        AND column_name = 'assigned_venues'
    ) THEN '✅ assigned_venues column exists'
    ELSE '❌ assigned_venues column missing'
  END as assigned_venues_status;

-- Check if fixtures table has new columns
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fixtures' 
        AND table_schema = 'public'
        AND column_name = 'updated_by'
    ) THEN '✅ updated_by column exists'
    ELSE '❌ updated_by column missing'
  END as updated_by_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fixtures' 
        AND table_schema = 'public'
        AND column_name = 'version'
    ) THEN '✅ version column exists'
    ELSE '❌ version column missing'
  END as version_status;

-- Check if match_updates table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'match_updates'
    ) THEN '✅ match_updates table exists'
    ELSE '❌ match_updates table missing'
  END as match_updates_status;

-- Check if RPC function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'rpc_update_fixture_score'
    ) THEN '✅ rpc_update_fixture_score function exists'
    ELSE '❌ rpc_update_fixture_score function missing'
  END as rpc_function_status;

-- Check current role constraint
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conrelid = 'public.profiles'::regclass 
        AND contype = 'c'
        AND conname = 'profiles_role_check'
    ) THEN '✅ profiles_role_check constraint exists'
    ELSE '❌ profiles_role_check constraint missing'
  END as role_constraint_status;

-- Summary
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'assigned_sports')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fixtures' AND column_name = 'updated_by')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_updates')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'rpc_update_fixture_score')
    THEN '🎉 MODERATOR SYSTEM IS FULLY SET UP!'
    ELSE '⚠️  MODERATOR SYSTEM IS NOT COMPLETE - Run scripts/10-moderator-system.sql and scripts/11-moderator-rls-policies.sql'
  END as overall_status;
