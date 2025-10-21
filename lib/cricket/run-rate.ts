export interface CricketTeamData {
  runs: number;
  wickets: number;
  overs: number;
  extras: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  wides: number;
  no_balls: number;
  byes: number;
  leg_byes: number;
  run_rate: number;
  balls_in_current_over?: number;
  innings?: 1 | 2;
  is_batting?: boolean;
}

export const calculateRunRate = (data: CricketTeamData): number => {
  // If no overs have been bowled, return 0
  if (data.overs === 0 && (!data.balls_in_current_over || data.balls_in_current_over === 0)) {
    return 0;
  }

  // Calculate total balls (overs * 6 + balls in current over)
  const totalBalls = (data.overs * 6) + (data.balls_in_current_over || 0);
  
  // Convert to decimal overs
  const totalOvers = totalBalls / 6;
  
  // Calculate and return run rate with 2 decimal places
  return Number((data.runs / totalOvers).toFixed(2));
};