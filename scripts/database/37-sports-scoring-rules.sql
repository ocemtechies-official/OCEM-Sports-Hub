-- ==========================================
-- OCEM Sports Hub - Sports Scoring Rules
-- ==========================================
-- Adds scoring_rules jsonb to public.sports to support sport-specific
-- scoring/points config. Idempotent and safe to re-run.

BEGIN;

-- Ensure extension for jsonb ops (usually default in Postgres)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- sports.scoring_rules jsonb (nullable)
ALTER TABLE public.sports
  ADD COLUMN IF NOT EXISTS scoring_rules JSONB;

-- Optional: set minimal defaults for common sports where null
-- We avoid overwriting any existing non-null configs
UPDATE public.sports
SET scoring_rules =
  CASE lower(name)
    WHEN 'football' THEN jsonb_build_object('scoring_metric','goals','win_points',3,'draw_points',1,'loss_points',0)
    WHEN 'basketball' THEN jsonb_build_object('scoring_metric','points','win_points',2,'loss_points',0)
    WHEN 'volleyball' THEN jsonb_build_object('scoring_metric','sets','win_points',2,'loss_points',0)
    WHEN 'badminton' THEN jsonb_build_object('scoring_metric','sets','best_of',3,'win_points',2,'loss_points',0)
    WHEN 'tennis' THEN jsonb_build_object('scoring_metric','sets','best_of',3,'win_points',2,'loss_points',0)
    WHEN 'chess' THEN jsonb_build_object('scoring_metric','result','win',1,'draw',0.5,'loss',0)
    WHEN 'cricket' THEN jsonb_build_object('scoring_metric','runs','win_points',2,'tie_points',1,'loss_points',0,'use_nrr',true)
    WHEN 'quiz' THEN jsonb_build_object('scoring_metric','score','rank_based',true)
    ELSE jsonb_build_object('scoring_metric','points')
  END
WHERE scoring_rules IS NULL;

COMMIT;


