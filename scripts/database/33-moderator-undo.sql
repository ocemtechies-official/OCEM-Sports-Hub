-- ==========================================
-- OCEM Sports Hub - Moderator Undo Function
-- ==========================================
-- Adds RPC to revert last fixture update within 15 seconds

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_revert_last_fixture_update(p_fixture UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_update RECORD;
  now_ts TIMESTAMPTZ := now();
  user_profile RECORD;
  result JSONB;
BEGIN
  -- Auth check
  SELECT * INTO user_profile FROM public.profiles WHERE id = auth.uid();
  IF user_profile IS NULL OR user_profile.role NOT IN ('admin','moderator') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Find last score/status update for this fixture
  SELECT * INTO last_update
  FROM public.match_updates
  WHERE fixture_id = p_fixture
    AND update_type IN ('score','status')
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_update IS NULL THEN
    RAISE EXCEPTION 'No updates to revert';
  END IF;

  -- Time window: 15 seconds
  IF (now_ts - last_update.created_at) > INTERVAL '15 seconds' THEN
    RAISE EXCEPTION 'Undo window expired';
  END IF;

  -- Apply previous values
  UPDATE public.fixtures f
  SET 
    team_a_score = COALESCE(last_update.prev_team_a_score, f.team_a_score),
    team_b_score = COALESCE(last_update.prev_team_b_score, f.team_b_score),
    status = COALESCE(last_update.prev_status, f.status),
    updated_by = auth.uid(),
    updated_at = now()
  WHERE f.id = p_fixture;

  -- Record a revert audit row
  INSERT INTO public.match_updates (
    fixture_id, update_type, note, 
    prev_team_a_score, prev_team_b_score, prev_status,
    new_team_a_score, new_team_b_score, new_status,
    created_by
  ) VALUES (
    p_fixture, 'undo', 'Reverted last update',
    last_update.new_team_a_score, last_update.new_team_b_score, last_update.new_status,
    last_update.prev_team_a_score, last_update.prev_team_b_score, last_update.prev_status,
    auth.uid()
  );

  SELECT jsonb_build_object('status','ok') INTO result;
  RETURN result;
END;
$$;

COMMIT;



