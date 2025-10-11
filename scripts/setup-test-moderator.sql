-- Setup script to create a test moderator
-- Run this after running the main migration scripts

-- First, check if the moderator system is set up
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'assigned_sports')
    THEN 'Moderator system is ready'
    ELSE 'Please run scripts/10-moderator-system.sql first'
  END as setup_status;

-- Create a test moderator (replace with actual user ID)
-- You can get a user ID from the profiles table
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   assigned_sports = ARRAY['Football', 'Basketball'],
--   assigned_venues = ARRAY['Main Field', 'Court 1'],
--   moderator_notes = 'Test moderator for development'
-- WHERE email = 'your-test-email@example.com';

-- Example: Update an existing user to moderator role
-- UPDATE public.profiles 
-- SET role = 'moderator'
-- WHERE id = 'your-user-id-here';

-- Check current users and their roles
SELECT id, email, full_name, role, assigned_sports, assigned_venues
FROM public.profiles 
WHERE role IN ('admin', 'moderator')
ORDER BY role, email;
