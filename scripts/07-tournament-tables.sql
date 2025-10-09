-- Tournament system tables for bracket functionality

-- Tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  tournament_type TEXT NOT NULL DEFAULT 'single_elimination' 
    CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin')),
  max_teams INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  winner_id UUID REFERENCES public.teams(id),
  bracket_structure JSONB DEFAULT '{}', -- Stores bracket layout and connections
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament Teams (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  seed INTEGER, -- Tournament seeding (1 = top seed)
  bracket_position INTEGER, -- Position in bracket layout
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

-- Tournament Rounds
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL, -- 1 = First Round, 2 = Quarter-finals, etc.
  round_name TEXT NOT NULL, -- "Round 1", "Quarter-finals", "Semi-finals", "Final"
  total_matches INTEGER NOT NULL,
  completed_matches INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tournament reference to fixtures table
ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;

ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS tournament_round_id UUID REFERENCES public.tournament_rounds(id) ON DELETE SET NULL;

ALTER TABLE public.fixtures 
ADD COLUMN IF NOT EXISTS bracket_position INTEGER; -- Position within the round

-- Create indexes for tournament queries
CREATE INDEX IF NOT EXISTS idx_tournaments_sport ON public.tournaments(sport_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament ON public.tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_team ON public.tournament_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_tournament_rounds_tournament ON public.tournament_rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament ON public.fixtures(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament_round ON public.fixtures(tournament_round_id);

-- Sample tournament data function
CREATE OR REPLACE FUNCTION create_sample_tournament()
RETURNS void AS $$
DECLARE
    tournament_uuid UUID;
    sport_uuid UUID;
    round1_uuid UUID;
    round2_uuid UUID;
    round3_uuid UUID;
    final_uuid UUID;
    team_ids UUID[];
    i INTEGER;
BEGIN
    -- Get football sport ID
    SELECT id INTO sport_uuid FROM sports WHERE name = 'Football' LIMIT 1;
    
    IF sport_uuid IS NULL THEN
        RAISE EXCEPTION 'Football sport not found';
    END IF;

    -- Create tournament
    INSERT INTO tournaments (name, description, sport_id, tournament_type, max_teams, status, start_date)
    VALUES (
        '2024 Football Championship',
        'Annual football tournament with elimination rounds',
        sport_uuid,
        'single_elimination',
        16,
        'active',
        NOW()
    ) RETURNING id INTO tournament_uuid;

    -- Create rounds
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (tournament_uuid, 1, 'Round of 16', 8) RETURNING id INTO round1_uuid;
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (tournament_uuid, 2, 'Quarter-finals', 4) RETURNING id INTO round2_uuid;
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (tournament_uuid, 3, 'Semi-finals', 2) RETURNING id INTO round3_uuid;
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (tournament_uuid, 4, 'Final', 1) RETURNING id INTO final_uuid;

    -- Get team IDs (limit to 16 for bracket)
    SELECT ARRAY(SELECT id FROM teams LIMIT 16) INTO team_ids;

    -- Add teams to tournament with seeding
    FOR i IN 1..LEAST(array_length(team_ids, 1), 16) LOOP
        INSERT INTO tournament_teams (tournament_id, team_id, seed, bracket_position)
        VALUES (tournament_uuid, team_ids[i], i, i);
    END LOOP;

END;
$$ LANGUAGE plpgsql;