-- ==========================================
-- OCEM Sports Hub - Initialize Cricket Data
-- ==========================================
-- Function to initialize cricket data for cricket fixtures
-- This ensures cricket fixtures have proper data structure from the start

CREATE OR REPLACE FUNCTION public.initialize_cricket_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sport_name TEXT;
BEGIN
  -- Get sport name
  SELECT s.name INTO sport_name
  FROM public.sports s
  WHERE s.id = NEW.sport_id;
  
  -- If it's a cricket fixture and doesn't have cricket data, initialize it
  IF sport_name ILIKE '%cricket%' AND (NEW.extra IS NULL OR NEW.extra->'cricket' IS NULL) THEN
    NEW.extra = COALESCE(NEW.extra, '{}'::jsonb) || jsonb_build_object(
      'cricket', jsonb_build_object(
        'team_a', jsonb_build_object(
          'runs', 0,
          'wickets', 0,
          'overs', 0,
          'extras', 0,
          'balls_faced', 0,
          'fours', 0,
          'sixes', 0,
          'wides', 0,
          'no_balls', 0,
          'byes', 0,
          'leg_byes', 0,
          'run_rate', 0
        ),
        'team_b', jsonb_build_object(
          'runs', 0,
          'wickets', 0,
          'overs', 0,
          'extras', 0,
          'balls_faced', 0,
          'fours', 0,
          'sixes', 0,
          'wides', 0,
          'no_balls', 0,
          'byes', 0,
          'leg_byes', 0,
          'run_rate', 0
        )
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS initialize_cricket_data_trigger ON public.fixtures;

-- Create trigger
CREATE TRIGGER initialize_cricket_data_trigger
  BEFORE INSERT OR UPDATE ON public.fixtures
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_cricket_data();

-- Function to backfill existing cricket fixtures
CREATE OR REPLACE FUNCTION public.backfill_cricket_data()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER := 0;
  fixture_record RECORD;
BEGIN
  -- Find cricket fixtures without cricket data
  FOR fixture_record IN
    SELECT f.id, f.extra
    FROM public.fixtures f
    JOIN public.sports s ON f.sport_id = s.id
    WHERE s.name ILIKE '%cricket%'
      AND (f.extra IS NULL OR f.extra->'cricket' IS NULL)
  LOOP
    -- Update the fixture with cricket data
    UPDATE public.fixtures
    SET extra = COALESCE(extra, '{}'::jsonb) || jsonb_build_object(
      'cricket', jsonb_build_object(
        'team_a', jsonb_build_object(
          'runs', 0,
          'wickets', 0,
          'overs', 0,
          'extras', 0,
          'balls_faced', 0,
          'fours', 0,
          'sixes', 0,
          'wides', 0,
          'no_balls', 0,
          'byes', 0,
          'leg_byes', 0,
          'run_rate', 0
        ),
        'team_b', jsonb_build_object(
          'runs', 0,
          'wickets', 0,
          'overs', 0,
          'extras', 0,
          'balls_faced', 0,
          'fours', 0,
          'sixes', 0,
          'wides', 0,
          'no_balls', 0,
          'byes', 0,
          'leg_byes', 0,
          'run_rate', 0
        )
      )
    )
    WHERE id = fixture_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.backfill_cricket_data TO authenticated;

-- Run the backfill function
SELECT public.backfill_cricket_data() as fixtures_updated;

RAISE NOTICE 'Cricket data initialization complete!';
RAISE NOTICE 'Trigger created to auto-initialize cricket data for new cricket fixtures.';
RAISE NOTICE 'Existing cricket fixtures have been backfilled with cricket data structure.';
