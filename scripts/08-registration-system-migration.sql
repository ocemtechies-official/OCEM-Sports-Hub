-- ==========================================
-- OCEM Sports Hub - Registration System Migration
-- ==========================================
-- This script safely adds registration functionality while preserving existing data
-- Run this script to extend the current database schema for registration system

BEGIN;

-- ==========================================
-- STEP 1: Extend Profiles Table for Student Information
-- ==========================================

-- Add student-specific columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS skill_levels JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_semester ON public.profiles(semester);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);

-- ==========================================
-- STEP 2: Create Individual Registrations Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.individual_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  
  -- Student Information
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  gender TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Registration Specific
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Status Management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  admin_notes TEXT,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Admin Tracking
  approved_by UUID REFERENCES public.profiles(id),
  rejected_by UUID REFERENCES public.profiles(id),
  
  -- Constraints
  UNIQUE(user_id, sport_id), -- Prevent duplicate registrations
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STEP 3: Create Team Registrations Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  
  -- Team Information
  team_name TEXT NOT NULL,
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  gender TEXT NOT NULL, -- For gender-specific competitions
  
  -- Captain Information
  captain_name TEXT NOT NULL,
  captain_contact TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  
  -- Team Size Validation
  required_members INTEGER NOT NULL DEFAULT 1,
  registered_members INTEGER NOT NULL DEFAULT 0,
  
  -- Status Management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  admin_notes TEXT,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Admin Tracking
  approved_by UUID REFERENCES public.profiles(id),
  rejected_by UUID REFERENCES public.profiles(id),
  
  -- Link to official team (if approved)
  official_team_id UUID REFERENCES public.teams(id),
  
  -- Constraints
  UNIQUE(user_id, sport_id), -- Prevent duplicate registrations by same user
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STEP 4: Create Team Registration Members Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.team_registration_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_registration_id UUID REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  
  -- Member Information
  member_name TEXT NOT NULL,
  member_roll_number TEXT,
  member_contact TEXT,
  member_position TEXT,
  member_order INTEGER NOT NULL, -- Order in the team list
  
  -- Status
  is_captain BOOLEAN DEFAULT FALSE,
  is_substitute BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(team_registration_id, member_order) -- Ensure unique order in team
);

-- ==========================================
-- STEP 5: Create Registration Settings Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.registration_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  
  -- Registration Period
  registration_open BOOLEAN DEFAULT TRUE,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  
  -- Team Size Limits (for team sports)
  min_team_size INTEGER,
  max_team_size INTEGER,
  
  -- Competition Settings
  allow_mixed_gender BOOLEAN DEFAULT TRUE,
  allow_mixed_department BOOLEAN DEFAULT TRUE,
  allow_mixed_semester BOOLEAN DEFAULT TRUE,
  
  -- Additional Settings
  requires_approval BOOLEAN DEFAULT TRUE,
  max_registrations_per_sport INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(sport_id)
);

-- ==========================================
-- STEP 6: Create Indexes for Performance
-- ==========================================

-- Individual Registrations Indexes
CREATE INDEX IF NOT EXISTS idx_individual_registrations_user ON public.individual_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_registrations_sport ON public.individual_registrations(sport_id);
CREATE INDEX IF NOT EXISTS idx_individual_registrations_status ON public.individual_registrations(status);
CREATE INDEX IF NOT EXISTS idx_individual_registrations_department ON public.individual_registrations(department);
CREATE INDEX IF NOT EXISTS idx_individual_registrations_registered_at ON public.individual_registrations(registered_at);

-- Team Registrations Indexes
CREATE INDEX IF NOT EXISTS idx_team_registrations_user ON public.team_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_team_registrations_sport ON public.team_registrations(sport_id);
CREATE INDEX IF NOT EXISTS idx_team_registrations_status ON public.team_registrations(status);
CREATE INDEX IF NOT EXISTS idx_team_registrations_department ON public.team_registrations(department);
CREATE INDEX IF NOT EXISTS idx_team_registrations_registered_at ON public.team_registrations(registered_at);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_registration ON public.team_registration_members(team_registration_id);
CREATE INDEX IF NOT EXISTS idx_team_members_captain ON public.team_registration_members(is_captain) WHERE is_captain = true;

-- Registration Settings Indexes
CREATE INDEX IF NOT EXISTS idx_registration_settings_sport ON public.registration_settings(sport_id);

-- ==========================================
-- STEP 7: Add Updated At Triggers
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_individual_registrations_updated_at ON public.individual_registrations;
CREATE TRIGGER update_individual_registrations_updated_at
    BEFORE UPDATE ON public.individual_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_registrations_updated_at ON public.team_registrations;
CREATE TRIGGER update_team_registrations_updated_at
    BEFORE UPDATE ON public.team_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registration_settings_updated_at ON public.registration_settings;
CREATE TRIGGER update_registration_settings_updated_at
    BEFORE UPDATE ON public.registration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- STEP 8: Insert Default Registration Settings
-- ==========================================

-- Insert default registration settings for existing sports
INSERT INTO public.registration_settings (
  sport_id,
  registration_open,
  min_team_size,
  max_team_size,
  allow_mixed_gender,
  allow_mixed_department,
  requires_approval
)
SELECT 
  s.id,
  true, -- registration open by default
  CASE 
    WHEN s.name IN ('Cricket') THEN 11
    WHEN s.name IN ('Football') THEN 9
    WHEN s.name IN ('Basketball') THEN 5
    WHEN s.name IN ('Volleyball') THEN 6
    ELSE 1 -- Individual sports
  END as min_team_size,
  CASE 
    WHEN s.name IN ('Cricket') THEN 15
    WHEN s.name IN ('Football') THEN 11
    WHEN s.name IN ('Basketball') THEN 8
    WHEN s.name IN ('Volleyball') THEN 9
    ELSE 1 -- Individual sports
  END as max_team_size,
  true, -- allow mixed gender
  true, -- allow mixed department  
  true  -- requires approval
FROM public.sports s
ON CONFLICT (sport_id) DO NOTHING;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Uncomment these to verify the migration worked
-- SELECT 'Profiles columns added' as status, 
--        COUNT(*) as profile_count 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('student_id', 'department', 'semester', 'gender');

-- SELECT 'Individual registrations table' as status,
--        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'individual_registrations') as created;

-- SELECT 'Team registrations table' as status,
--        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'team_registrations') as created;

-- SELECT 'Registration settings' as status, COUNT(*) as settings_count FROM public.registration_settings;

NOTIFY pgsql, 'Registration system migration completed successfully!';