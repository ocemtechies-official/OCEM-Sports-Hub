-- Sample Data Population Script for OCEM Sports Hub
-- This script populates the database with realistic sample data for testing and demonstration

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

-- Get sport IDs for use in fixtures
WITH sport_ids AS (
  SELECT id, name FROM public.sports
),
team_ids AS (
  SELECT id, name FROM public.teams
)
-- Insert sample fixtures for various sports
INSERT INTO public.fixtures (sport_id, team_a_id, team_b_id, scheduled_at, venue, status, team_a_score, team_b_score) VALUES
-- Cricket fixtures
((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
 (SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 
 (SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 
 NOW() + INTERVAL '1 day', 'Main Stadium', 'scheduled', 0, 0),
 
((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
 (SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 
 (SELECT id FROM team_ids WHERE name = 'Ocean Waves'), 
 NOW() + INTERVAL '2 days', 'East Ground', 'scheduled', 0, 0),
 
((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
 (SELECT id FROM team_ids WHERE name = 'Forest Rangers'), 
 (SELECT id FROM team_ids WHERE name = 'Desert Scorpions'), 
 NOW() - INTERVAL '1 hour', 'Main Stadium', 'live', 150, 142),
 
((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
 (SELECT id FROM team_ids WHERE name = 'Ice Vikings'), 
 (SELECT id FROM team_ids WHERE name = 'Solar Flares'), 
 NOW() - INTERVAL '2 days', 'North Pavilion', 'completed', 187, 192),

-- Football fixtures
((SELECT id FROM sport_ids WHERE name = 'Football'), 
 (SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 
 (SELECT id FROM team_ids WHERE name = 'Ocean Waves'), 
 NOW() + INTERVAL '3 days', 'Football Field A', 'scheduled', 0, 0),
 
((SELECT id FROM sport_ids WHERE name = 'Football'), 
 (SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 
 (SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 
 NOW() - INTERVAL '3 hours', 'Football Field B', 'live', 2, 1),
 
((SELECT id FROM sport_ids WHERE name = 'Football'), 
 (SELECT id FROM team_ids WHERE name = 'Desert Scorpions'), 
 (SELECT id FROM team_ids WHERE name = 'Solar Flares'), 
 NOW() - INTERVAL '3 days', 'Main Stadium', 'completed', 3, 2),

-- Basketball fixtures
((SELECT id FROM sport_ids WHERE name = 'Basketball'), 
 (SELECT id FROM team_ids WHERE name = 'Forest Rangers'), 
 (SELECT id FROM team_ids WHERE name = 'Ice Vikings'), 
 NOW() + INTERVAL '4 days', 'Basketball Court 1', 'scheduled', 0, 0),
 
((SELECT id FROM sport_ids WHERE name = 'Basketball'), 
 (SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 
 (SELECT id FROM team_ids WHERE name = 'Desert Scorpions'), 
 NOW() - INTERVAL '4 days', 'Basketball Court 2', 'completed', 89, 76),

-- Badminton fixtures
((SELECT id FROM sport_ids WHERE name = 'Badminton'), 
 (SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 
 (SELECT id FROM team_ids WHERE name = 'Ocean Waves'), 
 NOW() + INTERVAL '5 days', 'Badminton Hall', 'scheduled', 0, 0),

-- Table Tennis fixtures
((SELECT id FROM sport_ids WHERE name = 'Table Tennis'), 
 (SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 
 (SELECT id FROM team_ids WHERE name = 'Solar Flares'), 
 NOW() - INTERVAL '5 days', 'Table Tennis Room', 'completed', 3, 2)
ON CONFLICT DO NOTHING;

-- Update some fixtures as completed and set winners
WITH sport_ids AS (
  SELECT id, name FROM public.sports
),
team_ids AS (
  SELECT id, name FROM public.teams
)
UPDATE public.fixtures 
SET winner_id = team_b_id, status = 'completed'
WHERE team_b_id = (SELECT id FROM team_ids WHERE name = 'Solar Flares')
AND sport_id = (SELECT id FROM sport_ids WHERE name = 'Cricket');

UPDATE public.fixtures 
SET winner_id = team_a_id, status = 'completed'
WHERE team_a_id = (SELECT id FROM team_ids WHERE name = 'Desert Scorpions')
AND sport_id = (SELECT id FROM sport_ids WHERE name = 'Football');

-- Insert sample players for teams
WITH team_ids AS (
  SELECT id, name FROM public.teams
)
INSERT INTO public.players (team_id, name, position) VALUES
-- Thunderbolts players
((SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 'Alex Morgan', 'Captain'),
((SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 'James Wilson', 'Vice-Captain'),
((SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 'Sarah Johnson', 'All-rounder'),
((SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 'Michael Chen', 'Bowler'),
((SELECT id FROM team_ids WHERE name = 'Thunderbolts'), 'Emma Davis', 'Batter'),

-- Fire Dragons players
((SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 'David Rodriguez', 'Captain'),
((SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 'Lisa Park', 'Vice-Captain'),
((SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 'Robert Kim', 'All-rounder'),
((SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 'Jennifer Lee', 'Bowler'),
((SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 'Thomas Wright', 'Batter'),

-- Mountain Eagles players
((SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 'Christopher Brown', 'Captain'),
((SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 'Amanda Taylor', 'Vice-Captain'),
((SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 'Daniel Evans', 'Guard'),
((SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 'Jessica Miller', 'Forward'),
((SELECT id FROM team_ids WHERE name = 'Mountain Eagles'), 'Matthew Wilson', 'Center')
ON CONFLICT DO NOTHING;

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, difficulty, time_limit, is_active) VALUES
  ('Sports History Quiz', 'Test your knowledge of sports history from ancient times to present', 'medium', 600, true),
  ('Football Rules & Regulations', 'How well do you know the official rules of football?', 'hard', 900, true),
  ('Cricket Trivia Challenge', 'From test matches to T20 - prove your cricket knowledge', 'easy', 480, true),
  ('Olympics General Knowledge', 'Questions about Olympic history, sports, and athletes', 'medium', 720, true)
ON CONFLICT DO NOTHING;

-- Insert sample quiz questions
WITH quiz_ids AS (
  SELECT id, title FROM public.quizzes
)
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
-- Sports History Quiz questions
((SELECT id FROM quiz_ids WHERE title = 'Sports History Quiz'), 
 'In which year were the first modern Olympic Games held?', 
 'multiple_choice', 
 '["1896", "1900", "1888", "1924"]', 
 '1896', 
 10, 
 1),

((SELECT id FROM quiz_ids WHERE title = 'Sports History Quiz'), 
 'Which country has won the most FIFA World Cup titles?', 
 'multiple_choice', 
 '["Brazil", "Germany", "Italy", "Argentina"]', 
 'Brazil', 
 10, 
 2),

((SELECT id FROM quiz_ids WHERE title = 'Sports History Quiz'), 
 'The Wimbledon tournament is associated with which sport?', 
 'multiple_choice', 
 '["Tennis", "Cricket", "Golf", "Horse Racing"]', 
 'Tennis', 
 10, 
 3),

-- Football Rules questions
((SELECT id FROM quiz_ids WHERE title = 'Football Rules & Regulations'), 
 'How long is a standard football match?', 
 'multiple_choice', 
 '["90 minutes", "80 minutes", "100 minutes", "120 minutes"]', 
 '90 minutes', 
 15, 
 1),

((SELECT id FROM quiz_ids WHERE title = 'Football Rules & Regulations'), 
 'How many players are there in a football team on the field?', 
 'multiple_choice', 
 '["11", "10", "9", "12"]', 
 '11', 
 15, 
 2),

-- Cricket Trivia questions
((SELECT id FROM quiz_ids WHERE title = 'Cricket Trivia Challenge'), 
 'What is the length of a cricket pitch?', 
 'multiple_choice', 
 '["22 yards", "20 yards", "25 yards", "18 yards"]', 
 '22 yards', 
 5, 
 1),

((SELECT id FROM quiz_ids WHERE title = 'Cricket Trivia Challenge'), 
 'Which country invented cricket?', 
 'multiple_choice', 
 '["England", "Australia", "India", "West Indies"]', 
 'England', 
 5, 
 2)
ON CONFLICT DO NOTHING;

-- Insert sample chess games
INSERT INTO public.chess_games (game_type, status, result, fen_position) VALUES
  ('online', 'completed', 'white_wins', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'),
  ('online', 'completed', 'black_wins', 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1'),
  ('online', 'active', 'abandoned', 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'),
  ('puzzle', 'completed', 'white_wins', 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3')
ON CONFLICT DO NOTHING;

-- Insert sample chess moves
WITH game_ids AS (
  SELECT id FROM public.chess_games LIMIT 2
)
INSERT INTO public.chess_moves (game_id, move_number, player_color, move_notation) VALUES
  ((SELECT id FROM game_ids LIMIT 1), 1, 'white', 'e4'),
  ((SELECT id FROM game_ids LIMIT 1), 1, 'black', 'e5'),
  ((SELECT id FROM game_ids LIMIT 1), 2, 'white', 'Nf3'),
  ((SELECT id FROM game_ids LIMIT 1), 2, 'black', 'Nc6')
ON CONFLICT DO NOTHING;

-- Insert sample leaderboard entries (these would normally be auto-generated by the function)
-- For demonstration purposes, we'll manually insert some data
WITH sport_ids AS (
  SELECT id, name FROM public.sports
),
team_ids AS (
  SELECT id, name FROM public.teams
)
INSERT INTO public.leaderboards (sport_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against) VALUES
  ((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
   (SELECT id FROM team_ids WHERE name = 'Solar Flares'), 
   1, 1, 0, 0, 3, 192, 187),
   
  ((SELECT id FROM sport_ids WHERE name = 'Football'), 
   (SELECT id FROM team_ids WHERE name = 'Desert Scorpions'), 
   1, 1, 0, 0, 3, 3, 2),
   
  ((SELECT id FROM sport_ids WHERE name = 'Cricket'), 
   (SELECT id FROM team_ids WHERE name = 'Fire Dragons'), 
   1, 0, 1, 0, 0, 142, 150)
ON CONFLICT (sport_id, team_id) DO NOTHING;