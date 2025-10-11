-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sports table
CREATE TABLE IF NOT EXISTS public.sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  position TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixtures/Matches table
CREATE TABLE IF NOT EXISTS public.fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  team_a_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.teams(id),
  match_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER, -- in seconds
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB, -- Array of options for multiple choice
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  answers JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chess Games table
CREATE TABLE IF NOT EXISTS public.chess_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  white_player_id UUID REFERENCES public.profiles(id),
  black_player_id UUID REFERENCES public.profiles(id),
  game_type TEXT NOT NULL CHECK (game_type IN ('online', 'puzzle')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  winner_id UUID REFERENCES public.profiles(id),
  result TEXT CHECK (result IN ('white_wins', 'black_wins', 'draw', 'abandoned')),
  fen_position TEXT, -- Current board position in FEN notation
  pgn TEXT, -- Full game in PGN notation
  time_control TEXT, -- e.g., "10+0", "5+3"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Chess Moves table
CREATE TABLE IF NOT EXISTS public.chess_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.chess_games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  player_color TEXT NOT NULL CHECK (player_color IN ('white', 'black')),
  move_notation TEXT NOT NULL, -- e.g., "e4", "Nf3"
  fen_after TEXT, -- Board position after this move
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboards table (aggregated stats)
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sport_id, team_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fixtures_sport ON public.fixtures(sport_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON public.fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_scheduled ON public.fixtures(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_chess_games_players ON public.chess_games(white_player_id, black_player_id);
CREATE INDEX IF NOT EXISTS idx_chess_moves_game ON public.chess_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_sport ON public.leaderboards(sport_id);
