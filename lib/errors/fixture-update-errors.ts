// Enhanced error handling for moderator fixture updates
export class FixtureUpdateError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public technicalDetails?: any,
    public httpStatus: number = 400
  ) {
    super(userMessage)
    this.name = 'FixtureUpdateError'
  }
}

export const ERROR_CODES = {
  // Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SPORT_NOT_ASSIGNED: 'SPORT_NOT_ASSIGNED', 
  VENUE_NOT_ASSIGNED: 'VENUE_NOT_ASSIGNED',
  
  // Validation errors
  INVALID_SCORE: 'INVALID_SCORE',
  INVALID_STATUS: 'INVALID_STATUS',
  INVALID_SPORT_DATA: 'INVALID_SPORT_DATA',
  
  // Concurrency errors
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_UPDATES: 'TOO_MANY_UPDATES',
  
  // System errors
  FIXTURE_NOT_FOUND: 'FIXTURE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

export function createSpecificError(
  code: ErrorCode, 
  context?: any
): FixtureUpdateError {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
      return new FixtureUpdateError(
        code,
        'You must be logged in as a moderator or admin to update fixtures.',
        context,
        401
      )
      
    case ERROR_CODES.SPORT_NOT_ASSIGNED:
      return new FixtureUpdateError(
        code,
        `You're not assigned to moderate ${context?.sport || 'this sport'}. Contact an admin to update your assignments.`,
        context,
        403
      )
      
    case ERROR_CODES.VENUE_NOT_ASSIGNED:
      return new FixtureUpdateError(
        code,
        `You're not assigned to moderate fixtures at ${context?.venue || 'this venue'}. Contact an admin to update your assignments.`,
        context,
        403
      )
      
    case ERROR_CODES.INVALID_SCORE:
      return new FixtureUpdateError(
        code,
        `Invalid score values. ${context?.sport === 'cricket' ? 'Wickets must be between 0-10.' : 'Scores must be non-negative numbers.'}`,
        context,
        400
      )
      
    case ERROR_CODES.INVALID_SPORT_DATA:
      return new FixtureUpdateError(
        code,
        `Invalid ${context?.sport || 'sport'} data. ${getSpecificSportValidationMessage(context?.sport, context?.details)}`,
        context,
        400
      )
      
    case ERROR_CODES.VERSION_MISMATCH:
      return new FixtureUpdateError(
        code,
        'This fixture was updated by another user. Please refresh the page and try again.',
        context,
        409
      )
      
    case ERROR_CODES.CONCURRENT_UPDATE:
      return new FixtureUpdateError(
        code,
        'Another update is in progress. Please wait a moment and try again.',
        context,
        409
      )
      
    case ERROR_CODES.RATE_LIMITED:
      return new FixtureUpdateError(
        code,
        'You\'re updating too quickly. Please wait a moment before trying again.',
        context,
        429
      )
      
    case ERROR_CODES.FIXTURE_NOT_FOUND:
      return new FixtureUpdateError(
        code,
        'Fixture not found or has been deleted. Please refresh the page.',
        context,
        404
      )
      
    case ERROR_CODES.NETWORK_ERROR:
      return new FixtureUpdateError(
        code,
        'Network connection issue. Please check your internet and try again.',
        context,
        503
      )
      
    case ERROR_CODES.DATABASE_ERROR:
      return new FixtureUpdateError(
        code,
        'Database error occurred. Please try again in a moment.',
        context,
        500
      )
      
    default:
      return new FixtureUpdateError(
        ERROR_CODES.UNKNOWN_ERROR,
        'An unexpected error occurred. Please try again.',
        context,
        500
      )
  }
}

function getSpecificSportValidationMessage(sport?: string, details?: any): string {
  switch (sport?.toLowerCase()) {
    case 'cricket':
      return 'Wickets must be 0-10, overs must be positive, extras must be non-negative.'
    case 'basketball':
      return 'Quarter scores must be non-negative numbers.'
    case 'volleyball':
    case 'tennis':
    case 'badminton':
      return 'Set scores must be non-negative numbers.'
    case 'football':
      return 'Goals must be non-negative, penalty scores must be valid.'
    default:
      return 'Please check your input values.'
  }
}

