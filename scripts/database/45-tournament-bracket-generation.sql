-- First drop the existing function to ensure clean replacement
DROP FUNCTION IF EXISTS generate_tournament_bracket(uuid);

-- Extension for tournament bracket generation with explicit table references
CREATE OR REPLACE FUNCTION generate_tournament_bracket(tournament_id UUID)
RETURNS void AS $$
DECLARE
    tournament_record RECORD;
    num_teams INTEGER;
    num_rounds INTEGER;
    matches_per_round INTEGER;
    next_round_id UUID;
    i INTEGER;
BEGIN
    -- Get tournament details with explicit table reference
    SELECT t.* INTO tournament_record 
    FROM tournaments t
    WHERE t.id = tournament_id AND t.deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tournament not found or deleted';
    END IF;
    
    -- Get team count
    SELECT COUNT(*) INTO num_teams
    FROM tournament_teams tt
    WHERE tt.tournament_id = tournament_id AND tt.deleted_at IS NULL;
    
    IF num_teams < 2 THEN
        RAISE EXCEPTION 'Need at least 2 teams to generate bracket';
    END IF;
    
    -- Calculate rounds needed (single elimination)
    num_rounds := CEIL(LOG(2, num_teams));
    
    -- Clear existing rounds for this tournament
    DELETE FROM tournament_rounds 
    WHERE tournament_id = tournament_id;
    
    -- Create rounds
    FOR i IN 1..num_rounds LOOP
        matches_per_round := POWER(2, num_rounds - i);
        
        INSERT INTO tournament_rounds (
            tournament_id,
            round_number,
            round_name,
            total_matches
        ) VALUES (
            tournament_id,
            i,
            CASE 
                WHEN i = num_rounds THEN 'Final'
                WHEN i = num_rounds - 1 THEN 'Semi-finals'
                WHEN i = num_rounds - 2 THEN 'Quarter-finals'
                ELSE 'Round ' || i
            END,
            matches_per_round
        );
    END LOOP;
    
    -- Create placeholder fixtures for all rounds
    FOR i IN 1..num_rounds LOOP
        matches_per_round := POWER(2, num_rounds - i);
        next_round_id := NULL;
        
        -- Get current round ID
        SELECT id INTO next_round_id
        FROM tournament_rounds tr
        WHERE tr.tournament_id = tournament_id 
        AND tr.round_number = i
        AND tr.deleted_at IS NULL;
        
        -- Create fixtures for this round
        FOR j IN 1..matches_per_round LOOP
            INSERT INTO fixtures (
                tournament_id,
                tournament_round_id,
                status,
                scheduled_at,
                bracket_position
            ) VALUES (
                tournament_id,
                next_round_id,
                'scheduled',
                tournament_record.start_date,
                j
            );
        END LOOP;
    END LOOP;
    
    -- Update tournament status
    UPDATE tournaments 
    SET 
        status = 'draft',
        updated_at = NOW()
    WHERE id = tournament_id;
    
END;
$$ LANGUAGE plpgsql;