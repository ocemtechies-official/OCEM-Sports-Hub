-- Align team_members schema with UI (supports member_email)
BEGIN;

ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS member_email TEXT;

COMMIT;


