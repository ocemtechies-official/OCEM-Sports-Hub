-- ==========================================
-- OCEM Sports Hub - Cricket Scoring System Test
-- ==========================================
-- Comprehensive test script for cricket scoring functionality
-- Run this after applying cricket optimizations

BEGIN;

-- Test 1: Verify database structure
DO $$
DECLARE
  extra_column_exists BOOLEAN;
  updated_by_column_exists BOOLEAN;
  version_column_exists BOOLEAN;
  gin_index_exists BOOLEAN;
BEGIN
  -- Check if extra column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fixtures' AND column_name = 'extra'
  ) INTO extra_column_exists;
  
  -- Check if updated_by column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fixtures' AND column_name = 'updated_by'
  ) INTO updated_by_column_exists;
  
  -- Check if version column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fixtures' AND column_name = 'version'
  ) INTO version_column_exists;
  
  -- Check if GIN index exists
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_fixtures_extra_gin'
  ) INTO gin_index_exists;
  
  -- Report results
  RAISE NOTICE 'Database Structure Check:';
  RAISE NOTICE '  extra column: %', CASE WHEN extra_column_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '  updated_by column: %', CASE WHEN updated_by_column_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '  version column: %', CASE WHEN version_column_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '  GIN index: %', CASE WHEN gin_index_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
END $$;

-- Test 2: Create test cricket fixture
DO $$
DECLARE
  test_fixture_id UUID;
  cricket_sport_id UUID;
  test_team_a_id UUID;
  test_team_b_id UUID;
BEGIN
  -- Get or create cricket sport
  SELECT id INTO cricket_sport_id FROM public.sports WHERE name = 'Cricket' LIMIT 1;
  IF cricket_sport_id IS NULL THEN
    INSERT INTO public.sports (name, icon) VALUES ('Cricket', '🏏') RETURNING id INTO cricket_sport_id;
  END IF;
  
  -- Get or create test teams
  SELECT id INTO test_team_a_id FROM public.teams WHERE name = 'Test Team A' LIMIT 1;
  IF test_team_a_id IS NULL THEN
    INSERT INTO public.teams (name, color) VALUES ('Test Team A', '#FF0000') RETURNING id INTO test_team_a_id;
  END IF;
  
  SELECT id INTO test_team_b_id FROM public.teams WHERE name = 'Test Team B' LIMIT 1;
  IF test_team_b_id IS NULL THEN
    INSERT INTO public.teams (name, color) VALUES ('Test Team B', '#0000FF') RETURNING id INTO test_team_b_id;
  END IF;
  
  -- Create test fixture
  INSERT INTO public.fixtures (
    sport_id, team_a_id, team_b_id, scheduled_at, venue, status,
    team_a_score, team_b_score, extra
  ) VALUES (
    cricket_sport_id, test_team_a_id, test_team_b_id, 
    NOW() + INTERVAL '1 hour', 'Test Ground', 'live',
    0, 0,
    '{
      "cricket": {
        "team_a": {
          "runs": 0, "wickets": 0, "overs": 0, "extras": 0, "balls_faced": 0,
          "fours": 0, "sixes": 0, "wides": 0, "no_balls": 0, "byes": 0, "leg_byes": 0, "run_rate": 0
        },
        "team_b": {
          "runs": 0, "wickets": 0, "overs": 0, "extras": 0, "balls_faced": 0,
          "fours": 0, "sixes": 0, "wides": 0, "no_balls": 0, "byes": 0, "leg_byes": 0, "run_rate": 0
        }
      }
    }'::jsonb
  ) RETURNING id INTO test_fixture_id;
  
  RAISE NOTICE 'Test fixture created with ID: %', test_fixture_id;
END $$;

-- Test 3: Test cricket data validation
DO $$
DECLARE
  validation_result BOOLEAN;
BEGIN
  -- Test valid cricket team data
  SELECT public.validate_cricket_team_data('{
    "runs": 100, "wickets": 3, "overs": 20.5, "extras": 8, "balls_faced": 123,
    "fours": 12, "sixes": 3, "wides": 4, "no_balls": 2, "byes": 1, "leg_byes": 1, "run_rate": 6.0
  }'::jsonb) INTO validation_result;
  
  RAISE NOTICE 'Valid cricket data validation: %', CASE WHEN validation_result THEN '✅ PASSED' ELSE '❌ FAILED' END;
  
  -- Test invalid cricket team data
  SELECT public.validate_cricket_team_data('{
    "runs": "invalid", "wickets": 3, "overs": 20.5
  }'::jsonb) INTO validation_result;
  
  RAISE NOTICE 'Invalid cricket data validation: %', CASE WHEN NOT validation_result THEN '✅ PASSED' ELSE '❌ FAILED' END;
