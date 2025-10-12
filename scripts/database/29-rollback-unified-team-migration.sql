-- ==========================================
-- OCEM Sports Hub - Rollback Unified Team System Migration
-- ==========================================
-- This script rolls back the unified team system migration
-- 
-- WARNING: This will restore the original 3-table system
-- Make sure you have a backup before running this script
--
-- ROLLBACK STEPS:
-- 1. Restore original teams table
-- 2. Restore team_registrations table
-- 3. Restore team_registration_members table
-- 4. Drop new tables and columns
-- 5. Restore original RLS policies

BEGIN;

-- ==========================================
-- STEP 1: RESTORE ORIGINAL TEAMS TABLE
-- ==========================================

-- Drop new columns from teams table
ALTER TABLE public.teams 
DROP COLUMN IF EXISTS team_type,
DROP COLUMN IF EXISTS source_type,
DROP COLUMN IF EXISTS sport_id,
DROP COLUMN IF EXISTS department,
DROP COLUMN IF EXISTS semester,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS captain_name,
DROP COLUMN IF EXISTS captain_contact,
DROP COLUMN IF EXISTS captain_email,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approved_at,
DROP COLUMN IF EXISTS original_registration_id,
DROP COLUMN IF EXISTS updated_at;

-- ==========================================
-- STEP 2: RESTORE ORIGINAL DATA
-- ==========================================

-- Restore teams from backup
DELETE FROM public.teams;
INSERT INTO public.teams (id, name, logo_url, color, created_at)
SELECT id, name, logo_url, color, created_at
FROM public.teams_backup;

-- ==========================================
-- STEP 3: DROP NEW TABLES
-- ==========================================

-- Drop team_members table
DROP TABLE IF EXISTS public.team_members;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_team_by_registration(UUID);
DROP FUNCTION IF EXISTS approve_team_registration(UUID, UUID);
DROP FUNCTION IF EXISTS reject_team_registration(UUID, UUID, TEXT);

-- Drop views
DROP VIEW IF EXISTS student_teams;
DROP VIEW IF EXISTS official_teams;

-- ==========================================
-- STEP 4: RESTORE ORIGINAL RLS POLICIES
-- ==========================================

-- Drop new policies
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
DROP POLICY IF EXISTS "Admins can manage all teams" ON public.teams;
DROP POLICY IF EXISTS "Users can manage their own student teams" ON public.teams;

-- Restore original policies
CREATE POLICY "Teams are viewable by everyone" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- STEP 5: CLEANUP
-- ==========================================

-- Drop indexes that were added
DROP INDEX IF EXISTS idx_teams_team_type;
DROP INDEX IF EXISTS idx_teams_sport_id;
DROP INDEX IF EXISTS idx_teams_status;
DROP INDEX IF EXISTS idx_teams_original_registration;
DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_captain;

-- ==========================================
-- STEP 6: VERIFICATION
-- ==========================================

-- Verify rollback success
DO $$
DECLARE
  team_count INTEGER;
  backup_count INTEGER;
BEGIN
  -- Count teams
  SELECT COUNT(*) INTO team_count FROM public.teams;
  
  -- Count backup teams
  SELECT COUNT(*) INTO backup_count FROM public.teams_backup;
  
  RAISE NOTICE 'Rollback completed:';
  RAISE NOTICE 'Teams restored: %', team_count;
  RAISE NOTICE 'Backup teams: %', backup_count;
  
  -- Verify data integrity
  IF team_count != backup_count THEN
    RAISE EXCEPTION 'Data integrity check failed! Team counts do not match.';
  END IF;
  
  RAISE NOTICE 'Rollback verification passed!';
END $$;

COMMIT;

-- ==========================================
-- ROLLBACK COMPLETE
-- ==========================================

SELECT 
  'Unified Team System Rollback Complete' as status,
  'System has been restored to the original 3-table structure' as description,
  'Next: Restart applications and verify functionality' as next_step;
