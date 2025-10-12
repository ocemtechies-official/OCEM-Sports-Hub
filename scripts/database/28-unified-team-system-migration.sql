-- ==========================================
-- OCEM Sports Hub - Unified Team System Migration
-- ==========================================
-- This script migrates from the current 3-table system to a unified team system
-- 
-- BEFORE RUNNING:
-- 1. Backup your database
-- 2. Test on a development environment first
-- 3. Ensure all applications are stopped during migration
--
-- MIGRATION STEPS:
-- 1. Create backup tables
-- 2. Update teams table schema
-- 3. Create team_members table
-- 4. Migrate data from team_registrations
-- 5. Update foreign key references
-- 6. Clean up old tables (optional)

BEGIN;

-- ==========================================
-- STEP 1: CREATE BACKUP TABLES
-- ==========================================

-- Backup existing tables before migration
CREATE TABLE IF NOT EXISTS teams_backup AS SELECT * FROM teams;
CREATE TABLE IF NOT EXISTS team_registrations_backup AS SELECT * FROM team_registrations;
CREATE TABLE IF NOT EXISTS team_registration_members_backup AS SELECT * FROM team_registration_members;
CREATE TABLE IF NOT EXISTS individual_registrations_backup AS SELECT * FROM individual_registrations;

-- ==========================================
-- STEP 2: UPDATE TEAMS TABLE SCHEMA
-- ==========================================

-- Add new columns to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS team_type TEXT NOT NULL DEFAULT 'official' CHECK (team_type IN ('official', 'student_registered')),
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('admin_created', 'student_registration')),
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES public.sports(id),
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS captain_name TEXT,
ADD COLUMN IF NOT EXISTS captain_contact TEXT,
ADD COLUMN IF NOT EXISTS captain_email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'rejected', 'inactive')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS original_registration_id UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing teams to have proper source_type
UPDATE public.teams 
SET source_type = 'admin_created', 
    team_type = 'official',
    status = 'active'
WHERE source_type IS NULL;

-- ==========================================
-- STEP 3: CREATE TEAM_MEMBERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  member_contact TEXT,
  member_position TEXT,
  member_order INTEGER NOT NULL,
  is_captain BOOLEAN DEFAULT FALSE,
  is_substitute BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_captain ON public.team_members(is_captain);

-- ==========================================
-- STEP 4: MIGRATE TEAM_REGISTRATIONS DATA
-- ==========================================

-- Migrate approved team registrations to teams table
INSERT INTO public.teams (
  id,
  name,
  team_type,
  source_type,
  sport_id,
  department,
  semester,
  gender,
  captain_name,
  captain_contact,
  captain_email,
  status,
  approved_by,
  approved_at,
  original_registration_id,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(), -- Generate new UUID for teams table
  tr.team_name,
  'student_registered',
  'student_registration',
  tr.sport_id,
  tr.department,
  tr.semester,
  tr.gender,
  tr.captain_name,
  tr.captain_contact,
  tr.captain_email,
  CASE 
    WHEN tr.status = 'approved' THEN 'active'
    WHEN tr.status = 'pending' THEN 'pending_approval'
    WHEN tr.status = 'rejected' THEN 'rejected'
    ELSE 'inactive'
  END,
  tr.approved_by,
  tr.approved_at,
  tr.id, -- Store original registration ID
  tr.created_at,
  tr.updated_at
FROM public.team_registrations tr
WHERE tr.status IN ('approved', 'pending', 'rejected');

-- Migrate team registration members to team_members table
INSERT INTO public.team_members (
  team_id,
  member_name,
  member_contact,
  member_position,
  member_order,
  is_captain,
  is_substitute,
  created_at
)
SELECT 
  t.id, -- New team ID from the migration above
  trm.member_name,
  trm.member_contact,
  trm.member_position,
  trm.member_order,
  trm.is_captain,
  trm.is_substitute,
  trm.created_at
FROM public.team_registration_members trm
JOIN public.team_registrations tr ON tr.id = trm.team_registration_id
JOIN public.teams t ON t.original_registration_id = tr.id
WHERE tr.status IN ('approved', 'pending', 'rejected');

-- ==========================================
-- STEP 5: UPDATE FOREIGN KEY REFERENCES
-- ==========================================

-- Update team_registrations to reference the new team IDs
UPDATE public.team_registrations tr
SET official_team_id = t.id
FROM public.teams t
WHERE t.original_registration_id = tr.id;

-- ==========================================
-- STEP 6: CREATE HELPER FUNCTIONS
-- ==========================================

-- Function to get team by registration ID
CREATE OR REPLACE FUNCTION get_team_by_registration(reg_id UUID)
RETURNS UUID AS $$
DECLARE
  team_id UUID;
BEGIN
  SELECT id INTO team_id
  FROM public.teams
  WHERE original_registration_id = reg_id;
  
  RETURN team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve student team registration
CREATE OR REPLACE FUNCTION approve_team_registration(
  reg_id UUID,
  approver_id UUID
)
RETURNS UUID AS $$
DECLARE
  team_id UUID;
BEGIN
  -- Update the team status
  UPDATE public.teams
  SET status = 'active',
      approved_by = approver_id,
      approved_at = NOW(),
      updated_at = NOW()
  WHERE original_registration_id = reg_id
  RETURNING id INTO team_id;
  
  -- Update the original registration
  UPDATE public.team_registrations
  SET status = 'approved',
      approved_by = approver_id,
      approved_at = NOW(),
      official_team_id = team_id
  WHERE id = reg_id;
  
  RETURN team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reject team registration
CREATE OR REPLACE FUNCTION reject_team_registration(
  reg_id UUID,
  approver_id UUID,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update the team status
  UPDATE public.teams
  SET status = 'rejected',
      approved_by = approver_id,
      approved_at = NOW(),
      updated_at = NOW()
  WHERE original_registration_id = reg_id;
  
  -- Update the original registration
  UPDATE public.team_registrations
  SET status = 'rejected',
      approved_by = approver_id,
      approved_at = NOW(),
      admin_notes = COALESCE(admin_notes, '') || CASE 
        WHEN admin_notes IS NOT NULL AND admin_notes != '' THEN ' | ' ELSE '' 
      END || COALESCE(reason, 'Registration rejected')
  WHERE id = reg_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STEP 7: UPDATE RLS POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
DROP POLICY IF EXISTS "Only admins can manage teams" ON public.teams;

-- Create new unified policies
CREATE POLICY "Teams are viewable by everyone" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage their own student teams" ON public.teams
  FOR ALL USING (
    team_type = 'student_registered' AND
    EXISTS (
      SELECT 1 FROM public.team_registrations tr
      WHERE tr.id = original_registration_id
      AND tr.user_id = auth.uid()
    )
  );

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage their own team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_registrations tr ON tr.id = t.original_registration_id
      WHERE t.id = team_id
      AND tr.user_id = auth.uid()
    )
  );

