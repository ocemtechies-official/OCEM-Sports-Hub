-- Complete Sample Data Population Script for OCEM Sports Hub
-- This script populates all tables with comprehensive sample data

-- Insert additional sports if not already present
INSERT INTO public.sports (name, icon) VALUES
  ('Cricket', '🏏'),
  ('Football', '⚽'),
  ('Basketball', '🏀'),
  ('Badminton', '🏸'),
  ('Table Tennis', '🏓'),
  ('Chess', '♟️')
ON CONFLICT (name) DO NOTHING;

-- Insert sample teams
INSERT INTO public.teams (name, color) VALUES
  ('Thunderbolts', '#3b82f6'),
  ('Fire Dragons', '#ef4444'),
  ('Mountain Eagles', '#10b981'),
  ('Ocean Waves', '#0ea5e9'),
  ('Forest Rangers', '#84cc16'),
  ('Desert Scorpions', '#f59e0b'),
  ('Ice Vikings', '#60a5fa'),
  ('Solar Flares', '#f97316')
ON CONFLICT (name) DO NOTHING;

-- Insert sample players for teams
INSERT INTO public.players (team_id, name, position) 
SELECT t.id, p.name, p.position
FROM (
  VALUES 
    ('Thunderbolts', 'Alex Morgan', 'Captain'),
    ('Thunderbolts', 'James Wilson', 'Vice-Captain'),
    ('Thunderbolts', 'Sarah Johnson', 'All-rounder'),
    ('Thunderbolts', 'Michael Chen', 'Bowler'),
    ('Thunderbolts', 'Emma Davis', 'Batter'),
    
    ('Fire Dragons', 'David Rodriguez', 'Captain'),
    ('Fire Dragons', 'Lisa Park', 'Vice-Captain'),
    ('Fire Dragons', 'Robert Kim', 'All-rounder'),
    ('Fire Dragons', 'Jennifer Lee', 'Bowler'),
    ('Fire Dragons', 'Thomas Wright', 'Batter'),
    
    ('Mountain Eagles', 'Christopher Brown', 'Captain'),
    ('Mountain Eagles', 'Amanda Taylor', 'Vice-Captain'),
    ('Mountain Eagles', 'Daniel Evans', 'Guard'),
    ('Mountain Eagles', 'Jessica Miller', 'Forward'),
    ('Mountain Eagles', 'Matthew Wilson', 'Center'),
    
    ('Ocean Waves', 'Ryan Cooper', 'Captain'),
    ('Ocean Waves', 'Sophia Martinez', 'Vice-Captain'),
    ('Ocean Waves', 'Kevin Turner', 'Midfielder'),
    ('Ocean Waves', 'Olivia Green', 'Defender'),
    ('Ocean Waves', 'Brandon Hill', 'Striker'),
    
    ('Forest Rangers', 'Tyler Adams', 'Captain'),
    ('Forest Rangers', 'Mia Robinson', 'Vice-Captain'),
    ('Forest Rangers', 'Jordan Phillips', 'Point Guard'),
    ('Forest Rangers', 'Abigail Carter', 'Shooting Guard'),
    ('Forest Rangers', 'Zachary Scott', 'Power Forward'),
    
    ('Desert Scorpions', 'Nathan Reed', 'Captain'),
    ('Desert Scorpions', 'Isabella Ward', 'Vice-Captain'),
    ('Desert Scorpions', 'Christian Bell', 'Winger'),
    ('Desert Scorpions', 'Charlotte Foster', 'Fullback'),
    ('Desert Scorpions', 'Logan Butler', 'Goalkeeper'),
    
    ('Ice Vikings', 'Dylan Powell', 'Captain'),
    ('Ice Vikings', 'Amelia Long', 'Vice-Captain'),
    ('Ice Vikings', 'Ethan Perry', 'Serve Specialist'),
    ('Ice Vikings', 'Harper Brooks', 'Net Player'),
    ('Ice Vikings', 'Aaron Wood', 'Back Player'),
    
    ('Solar Flares', 'Lucas Price', 'Captain'),
    ('Solar Flares', 'Evelyn Russell', 'Vice-Captain'),
    ('Solar Flares', 'Jack Hughes', 'Opening Bat'),
    ('Solar Flares', 'Scarlett Patterson', 'Wicket Keeper'),
    ('Solar Flares', 'Owen Simmons', 'Spin Bowler')
) AS p(team_name, name, position)
JOIN public.teams t ON t.name = p.team_name
ON CONFLICT DO NOTHING;

