-- ==========================================
-- OCEM Sports Hub - Fix Winner ID for Completed Fixtures
-- ==========================================
-- This script fixes the winner_id issue for completed fixtures
-- It ensures that when a fixture is marked as completed, the winner_id is properly set

BEGIN;

-- 1. Fix existing completed fixtures that are missing winner_id
UPDATE public.fixtures 
SET winner_id = team_a_id
WHERE status = 'completed' 
AND winner_id IS NULL
AND team_a_score > team_b_score;

UPDATE public.fixtures 
SET winner_id = team_b_id
WHERE status = 'completed' 
AND winner_id IS NULL
AND team_b_score > team_a_score;

-- 2. Update the RPC function to properly set winner_id when completing fixtures
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
  winner_id UUID := NULL;
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
  
  -- Calculate winner if match is completed - THIS IS THE KEY PART
  IF p_status = 'completed' THEN
    IF p_team_a_score > p_team_b_score THEN
      winner_id := old_row.team_a_id;  -- Team A wins
    ELSIF p_team_b_score > p_team_a_score THEN
      winner_id := old_row.team_b_id;  -- Team B wins
    END IF;
    -- For draws (equal scores), winner_id remains NULL
  END IF;
  
  -- Update fixture - ALWAYS set winner_id
  UPDATE public.fixtures SET
    team_a_score = p_team_a_score,
    team_b_score = p_team_b_score,
    status = p_status,
    winner_id = winner_id,  -- This will be set correctly now
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

-- 3. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.rpc_update_fixture_score TO authenticated;

COMMIT;

-- 4. Verify the fix worked for the specific fixture mentioned in the issue
SELECT 
    id,
    team_a_id,
    team_b_id,
    team_a_score,
    team_b_score,
    status,
    winner_id
FROM public.fixtures 
WHERE id = '22979b8d-5880-4245-a255-3bcb43a910d2';