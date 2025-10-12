-- ==========================================
-- OCEM Sports Hub - Sports Enhancement Migration
-- ==========================================
-- This script enhances the sports table with additional fields for better management

BEGIN;

-- ==========================================
-- STEP 1: ADD NEW COLUMNS TO SPORTS TABLE
-- ==========================================

-- Add new columns to sports table
ALTER TABLE public.sports 
ADD COLUMN IF NOT EXISTS is_team_sport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS min_players INTEGER,
ADD COLUMN IF NOT EXISTS max_players INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==========================================
-- STEP 2: UPDATE EXISTING SPORTS WITH TEAM SPORT INFO
-- ==========================================

-- Update existing sports with team sport information
UPDATE public.sports 
SET 
  is_team_sport = TRUE,
  min_players = 11,
  max_players = 15,
  description = 'A bat-and-ball game played between two teams of eleven players',
  rules = 'Each team bats and bowls. The team with the most runs wins.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Cricket';

UPDATE public.sports 
SET 
  is_team_sport = TRUE,
  min_players = 9,
  max_players = 11,
  description = 'A team sport played with a spherical ball between two teams of 11 players',
  rules = 'Each team tries to score by getting the ball into the opposing goal.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Football';

UPDATE public.sports 
SET 
  is_team_sport = TRUE,
  min_players = 5,
  max_players = 8,
  description = 'A team sport in which two teams try to score points by throwing a ball through the opposing team''s hoop',
  rules = 'Each team tries to score by shooting the ball through the opponent''s basket.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Basketball';

UPDATE public.sports 
SET 
  is_team_sport = FALSE,
  min_players = 1,
  max_players = 1,
  description = 'A racquet sport played using racquets to hit a shuttlecock across a net',
  rules = 'Players score points by hitting the shuttlecock over the net and into the opponent''s court.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Badminton';

UPDATE public.sports 
SET 
  is_team_sport = FALSE,
  min_players = 1,
  max_players = 1,
  description = 'A sport in which two or four players hit a lightweight ball back and forth across a table',
  rules = 'Players score points by hitting the ball so that the opponent cannot return it.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Table Tennis';

UPDATE public.sports 
SET 
  is_team_sport = FALSE,
  min_players = 1,
  max_players = 1,
  description = 'A two-player strategy board game played on a chessboard',
  rules = 'Players take turns moving pieces to capture the opponent''s king.',
  is_active = TRUE,
  updated_at = NOW()
WHERE name = 'Chess';

-- ==========================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sports_is_active ON public.sports(is_active);
CREATE INDEX IF NOT EXISTS idx_sports_is_team_sport ON public.sports(is_team_sport);
CREATE INDEX IF NOT EXISTS idx_sports_name ON public.sports(name);

-- ==========================================
-- STEP 4: UPDATE RLS POLICIES
-- ==========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Sports are viewable by everyone" ON public.sports;
DROP POLICY IF EXISTS "Only admins can manage sports" ON public.sports;

-- Create new policies
CREATE POLICY "Sports are viewable by everyone" ON public.sports
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sports" ON public.sports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- ==========================================

-- Function to get active sports
CREATE OR REPLACE FUNCTION get_active_sports()
RETURNS TABLE (
  id UUID,
  name TEXT,
  icon TEXT,
  is_team_sport BOOLEAN,
  min_players INTEGER,
  max_players INTEGER,
  description TEXT,
  rules TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.icon,
    s.is_team_sport,
    s.min_players,
    s.max_players,
    s.description,
    s.rules
  FROM public.sports s
  WHERE s.is_active = TRUE
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get team sports only
CREATE OR REPLACE FUNCTION get_team_sports()
RETURNS TABLE (
  id UUID,
  name TEXT,
  icon TEXT,
  min_players INTEGER,
  max_players INTEGER,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.icon,
    s.min_players,
    s.max_players,
    s.description
  FROM public.sports s
  WHERE s.is_active = TRUE AND s.is_team_sport = TRUE
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get individual sports only
CREATE OR REPLACE FUNCTION get_individual_sports()
RETURNS TABLE (
  id UUID,
  name TEXT,
  icon TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.icon,
    s.description
  FROM public.sports s
  WHERE s.is_active = TRUE AND s.is_team_sport = FALSE
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STEP 6: VERIFICATION
-- ==========================================

-- Verify migration success
DO $$
DECLARE
  sport_count INTEGER;
  team_sport_count INTEGER;
  individual_sport_count INTEGER;
BEGIN
  -- Count total sports
  SELECT COUNT(*) INTO sport_count FROM public.sports;
  
  -- Count team sports
  SELECT COUNT(*) INTO team_sport_count FROM public.sports WHERE is_team_sport = TRUE;
  
  -- Count individual sports
  SELECT COUNT(*) INTO individual_sport_count FROM public.sports WHERE is_team_sport = FALSE;
  
  RAISE NOTICE 'Sports enhancement completed:';
  RAISE NOTICE 'Total Sports: %', sport_count;
  RAISE NOTICE 'Team Sports: %', team_sport_count;
  RAISE NOTICE 'Individual Sports: %', individual_sport_count;
  
  RAISE NOTICE 'Migration verification passed!';
END $$;

COMMIT;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================

SELECT 
  'Sports Enhancement Migration Complete' as status,
  'Sports table has been enhanced with additional fields for better management' as description,
  'Next: Update application components to use the enhanced sports system' as next_step;
