-- Insert default sports
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
  ('Team Alpha', '#3b82f6'),
  ('Team Beta', '#ef4444'),
  ('Team Gamma', '#10b981'),
  ('Team Delta', '#f59e0b')
ON CONFLICT (name) DO NOTHING;
