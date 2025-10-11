-- Moderator System Migration Script
-- This script adds moderator role support to the OCEM Sports Hub

-- 1. Update profiles table to support moderator role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'moderator', 'viewer'));

-- Add moderator-specific columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_sports TEXT[],
ADD COLUMN IF NOT EXISTS assigned_venues TEXT[],
ADD COLUMN IF NOT EXISTS moderator_notes TEXT;

-- 2. Update fixtures table for moderator tracking
ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_fixtures_updated_by ON public.fixtures(updated_by);
CREATE INDEX IF NOT EXISTS idx_fixtures_version ON public.fixtures(version);

-- 3. Create match_updates audit table
CREATE TABLE IF NOT EXISTS public.match_updates (
  id BIGSERIAL PRIMARY KEY,
  fixture_id UUID NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id),
  change_time TIMESTAMPTZ DEFAULT NOW(),
  old_state JSONB,
  new_state JSONB,
  change_type TEXT NOT NULL, -- 'score_update', 'status_change', 'note', 'media'
  note TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Add indexes for match_updates
CREATE INDEX IF NOT EXISTS idx_match_updates_fixture ON public.match_updates(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_updates_changed_by ON public.match_updates(changed_by);
CREATE INDEX IF NOT EXISTS idx_match_updates_change_time ON public.match_updates(change_time);

-- 4. Create audit logging function
CREATE OR REPLACE FUNCTION public.log_fixture_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.match_updates(
    fixture_id, 
    changed_by, 
    old_state, 
    new_state, 
    change_type,
    note
  )
  VALUES (
    NEW.id,
    NEW.updated_by,
    row_to_json(OLD),
    row_to_json(NEW),
    CASE 
      WHEN OLD.team_a_score != NEW.team_a_score OR OLD.team_b_score != NEW.team_b_score THEN 'score_update'
      WHEN OLD.status != NEW.status THEN 'status_change'
      ELSE 'update'
    END,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create RPC function for secure score updates
CREATE OR REPLACE FUNCTION public.rpc_update_fixture_score(
  p_fixture UUID,
  p_team_a_score INT,
  p_team_b_score INT,
  p_status TEXT,
  p_expected_version INT,
  p_note TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  old_row public.fixtures%rowtype;
  new_row public.fixtures%rowtype;
  user_profile public.profiles%rowtype;
  sport_name TEXT;
  is_authorized BOOLEAN := FALSE;
  recent_updates_count INTEGER;
BEGIN
  -- Get current user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF user_profile IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user is admin or moderator
  IF user_profile.role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Get current fixture with lock
  SELECT * INTO old_row 
  FROM public.fixtures 
  WHERE id = p_fixture 
  FOR UPDATE;
  
  IF old_row IS NULL THEN
    RAISE EXCEPTION 'Fixture not found';
  END IF;
  
  -- Check version for optimistic locking
  IF old_row.version != p_expected_version THEN
    RAISE EXCEPTION 'Version mismatch - fixture was updated by another user';
  END IF;
  
  -- Validate scores
  IF p_team_a_score < 0 OR p_team_b_score < 0 THEN
    RAISE EXCEPTION 'Scores must be non-negative';
  END IF;
  
  -- Validate status
  IF p_status NOT IN ('scheduled', 'live', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  -- Check authorization
  IF user_profile.role = 'admin' THEN
    is_authorized := TRUE;
  ELSIF user_profile.role = 'moderator' THEN
    -- Get sport name for this fixture
    SELECT s.name INTO sport_name
    FROM public.sports s
    WHERE s.id = old_row.sport_id;
    
    -- Check if moderator is assigned to this sport
    IF user_profile.assigned_sports IS NULL OR sport_name = ANY(user_profile.assigned_sports) THEN
      is_authorized := TRUE;
    END IF;
    
    -- If assigned_venues is set, check venue match
    IF is_authorized AND user_profile.assigned_venues IS NOT NULL THEN
      IF old_row.venue IS NULL OR old_row.venue != ANY(user_profile.assigned_venues) THEN
        is_authorized := FALSE;
      END IF;
    END IF;
  END IF;
  
  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Not authorized to update this fixture';
  END IF;
  
  -- Rate limiting: Check recent updates (20 per 5 minutes)
  SELECT COUNT(*) INTO recent_updates_count
  FROM public.match_updates
  WHERE fixture_id = p_fixture 
    AND changed_by = auth.uid()
    AND change_time > NOW() - INTERVAL '5 minutes';
    
  IF recent_updates_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded - too many updates in 5 minutes';
  END IF;
  
  -- Calculate winner if match is completed
  DECLARE
    winner_id UUID := NULL;
  BEGIN
    IF p_status = 'completed' THEN
      IF p_team_a_score > p_team_b_score THEN
        winner_id := old_row.team_a_id;
      ELSIF p_team_b_score > p_team_a_score THEN
        winner_id := old_row.team_b_id;
      END IF;
    END IF;
    
    -- Update fixture
    UPDATE public.fixtures SET
      team_a_score = p_team_a_score,
      team_b_score = p_team_b_score,
      status = p_status,
      winner_id = winner_id,
      updated_by = auth.uid(),
      version = old_row.version + 1,
      updated_at = NOW()
    WHERE id = p_fixture
    RETURNING * INTO new_row;
    
    -- Insert audit log with note if provided
    IF p_note IS NOT NULL AND LENGTH(TRIM(p_note)) > 0 THEN
      INSERT INTO public.match_updates(
        fixture_id, 
        changed_by, 
        old_state, 
        new_state, 
        change_type,
        note
      )
      VALUES (
        p_fixture,
        auth.uid(),
        row_to_json(old_row),
        row_to_json(new_row),
        'note',
        p_note
      );
    END IF;
  END;
  
  -- Return updated fixture with relations
  RETURN (
    SELECT row_to_json(fixture_with_relations)
    FROM (
      SELECT 
        f.*,
        s.name as sport_name,
        s.icon as sport_icon,
        ta.name as team_a_name,
        ta.logo_url as team_a_logo,
        tb.name as team_b_name,
        tb.logo_url as team_b_logo,
        p.full_name as updated_by_name
      FROM public.fixtures f
      LEFT JOIN public.sports s ON f.sport_id = s.id
      LEFT JOIN public.teams ta ON f.team_a_id = ta.id
      LEFT JOIN public.teams tb ON f.team_b_id = tb.id
      LEFT JOIN public.profiles p ON f.updated_by = p.id
      WHERE f.id = p_fixture
    ) fixture_with_relations
  );
END;
$$;

-- 6. Create trigger for audit logging
DROP TRIGGER IF EXISTS trigger_log_fixture_update ON public.fixtures;
CREATE TRIGGER trigger_log_fixture_update
  AFTER UPDATE ON public.fixtures
  FOR EACH ROW
  EXECUTE FUNCTION public.log_fixture_update();

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.rpc_update_fixture_score TO authenticated;
GRANT SELECT, INSERT ON public.match_updates TO authenticated;

-- 8. Update existing fixtures to have version 1
UPDATE public.fixtures SET version = 1 WHERE version IS NULL;

-- 9. Create helper function to check if user can moderate fixture
CREATE OR REPLACE FUNCTION public.can_moderate_fixture(
  p_fixture_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles%rowtype;
  fixture_sport_name TEXT;
  fixture_venue TEXT;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admins can moderate all fixtures
  IF user_profile.role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Moderators need to be assigned
  IF user_profile.role = 'moderator' THEN
    -- Get fixture details
    SELECT s.name, f.venue INTO fixture_sport_name, fixture_venue
    FROM public.fixtures f
    LEFT JOIN public.sports s ON f.sport_id = s.id
    WHERE f.id = p_fixture_id;
    
    -- Check sport assignment
    IF user_profile.assigned_sports IS NULL OR fixture_sport_name = ANY(user_profile.assigned_sports) THEN
      -- Check venue assignment if specified
      IF user_profile.assigned_venues IS NULL OR fixture_venue = ANY(user_profile.assigned_venues) THEN
        RETURN TRUE;
      END IF;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_moderate_fixture TO authenticated;

-- 10. Create function to get moderator assignments
CREATE OR REPLACE FUNCTION public.get_moderator_assignments(
  p_user_id UUID DEFAULT auth.uid()
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_profile public.profiles%rowtype;
  result JSONB;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN '{"error": "User not found"}'::JSONB;
  END IF;
  
  result := jsonb_build_object(
    'role', user_profile.role,
    'assigned_sports', COALESCE(user_profile.assigned_sports, '{}'),
    'assigned_venues', COALESCE(user_profile.assigned_venues, '{}'),
    'moderator_notes', user_profile.moderator_notes
  );
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_moderator_assignments TO authenticated;
