-- Quick setup script for moderator system
-- Run this to set up a test moderator

-- First, check if the system is ready
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'assigned_sports')
    THEN 'System is ready - you can create moderators'
    ELSE 'Please run scripts/10-moderator-system.sql first'
  END as setup_status;

-- Show current users that could be made moderators
SELECT 
  id, 
  email, 
  full_name, 
  role,
  CASE 
    WHEN role = 'admin' THEN 'Already admin'
    WHEN role = 'moderator' THEN 'Already moderator'
    WHEN role = 'viewer' THEN 'Can be made moderator'
    ELSE 'Unknown role'
  END as can_be_moderator
FROM public.profiles 
ORDER BY role, email;

-- Example: Make a user a moderator (replace with actual email)
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   assigned_sports = ARRAY['Football', 'Basketball'],
--   assigned_venues = ARRAY['Main Field', 'Court 1'],
--   moderator_notes = 'Test moderator for development'
-- WHERE email = 'your-email@example.com';

-- Check if there are any fixtures to moderate
SELECT 
  COUNT(*) as total_fixtures,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_fixtures,
  COUNT(CASE WHEN status = 'live' THEN 1 END) as live_fixtures,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_fixtures
FROM public.fixtures;