-- ==========================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Teams table indexes
CREATE INDEX IF NOT EXISTS idx_teams_team_type ON public.teams(team_type);
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON public.teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_original_registration ON public.teams(original_registration_id);

-- ==========================================
-- STEP 9: CREATE VIEWS FOR BACKWARD COMPATIBILITY
-- ==========================================

-- View for student teams (backward compatibility)
CREATE OR REPLACE VIEW student_teams AS
SELECT 
  t.*,
  tr.user_id,
  tr.registered_at,
  tr.admin_notes
FROM public.teams t
JOIN public.team_registrations tr ON tr.id = t.original_registration_id
WHERE t.team_type = 'student_registered';

-- View for official teams (backward compatibility)
CREATE OR REPLACE VIEW official_teams AS
SELECT *
FROM public.teams
WHERE team_type = 'official';

-- ==========================================
-- STEP 10: VERIFICATION QUERIES
-- ==========================================

-- Verify migration success
DO $$
DECLARE
  team_count INTEGER;
  member_count INTEGER;
  registration_count INTEGER;
BEGIN
  -- Count teams
  SELECT COUNT(*) INTO team_count FROM public.teams;
  
  -- Count team members
  SELECT COUNT(*) INTO member_count FROM public.team_members;
  
  -- Count registrations
  SELECT COUNT(*) INTO registration_count FROM public.team_registrations;
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE 'Teams: %', team_count;
  RAISE NOTICE 'Team Members: %', member_count;
  RAISE NOTICE 'Registrations: %', registration_count;
  
  -- Verify no data loss
  IF team_count < (SELECT COUNT(*) FROM teams_backup) THEN
    RAISE EXCEPTION 'Data loss detected in teams table!';
  END IF;
  
  RAISE NOTICE 'Migration verification passed!';
END $$;

COMMIT;

-- ==========================================
-- POST-MIGRATION CLEANUP (OPTIONAL)
-- ==========================================
-- Uncomment these lines after verifying everything works correctly
-- and you no longer need the backup tables

-- DROP TABLE IF EXISTS public.team_registration_members_backup;
-- DROP TABLE IF EXISTS public.team_registrations_backup;
-- DROP TABLE IF EXISTS public.teams_backup;
-- DROP TABLE IF EXISTS public.individual_registrations_backup;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================

SELECT 
  'Unified Team System Migration Complete' as status,
  'All team data has been consolidated into the unified teams table' as description,
  'Next: Update application components to use the new unified system' as next_step;