-- Insert sample fixtures for various sports
INSERT INTO public.fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score) 
SELECT 
  s.id as sport_id,
  ta.id as team_a_id,
  tb.id as team_b_id,
  f.scheduled_at,
  f.venue,
  f.status,
  f.team_a_score,
  f.team_b_score
FROM (
  VALUES 
    -- Cricket fixtures
    ('Cricket', 'Thunderbolts', 'Fire Dragons', NOW() + INTERVAL '1 day', 'Main Stadium', 'scheduled', 0, 0),
    ('Cricket', 'Mountain Eagles', 'Ocean Waves', NOW() + INTERVAL '2 days', 'East Ground', 'scheduled', 0, 0),
    ('Cricket', 'Forest Rangers', 'Desert Scorpions', NOW() - INTERVAL '1 hour', 'Main Stadium', 'live', 150, 142),
    ('Cricket', 'Ice Vikings', 'Solar Flares', NOW() - INTERVAL '2 days', 'North Pavilion', 'completed', 187, 192),
    
    -- Football fixtures
    ('Football', 'Thunderbolts', 'Ocean Waves', NOW() + INTERVAL '3 days', 'Football Field A', 'scheduled', 0, 0),
    ('Football', 'Fire Dragons', 'Mountain Eagles', NOW() - INTERVAL '3 hours', 'Football Field B', 'live', 2, 1),
    ('Football', 'Desert Scorpions', 'Solar Flares', NOW() - INTERVAL '3 days', 'Main Stadium', 'completed', 3, 2),
    ('Football', 'Forest Rangers', 'Ice Vikings', NOW() + INTERVAL '4 days', 'Football Field C', 'scheduled', 0, 0),
    
    -- Basketball fixtures
    ('Basketball', 'Forest Rangers', 'Ice Vikings', NOW() + INTERVAL '4 days', 'Basketball Court 1', 'scheduled', 0, 0),
    ('Basketball', 'Thunderbolts', 'Desert Scorpions', NOW() - INTERVAL '4 days', 'Basketball Court 2', 'completed', 89, 76),
    ('Basketball', 'Fire Dragons', 'Solar Flares', NOW() + INTERVAL '5 days', 'Basketball Court 3', 'scheduled', 0, 0),
    ('Basketball', 'Mountain Eagles', 'Ocean Waves', NOW() - INTERVAL '5 days', 'Basketball Court 4', 'completed', 78, 85),
    
    -- Badminton fixtures
    ('Badminton', 'Fire Dragons', 'Ocean Waves', NOW() + INTERVAL '5 days', 'Badminton Hall', 'scheduled', 0, 0),
    ('Badminton', 'Thunderbolts', 'Forest Rangers', NOW() + INTERVAL '6 days', 'Badminton Hall', 'scheduled', 0, 0),
    ('Badminton', 'Desert Scorpions', 'Ice Vikings', NOW() - INTERVAL '6 days', 'Badminton Hall', 'completed', 2, 1),
    
    -- Table Tennis fixtures
    ('Table Tennis', 'Mountain Eagles', 'Solar Flares', NOW() - INTERVAL '5 days', 'Table Tennis Room', 'completed', 3, 2),
    ('Table Tennis', 'Ocean Waves', 'Fire Dragons', NOW() + INTERVAL '7 days', 'Table Tennis Room', 'scheduled', 0, 0)
) AS f(sport_name, team_a_name, team_b_name, scheduled_at, venue, status, team_a_score, team_b_score)
JOIN public.sports s ON s.name = f.sport_name
JOIN public.teams ta ON ta.name = f.team_a_name
JOIN public.teams tb ON tb.name = f.team_b_name
ON CONFLICT DO NOTHING;

-- Update some fixtures as completed and set winners
UPDATE public.fixtures 
SET winner_id = team_b_id
WHERE team_b_id = (SELECT id FROM public.teams WHERE name = 'Solar Flares')
AND sport_id = (SELECT id FROM public.sports WHERE name = 'Cricket');

UPDATE public.fixtures 
SET winner_id = team_a_id
WHERE team_a_id = (SELECT id FROM public.teams WHERE name = 'Desert Scorpions')
AND sport_id = (SELECT id FROM public.sports WHERE name = 'Football');

UPDATE public.fixtures 
SET winner_id = team_b_id, status = 'completed'
WHERE team_b_id = (SELECT id FROM public.teams WHERE name = 'Ocean Waves')
AND sport_id = (SELECT id FROM public.sports WHERE name = 'Basketball');

