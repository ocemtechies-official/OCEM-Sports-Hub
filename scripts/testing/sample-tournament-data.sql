-- Sample Tournament Data for OCEM Sports Hub
-- This script creates sample tournaments to test the UI

-- Create a sample single elimination football tournament
DO $$
DECLARE
    football_tournament_id UUID;
    cricket_tournament_id UUID;
    basketball_tournament_id UUID;
    football_sport_id UUID;
    cricket_sport_id UUID;
    basketball_sport_id UUID;
    round1_id UUID;
    round2_id UUID;
    round3_id UUID;
    final_id UUID;
    team_ids UUID[] := ARRAY(SELECT id FROM teams LIMIT 8);
BEGIN
    -- Get sport IDs
    SELECT id INTO football_sport_id FROM sports WHERE name = 'Football' LIMIT 1;
    SELECT id INTO cricket_sport_id FROM sports WHERE name = 'Cricket' LIMIT 1;
    SELECT id INTO basketball_sport_id FROM sports WHERE name = 'Basketball' LIMIT 1;
    
    -- Create Football Tournament
    INSERT INTO tournaments (name, description, sport_id, tournament_type, max_teams, status, start_date, end_date)
    VALUES (
        '2024 Football Championship',
        'Annual football championship with 8 teams competing in single elimination format',
        football_sport_id,
        'single_elimination',
        8,
        'active',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '10 days'
    ) RETURNING id INTO football_tournament_id;
    
    -- Create tournament rounds for football
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (football_tournament_id, 1, 'Quarter-finals', 4) RETURNING id INTO round1_id;
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (football_tournament_id, 2, 'Semi-finals', 2) RETURNING id INTO round2_id;
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (football_tournament_id, 3, 'Final', 1) RETURNING id INTO final_id;
    
    -- Add teams to football tournament
    FOR i IN 1..8 LOOP
        INSERT INTO tournament_teams (tournament_id, team_id, seed, bracket_position)
        VALUES (football_tournament_id, team_ids[i], i, i);
    END LOOP;
    
    -- Create Cricket Tournament
    INSERT INTO tournaments (name, description, sport_id, tournament_type, max_teams, status, start_date, end_date)
    VALUES (
        'Cricket Premier League',
        'Exciting cricket tournament with round-robin followed by playoffs',
        cricket_sport_id,
        'round_robin',
        6,
        'active',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '15 days'
    ) RETURNING id INTO cricket_tournament_id;
    
    -- Create tournament rounds for cricket
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (cricket_tournament_id, 1, 'Group Stage', 15);
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (cricket_tournament_id, 2, 'Semi-finals', 2);
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (cricket_tournament_id, 3, 'Final', 1);
    
    -- Add teams to cricket tournament
    FOR i IN 1..6 LOOP
        INSERT INTO tournament_teams (tournament_id, team_id, seed, bracket_position)
        VALUES (cricket_tournament_id, team_ids[i], i, i);
    END LOOP;
    
    -- Create Basketball Tournament
    INSERT INTO tournaments (name, description, sport_id, tournament_type, max_teams, status, start_date, end_date)
    VALUES (
        'Basketball Showdown',
        'Fast-paced basketball tournament with double elimination format',
        basketball_sport_id,
        'double_elimination',
        8,
        'draft',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '20 days'
    ) RETURNING id INTO basketball_tournament_id;
    
    -- Create tournament rounds for basketball
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (basketball_tournament_id, 1, 'First Round', 4);
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (basketball_tournament_id, 2, 'Winners Bracket', 2);
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (basketball_tournament_id, 3, 'Losers Bracket', 2);
    
    INSERT INTO tournament_rounds (tournament_id, round_number, round_name, total_matches)
    VALUES 
        (basketball_tournament_id, 4, 'Championship', 1);
    
    -- Add teams to basketball tournament
    FOR i IN 1..8 LOOP
        INSERT INTO tournament_teams (tournament_id, team_id, seed, bracket_position)
        VALUES (basketball_tournament_id, team_ids[i], i, i);
    END LOOP;
    
    -- Create some fixtures for the football tournament to show in the UI
    INSERT INTO fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score, tournament_id, tournament_round_id, bracket_position)
    SELECT 
        football_sport_id,
        team_ids[1],  -- Thunderbolts
        team_ids[2],  -- Fire Dragons
        NOW() - INTERVAL '1 day',
        'Main Stadium',
        'completed',
        2,
        1,
        football_tournament_id,
        round1_id,
        1
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = team_ids[1]) 
      AND EXISTS (SELECT 1 FROM teams WHERE id = team_ids[2]);
    
    INSERT INTO fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score, tournament_id, tournament_round_id, bracket_position)
    SELECT 
        football_sport_id,
        team_ids[3],  -- Mountain Eagles
        team_ids[4],  -- Ocean Waves
        NOW() + INTERVAL '1 hour',
        'East Field',
        'scheduled',
        0,
        0,
        football_tournament_id,
        round1_id,
        2
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = team_ids[3]) 
      AND EXISTS (SELECT 1 FROM teams WHERE id = team_ids[4]);
    
    INSERT INTO fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score, tournament_id, tournament_round_id, bracket_position)
    SELECT 
        football_sport_id,
        team_ids[5],  -- Forest Rangers
        team_ids[6],  -- Desert Scorpions
        NOW() - INTERVAL '2 hours',
        'West Field',
        'live',
        1,
        0,
        football_tournament_id,
        round1_id,
        3
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = team_ids[5]) 
      AND EXISTS (SELECT 1 FROM teams WHERE id = team_ids[6]);
    
    INSERT INTO fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score, tournament_id, tournament_round_id, bracket_position)
    SELECT 
        football_sport_id,
        team_ids[7],  -- Ice Vikings
        team_ids[8],  -- Solar Flares
        NOW() - INTERVAL '1 day',
        'North Field',
        'completed',
        0,
        3,
        football_tournament_id,
        round1_id,
        4
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = team_ids[7]) 
      AND EXISTS (SELECT 1 FROM teams WHERE id = team_ids[8]);
    
    -- Add a semi-final fixture
    INSERT INTO fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score, tournament_id, tournament_round_id, bracket_position)
    SELECT 
        football_sport_id,
        NULL,  -- To be determined
        NULL,  -- To be determined
        NOW() + INTERVAL '3 days',
        'Main Stadium',
        'scheduled',
        0,
        0,
        football_tournament_id,
        round2_id,
        1
    WHERE EXISTS (SELECT 1 FROM teams WHERE id = team_ids[1]);
    
    RAISE NOTICE 'Sample tournament data created successfully!';
END $$;