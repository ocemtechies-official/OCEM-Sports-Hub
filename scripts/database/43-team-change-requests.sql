-- Team Change Requests - for captain-submitted member updates requiring admin approval
BEGIN;

CREATE TABLE IF NOT EXISTS public.team_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- change_type currently supports only 'members'; can be extended later
  change_type TEXT NOT NULL CHECK (change_type IN ('members')),
  -- Proposed changes payload; for 'members', expect an array of member objects matching public.team_members shape (excluding id)
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_change_requests_team ON public.team_change_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_change_requests_requested_by ON public.team_change_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_team_change_requests_status ON public.team_change_requests(status);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_updated_at_column_tcr()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_team_change_requests_updated_at ON public.team_change_requests;
CREATE TRIGGER update_team_change_requests_updated_at
    BEFORE UPDATE ON public.team_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_tcr();

COMMIT;


