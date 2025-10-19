# Cricket Player Tracking - team_members Migration Summary

## Overview

Updated cricket player tracking migration to use the **sport-agnostic `team_members` table** instead of the sport-specific `players` table. This enables cross-sport statistics tracking while maintaining a unified roster system.

## Architecture Decision

### ✅ **Selected Approach: team_members Table**

- **Benefits:**
  - Sport-agnostic design (cricket, football, basketball, etc.)
  - Same member can have stats across multiple sports
  - Reuses existing unified team system
  - No schema changes needed - uses JSONB storage
  - Flexible matching: UUID (strict FK) OR name (manual entry)

### ❌ **Rejected Approaches:**

- **profiles table**: Too high-level, auth-focused, not all team members have accounts
- **players table**: Sport-specific, would need separate tables per sport
- **New tables**: Unnecessary complexity, JSONB provides flexibility

## Migration Changes

### File: `scripts/database/46-cricket-player-tracking.sql`

#### 1. View: `cricket_player_stats`

**Changed FROM clause:**

```sql
-- OLD
FROM public.players p

-- NEW  
FROM public.team_members tm
```

**Changed field mappings:**

```sql
-- OLD
p.id as player_id,
p.name as player_name

-- NEW
tm.id as member_id,
tm.member_name as player_name,
tm.member_position as position,
tm.is_captain
```

**Changed JOIN conditions:**

```sql
-- OLD
batting.batting_elem->>'player_id' = p.id::TEXT

-- NEW
(
  batting.batting_elem->>'member_id' = tm.id::TEXT OR
  batting.batting_elem->>'name' = tm.member_name
)
```

#### 2. Function: `get_member_cricket_stats`

**Renamed from:** `get_player_cricket_stats`

**Changed signature:**

```sql
-- OLD
get_player_cricket_stats(player_uuid UUID)

-- NEW
get_member_cricket_stats(member_uuid UUID)
```

**Changed query:**

```sql
-- OLD
SELECT name INTO player_name_var
FROM public.players
WHERE id = player_uuid;

-- NEW
SELECT member_name INTO member_name_var
FROM public.team_members
WHERE id = member_uuid;
```

**Changed variable names:**

- `player_name_var` → `member_name_var`
- All `player_id` → `member_id` in WHERE clauses

#### 3. GRANT Permissions

```sql
-- OLD
GRANT EXECUTE ON FUNCTION public.get_player_cricket_stats TO authenticated;

-- NEW
GRANT EXECUTE ON FUNCTION public.get_member_cricket_stats TO authenticated;
```

#### 4. Documentation Updates

**Function COMMENT:**

```sql
-- OLD
'Retrieves comprehensive cricket statistics for a specific player'

-- NEW
'Retrieves comprehensive cricket statistics for a specific team member. 
Uses team_members table for sport-agnostic tracking.'
```

**View COMMENT:**

```sql
-- OLD
'Aggregates cricket player statistics across all matches'

-- NEW
'Aggregates cricket statistics for team members across all matches.
Uses team_members table which is sport-agnostic - can be extended for other sports.'
```

#### 5. Sample Data Structure

**Updated all JSON examples:**

```json
// OLD
{
  "player_id": "uuid-from-players-table",
  "dismissed_by_bowler_id": "uuid",
  "caught_by_fielder_id": "uuid"
}

// NEW
{
  "member_id": "uuid-from-team_members-table",
  "dismissed_by_member_id": "uuid",
  "caught_by_member_id": "uuid"
}
```

#### 6. Success Message

Added notes about cross-sport capability:

```bash
📊 Using team_members table for player tracking!
   - Extensible for other sports (football, basketball, etc.)
🔍 Get team members: SELECT * FROM team_members WHERE team_id = 'team-uuid';
```

## Data Structure

### team_members Table

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  member_name TEXT NOT NULL,
  member_contact TEXT,
  member_position TEXT,
  member_order INTEGER,
  is_captain BOOLEAN DEFAULT FALSE,
  is_substitute BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### fixtures.extra.cricket JSONB Structure

```json
{
  "cricket": {
    "innings": [
      {
        "batting": [
          {
            "member_id": "uuid",  // FK to team_members.id (optional)
            "name": "Player Name",  // Always required
            "runs": 45,
            "balls_faced": 32,
            "fours": 6,
            "sixes": 1,
            "strike_rate": 140.63,
            "is_out": true,
            "dismissal_type": "caught",
            "dismissed_by_member_id": "bowler-uuid",
            "caught_by_member_id": "fielder-uuid",
            "batting_position": 1
          }
        ],
        "bowling": [
          {
            "member_id": "uuid",  // FK to team_members.id (optional)
            "name": "Bowler Name",  // Always required
            "overs": 4,
            "balls_bowled": 24,
            "maidens": 1,
            "runs_conceded": 28,
            "wickets": 2,
            "economy": 7.0
          }
        ],
        "current_batsmen": {
          "striker_member_id": "uuid",
          "striker_name": "Striker",
          "non_striker_member_id": "uuid",
          "non_striker_name": "Non Striker"
        },
        "current_bowler": {
          "bowler_member_id": "uuid",
          "bowler_name": "Bowler"
        },
        "fall_of_wickets": [
          {
            "runs": 45,
            "wicket_number": 1,
            "batsman_member_id": "uuid",
            "batsman_name": "Player Name",
            "over": "5.3"
          }
        ],
        "partnerships": [
          {
            "batsman1_member_id": "uuid",
            "batsman1_name": "Player 1",
            "batsman2_member_id": "uuid",
            "batsman2_name": "Player 2",
            "runs": 78,
            "balls": 54,
            "is_current": true
          }
        ]
      }
    ]
  }
}
```

