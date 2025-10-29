# Cricket Scoring System Technical Documentation

## Overview

The OCEM Sports Hub includes a specialized cricket scoring system that provides detailed tracking of cricket match statistics beyond simple runs and wickets. This system is designed to handle the complexities of cricket scoring including overs, extras, boundaries, and run rates.

## System Architecture

### Core Components

1. **Enhanced Cricket Scorecard Component** (`components/cricket/enhanced-cricket-scorecard.tsx`)
   - Main UI component for cricket scoring
   - Handles real-time updates and calculations
   - Provides detailed statistics tracking

2. **Run Rate Calculation Library** (`lib/cricket/run-rate.ts`)
   - Calculates cricket run rates
   - Handles overs and balls conversion
   - Provides type definitions for cricket data

3. **API Routes** (`app/api/moderator/fixtures/[id]/update-score/route.ts`)
   - Handles score updates from the frontend
   - Validates cricket-specific data
   - Integrates with the main fixture update system

4. **Database Schema** (Extended fixture data storage)
   - Stores cricket-specific data in the `fixtures.extra` JSONB column
   - Maintains historical data through audit trails

### Data Structure

The cricket scoring system uses a detailed data structure to track all aspects of a cricket match:

```typescript
interface CricketTeamData {
  runs: number;              // Total runs scored
  wickets: number;           // Wickets lost
  overs: number;             // Completed overs
  extras: number;            // Total extras
  balls_faced: number;       // Total balls faced
  fours: number;             // Number of fours scored
  sixes: number;             // Number of sixes scored
  wides: number;             // Wide balls bowled
  no_balls: number;          // No balls bowled
  byes: number;              // Byes scored
  leg_byes: number;          // Leg byes scored
  run_rate: number;          // Current run rate
  balls_in_current_over?: number;  // Balls in current over (0-5)
  innings?: 1 | 2;           // Current innings
  is_batting?: boolean;      // Whether team is currently batting
}
```

## Key Features

### Real-time Scoring

The system provides real-time scoring updates with:

- **Quick Score Buttons**: One-tap scoring for common events (1 run, 4 runs, 6 runs)
- **Wicket Tracking**: Dedicated wicket update functionality
- **Extras Management**: Separate tracking for wides, no-balls, byes, and leg-byes
- **Overs Calculation**: Automatic overs progression (6 balls = 1 over)

### Detailed Statistics

The system tracks comprehensive cricket statistics:

- **Boundaries**: Separate counts for fours and sixes
- **Extras**: Detailed breakdown of wides, no-balls, byes, and leg-byes
- **Run Rate**: Real-time calculation of current run rate
- **Required Run Rate**: Calculation for chasing teams
- **Overs Remaining**: Automatic calculation of overs remaining in innings

### Match Configuration

The system supports different match formats:

- **T20**: 20 overs per innings
- **ODI**: 50 overs per innings
- **T10**: 10 overs per innings
- **Test**: Unlimited overs (custom configuration)
- **Custom**: User-defined overs per innings

### Innings Management

The system handles both innings of a cricket match:

- **First Innings**: Tracking of team batting first
- **Second Innings**: Tracking of team batting second
- **Batting Order**: Clear indication of which team is currently batting
- **Target Calculation**: Automatic calculation of target for chasing team

## Implementation Details

### Run Rate Calculation

The run rate is calculated using the following formula:

```typescript
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
```

### Overs Progression

The system automatically handles overs progression:

```typescript
const incrementBall = (data: CricketTeamData, isExtra: boolean = false): CricketTeamData => {
  // Extras (wides, no balls) don't count as legal deliveries
  if (isExtra) {
    return data;
  }

  let balls = (data.balls_in_current_over || 0) + 1;
  let overs = data.overs;

  // After 6 legal balls, increment over and reset balls
  if (balls === 6) {
    overs += 1;
    balls = 0;
  }

  return {
    ...data,
    overs,
    balls_in_current_over: balls
  };
};
```

### Data Persistence

Cricket data is stored in the `fixtures` table in the `extra` JSONB column:

```sql
-- Example of how cricket data is stored
UPDATE public.fixtures 
SET extra = '{
  "cricket": {
    "team_a": {
      "runs": 150,
      "wickets": 4,
      "overs": 20,
      "extras": 12,
      "balls_faced": 120,
      "fours": 12,
      "sixes": 8,
      "wides": 5,
      "no_balls": 3,
      "byes": 2,
      "leg_byes": 2,
      "run_rate": 7.50
    },
    "team_b": {
      "runs": 75,
      "wickets": 10,
      "overs": 15,
      "extras": 8,
      "balls_faced": 90,
      "fours": 5,
      "sixes": 3,
      "wides": 4,
      "no_balls": 2,
      "byes": 1,
      "leg_byes": 1,
      "run_rate": 5.00
    }
  }
}'::jsonb
WHERE id = 'fixture-uuid';
```

## API Integration

### Score Updates

The system integrates with the main fixture update API:

```typescript
// Example API call to update cricket scores
const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    team_a_score: teamAData.runs,  // Main score matches cricket runs
    team_b_score: teamBData.runs,  // Main score matches cricket runs
    status: status,
    extra: {
      cricket: {
        team_a: teamAData,
        team_b: teamBData
      }
    }
  }),
});
```

### Quick Updates

The system provides quick update functions for common actions:

