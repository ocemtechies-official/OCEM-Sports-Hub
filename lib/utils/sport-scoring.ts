/**
 * Sport-specific scoring terminology utilities
 */

export interface SportScoringInfo {
  unit: string;           // Single unit (goal, run, point, etc.)
  units: string;          // Plural units (goals, runs, points, etc.)
  verb: string;           // Action verb (scored, gained, made, etc.)
  pastTense: string;      // Past tense verb (scored, gained, made, etc.)
}

/**
 * Get sport-specific scoring terminology
 */
export function getSportScoringInfo(sportName: string): SportScoringInfo {
  const sport = sportName?.toLowerCase().trim() || '';
  
  switch (sport) {
    case 'football':
    case 'soccer':
      return {
        unit: 'goal',
        units: 'goals',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'cricket':
      return {
        unit: 'run',
        units: 'runs',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'basketball':
      return {
        unit: 'basket',
        units: 'baskets',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'volleyball':
      return {
        unit: 'point',
        units: 'points',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'tennis':
      return {
        unit: 'point',
        units: 'points',
        verb: 'win',
        pastTense: 'won'
      };
      
    case 'badminton':
      return {
        unit: 'point',
        units: 'points',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'table tennis':
      return {
        unit: 'point',
        units: 'points',
        verb: 'score',
        pastTense: 'scored'
      };
      
    case 'chess':
      return {
        unit: 'point',
        units: 'points',
        verb: 'score',
        pastTense: 'scored'
      };
      
    default:
      // Default fallback for unknown sports
      return {
        unit: 'point',
        units: 'points',
        verb: 'score',
        pastTense: 'scored'
      };
  }
}

/**
 * Generate sport-specific scoring message
 */
export function generateScoringMessage(
  teamName: string, 
  scoreIncrease: number, 
  sportName: string
): string {
  const scoringInfo = getSportScoringInfo(sportName);
  
  if (scoreIncrease === 1) {
    return `${teamName} ${scoringInfo.pastTense} 1 ${scoringInfo.unit}`;
  } else {
    return `${teamName} ${scoringInfo.pastTense} ${scoreIncrease} ${scoringInfo.units}`;
  }
}

/**
 * Generate sport-specific scoring message for cricket extras
 */
export function generateCricketExtraMessage(
  teamName: string,
  extraType: string,
  runs: number,
  sportName: string = 'cricket'
): string {
  const scoringInfo = getSportScoringInfo(sportName);
  
  switch (extraType.toLowerCase()) {
    case 'four':
    case '4':
      return `${teamName} hit a boundary! 4 runs`;
      
    case 'six':
    case '6':
      return `${teamName} hit a six! 6 runs`;
      
    case 'wide':
      return `${teamName} bowled a wide (+${runs} run${runs > 1 ? 's' : ''})`;
      
    case 'no_ball':
    case 'noball':
      return `${teamName} bowled a no ball (+${runs} run${runs > 1 ? 's' : ''})`;
      
    case 'bye':
      return `${teamName} scored ${runs} bye${runs > 1 ? 's' : ''}`;
      
    case 'leg_bye':
    case 'legbye':
      return `${teamName} scored ${runs} leg bye${runs > 1 ? 's' : ''}`;
      
    case 'wicket':
      return `${teamName} lost a wicket!`;
      
    default:
      return `${teamName} scored ${runs} ${scoringInfo.unit}${runs > 1 ? 's' : ''}`;
  }
}

/**
 * Generate cricket-specific scoring message with context
 */
export function generateCricketScoringMessage(
  teamName: string,
  runs: number,
  context?: {
    isBoundary?: boolean;
    isSix?: boolean;
    isWicket?: boolean;
    isExtra?: boolean;
    extraType?: string;
  }
): string {
  if (context?.isWicket) {
    return `${teamName} lost a wicket!`;
  }
  
  if (context?.isSix) {
    return `${teamName} hit a six! 6 runs`;
  }
  
  if (context?.isBoundary && runs === 4) {
    return `${teamName} hit a boundary! 4 runs`;
  }
  
  if (context?.isExtra && context.extraType) {
    return generateCricketExtraMessage(teamName, context.extraType, runs);
  }
  
  if (runs === 1) {
    return `${teamName} scored 1 run`;
  } else {
    return `${teamName} scored ${runs} runs`;
  }
}
