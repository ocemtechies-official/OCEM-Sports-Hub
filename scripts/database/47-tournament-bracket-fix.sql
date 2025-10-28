-- Fixed tournament bracket generation function
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
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM tournaments 
    WHERE id = tournament_id;

    -- Check if tournament exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tournament not found: %', tournament_id;
    END IF;

    -- Calculate number of teams
    SELECT COUNT(*) INTO num_teams 
    FROM tournament_teams 
    WHERE tournament_id = generate_tournament_bracket.tournament_id;

    -- Check if there are teams in the tournament
    IF num_teams = 0 THEN
        RAISE EXCEPTION 'No teams registered for tournament: %', tournament_id;
    END IF;

    -- Delete existing rounds and fixtures for this tournament
    DELETE FROM fixtures 
    WHERE tournament_id = generate_tournament_bracket.tournament_id;
    
    DELETE FROM tournament_rounds 
    WHERE tournament_id = generate_tournament_bracket.tournament_id;

    -- Calculate number of rounds needed based on tournament type
    IF tournament_record.tournament_type = 'single_elimination' THEN
        -- For single elimination: log2(num_teams) rounded up
        num_rounds := CEIL(LOG(2, GREATEST(num_teams, 2)));
        matches_per_round := num_teams / 2;

        -- Create rounds
        FOR i IN 1..num_rounds LOOP
            INSERT INTO tournament_rounds 
                (tournament_id, round_number, round_name, total_matches)
            VALUES 
                (generate_tournament_bracket.tournament_id, 
                 i,
                 CASE 
                     WHEN i = num_rounds THEN 'Final'
                     WHEN i = num_rounds - 1 THEN 'Semi-finals'
                     WHEN i = num_rounds - 2 THEN 'Quarter-finals'
                     ELSE 'Round ' || i
                 END,
                 matches_per_round)
            RETURNING id INTO next_round_id;

            -- Create fixtures for this round
            IF i = 1 THEN
                -- First round: Create matches between teams based on seeding
                INSERT INTO fixtures 
                    (tournament_id, tournament_round_id, team_a_id, team_b_id, status, scheduled_at, bracket_position)
                SELECT 
                    generate_tournament_bracket.tournament_id,
                    next_round_id,
                    t1.team_id,
                    t2.team_id,
                    'scheduled',
                    tournament_record.start_date + ((i-1) || ' days')::interval,
                    t1.bracket_position
                FROM 
                    (SELECT team_id, bracket_position, seed
                     FROM tournament_teams 
                     WHERE tournament_id = generate_tournament_bracket.tournament_id 
                     ORDER BY seed) t1
                JOIN 
                    (SELECT team_id, bracket_position, seed
                     FROM tournament_teams 
                     WHERE tournament_id = generate_tournament_bracket.tournament_id 
                     ORDER BY seed DESC) t2
                ON t1.seed < t2.seed AND t1.seed + t2.seed = num_teams + 1
                LIMIT matches_per_round;
            ELSE
                -- Other rounds: Create empty matches that will be filled as teams advance
                INSERT INTO fixtures 
                    (tournament_id, tournament_round_id, status, scheduled_at, bracket_position)
                SELECT 
                    generate_tournament_bracket.tournament_id,
                    next_round_id,
                    'scheduled',
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
            INSERT INTO tournament_rounds 
                (tournament_id, round_number, round_name, total_matches)
            VALUES 
                (generate_tournament_bracket.tournament_id, i, 'Round ' || i, matches_per_round)
            RETURNING id INTO next_round_id;

            -- Create fixtures for this round using round robin algorithm
            INSERT INTO fixtures 
                (tournament_id, tournament_round_id, team_a_id, team_b_id, status, scheduled_at, bracket_position)
            SELECT 
                generate_tournament_bracket.tournament_id,
                next_round_id,
                t1.team_id,
                t2.team_id,
                'scheduled',
                tournament_record.start_date + ((i-1) || ' days')::interval,
                ROW_NUMBER() OVER ()
            FROM 
                tournament_teams t1
            JOIN 
                tournament_teams t2
            ON t1.team_id < t2.team_id
            WHERE 
                t1.tournament_id = generate_tournament_bracket.tournament_id
                AND t2.tournament_id = generate_tournament_bracket.tournament_id
            LIMIT matches_per_round;
        END LOOP;
    END IF;

    -- Update tournament status to active
    UPDATE tournaments 
    SET status = 'active' 
    WHERE id = generate_tournament_bracket.tournament_id;
END;
$$ LANGUAGE plpgsql;