```typescript
// Quick score update (1, 4, or 6 runs)
const quickScoreUpdate = async (team: 'a' | 'b', runs: number) => {
  // Implementation details...
};

// Quick wicket update
const quickWicketUpdate = async (team: 'a' | 'b') => {
  // Implementation details...
};

// Quick extras update
const quickExtraUpdate = async (team: 'a' | 'b', extraType: 'wides' | 'no_balls' | 'byes' | 'leg_byes', runs: number = 1) => {
  // Implementation details...
};
```

## User Interface

### Main Score Display

The main scorecard displays:

- **Team Names**: Clear identification of both teams
- **Current Scores**: Runs and wickets for each team
- **Overs**: Completed overs and balls in current over
- **Run Rates**: Current run rate for each team
- **Required Run Rate**: For chasing teams
- **Overs Remaining**: In the current innings

### Quick Action Buttons

The interface provides quick action buttons for:

- **+1 Run**: Increment score by 1
- **4 Runs**: Record a four
- **6 Runs**: Record a six
- **Wicket**: Record a wicket
- **Wide**: Record a wide ball

### Detailed Statistics Tabs

Separate tabs for each team provide detailed statistics:

- **Runs**: Total runs scored
- **Wickets**: Wickets lost
- **Overs**: Completed overs
- **Balls Faced**: Total balls faced
- **4s**: Number of fours
- **6s**: Number of sixes
- **Wides**: Wide balls bowled
- **No Balls**: No balls bowled
- **Byes**: Byes scored
- **Leg Byes**: Leg byes scored

### Match Configuration

The system allows configuration of:

- **Match Type**: T20, ODI, T10, Test, or Custom
- **Total Overs**: Overs per innings
- **Current Innings**: First or second innings
- **Batting Order**: Which team bats first

## Error Handling

### Data Validation

The system validates all cricket data:

- **Score Validation**: Runs and wickets must be non-negative
- **Overs Validation**: Overs must be valid decimal values
- **Extras Validation**: Extras must be non-negative
- **Boundary Validation**: Fours and sixes must be non-negative

### Conflict Resolution

The system handles conflicts through:

- **Optimistic Locking**: Version checking to prevent concurrent updates
- **Error Messaging**: Clear error messages for users
- **Automatic Retries**: For transient errors

## Performance Considerations

### Real-time Updates

The system is optimized for real-time updates:

- **Debounced Updates**: 1-second delay to prevent excessive API calls
- **Local State Management**: Immediate UI updates with server sync
- **Efficient Data Transfer**: Only sending changed data

### Database Performance

The system optimizes database performance through:

- **JSONB Storage**: Efficient storage of complex cricket data
- **Indexing**: Proper indexing for quick data retrieval
- **Batch Updates**: Combining multiple updates when possible

## Testing

### Unit Tests

Key functions should be tested:

- **Run Rate Calculation**: Various scenarios including edge cases
- **Overs Progression**: Correct handling of ball counting
- **Data Validation**: Proper validation of input data
- **API Integration**: Correct handling of API responses

### Integration Tests

The system should be tested as a whole:

- **End-to-End Scoring**: Complete match simulation
- **Concurrent Updates**: Handling of multiple users updating scores
- **Error Conditions**: Proper handling of network errors and conflicts
- **UI Responsiveness**: Smooth user experience under load

## Future Enhancements

### Planned Features

1. **Player Statistics**: Track individual player performance
2. **Bowling Figures**: Detailed bowling statistics
3. **Partnership Tracking**: Record partnerships between batsmen
4. **Fall of Wickets**: Track when each wicket fell
5. **Powerplay Tracking**: Special tracking for powerplay overs
6. **DRS Integration**: Decision Review System integration
7. **Live Commentary**: Integration with live commentary system

### Technical Improvements

1. **WebSocket Integration**: Real-time updates using WebSockets
2. **Offline Support**: Local storage for offline scoring
3. **Mobile Optimization**: Enhanced mobile user experience
4. **Accessibility**: Improved accessibility features
5. **Internationalization**: Support for multiple languages

## Troubleshooting

### Common Issues

**Incorrect Run Rates**

1. Check that overs and balls are correctly calculated
2. Verify that runs match the displayed score
3. Ensure the calculation formula is correctly implemented

**Overs Not Progressing**

1. Verify that balls are being counted correctly
2. Check that 6 balls correctly increment the over count
3. Ensure extras are handled properly

**Data Not Saving**

1. Check API response for errors
2. Verify network connectivity
3. Ensure database permissions are correct

### Debugging Tools

1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor API requests and responses
3. **Database Queries**: Direct database inspection
4. **Server Logs**: Check server-side error logs

## Best Practices

### For Developers

1. **Consistent Data Handling**: Always keep main scores in sync with cricket data
2. **Proper Validation**: Validate all input data before processing
3. **Error Handling**: Implement comprehensive error handling
4. **Performance Optimization**: Optimize for real-time updates
5. **Security**: Ensure proper authentication and authorization

### For Moderators

1. **Regular Updates**: Update scores frequently for best user experience
2. **Accurate Data**: Ensure all data is entered correctly
3. **Timely Updates**: Update scores as events happen
4. **Use Quick Actions**: Take advantage of quick action buttons
5. **Report Issues**: Report any system issues immediately

The cricket scoring system is designed to provide a comprehensive and user-friendly interface for tracking cricket matches while maintaining the accuracy and detail required for serious cricket scoring.