// Validate sport-specific data
export function validateSportData(sport: string, data: any): void {
  const sportLower = sport.toLowerCase()
  
  switch (sportLower) {
    case 'cricket':
      validateCricketData(data)
      break
    case 'basketball':
      validateBasketballData(data)
      break
    case 'volleyball':
    case 'tennis':
    case 'badminton':
      validateRacketSportData(data)
      break
    case 'football':
      validateFootballData(data)
      break
  }
}

function validateCricketData(data: any): void {
  const cricket = data?.cricket
  if (!cricket) return
  
  if (cricket.wickets_a !== undefined && (cricket.wickets_a < 0 || cricket.wickets_a > 10)) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'cricket', 
      details: 'Team A wickets must be between 0-10' 
    })
  }
  
  if (cricket.wickets_b !== undefined && (cricket.wickets_b < 0 || cricket.wickets_b > 10)) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'cricket', 
      details: 'Team B wickets must be between 0-10' 
    })
  }
  
  if (cricket.overs_a !== undefined && cricket.overs_a < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'cricket', 
      details: 'Overs must be positive' 
    })
  }
  
  if (cricket.overs_b !== undefined && cricket.overs_b < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'cricket', 
      details: 'Overs must be positive' 
    })
  }
}

function validateBasketballData(data: any): void {
  const basketball = data?.basketball
  if (!basketball) return
  
  const quarters = ['quarter_1_a', 'quarter_1_b', 'quarter_2_a', 'quarter_2_b', 
                   'quarter_3_a', 'quarter_3_b', 'quarter_4_a', 'quarter_4_b',
                   'overtime_a', 'overtime_b']
  
  for (const quarter of quarters) {
    if (basketball[quarter] !== undefined && basketball[quarter] < 0) {
      throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
        sport: 'basketball', 
        details: 'Quarter/overtime scores must be non-negative' 
      })
    }
  }
}

function validateRacketSportData(data: any): void {
  if (data.sets_a !== undefined && data.sets_a < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'racket', 
      details: 'Sets won must be non-negative' 
    })
  }
  
  if (data.sets_b !== undefined && data.sets_b < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'racket', 
      details: 'Sets won must be non-negative' 
    })
  }
}

function validateFootballData(data: any): void {
  if (data.pens_a !== undefined && data.pens_a < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'football', 
      details: 'Penalty scores must be non-negative' 
    })
  }
  
  if (data.pens_b !== undefined && data.pens_b < 0) {
    throw createSpecificError(ERROR_CODES.INVALID_SPORT_DATA, { 
      sport: 'football', 
      details: 'Penalty scores must be non-negative' 
    })
  }
}

// Helper to convert database errors to specific errors
export function handleDatabaseError(error: any, context?: any): FixtureUpdateError {
  const errorMessage = error?.message || String(error) || 'Unknown error'
  
  if (errorMessage.includes('version_mismatch') || errorMessage.includes('Version mismatch')) {
    return createSpecificError(ERROR_CODES.VERSION_MISMATCH, context)
  }
  
  if (errorMessage.includes('concurrent') || errorMessage.includes('in progress')) {
    return createSpecificError(ERROR_CODES.CONCURRENT_UPDATE, context)
  }
  
  if (errorMessage.includes('Rate limit') || errorMessage.includes('rate limit')) {
    return createSpecificError(ERROR_CODES.RATE_LIMITED, context)
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return createSpecificError(ERROR_CODES.FIXTURE_NOT_FOUND, context)
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('authorized')) {
    return createSpecificError(ERROR_CODES.PERMISSION_DENIED, context)
  }
  
  // Generic database error
  return createSpecificError(ERROR_CODES.DATABASE_ERROR, { 
    ...context, 
    originalError: errorMessage 
  })
}