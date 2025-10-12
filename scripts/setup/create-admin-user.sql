-- Method to create admin user in Supabase
-- Run this SQL in your Supabase SQL Editor after signing up normally

-- 1. First, sign up as a regular user through the app
-- 2. Then run this query, replacing 'your-email@example.com' with your actual email:

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Alternative: If you know your user ID, you can use that instead:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-uuid-here';

-- To verify the change:
SELECT id, email, full_name, role FROM public.profiles WHERE role = 'admin';