-- Test script to check if moderator system is set up
-- Run this to see what's missing

-- Check if RPC function exists
SELECT EXISTS (
  SELECT FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name = 'rpc_update_fixture_score'
) as rpc_function_exists;

-- Check if match_updates table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'match_updates'
) as match_updates_table_exists;

-- Check if profiles has moderator columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name IN ('assigned_sports', 'assigned_venues', 'moderator_notes')
ORDER BY column_name;

-- Check if fixtures has new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fixtures' 
  AND table_schema = 'public'
  AND column_name IN ('updated_by', 'version')
ORDER BY column_name;

-- Check role constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
  AND contype = 'c'
  AND conname = 'profiles_role_check';