END $$;

-- Test 4: Test run rate calculation
DO $$
DECLARE
  run_rate DECIMAL;
BEGIN
  SELECT public.calculate_cricket_run_rate(120, 20.0) INTO run_rate;
  RAISE NOTICE 'Run rate calculation (120 runs in 20 overs): %', run_rate;
  
  SELECT public.calculate_cricket_run_rate(0, 0) INTO run_rate;
  RAISE NOTICE 'Run rate calculation (0 runs in 0 overs): %', run_rate;
END $$;

-- Test 5: Test cricket stats function
DO $$
DECLARE
  stats JSONB;
  test_fixture_id UUID;
BEGIN
  -- Get test fixture ID
  SELECT f.id INTO test_fixture_id
  FROM public.fixtures f
  JOIN public.sports s ON f.sport_id = s.id
  WHERE s.name = 'Cricket' AND f.venue = 'Test Ground'
  LIMIT 1;
  
  IF test_fixture_id IS NOT NULL THEN
    SELECT public.get_cricket_stats(test_fixture_id) INTO stats;
    RAISE NOTICE 'Cricket stats retrieved: %', stats;
  ELSE
    RAISE NOTICE 'No test fixture found for stats test';
  END IF;
END $$;

-- Test 6: Test cricket match summary view
DO $$
DECLARE
  match_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO match_count FROM public.cricket_match_summary;
  RAISE NOTICE 'Cricket match summary view: % matches found', match_count;
END $$;

-- Test 7: Test RLS policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'fixtures' AND policyname LIKE '%moderator%';
  
  RAISE NOTICE 'Moderator RLS policies: % found', policy_count;
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'match_updates';
  
  RAISE NOTICE 'Match updates RLS policies: % found', policy_count;
END $$;

-- Test 8: Performance test with GIN index
DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  query_time INTERVAL;
BEGIN
  start_time := clock_timestamp();
  
  -- Query using GIN index
  PERFORM COUNT(*) FROM public.fixtures 
  WHERE extra @> '{"cricket": {"team_a": {"runs": 0}}}';
  
  end_time := clock_timestamp();
  query_time := end_time - start_time;
  
  RAISE NOTICE 'GIN index query performance: %', query_time;
END $$;

-- Test 9: Test audit trail functionality
DO $$
DECLARE
  audit_count INTEGER;
  test_fixture_id UUID;
BEGIN
  -- Get test fixture ID
  SELECT f.id INTO test_fixture_id
  FROM public.fixtures f
  JOIN public.sports s ON f.sport_id = s.id
  WHERE s.name = 'Cricket' AND f.venue = 'Test Ground'
  LIMIT 1;
  
  IF test_fixture_id IS NOT NULL THEN
    -- Count existing audit entries
    SELECT COUNT(*) INTO audit_count
    FROM public.match_updates
    WHERE fixture_id = test_fixture_id;
    
    RAISE NOTICE 'Audit trail entries for test fixture: %', audit_count;
  ELSE
    RAISE NOTICE 'No test fixture found for audit test';
  END IF;
END $$;

-- Test 10: Cleanup test data
DO $$
DECLARE
  test_fixture_id UUID;
BEGIN
  -- Get test fixture ID
  SELECT f.id INTO test_fixture_id
  FROM public.fixtures f
  JOIN public.sports s ON f.sport_id = s.id
  WHERE s.name = 'Cricket' AND f.venue = 'Test Ground'
  LIMIT 1;
  
  IF test_fixture_id IS NOT NULL THEN
    -- Delete test fixture (cascade will clean up match_updates)
    DELETE FROM public.fixtures WHERE id = test_fixture_id;
    RAISE NOTICE 'Test fixture cleaned up';
  END IF;
END $$;

COMMIT;

-- ==========================================
-- Test Results Summary
-- ==========================================
-- Run this script and check the output for:
-- ✅ All database structure checks should pass
-- ✅ Cricket data validation should work correctly
-- ✅ Run rate calculation should be accurate
-- ✅ Cricket stats function should return data
-- ✅ Cricket match summary view should be accessible
-- ✅ RLS policies should be in place
-- ✅ GIN index should provide good performance
-- ✅ Audit trail should be functional
-- ✅ Test data should be cleaned up

RAISE NOTICE 'Cricket Scoring System Test Complete!';
RAISE NOTICE 'Check the output above for any ❌ FAILED tests.';
RAISE NOTICE 'All tests should show ✅ PASSED or ✅ EXISTS for a successful setup.';
