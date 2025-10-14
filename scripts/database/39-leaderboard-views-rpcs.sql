-- ======================================================
-- OCEM Sports Hub - Leaderboard Views and RPCs (with NRR)
-- ======================================================
-- Computes season and tournament leaderboards from fixtures.
-- Safe to re-run via CREATE OR REPLACE VIEW / FUNCTION.

BEGIN;

-- Helper: normalize sport points based on sports.scoring_rules
-- Returns win_points, draw_points, loss_points with sensible defaults
CREATE OR REPLACE FUNCTION public.get_points_config(p_sport UUID)
RETURNS TABLE(win_points NUMERIC, draw_points NUMERIC, loss_points NUMERIC)
LANGUAGE sql
AS $$
  SELECT
    COALESCE((scoring_rules->>'win_points')::NUMERIC, 3) AS win_points,
    COALESCE((scoring_rules->>'draw_points')::NUMERIC, 0) AS draw_points,
    COALESCE((scoring_rules->>'loss_points')::NUMERIC, 0) AS loss_points
  FROM public.sports s
  WHERE s.id = p_sport
$$;

-- Helper: compute cricket fixture aggregates needed for NRR
-- Assumes fixtures.extra contains JSON like { runs_a, runs_b, overs_a, overs_b }
CREATE OR REPLACE FUNCTION public.cricket_agg_for_fixture(p_fixture_id UUID)
RETURNS TABLE(team_a_runs NUMERIC, team_b_runs NUMERIC, team_a_overs NUMERIC, team_b_overs NUMERIC)
LANGUAGE sql
AS $$
  SELECT
    COALESCE((f.extra->>'runs_a')::NUMERIC, f.team_a_score::NUMERIC) AS team_a_runs,
    COALESCE((f.extra->>'runs_b')::NUMERIC, f.team_b_score::NUMERIC) AS team_b_runs,
    COALESCE((f.extra->>'overs_a')::NUMERIC, NULL) AS team_a_overs,
    COALESCE((f.extra->>'overs_b')::NUMERIC, NULL) AS team_b_overs
  FROM public.fixtures f
  WHERE f.id = p_fixture_id
$$;

-- View: tournament leaderboard (per tournament, sport, gender, team)
CREATE OR REPLACE VIEW public.v_leaderboard_tournament AS
WITH base AS (
  SELECT
    f.tournament_id,
    f.sport_id,
    f.gender,
    f.team_a_id AS team_id,
    CASE WHEN f.team_a_score IS NULL OR f.team_b_score IS NULL THEN NULL
         WHEN f.team_a_score > f.team_b_score THEN 'win'
         WHEN f.team_a_score = f.team_b_score THEN 'draw'
         ELSE 'loss' END AS result,
    f.id AS fixture_id
  FROM public.fixtures f
  WHERE f.status = 'finished' AND f.tournament_id IS NOT NULL
  UNION ALL
  SELECT
    f.tournament_id,
    f.sport_id,
    f.gender,
    f.team_b_id AS team_id,
    CASE WHEN f.team_a_score IS NULL OR f.team_b_score IS NULL THEN NULL
         WHEN f.team_b_score > f.team_a_score THEN 'win'
         WHEN f.team_a_score = f.team_b_score THEN 'draw'
         ELSE 'loss' END AS result,
    f.id AS fixture_id
  FROM public.fixtures f
  WHERE f.status = 'finished' AND f.tournament_id IS NOT NULL
), pts AS (
  SELECT
    b.tournament_id,
    b.sport_id,
    b.gender,
    b.team_id,
    COUNT(*) FILTER (WHERE b.result IS NOT NULL) AS matches_played,
    COUNT(*) FILTER (WHERE b.result = 'win') AS wins,
    COUNT(*) FILTER (WHERE b.result = 'loss') AS losses,
    COUNT(*) FILTER (WHERE b.result = 'draw') AS draws,
    -- Points via get_points_config
    SUM(
      CASE b.result
        WHEN 'win'  THEN (SELECT win_points FROM public.get_points_config(b.sport_id))
        WHEN 'draw' THEN (SELECT draw_points FROM public.get_points_config(b.sport_id))
        WHEN 'loss' THEN (SELECT loss_points FROM public.get_points_config(b.sport_id))
      END
    )::NUMERIC AS points,
    -- Goal diff proxy (score diff) when available
    SUM(
      CASE WHEN b.team_id = f.team_a_id THEN COALESCE(f.team_a_score,0) - COALESCE(f.team_b_score,0)
           ELSE COALESCE(f.team_b_score,0) - COALESCE(f.team_a_score,0) END
    ) AS goal_diff,
    -- Cricket NRR components aggregated per team via LATERAL agg
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_a_runs
             WHEN b.team_id = f.team_b_id THEN caf.team_b_runs
             ELSE NULL END
      ELSE NULL END
    ) AS runs_scored,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_b_runs
             WHEN b.team_id = f.team_b_id THEN caf.team_a_runs
             ELSE NULL END
      ELSE NULL END
    ) AS runs_conceded,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_a_overs
             WHEN b.team_id = f.team_b_id THEN caf.team_b_overs
             ELSE NULL END
      ELSE NULL END
    ) AS overs_faced,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_b_overs
             WHEN b.team_id = f.team_b_id THEN caf.team_a_overs
             ELSE NULL END
      ELSE NULL END
    ) AS overs_bowled
  FROM base b
  JOIN public.fixtures f ON f.id = b.fixture_id
  JOIN public.sports s ON s.id = b.sport_id
  LEFT JOIN LATERAL public.cricket_agg_for_fixture(f.id) caf ON true
  GROUP BY b.tournament_id, b.sport_id, b.gender, b.team_id
)
SELECT
  tournament_id, sport_id, gender, team_id,
  matches_played, wins, losses, draws, points,
  goal_diff,
  CASE WHEN lower(s.name) = 'cricket' AND overs_faced IS NOT NULL AND overs_bowled IS NOT NULL AND overs_faced > 0 AND overs_bowled > 0
       THEN (runs_scored / overs_faced) - (runs_conceded / overs_bowled)
       ELSE NULL END AS nrr