## Matching Strategy

### 1. By UUID (Strict Foreign Key)

```sql
batting.batting_elem->>'member_id' = tm.id::TEXT
```

- Most accurate
- Ensures data integrity
- Required when using dropdowns to select players

### 2. By Name (Flexible Fallback)

```sql
batting.batting_elem->>'name' = tm.member_name
```

- Allows manual entry
- Backward compatibility
- Useful for legacy data

### 3. Combined (OR Condition)

```sql
WHERE (
  batting.batting_elem->>'member_id' = tm.id::TEXT OR
  batting.batting_elem->>'name' = tm.member_name
)
```

- Best of both worlds
- Flexible yet accurate
- Used in cricket_player_stats view

## Cross-Sport Benefits

### Same Member, Multiple Sports

```sql
-- Get member's cricket stats
SELECT * FROM cricket_player_stats 
WHERE member_id = 'member-uuid';

-- Future: Get same member's football stats
SELECT * FROM football_player_stats 
WHERE member_id = 'member-uuid';

-- Future: Get same member's basketball stats
SELECT * FROM basketball_player_stats 
WHERE member_id = 'member-uuid';
```

### Team Roster Management

```sql
-- Get all team members (works for any sport)
SELECT * FROM team_members 
WHERE team_id = 'team-uuid'
ORDER BY member_order;

-- Get captain
SELECT * FROM team_members 
WHERE team_id = 'team-uuid' AND is_captain = TRUE;

-- Get substitutes
SELECT * FROM team_members 
WHERE team_id = 'team-uuid' AND is_substitute = TRUE;
```

## Migration Status

### ✅ Completed

- [x] Updated cricket_player_stats view to query team_members
- [x] Renamed function: get_member_cricket_stats
- [x] Updated all field references: player_id → member_id
- [x] Updated dismissal fields: dismissed_by_member_id, caught_by_member_id
- [x] Updated GRANT permissions
- [x] Updated COMMENT documentation
- [x] Updated sample data structure
- [x] Updated success message

### 🔄 Verified

- [x] No remaining player_id references
- [x] No remaining player_name_var references
- [x] No remaining get_player_cricket references
- [x] All team_members references consistent

### ⏳ Next Steps

1. Test migration on development database
2. Verify cricket_player_stats view returns data
3. Test get_member_cricket_stats function
4. Update docs/CRICKET_PLAYER_TRACKING_MIGRATION.md
5. Proceed to Phase 3: TypeScript interfaces

## Testing Queries

### After Migration

```sql
-- Check view exists and returns data
SELECT * FROM cricket_player_stats LIMIT 5;

-- Check function works
SELECT * FROM get_member_cricket_stats('member-uuid');

-- Check team members
SELECT 
  tm.id,
  tm.member_name,
  tm.member_position,
  tm.is_captain,
  t.name as team_name
FROM team_members tm
JOIN teams t ON t.id = tm.team_id
WHERE t.sport = 'cricket'
ORDER BY tm.member_order;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'fixtures' AND indexname LIKE 'idx_cricket_%';
```

## TypeScript Integration (Phase 3)

### Updated Interfaces Needed

```typescript
// lib/types/cricket.ts

export interface CricketBatsmanData {
  member_id?: string;  // FK to team_members.id
  name: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_out: boolean;
  dismissal_type?: DismissalType;
  dismissed_by_member_id?: string;  // FK to team_members.id
  caught_by_member_id?: string;     // FK to team_members.id
  batting_position: number;
}

export interface CricketBowlerData {
  member_id?: string;  // FK to team_members.id
  name: string;
  overs: number;
  balls_bowled: number;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  economy: number;
}

export interface CricketCurrentBatsmen {
  striker_member_id?: string;
  striker_name: string;
  non_striker_member_id?: string;
  non_striker_name: string;
}

export interface CricketCurrentBowler {
  bowler_member_id?: string;
  bowler_name: string;
}

export interface CricketFallOfWicket {
  runs: number;
  wicket_number: number;
  batsman_member_id?: string;
  batsman_name: string;
  over: string;
}

export interface CricketPartnership {
  batsman1_member_id?: string;
  batsman1_name: string;
  batsman2_member_id?: string;
  batsman2_name: string;
  runs: number;
  balls: number;
  is_current: boolean;
}
```

## Summary

**Key Changes:**

- All references to `players` table → `team_members` table
- All `player_id` fields → `member_id`
- Function renamed: `get_player_cricket_stats` → `get_member_cricket_stats`
- Added cross-sport capability
- Maintained backward compatibility with name matching

**Benefits:**

- ✅ Sport-agnostic architecture
- ✅ Unified roster management
- ✅ Cross-sport statistics
- ✅ No schema changes (JSONB)
- ✅ Flexible matching (UUID or name)
- ✅ Reuses existing system

**Ready for:**

- Database migration testing
- TypeScript interface updates
- Player management UI development
- Enhanced scoring logic implementation
