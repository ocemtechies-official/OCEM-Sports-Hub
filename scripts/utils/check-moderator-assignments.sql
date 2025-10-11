-- Script to check and fix moderator assignments
-- Run this to see what's happening with your moderator

-- 1. Check all users and their roles
SELECT 
  id, 
  email, 
  full_name, 
  role,
  assigned_sports,
  assigned_venues,
  moderator_notes
FROM public.profiles 
WHERE role IN ('admin', 'moderator')
ORDER BY role, email;

-- 2. Check if the moderator columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name IN ('assigned_sports', 'assigned_venues', 'moderator_notes')
ORDER BY column_name;

-- 3. Check what sports exist in your database
SELECT id, name FROM public.sports ORDER BY name;

-- 4. Example: Create a test moderator with specific assignments
-- Replace 'your-email@example.com' with an actual email from your profiles table
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   assigned_sports = ARRAY['Football', 'Basketball'], -- Use actual sport names from your database
--   assigned_venues = ARRAY['Main Field', 'Court 1'],
--   moderator_notes = 'Test moderator for development'
-- WHERE email = 'your-email@example.com';

-- 5. Example: Make a moderator with no assignments (should see "No Sports Assigned")
-- UPDATE public.profiles 
-- SET 
--   role = 'moderator',
--   assigned_sports = NULL,
--   assigned_venues = NULL,
--   moderator_notes = 'Test moderator with no assignments'
-- WHERE email = 'your-email@example.com';

-- 6. Check fixtures to see what sports they belong to
SELECT 
  f.id,
  f.scheduled_at,
  f.status,
  s.name as sport_name,
  ta.name as team_a,
  tb.name as team_b
FROM public.fixtures f
JOIN public.sports s ON f.sport_id = s.id
JOIN public.teams ta ON f.team_a_id = ta.id
JOIN public.teams tb ON f.team_b_id = tb.id
ORDER BY f.scheduled_at DESC
LIMIT 10;
