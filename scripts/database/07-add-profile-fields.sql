-- Migration script to add new profile fields for enhanced profile and settings functionality
-- This script adds new columns to the profiles table without affecting existing data

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_semester ON public.profiles(semester);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_visibility ON public.profiles(profile_visibility);

-- Update the updated_at timestamp for existing records to ensure consistency
UPDATE public.profiles 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON public.profiles 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;