FROM pts
JOIN public.sports s ON s.id = pts.sport_id;

-- View: season leaderboard (per season_key, sport, gender, team)
CREATE OR REPLACE VIEW public.v_leaderboard_season AS
WITH base AS (
  SELECT
    f.season_key,
    f.sport_id,
    f.gender,
    f.team_a_id AS team_id,
    CASE WHEN f.team_a_score IS NULL OR f.team_b_score IS NULL THEN NULL
         WHEN f.team_a_score > f.team_b_score THEN 'win'
         WHEN f.team_a_score = f.team_b_score THEN 'draw'
         ELSE 'loss' END AS result,
    f.id AS fixture_id
  FROM public.fixtures f
  WHERE f.status = 'finished' AND f.season_key IS NOT NULL
  UNION ALL
  SELECT
    f.season_key,
    f.sport_id,
    f.gender,
    f.team_b_id AS team_id,
    CASE WHEN f.team_a_score IS NULL OR f.team_b_score IS NULL THEN NULL
         WHEN f.team_b_score > f.team_a_score THEN 'win'
         WHEN f.team_a_score = f.team_b_score THEN 'draw'
         ELSE 'loss' END AS result,
    f.id AS fixture_id
  FROM public.fixtures f
  WHERE f.status = 'finished' AND f.season_key IS NOT NULL
), pts AS (
  SELECT
    b.season_key,
    b.sport_id,
    b.gender,
    b.team_id,
    COUNT(*) FILTER (WHERE b.result IS NOT NULL) AS matches_played,
    COUNT(*) FILTER (WHERE b.result = 'win') AS wins,
    COUNT(*) FILTER (WHERE b.result = 'loss') AS losses,
    COUNT(*) FILTER (WHERE b.result = 'draw') AS draws,
    SUM(
      CASE b.result
        WHEN 'win'  THEN (SELECT win_points FROM public.get_points_config(b.sport_id))
        WHEN 'draw' THEN (SELECT draw_points FROM public.get_points_config(b.sport_id))
        WHEN 'loss' THEN (SELECT loss_points FROM public.get_points_config(b.sport_id))
      END
    )::NUMERIC AS points,
    SUM(
      CASE WHEN b.team_id = f.team_a_id THEN COALESCE(f.team_a_score,0) - COALESCE(f.team_b_score,0)
           ELSE COALESCE(f.team_b_score,0) - COALESCE(f.team_a_score,0) END
    ) AS goal_diff,
    -- NRR components via LATERAL agg
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_a_runs
             WHEN b.team_id = f.team_b_id THEN caf.team_b_runs
             ELSE NULL END
      ELSE NULL END
    ) AS runs_scored,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_b_runs
             WHEN b.team_id = f.team_b_id THEN caf.team_a_runs
             ELSE NULL END
      ELSE NULL END
    ) AS runs_conceded,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_a_overs
             WHEN b.team_id = f.team_b_id THEN caf.team_b_overs
             ELSE NULL END
      ELSE NULL END
    ) AS overs_faced,
    SUM(
      CASE WHEN lower(s.name) = 'cricket' THEN
        CASE WHEN b.team_id = f.team_a_id THEN caf.team_b_overs
             WHEN b.team_id = f.team_b_id THEN caf.team_a_overs
             ELSE NULL END
      ELSE NULL END
    ) AS overs_bowled
  FROM base b
  JOIN public.fixtures f ON f.id = b.fixture_id
  JOIN public.sports s ON s.id = b.sport_id
  LEFT JOIN LATERAL public.cricket_agg_for_fixture(f.id) caf ON true
  GROUP BY b.season_key, b.sport_id, b.gender, b.team_id
)
SELECT
  season_key, sport_id, gender, team_id,
  matches_played, wins, losses, draws, points,
  goal_diff,
  CASE WHEN lower(s.name) = 'cricket' AND overs_faced IS NOT NULL AND overs_bowled IS NOT NULL AND overs_faced > 0 AND overs_bowled > 0
       THEN (runs_scored / overs_faced) - (runs_conceded / overs_bowled)
       ELSE NULL END AS nrr
FROM pts
JOIN public.sports s ON s.id = pts.sport_id;

-- RPC: get tournament leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard_tournament(
  p_tournament UUID,
  p_gender TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF public.v_leaderboard_tournament
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.v_leaderboard_tournament v
  WHERE v.tournament_id = p_tournament
    AND (p_gender IS NULL OR v.gender = p_gender)
  ORDER BY v.points DESC NULLS LAST, v.nrr DESC NULLS LAST, v.goal_diff DESC NULLS LAST
  OFFSET p_offset LIMIT p_limit
$$;

-- RPC: get season leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard_season(
  p_sport UUID,
  p_gender TEXT DEFAULT NULL,
  p_season TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS SETOF public.v_leaderboard_season
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.v_leaderboard_season v
  WHERE v.sport_id = p_sport
    AND (p_gender IS NULL OR v.gender = p_gender)
    AND (p_season IS NULL OR v.season_key = p_season)
  ORDER BY v.points DESC NULLS LAST, v.nrr DESC NULLS LAST, v.goal_diff DESC NULLS LAST
  OFFSET p_offset LIMIT p_limit
$$;

COMMIT;


