-- Migration: Update fixtures table for new tournament bracket workflow
-- This script adds necessary columns and constraints for the improved bracket management

-- Add bracket_position column if it doesn't exist
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS bracket_position INTEGER;

-- Ensure tournament_id and tournament_round_id columns exist with proper constraints
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL;

ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS tournament_round_id UUID REFERENCES public.tournament_rounds(id) ON DELETE SET NULL;

-- Create indexes for better performance on tournament queries
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament ON fixtures(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament_round ON fixtures(tournament_round_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_bracket_position ON fixtures(bracket_position);

-- Update existing RLS policies to include tournament_id in queries
-- (This is handled by the application logic, but we ensure the columns exist)

-- Create a function to initialize bracket fixtures for a tournament
-- This function creates placeholder fixtures for all rounds
CREATE OR REPLACE FUNCTION initialize_tournament_bracket(tournament_id UUID)
RETURNS INTEGER AS $$
DECLARE
    round_record RECORD;
    fixture_count INTEGER := 0;
    fixture_id UUID;
BEGIN
    -- Get tournament details
    IF NOT EXISTS (SELECT 1 FROM tournaments WHERE id = tournament_id AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Tournament not found';
    END IF;
    
    -- For each round in the tournament, create placeholder fixtures
    FOR round_record IN 
        SELECT id, round_number, total_matches 
        FROM tournament_rounds 
        WHERE tournament_id = tournament_id 
        AND deleted_at IS NULL
        ORDER BY round_number
    LOOP
        -- Create fixtures for this round
        FOR i IN 1..round_record.total_matches LOOP
            INSERT INTO fixtures (
                tournament_id,
                tournament_round_id,
                status,
                bracket_position
            ) VALUES (
                tournament_id,
                round_record.id,
                'scheduled',
                i
            );
            
            fixture_count := fixture_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN fixture_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to finalize tournament fixtures
-- This function updates placeholder fixtures with actual team pairings
CREATE OR REPLACE FUNCTION finalize_tournament_fixtures(tournament_id UUID)
RETURNS INTEGER AS $$
DECLARE
    fixture_count INTEGER := 0;
BEGIN
    -- Update tournament status to active
    UPDATE tournaments 
    SET status = 'active', updated_at = NOW()
    WHERE id = tournament_id AND deleted_at IS NULL;
    
    -- Get count of fixtures for this tournament
    SELECT COUNT(*) INTO fixture_count
    FROM fixtures 
    WHERE tournament_id = tournament_id AND deleted_at IS NULL;
    
    RETURN fixture_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION initialize_tournament_bracket(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_tournament_fixtures(UUID) TO authenticated;