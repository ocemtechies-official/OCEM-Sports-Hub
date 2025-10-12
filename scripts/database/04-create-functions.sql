-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update leaderboard after fixture completion
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update team A stats
    INSERT INTO public.leaderboards (sport_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against)
    VALUES (
      NEW.sport_id,
      NEW.team_a_id,
      1,
      CASE WHEN NEW.winner_id = NEW.team_a_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.team_b_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.team_a_id THEN 3 WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      NEW.team_a_score,
      NEW.team_b_score
    )
    ON CONFLICT (sport_id, team_id) DO UPDATE SET
      matches_played = public.leaderboards.matches_played + 1,
      wins = public.leaderboards.wins + CASE WHEN NEW.winner_id = NEW.team_a_id THEN 1 ELSE 0 END,
      losses = public.leaderboards.losses + CASE WHEN NEW.winner_id = NEW.team_b_id THEN 1 ELSE 0 END,
      draws = public.leaderboards.draws + CASE WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      points = public.leaderboards.points + CASE WHEN NEW.winner_id = NEW.team_a_id THEN 3 WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      goals_for = public.leaderboards.goals_for + NEW.team_a_score,
      goals_against = public.leaderboards.goals_against + NEW.team_b_score,
      updated_at = NOW();

    -- Update team B stats
    INSERT INTO public.leaderboards (sport_id, team_id, matches_played, wins, losses, draws, points, goals_for, goals_against)
    VALUES (
      NEW.sport_id,
      NEW.team_b_id,
      1,
      CASE WHEN NEW.winner_id = NEW.team_b_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.team_a_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.team_b_id THEN 3 WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      NEW.team_b_score,
      NEW.team_a_score
    )
    ON CONFLICT (sport_id, team_id) DO UPDATE SET
      matches_played = public.leaderboards.matches_played + 1,
      wins = public.leaderboards.wins + CASE WHEN NEW.winner_id = NEW.team_b_id THEN 1 ELSE 0 END,
      losses = public.leaderboards.losses + CASE WHEN NEW.winner_id = NEW.team_a_id THEN 1 ELSE 0 END,
      draws = public.leaderboards.draws + CASE WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      points = public.leaderboards.points + CASE WHEN NEW.winner_id = NEW.team_b_id THEN 3 WHEN NEW.winner_id IS NULL THEN 1 ELSE 0 END,
      goals_for = public.leaderboards.goals_for + NEW.team_b_score,
      goals_against = public.leaderboards.goals_against + NEW.team_a_score,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update leaderboard
DROP TRIGGER IF EXISTS on_fixture_completed ON public.fixtures;
CREATE TRIGGER on_fixture_completed
  AFTER UPDATE ON public.fixtures
  FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard();
