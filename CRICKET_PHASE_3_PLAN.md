# Cricket Player Tracking - Phase 3 Implementation Plan

## Overview

Update both public match display and moderator UI to support comprehensive player tracking using team_members table.

## Phase 3 Tasks

### ✅ Task 1: TypeScript Interfaces (COMPLETED)

- Created `lib/types/cricket.ts` with comprehensive interfaces
- Uses `member_id` fields referencing `team_members.id`
- Includes helper functions for calculations and formatting
- Type guards for data validation

### 🔄 Task 2: Create New Display Components

#### 2.1 Batting Scorecard Component

**File:** `components/cricket/batting-scorecard.tsx`

- Display all batsmen with stats
- Highlight current striker/non-striker
- Show dismissal details
- Responsive design for mobile

#### 2.2 Bowling Figures Component

**File:** `components/cricket/bowling-figures.tsx`

- Display all bowlers with stats
- Highlight current bowler
- Show economy rates
- Sortable by wickets/economy

#### 2.3 Current Players Card

**File:** `components/cricket/current-players-card.tsx`

- Show striker, non-striker, bowler
- Live highlighting
- Player stats summary

#### 2.4 Fall of Wickets Timeline

**File:** `components/cricket/fall-of-wickets-timeline.tsx`

- Chronological wicket display
- Dismissal details
- Score at wicket fall

#### 2.5 Partnerships Display

**File:** `components/cricket/partnerships-display.tsx`

- Current partnership highlighted
- Runs and balls faced
- Partnership history

### 🔄 Task 3: Update Match Display (Public View)

#### 3.1 Update `app/match/[id]/page.tsx`

- Import new display components
- Add sections for:
  - Batting scorecard
  - Bowling figures
  - Current players
  - Fall of wickets
  - Partnerships

#### 3.2 Update `components/cricket/cricket-score-display.tsx`

- Import types from `lib/types/cricket.ts`
- Use new interfaces
- Support player tracking data
- Conditionally show player stats if available

### 🔄 Task 4: Update Moderator UI

#### 4.1 Team Members Selector

**File:** `components/cricket/team-members-selector.tsx`

- Fetch team members from `team_members` table
- Select playing XI
- Mark captain
- Mark substitutes

#### 4.2 Batting Order Manager

**File:** `components/cricket/batting-order-manager.tsx`

- Set batting order (1-11)
- Drag and drop reordering
- Select opening batsmen

#### 4.3 Current Batsmen Selector

**File:** `components/cricket/current-batsmen-selector.tsx`

- Select striker from available batsmen
- Select non-striker
- Auto-update on wickets

#### 4.4 Bowler Selector

**File:** `components/cricket/bowler-selector.tsx`

- Select current bowler
- Track overs bowled
- Enforce max overs per bowler

#### 4.5 Dismissal Dialog

**File:** `components/cricket/dismissal-dialog.tsx`

- Select dismissal type
- Select bowler (for most dismissals)
- Select fielder (for catches)
- Enter dismissal description

### 🔄 Task 5: Update Moderator Scoring Logic

#### 5.1 Update `enhanced-cricket-scorecard.tsx`

**Changes needed:**

1. Add team members state
2. Add playing XI selection UI
3. Add current players selection UI
4. Update `quickScoreUpdate` to track:
   - Striker's runs, balls, 4s, 6s, SR
   - Bowler's overs, runs conceded, economy
   - Update partnerships
5. Update `quickWicketUpdate` to:
   - Show dismissal dialog
   - Record dismissal details
   - Update fall of wickets
   - End current partnership
6. Add functions:
   - `fetchTeamMembers(teamId)` - Get available players
   - `initializePlayingXI()` - Set up batting/bowling arrays
   - `updateBatsmanStats()` - Update individual batsman
   - `updateBowlerStats()` - Update individual bowler
   - `switchStrike()` - Swap striker/non-striker
   - `recordWicket()` - Record dismissal details

## Data Flow

### Match Setup (Moderator)

1. Moderator opens fixture page
2. System fetches team_members for both teams
3. Moderator selects playing XI for each team
4. Moderator sets batting order
5. Moderator selects opening batsmen (striker, non-striker)
6. Moderator selects opening bowler
7. Match starts

### During Match (Moderator)