UPDATE public.fixtures 
SET winner_id = team_a_id, status = 'completed'
WHERE team_a_id = (SELECT id FROM public.teams WHERE name = 'Desert Scorpions')
AND sport_id = (SELECT id FROM public.sports WHERE name = 'Badminton');

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, difficulty, time_limit, is_active) VALUES
  ('Sports History Quiz', 'Test your knowledge of sports history from ancient times to present', 'medium', 600, true),
  ('Football Rules & Regulations', 'How well do you know the official rules of football?', 'hard', 900, true),
  ('Cricket Trivia Challenge', 'From test matches to T20 - prove your cricket knowledge', 'easy', 480, true),
  ('Olympics General Knowledge', 'Questions about Olympic history, sports, and athletes', 'medium', 720, true),
  ('Basketball Legends', 'Test your knowledge of basketball stars and their achievements', 'medium', 600, true)
ON CONFLICT DO NOTHING;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) 
SELECT 
  q.id as quiz_id,
  qq.question_text,
  qq.question_type,
  qq.options::JSONB,  -- Cast text to JSONB
  qq.correct_answer,
  qq.points,
  qq.order_index
FROM (
  VALUES 
    -- Sports History Quiz questions
    ('Sports History Quiz', 'In which year were the first modern Olympic Games held?', 'multiple_choice', '["1896", "1900", "1888", "1924"]', '1896', 10, 1),
    ('Sports History Quiz', 'Which country has won the most FIFA World Cup titles?', 'multiple_choice', '["Brazil", "Germany", "Italy", "Argentina"]', 'Brazil', 10, 2),
    ('Sports History Quiz', 'The Wimbledon tournament is associated with which sport?', 'multiple_choice', '["Tennis", "Cricket", "Golf", "Horse Racing"]', 'Tennis', 10, 3),
    ('Sports History Quiz', 'Who is known as the "Flying Finn" and won nine Olympic gold medals in athletics?', 'multiple_choice', '["Paavo Nurmi", "Carl Lewis", "Usain Bolt", "Jesse Owens"]', 'Paavo Nurmi', 15, 4),
    ('Sports History Quiz', 'In which sport would you perform a slam dunk?', 'multiple_choice', '["Basketball", "Volleyball", "Tennis", "Golf"]', 'Basketball', 5, 5),

    -- Football Rules questions
    ('Football Rules & Regulations', 'How long is a standard football match?', 'multiple_choice', '["90 minutes", "80 minutes", "100 minutes", "120 minutes"]', '90 minutes', 15, 1),
    ('Football Rules & Regulations', 'How many players are there in a football team on the field?', 'multiple_choice', '["11", "10", "9", "12"]', '11', 15, 2),
    ('Football Rules & Regulations', 'What is the maximum number of substitutions allowed in a standard football match?', 'multiple_choice', '["3", "5", "7", "No limit"]', '5', 20, 3),
    ('Football Rules & Regulations', 'Which card results in a player being sent off?', 'multiple_choice', '["Yellow", "Red", "Blue", "Green"]', 'Red', 10, 4),
    ('Football Rules & Regulations', 'What is the shape of a football pitch?', 'multiple_choice', '["Rectangular", "Square", "Circular", "Oval"]', 'Rectangular', 5, 5),

    -- Cricket Trivia questions
    ('Cricket Trivia Challenge', 'What is the length of a cricket pitch?', 'multiple_choice', '["22 yards", "20 yards", "25 yards", "18 yards"]', '22 yards', 5, 1),
    ('Cricket Trivia Challenge', 'Which country invented cricket?', 'multiple_choice', '["England", "Australia", "India", "West Indies"]', 'England', 5, 2),
    ('Cricket Trivia Challenge', 'How many players are there in a cricket team?', 'multiple_choice', '["11", "10", "12", "9"]', '11', 5, 3),
    ('Cricket Trivia Challenge', 'What is the term for a score of 100 runs by a batsman?', 'multiple_choice', '["Century", "Half-century", "Double century", "Triple century"]', 'Century', 10, 4),
    ('Cricket Trivia Challenge', 'Which of these is NOT a way to get out in cricket?', 'multiple_choice', '["Bowled", "Caught", "Stumped", "Fouled"]', 'Fouled', 5, 5),

    -- Olympics General Knowledge questions
    ('Olympics General Knowledge', 'In which city were the 2024 Summer Olympics held?', 'multiple_choice', '["Paris", "Tokyo", "Los Angeles", "London"]', 'Paris', 10, 1),
    ('Olympics General Knowledge', 'How often are the Summer Olympic Games held?', 'multiple_choice', '["Every 2 years", "Every 4 years", "Every 6 years", "Every 8 years"]', 'Every 4 years', 10, 2),
    ('Olympics General Knowledge', 'Which of these sports is NOT part of the modern pentathlon?', 'multiple_choice', '["Fencing", "Swimming", "Running", "Cycling"]', 'Cycling', 15, 3),
    ('Olympics General Knowledge', 'What are the five rings on the Olympic flag?', 'multiple_choice', '["Blue, Yellow, Black, Green, Red", "Red, White, Blue, Green, Orange", "Purple, Pink, Blue, Green, Yellow", "Orange, Black, White, Red, Brown"]', 'Blue, Yellow, Black, Green, Red', 10, 4),
    ('Olympics General Knowledge', 'Which country has hosted the most Olympic Games?', 'multiple_choice', '["USA", "France", "UK", "Germany"]', 'USA', 15, 5),

    -- Basketball Legends questions
    ('Basketball Legends', 'Which player is known as "His Airness"?', 'multiple_choice', '["Michael Jordan", "LeBron James", "Kobe Bryant", "Magic Johnson"]', 'Michael Jordan', 15, 1),
    ('Basketball Legends', 'Who holds the record for the most NBA championships as a player?', 'multiple_choice', '["Michael Jordan", "Bill Russell", "LeBron James", "Kareem Abdul-Jabbar"]', 'Bill Russell', 15, 2),
    ('Basketball Legends', 'Which team did Michael Jordan play for throughout his NBA career?', 'multiple_choice', '["Los Angeles Lakers", "Boston Celtics", "Chicago Bulls", "Miami Heat"]', 'Chicago Bulls', 10, 3),
    ('Basketball Legends', 'What is the height of a standard basketball hoop?', 'multiple_choice', '["10 feet", "8 feet", "12 feet", "9 feet"]', '10 feet', 5, 4),
    ('Basketball Legends', 'Which player is known for the "Dream Shake"?', 'multiple_choice', '["Shaquille O''Neal", "Tim Duncan", "Hakeem Olajuwon", "Karl Malone"]', 'Hakeem Olajuwon', 15, 5)
) AS qq(quiz_title, question_text, question_type, options, correct_answer, points, order_index)
JOIN public.quizzes q ON q.title = qq.quiz_title
ON CONFLICT DO NOTHING;

