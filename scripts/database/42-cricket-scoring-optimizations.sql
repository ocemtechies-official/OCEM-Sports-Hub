-- ==========================================
-- OCEM Sports Hub - Cricket Scoring Optimizations
-- ==========================================
-- Adds performance indexes and constraints for cricket scoring system
-- Safe to run multiple times

BEGIN;

-- 1. Add GIN index for efficient JSONB queries on extra field
CREATE INDEX IF NOT EXISTS idx_fixtures_extra_gin 
ON public.fixtures USING GIN (extra);

-- 2. Add cricket-specific indexes for common queries
CREATE INDEX IF NOT EXISTS idx_fixtures_cricket_stats 
ON public.fixtures USING GIN ((extra->'cricket'));

-- 3. Add sport-specific live match index
CREATE INDEX IF NOT EXISTS idx_fixtures_sport_status 
ON public.fixtures(sport_id, status) 
WHERE status IN ('live', 'completed');

-- 4. Add composite index for moderator queries
CREATE INDEX IF NOT EXISTS idx_fixtures_moderator_view
ON public.fixtures(sport_id, status, scheduled_at DESC)
WHERE status IN ('scheduled', 'live');

-- 5. Add constraint to ensure cricket data integrity
DO $$
BEGIN
  -- Only add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fixtures_extra_cricket_check'
    AND table_name = 'fixtures'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.fixtures 
    ADD CONSTRAINT fixtures_extra_cricket_check 
    CHECK (
      extra IS NULL OR 
      extra->'cricket' IS NULL OR
      (
        jsonb_typeof(extra->'cricket'->'team_a') = 'object' AND
        jsonb_typeof(extra->'cricket'->'team_b') = 'object'
      )
    );
  END IF;
END $$;

-- 6. Add function to validate cricket team data structure
CREATE OR REPLACE FUNCTION public.validate_cricket_team_data(team_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check if team_data is null or empty
  IF team_data IS NULL OR team_data = '{}'::jsonb THEN
    RETURN TRUE;
  END IF;
  
  -- Check required fields exist and are numbers
  IF (
    jsonb_typeof(team_data->'runs') = 'number' AND
    jsonb_typeof(team_data->'wickets') = 'number' AND
    jsonb_typeof(team_data->'overs') = 'number' AND
    jsonb_typeof(team_data->'extras') = 'number' AND
    jsonb_typeof(team_data->'balls_faced') = 'number' AND
    jsonb_typeof(team_data->'fours') = 'number' AND
    jsonb_typeof(team_data->'sixes') = 'number' AND
    jsonb_typeof(team_data->'wides') = 'number' AND
    jsonb_typeof(team_data->'no_balls') = 'number' AND
    jsonb_typeof(team_data->'byes') = 'number' AND
    jsonb_typeof(team_data->'leg_byes') = 'number' AND
    jsonb_typeof(team_data->'run_rate') = 'number'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- 7. Add trigger to validate cricket data on insert/update
CREATE OR REPLACE FUNCTION public.validate_cricket_data_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only validate if extra field contains cricket data
  IF NEW.extra IS NOT NULL AND NEW.extra->'cricket' IS NOT NULL THEN
    -- Validate team_a data
    IF NOT public.validate_cricket_team_data(NEW.extra->'cricket'->'team_a') THEN
      RAISE EXCEPTION 'Invalid cricket team_a data structure';
    END IF;
    
    -- Validate team_b data
    IF NOT public.validate_cricket_team_data(NEW.extra->'cricket'->'team_b') THEN
      RAISE EXCEPTION 'Invalid cricket team_b data structure';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS validate_cricket_data_trigger ON public.fixtures;

-- Create trigger
CREATE TRIGGER validate_cricket_data_trigger
  BEFORE INSERT OR UPDATE ON public.fixtures
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_cricket_data_trigger();

-- 8. Add helper function to get cricket stats efficiently
CREATE OR REPLACE FUNCTION public.get_cricket_stats(fixture_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT extra->'cricket' INTO result
  FROM public.fixtures
  WHERE id = fixture_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_cricket_stats TO authenticated;

-- 9. Add function to calculate cricket run rate
CREATE OR REPLACE FUNCTION public.calculate_cricket_run_rate(runs INTEGER, overs DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF overs <= 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((runs::DECIMAL / overs), 2);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.calculate_cricket_run_rate TO authenticated;

-- 10. Add view for cricket match summaries
CREATE OR REPLACE VIEW public.cricket_match_summary AS
SELECT 
  f.id,
  f.sport_id,
  f.team_a_id,
  f.team_b_id,
  f.status,
  f.team_a_score,
  f.team_b_score,
  f.scheduled_at,
  f.venue,
  -- Team A cricket stats
  (f.extra->'cricket'->'team_a'->>'runs')::INTEGER as team_a_runs,
  (f.extra->'cricket'->'team_a'->>'wickets')::INTEGER as team_a_wickets,
  (f.extra->'cricket'->'team_a'->>'overs')::DECIMAL as team_a_overs,
  (f.extra->'cricket'->'team_a'->>'run_rate')::DECIMAL as team_a_run_rate,
  -- Team B cricket stats
  (f.extra->'cricket'->'team_b'->>'runs')::INTEGER as team_b_runs,
  (f.extra->'cricket'->'team_b'->>'wickets')::INTEGER as team_b_wickets,
  (f.extra->'cricket'->'team_b'->>'overs')::DECIMAL as team_b_overs,
  (f.extra->'cricket'->'team_b'->>'run_rate')::DECIMAL as team_b_run_rate,
  -- Team names
  ta.name as team_a_name,
  tb.name as team_b_name,
  -- Sport info
  s.name as sport_name
FROM public.fixtures f
LEFT JOIN public.teams ta ON f.team_a_id = ta.id
LEFT JOIN public.teams tb ON f.team_b_id = tb.id
LEFT JOIN public.sports s ON f.sport_id = s.id
WHERE s.name ILIKE '%cricket%'
  AND f.extra->'cricket' IS NOT NULL;

-- Grant select permission on view
GRANT SELECT ON public.cricket_match_summary TO authenticated;

COMMIT;

-- ==========================================
-- Performance Testing Queries
-- ==========================================

-- Test 1: Query cricket stats efficiently
-- SELECT * FROM public.cricket_match_summary WHERE status = 'live';

-- Test 2: Query using GIN index
-- SELECT id, extra->'cricket' FROM public.fixtures WHERE extra @> '{"cricket": {"team_a": {"runs": 100}}}';

-- Test 3: Query live cricket matches
-- SELECT * FROM public.fixtures WHERE sport_id = (SELECT id FROM sports WHERE name = 'Cricket') AND status = 'live';
