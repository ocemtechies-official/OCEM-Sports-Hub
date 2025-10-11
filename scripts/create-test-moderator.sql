-- Quick script to create a test moderator
-- Replace 'your-email@example.com' with an actual user email from your profiles table

-- First, check what users exist
SELECT id, email, full_name, role 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Example: Make a user a moderator (uncomment and replace email)
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   assigned_sports = ARRAY['Football', 'Basketball'],
--   assigned_venues = ARRAY['Main Field', 'Court 1'],
--   moderator_notes = 'Test moderator for development'
-- WHERE email = 'your-email@example.com';

-- Check the result
-- SELECT id, email, full_name, role, assigned_sports, assigned_venues
-- FROM public.profiles 
-- WHERE email = 'your-email@example.com';

-- Alternative: Make an existing admin a moderator too (for testing)
-- UPDATE public.profiles 
-- SET role = 'moderator'
-- WHERE role = 'admin' 
-- LIMIT 1;
