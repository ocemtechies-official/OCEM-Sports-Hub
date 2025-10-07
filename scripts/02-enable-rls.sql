-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sports policies (public read, admin write)
CREATE POLICY "Sports are viewable by everyone"
  ON public.sports FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage sports"
  ON public.sports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teams policies (public read, admin write)
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Players policies (public read, admin write)
CREATE POLICY "Players are viewable by everyone"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage players"
  ON public.players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fixtures policies (public read, admin write)
CREATE POLICY "Fixtures are viewable by everyone"
  ON public.fixtures FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage fixtures"
  ON public.fixtures FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quizzes policies (public read active quizzes, admin full access)
CREATE POLICY "Active quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quiz Questions policies
CREATE POLICY "Quiz questions are viewable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quiz Attempts policies (users can view own attempts, admins can view all)
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
  ON public.quiz_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Chess Games policies
CREATE POLICY "Chess games are viewable by everyone"
  ON public.chess_games FOR SELECT
  USING (true);

CREATE POLICY "Users can create chess games"
  ON public.chess_games FOR INSERT
  WITH CHECK (
    auth.uid() = white_player_id OR 
    auth.uid() = black_player_id OR
    game_type = 'puzzle'
  );

CREATE POLICY "Players can update their games"
  ON public.chess_games FOR UPDATE
  USING (
    auth.uid() = white_player_id OR 
    auth.uid() = black_player_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chess Moves policies
CREATE POLICY "Chess moves are viewable by everyone"
  ON public.chess_moves FOR SELECT
  USING (true);

CREATE POLICY "Players can add moves to their games"
  ON public.chess_moves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chess_games
      WHERE id = game_id AND (
        white_player_id = auth.uid() OR 
        black_player_id = auth.uid()
      )
    )
  );

-- Leaderboards policies (public read, admin write)
CREATE POLICY "Leaderboards are viewable by everyone"
  ON public.leaderboards FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage leaderboards"
  ON public.leaderboards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
