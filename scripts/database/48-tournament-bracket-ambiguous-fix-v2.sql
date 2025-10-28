-- Fix for tournament bracket generation function with explicit table references
CREATE OR REPLACE FUNCTION generate_tournament_bracket(input_tournament_id UUID)
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
    SELECT tournaments.* INTO tournament_record 
    FROM tournaments 
    WHERE tournaments.id = input_tournament_id;

    -- Check if tournament exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tournament not found: %', input_tournament_id;
    END IF;

    -- Calculate number of teams with explicit table reference
    SELECT COUNT(*) INTO num_teams 
    FROM tournament_teams tt
    WHERE tt.tournament_id = input_tournament_id;

    -- Check if there are teams in the tournament
    IF num_teams = 0 THEN
        RAISE EXCEPTION 'No teams registered for tournament: %', input_tournament_id;
    END IF;

    -- Delete existing rounds and fixtures for this tournament with explicit table references
    DELETE FROM fixtures f
    WHERE f.tournament_id = input_tournament_id;
    
    DELETE FROM tournament_rounds tr
    WHERE tr.tournament_id = input_tournament_id;

    -- Calculate number of rounds needed based on tournament type
    IF tournament_record.tournament_type = 'single_elimination' THEN
        -- For single elimination: log2(num_teams) rounded up
        num_rounds := CEIL(LOG(2, GREATEST(num_teams, 2)));
        matches_per_round := num_teams / 2;

        -- Create rounds
        FOR i IN 1..num_rounds LOOP
            -- Insert round with explicit column references
            INSERT INTO tournament_rounds 
                (tournament_id, round_number, round_name, total_matches)
            VALUES 
                (input_tournament_id, 
                 i,
                 CASE 
                     WHEN i = num_rounds THEN 'Final'
                     WHEN i = num_rounds - 1 THEN 'Semi-finals'
                     WHEN i = num_rounds - 2 THEN 'Quarter-finals'
                     ELSE 'Round ' || i
                 END,
                 matches_per_round)
            RETURNING tournament_rounds.id INTO next_round_id;

            -- Create fixtures for this round
            IF i = 1 THEN
                -- First round: Create matches between teams based on seeding
                WITH seeded_teams AS (
                    SELECT 
                        tt.team_id,
                        tt.bracket_position,
                        tt.seed,
                        ROW_NUMBER() OVER (ORDER BY tt.seed) as rn
                    FROM tournament_teams tt
                    WHERE tt.tournament_id = input_tournament_id
                )
                INSERT INTO fixtures 
                    (tournament_id, tournament_round_id, team_a_id, team_b_id, status, scheduled_at, bracket_position)
                SELECT 
                    input_tournament_id,
                    next_round_id,
                    t1.team_id,
                    t2.team_id,
                    'scheduled'::text,
                    tournament_record.start_date + ((i-1) || ' days')::interval,
                    t1.bracket_position
                FROM seeded_teams t1
                JOIN seeded_teams t2 ON t2.rn = (num_teams + 1 - t1.rn)
                WHERE t1.rn <= num_teams/2
                ORDER BY t1.rn
                LIMIT matches_per_round;
            ELSE
                -- Other rounds: Create empty matches that will be filled as teams advance
                INSERT INTO fixtures 
                    (tournament_id, tournament_round_id, status, scheduled_at, bracket_position)
                SELECT 
                    input_tournament_id,
                    next_round_id,
                    'scheduled'::text,
                    tournament_record.start_date + ((i-1) || ' days')::interval,
                    generate_series(1, matches_per_round);
            END IF;

            matches_per_round := matches_per_round / 2;
            EXIT WHEN matches_per_round = 0;
        END LOOP;

    ELSIF tournament_record.tournament_type = 'round_robin' THEN
        -- For round robin: each team plays against every other team
        num_rounds := num_teams - 1;
        matches_per_round := num_teams / 2;

        -- Create round robin schedule using circle method
        FOR i IN 1..num_rounds LOOP
            -- Insert round with explicit column references
            INSERT INTO tournament_rounds 
                (tournament_id, round_number, round_name, total_matches)
            VALUES 
                (input_tournament_id, i, 'Round ' || i, matches_per_round)
            RETURNING tournament_rounds.id INTO next_round_id;

            -- Create fixtures for this round using round robin algorithm
            -- Using a CTE with explicit table references
            WITH base_teams AS (
                SELECT 
                    tt.team_id,
                    ROW_NUMBER() OVER (ORDER BY tt.team_id) as team_num
                FROM tournament_teams tt
                WHERE tt.tournament_id = input_tournament_id
            )
            INSERT INTO fixtures 
                (tournament_id, tournament_round_id, team_a_id, team_b_id, status, scheduled_at, bracket_position)
            SELECT DISTINCT 
                input_tournament_id,
                next_round_id,
                t1.team_id,
                t2.team_id,
                'scheduled'::text,
                tournament_record.start_date + ((i-1) || ' days')::interval,
                ROW_NUMBER() OVER ()
            FROM base_teams t1
            CROSS JOIN base_teams t2
            WHERE t1.team_id < t2.team_id
            LIMIT matches_per_round;
        END LOOP;
    END IF;

    -- Update tournament status with explicit table reference
    UPDATE tournaments t
    SET status = 'active' 
    WHERE t.id = input_tournament_id;
END;
$$ LANGUAGE plpgsql;