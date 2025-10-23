-- Function to automatically progress winners to the next round in a tournament bracket
-- This function is called after a match winner is determined

CREATE OR REPLACE FUNCTION progress_tournament_bracket(tournament_id UUID, completed_round_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_round_id UUID;
    completed_round_number INTEGER;
    next_round_number INTEGER;
    winners_progressed INTEGER := 0;
    match_record RECORD;
    next_fixture_position INTEGER;
    team_a_position INTEGER;
    team_b_position INTEGER;
BEGIN
    -- Get the completed round details
    SELECT round_number INTO completed_round_number
    FROM tournament_rounds
    WHERE id = completed_round_id AND tournament_id = tournament_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Completed round not found for tournament';
    END IF;
    
    -- Get the next round
    next_round_number := completed_round_number + 1;
    
    SELECT id INTO next_round_id
    FROM tournament_rounds
    WHERE tournament_id = tournament_id AND round_number = next_round_number;
    
    -- If there's no next round, we're at the final
    IF NOT FOUND THEN
        -- Tournament is complete, no more progression needed
        RETURN 0;
    END IF;
    
    -- For each completed match in the current round, progress the winner to the next round
    FOR match_record IN
        SELECT 
            f.id as fixture_id,
            f.winner_id,
            f.bracket_position
        FROM fixtures f
        WHERE f.tournament_round_id = completed_round_id 
        AND f.winner_id IS NOT NULL
        AND f.status = 'completed'
    LOOP
        -- Calculate the fixture position in the next round
        -- In a single elimination bracket, winners from position N and N+1 in round R
        -- go to position (N+1)/2 in round R+1
        next_fixture_position := CEIL(match_record.bracket_position::DECIMAL / 2);
        
        -- Determine if this winner should be team_a or team_b in the next fixture
        -- Even positions (2,4,6...) become team_b, odd positions (1,3,5...) become team_a
        IF match_record.bracket_position % 2 = 1 THEN
            -- Odd position - this team becomes team_a in the next fixture
            UPDATE fixtures 
            SET team_a_id = match_record.winner_id
            WHERE tournament_round_id = next_round_id 
            AND bracket_position = next_fixture_position
            AND (team_a_id IS NULL OR team_a_id != match_record.winner_id);
            
            IF FOUND THEN
                winners_progressed := winners_progressed + 1;
            END IF;
        ELSE
            -- Even position - this team becomes team_b in the next fixture
            UPDATE fixtures 
            SET team_b_id = match_record.winner_id
            WHERE tournament_round_id = next_round_id 
            AND bracket_position = next_fixture_position
            AND (team_b_id IS NULL OR team_b_id != match_record.winner_id);
            
            IF FOUND THEN
                winners_progressed := winners_progressed + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- If all matches in the next round now have both teams, activate the round
    -- Check if all fixtures in the next round have both teams assigned
    IF next_round_id IS NOT NULL THEN
        PERFORM 1 FROM fixtures 
        WHERE tournament_round_id = next_round_id 
        AND (team_a_id IS NULL OR team_b_id IS NULL)
        LIMIT 1;
        
        -- If no fixture has missing teams, activate the round
        IF NOT FOUND THEN
            UPDATE tournament_rounds 
            SET status = 'active'
            WHERE id = next_round_id 
            AND status = 'pending';
        END IF;
    END IF;
    
    RETURN winners_progressed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION progress_tournament_bracket(UUID, UUID) TO authenticated;