1. Moderator clicks +1/+4/+6 button
2. System updates:
   - Team score
   - Striker's runs, balls, SR
   - Bowler's runs conceded, economy
   - Current partnership
3. Moderator clicks wicket button
4. Dismissal dialog opens
5. Moderator selects:
   - Dismissal type
   - Bowler (if applicable)
   - Fielder (if catch)
6. System records:
   - Batsman as out
   - Fall of wicket
   - Ends partnership
7. Moderator selects next batsman
8. Match continues

### Public Display

1. User opens match page
2. System fetches fixture with cricket data
3. If player tracking exists:
   - Show batting scorecard
   - Show bowling figures
   - Show current players
   - Show fall of wickets
   - Show partnerships
4. Live updates via polling/subscription

## Database Queries

### Fetch Team Members

```typescript
const { data: members } = await supabase
  .from("team_members")
  .select("*")
  .eq("team_id", teamId)
  .order("member_order", { ascending: true });
```

### Save Match Data

```typescript
await supabase
  .from("fixtures")
  .update({
    extra: {
      cricket: {
        config: matchConfig,
        team_a: teamAScore,
        team_b: teamBScore,
        team_a_batting: teamABatsmen,
        team_b_batting: teamBBatsmen,
        team_a_bowling: teamABowlers,
        team_b_bowling: teamBBowlers,
        current_batting_team: "team_a",
        current_striker_id: strikerId,
        current_non_striker_id: nonStrikerId,
        current_bowler_id: bowlerId,
        partnerships: partnerships,
        fall_of_wickets: fallOfWickets,
      },
    },
  })
  .eq("id", fixtureId);
```

## Implementation Order

### Priority 1: Core Infrastructure

1. ✅ Create TypeScript interfaces
2. Create basic display components
3. Test with mock data

### Priority 2: Public Display

4. Update match page to show player stats
5. Test with existing data
6. Ensure backward compatibility

### Priority 3: Moderator UI - Selection

7. Create team members selector
8. Create batting order manager
9. Create current players selectors
10. Test player selection flow

### Priority 4: Moderator UI - Scoring

11. Update scoring functions
12. Add player stat tracking
13. Test scoring updates

### Priority 5: Moderator UI - Wickets

14. Create dismissal dialog
15. Update wicket recording
16. Test wicket flow

### Priority 6: Polish

17. Add partnerships tracking
18. Add fall of wickets display
19. Add match events timeline
20. Final testing

## Testing Checklist

### Public Display

- [ ] Shows batting scorecard when data available
- [ ] Shows bowling figures when data available
- [ ] Highlights current players
- [ ] Shows fall of wickets
- [ ] Shows partnerships
- [ ] Works without player data (backward compatible)
- [ ] Responsive on mobile
- [ ] Live updates work

### Moderator UI - Selection

- [ ] Can fetch team members
- [ ] Can select playing XI
- [ ] Can set batting order
- [ ] Can select opening batsmen
- [ ] Can select opening bowler
- [ ] Validates selections

### Moderator UI - Scoring

- [ ] +1/+4/+6 updates batsman stats
- [ ] Scoring updates bowler stats
- [ ] Partnerships tracked correctly
- [ ] Strike rotates on odd runs
- [ ] Overs increment correctly
- [ ] Economy rates calculate correctly

### Moderator UI - Wickets

- [ ] Dismissal dialog opens
- [ ] Can select dismissal type
- [ ] Can select bowler/fielder
- [ ] Wicket recorded in fall of wickets
- [ ] Partnership ends
- [ ] Can select next batsman
- [ ] Stats update correctly

## Migration Strategy

### Backward Compatibility

- Old matches without player data still display normally
- New matches have enhanced display
- Graceful degradation if data incomplete

### Data Migration

- No migration needed for old data
- New matches automatically use new structure
- Can manually add player data to old matches

## Next Steps

1. Create display components (batting scorecard, bowling figures, etc.)
2. Update match display page
3. Create moderator player selection components
4. Update moderator scoring logic
5. Create dismissal dialog
6. Test complete flow
7. Deploy and monitor

## Success Criteria

✅ Public display shows comprehensive player stats
✅ Moderator can select playing XI easily
✅ Scoring tracks individual player performance
✅ Wickets recorded with full details
✅ Partnerships and fall of wickets displayed
✅ System works for both old and new matches
✅ Mobile responsive
✅ Live updates work correctly
