-- Add phone and roll number to team_members; keep email optional
BEGIN;

-- Add new columns if they don't exist
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS member_roll_number TEXT,
ADD COLUMN IF NOT EXISTS member_phone TEXT;

-- Optional: backfill member_phone from legacy member_contact
UPDATE public.team_members
SET member_phone = COALESCE(member_phone, member_contact)
WHERE member_phone IS NULL AND member_contact IS NOT NULL;

COMMIT;