-- Insert sample chess games
INSERT INTO public.chess_games (game_type, status, result, fen_position) VALUES
  ('online', 'completed', 'white_wins', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'),
  ('online', 'completed', 'black_wins', 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1'),
  ('online', 'active', 'draw', 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'),
  ('puzzle', 'completed', 'white_wins', 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'),
  ('puzzle', 'completed', 'black_wins', 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 4')
ON CONFLICT DO NOTHING;

-- Insert sample leaderboard entries
INSERT INTO public.leaderboards (sport_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against) 
SELECT 
  s.id as sport_id,
  t.id as team_id,
  l.matches_played,
  l.wins,
  l.losses,
  l.draws,
  l.points,
  l.goals_for,
  l.goals_against
FROM (
  VALUES 
    ('Cricket', 'Solar Flares', 1, 1, 0, 0, 3, 192, 187),
    ('Cricket', 'Fire Dragons', 1, 0, 1, 0, 0, 142, 150),
    ('Football', 'Desert Scorpions', 1, 1, 0, 0, 3, 3, 2),
    ('Football', 'Solar Flares', 1, 0, 1, 0, 0, 1, 2),
    ('Basketball', 'Ocean Waves', 1, 1, 0, 0, 3, 85, 78),
    ('Basketball', 'Thunderbolts', 1, 0, 1, 0, 0, 76, 89),
    ('Badminton', 'Desert Scorpions', 1, 1, 0, 0, 3, 2, 1),
    ('Badminton', 'Ice Vikings', 1, 0, 1, 0, 0, 1, 2)
) AS l(sport_name, team_name, matches_played, wins, losses, draws, points, goals_for, goals_against)
JOIN public.sports s ON s.name = l.sport_name
JOIN public.teams t ON t.name = l.team_name
ON CONFLICT (sport_id, team_id) DO UPDATE SET
  matches_played = EXCLUDED.matches_played,
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses,
  draws = EXCLUDED.draws,
  points = EXCLUDED.points,
  goals_for = EXCLUDED.goals_for,
  goals_against = EXCLUDED.goals_against,
  updated_at = NOW();