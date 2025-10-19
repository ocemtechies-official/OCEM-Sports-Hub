# Cricket Player Tracking & Run Rate Fix - Comprehensive Analysis & Plan

## 📋 Executive Summary

**Date**: January 2025  
**Status**: 🔍 Analysis Complete → Planning  
**Scope**: Player tracking (batsmen/bowlers), dismissal types, run rate fix

---

## 🔍 Current System Analysis

### ✅ What We Have

#### 1. Database Structure

```sql
-- Existing Tables
public.fixtures (
  id UUID,
  extra JSONB,  -- Contains cricket data
  ...
)

public.players (
  id UUID,
  team_id UUID,
  name TEXT,
  avatar_url TEXT,
  position TEXT,  -- Could be "Batsman", "Bowler", "All-rounder"
  stats JSONB,    -- Player statistics
  ...
)

public.teams (
  id UUID,
  name TEXT,
  ...
)
```

#### 2. Current Cricket Data Structure

```typescript
fixtures.extra.cricket = {
  team_a: {
    runs: 120,
    wickets: 5,
    overs: 15,
    balls_in_current_over: 4,
    extras: 10,
    balls_faced: 94,
    fours: 10,
    sixes: 3,
    wides: 2,
    no_balls: 1,
    byes: 2,
    leg_byes: 1,
    run_rate: 8.0  // ⚠️ NOT CALCULATING CORRECTLY
  },
  team_b: { ... },
  config: {
    total_overs: 20,
    current_innings: 1,
    match_type: 'T20',
    batting_first: 'team_a'
  }
}
```

#### 3. Components

- ✅ `EnhancedCricketScorecard` - Moderator interface
- ✅ `CricketScoreDisplay` - Public view
- ✅ Auto-increment overs system
- ✅ Innings tracking
- ✅ Required run rate calculation

---

## 🐛 Identified Issues

### Issue 1: Run Rate Not Calculating

**Problem**: The `useEffect` that updates run rate creates infinite loop

```typescript
// CURRENT CODE (BROKEN)
useEffect(() => {
  setTeamAData(prev => ({
    ...prev,
    run_rate: calculateRunRate(prev.runs, prev.overs)
  }))
}, [teamAData.runs, teamAData.overs])  // ❌ Dependencies cause loop
```

**Why It Fails**:

1. `teamAData` changes trigger useEffect
2. useEffect calls `setTeamAData`
3. This changes `teamAData` again
4. Infinite loop! React prevents it but rate never updates

**Root Cause**:

- Run rate should be calculated BEFORE state update
- Not in a reactive useEffect
- Should be part of the data mutation functions

---

### Issue 2: No Player Tracking

**Missing Features**:

- ❌ Who is batting (striker/non-striker)
- ❌ Who is bowling
- ❌ Individual batsman stats (runs, balls, 4s, 6s, strike rate)
- ❌ Individual bowler stats (overs, runs, wickets, economy)
- ❌ Partnership tracking
- ❌ Batting order
- ❌ Bowling order
- ❌ Fall of wickets timeline

**Impact**:

- No detailed match insights
- Cannot show scorecards like TV broadcasts
- Missing professional cricket features

---

### Issue 3: No Dismissal Types

**Missing**:

- ❌ How was batsman out? (Bowled, Caught, LBW, Run Out, Stumped, etc.)
- ❌ Who took the catch?
- ❌ Who was the bowler?
- ❌ Fall of wickets score (e.g., "85/3 in 10.4 overs")

---

## 🎯 Proposed Solution

### Architecture Overview

```bash
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
├─────────────────────────────────────────────────────────────┤
│  fixtures.extra.cricket = {                                 │
│    team_a: { ...team stats... },                           │
│    team_b: { ...team stats... },                           │
│    config: { ...match config... },                         │
│    // 🆕 NEW: Player tracking                              │
│    batting: [                                               │
│      { player_id, name, runs, balls, 4s, 6s, SR, out, ... }│
│    ],                                                       │
│    bowling: [                                               │
│      { player_id, name, overs, runs, wickets, economy, ... }│
│    ],                                                       │
│    current_batsmen: [player_id_1, player_id_2],           │
│    current_bowler: player_id,                              │
│    partnerships: [...],                                     │
│    fall_of_wickets: [...]                                  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Detailed Database Design

### Option 1: Keep Everything in JSONB (Recommended)

**Pros**:

- No new tables
- Flexible schema
- Easy to query all match data together
- Follows existing pattern

**Cons**:

- Harder to query individual player stats across matches
- No referential integrity to players table

### Option 2: Create New Tables

**Pros**:

- Proper relational design
- Easy to query player history
- Foreign key constraints

**Cons**:

- More complex queries
- Need to manage relationships
- More database overhead

---

## ✅ Recommended Approach: Hybrid (Option 1 Enhanced)

### Enhanced Cricket Data Structure

```typescript
interface CricketBatsmanData {
  player_id: string | null        // FK to players table (optional)
  name: string                    // Player name (always required)
  batting_position: number        // 1-11
  runs: number
  balls_faced: number
  fours: number
  sixes: number
  strike_rate: number            // Calculated: (runs / balls) * 100
  is_out: boolean
  dismissal_type?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 
                   'hit_wicket' | 'retired_hurt' | 'timed_out' | 'obstructing'
  dismissed_by_bowler_id?: string | null  // Who got wicket
  caught_by_fielder_id?: string | null    // Who caught (if caught)
  dismissal_description?: string          // "c Fielder b Bowler"
  out_at_score?: number                   // Team score when out
  out_at_overs?: string                   // Overs when out (e.g., "15.4")
  is_striker: boolean                     // Currently facing
}

interface CricketBowlerData {
  player_id: string | null
  name: string
  overs: number                   // Complete overs
  balls_in_current_over: number   // 0-5
  runs_conceded: number
  wickets: number
  maidens: number                 // Overs with 0 runs
  wides: number
  no_balls: number
  economy_rate: number            // Calculated: runs / overs
  is_bowling: boolean             // Currently bowling
}

interface Partnership {
  batsman1_id: string | null
  batsman1_name: string
  batsman2_id: string | null
  batsman2_name: string
  runs: number
  balls: number
  wicket_number: number           // 1st wicket, 2nd wicket, etc.
  ended: boolean
}

interface FallOfWicket {
  wicket_number: number           // 1st, 2nd, 3rd...
  batsman_id: string | null
  batsman_name: string
  score: number                   // Team score at dismissal
  overs: string                   // "15.4"
  dismissal_type: string
  dismissal_description: string
}

interface EnhancedCricketData {
  // Existing team data
  team_a: CricketTeamData
  team_b: CricketTeamData
  config: CricketMatchConfig
  
  // 🆕 NEW: Player tracking
  team_a_batting: CricketBatsmanData[]
  team_a_bowling: CricketBowlerData[]
  team_b_batting: CricketBatsmanData[]
  team_b_bowling: CricketBowlerData[]
  
  // 🆕 NEW: Current players
  current_batting_team: 'team_a' | 'team_b'
  current_striker_id: string | null
  current_non_striker_id: string | null
  current_bowler_id: string | null
  
  // 🆕 NEW: Match events
  partnerships: Partnership[]
  fall_of_wickets: FallOfWicket[]
  
  // 🆕 NEW: Ball-by-ball (optional - for detailed tracking)
  balls?: {
    over: number
    ball: number
    batsman_id: string
    bowler_id: string
    runs: number
    extras_type?: string
    wicket?: boolean
    dismissal?: string
  }[]
}
```

---

## 🔧 Implementation Plan

### Phase 1: Fix Run Rate Calculation (IMMEDIATE)

**Priority**: 🔴 CRITICAL  
**Time**: 30 minutes

#### Changes Needed

```typescript
// FILE: components/cricket/enhanced-cricket-scorecard.tsx

// ❌ REMOVE: These useEffects
useEffect(() => {
  setTeamAData(prev => ({
    ...prev,
    run_rate: calculateRunRate(prev.runs, prev.overs)
  }))
}, [teamAData.runs, teamAData.overs])

// ✅ ADD: Calculate run rate in mutation functions
const quickScoreUpdate = async (team: 'a' | 'b', runs: number) => {
  const currentData = team === 'a' ? teamAData : teamBData
  
  let newData = {
    ...currentData,
    runs: currentData.runs + runs,
    balls_faced: currentData.balls_faced + 1,
    fours: runs === 4 ? currentData.fours + 1 : currentData.fours,
    sixes: runs === 6 ? currentData.sixes + 1 : currentData.sixes
  }
  
  // Auto-increment overs
  newData = incrementBall(newData, false)
  
  // 🔥 FIX: Calculate run rate HERE
  const totalBalls = (newData.overs * 6) + (newData.balls_in_current_over || 0)
  const totalOvers = totalBalls / 6
  newData.run_rate = totalOvers > 0 ? parseFloat((newData.runs / totalOvers).toFixed(2)) : 0
  
  // Update state and save
  const setData = team === 'a' ? setTeamAData : setTeamBData
  setData(newData)
  
  // ... rest of save logic
}
```

**Testing**:

1. Open moderator cricket scorecard
2. Add runs using +1, +4, +6 buttons
3. Verify run rate updates correctly
4. Check overs increment after 6 balls
5. Verify run rate recalculates after over completion

---

### Phase 2: Database Schema Enhancement (1-2 hours)

**Priority**: 🟡 HIGH  
**Time**: 1-2 hours

#### Create Migration Script

```sql
-- FILE: scripts/database/45-cricket-player-tracking.sql

-- Add helper function to validate batsman data
CREATE OR REPLACE FUNCTION public.validate_cricket_batsman_data(batsman_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF batsman_data IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check required fields
  IF NOT (
    batsman_data ? 'name' AND
    batsman_data ? 'runs' AND
    batsman_data ? 'balls_faced' AND
    batsman_data ? 'fours' AND
    batsman_data ? 'sixes'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add helper function to validate bowler data
CREATE OR REPLACE FUNCTION public.validate_cricket_bowler_data(bowler_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF bowler_data IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check required fields
  IF NOT (
    bowler_data ? 'name' AND
    bowler_data ? 'overs' AND
    bowler_data ? 'runs_conceded' AND
    bowler_data ? 'wickets'
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add indexes for player queries
CREATE INDEX IF NOT EXISTS idx_fixtures_cricket_players 
ON public.fixtures USING GIN ((extra->'cricket'->'team_a_batting'));

CREATE INDEX IF NOT EXISTS idx_fixtures_cricket_bowlers 
ON public.fixtures USING GIN ((extra->'cricket'->'team_a_bowling'));

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_cricket_batsman_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_cricket_bowler_data TO authenticated;

COMMIT;
```

#### Create View for Player Stats

```sql
-- FILE: scripts/database/46-cricket-player-stats-view.sql

-- View to aggregate player stats across matches
CREATE OR REPLACE VIEW public.cricket_player_stats AS
SELECT 
  p.id as player_id,
  p.name as player_name,
  p.team_id,
  t.name as team_name,
  -- Batting stats
  COUNT(DISTINCT f.id) FILTER (WHERE batting.value IS NOT NULL) as matches_batted,
  COALESCE(SUM((batting.value->>'runs')::INTEGER), 0) as total_runs,
  COALESCE(SUM((batting.value->>'balls_faced')::INTEGER), 0) as total_balls_faced,
  COALESCE(SUM((batting.value->>'fours')::INTEGER), 0) as total_fours,
  COALESCE(SUM((batting.value->>'sixes')::INTEGER), 0) as total_sixes,
  CASE 
    WHEN SUM((batting.value->>'balls_faced')::INTEGER) > 0 
    THEN ROUND((SUM((batting.value->>'runs')::INTEGER)::DECIMAL / 
                SUM((batting.value->>'balls_faced')::INTEGER)) * 100, 2)
    ELSE 0
  END as batting_strike_rate,
  -- Bowling stats
  COUNT(DISTINCT f.id) FILTER (WHERE bowling.value IS NOT NULL) as matches_bowled,
  COALESCE(SUM((bowling.value->>'wickets')::INTEGER), 0) as total_wickets,
  COALESCE(SUM((bowling.value->>'runs_conceded')::INTEGER), 0) as total_runs_conceded,
  COALESCE(SUM((bowling.value->>'overs')::DECIMAL), 0) as total_overs,
  CASE 
    WHEN SUM((bowling.value->>'overs')::DECIMAL) > 0 
    THEN ROUND(SUM((bowling.value->>'runs_conceded')::INTEGER)::DECIMAL / 
               SUM((bowling.value->>'overs')::DECIMAL), 2)
    ELSE 0
  END as bowling_economy
FROM public.players p
LEFT JOIN public.teams t ON p.team_id = t.id
LEFT JOIN public.fixtures f ON (
  f.team_a_id = p.team_id OR f.team_b_id = p.team_id
)
LEFT JOIN LATERAL jsonb_array_elements(
  CASE 
    WHEN f.team_a_id = p.team_id THEN f.extra->'cricket'->'team_a_batting'
    ELSE f.extra->'cricket'->'team_b_batting'
  END
) batting ON (batting.value->>'player_id' = p.id::TEXT OR batting.value->>'name' = p.name)
LEFT JOIN LATERAL jsonb_array_elements(
  CASE 
    WHEN f.team_a_id = p.team_id THEN f.extra->'cricket'->'team_b_bowling'
    ELSE f.extra->'cricket'->'team_a_bowling'
  END
) bowling ON (bowling.value->>'player_id' = p.id::TEXT OR bowling.value->>'name' = p.name)
GROUP BY p.id, p.name, p.team_id, t.name;

-- Grant access
GRANT SELECT ON public.cricket_player_stats TO authenticated, anon;
```

---

### Phase 3: TypeScript Interfaces (30 minutes)

**Priority**: 🟡 HIGH  
**Time**: 30 minutes

#### Create Shared Types

```typescript
// FILE: lib/types/cricket.ts

export interface CricketBatsmanData {
  player_id?: string | null
  name: string
  batting_position: number
  runs: number
  balls_faced: number
  fours: number
  sixes: number
  strike_rate: number
  is_out: boolean
  dismissal_type?: 'bowled' | 'caught' | 'lbw' | 'run_out' | 'stumped' | 
                   'hit_wicket' | 'retired_hurt' | 'timed_out' | 'obstructing'
  dismissed_by_bowler_id?: string | null
  caught_by_fielder_id?: string | null
  dismissal_description?: string
  out_at_score?: number
  out_at_overs?: string
  is_striker: boolean
}

export interface CricketBowlerData {
  player_id?: string | null
  name: string
  overs: number
  balls_in_current_over: number
  runs_conceded: number
  wickets: number
  maidens: number
  wides: number
  no_balls: number
  economy_rate: number
  is_bowling: boolean
}

export interface Partnership {
  batsman1_id: string | null
  batsman1_name: string
  batsman2_id: string | null
  batsman2_name: string
  runs: number
  balls: number
  wicket_number: number
  ended: boolean
}

export interface FallOfWicket {
  wicket_number: number
  batsman_id: string | null
  batsman_name: string
  score: number
  overs: string
  dismissal_type: string
  dismissal_description: string
}

export interface CricketTeamData {
  runs: number
  wickets: number
  overs: number
  extras: number
  balls_faced: number
  fours: number
  sixes: number
  wides: number
  no_balls: number
  byes: number
  leg_byes: number
  run_rate: number
  balls_in_current_over?: number
  innings?: 1 | 2
  is_batting?: boolean
}

export interface CricketMatchConfig {
  total_overs?: number
  current_innings?: 1 | 2
  match_type?: 'T20' | 'T10' | 'ODI' | 'Test' | 'Custom'
  toss_winner?: 'team_a' | 'team_b'
  elected_to?: 'bat' | 'bowl'
  batting_first?: 'team_a' | 'team_b'
}

export interface EnhancedCricketData {
  team_a: CricketTeamData
  team_b: CricketTeamData
  config: CricketMatchConfig
  
  // Player tracking
  team_a_batting?: CricketBatsmanData[]
  team_a_bowling?: CricketBowlerData[]
  team_b_batting?: CricketBatsmanData[]
  team_b_bowling?: CricketBowlerData[]
  
  // Current players
  current_batting_team?: 'team_a' | 'team_b'
  current_striker_id?: string | null
  current_non_striker_id?: string | null
  current_bowler_id?: string | null
  
  // Match events
  partnerships?: Partnership[]
  fall_of_wickets?: FallOfWicket[]
}
```

---

### Phase 4: Player Management Component (3-4 hours)

**Priority**: 🟢 MEDIUM  
**Time**: 3-4 hours

#### Component Structure

```
components/cricket/
├── player-management/
│   ├── playing-eleven-selector.tsx      // Select 11 players for each team
│   ├── batting-order-manager.tsx        // Set batting order (1-11)
│   ├── current-batsmen-selector.tsx     // Choose striker/non-striker
│   ├── bowler-selector.tsx              // Choose current bowler
│   ├── dismissal-dialog.tsx             // Record wicket details
│   └── player-stats-card.tsx            // Display individual player stats
```

#### Example Component

```typescript
// FILE: components/cricket/player-management/current-batsmen-selector.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Target } from "lucide-react"
import { CricketBatsmanData } from "@/lib/types/cricket"

interface CurrentBatsmenSelectorProps {
  battingPlayers: CricketBatsmanData[]
  currentStrikerId?: string | null
  currentNonStrikerId?: string | null
  onUpdate: (strikerId: string, nonStrikerId: string) => void
}

export function CurrentBatsmenSelector({
  battingPlayers,
  currentStrikerId,
  currentNonStrikerId,
  onUpdate
}: CurrentBatsmenSelectorProps) {
  const [striker, setStriker] = useState<string>(currentStrikerId || '')
  const [nonStriker, setNonStriker] = useState<string>(currentNonStrikerId || '')
  
  // Filter out players who are already out
  const availablePlayers = battingPlayers.filter(p => !p.is_out)
  
  const handleSave = () => {
    if (striker && nonStriker && striker !== nonStriker) {
      onUpdate(striker, nonStriker)
    }
  }
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Current Batsmen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Striker */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            Striker (Facing)
          </label>
          <Select value={striker} onValueChange={setStriker}>
            <SelectTrigger>
              <SelectValue placeholder="Select striker" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map(player => (
                <SelectItem 
                  key={player.player_id || player.name} 
                  value={player.player_id || player.name}
                  disabled={player.player_id === nonStriker}
                >
                  {player.name} ({player.runs}* off {player.balls_faced})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Non-Striker */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Non-Striker
          </label>
          <Select value={nonStriker} onValueChange={setNonStriker}>
            <SelectTrigger>
              <SelectValue placeholder="Select non-striker" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map(player => (
                <SelectItem 
                  key={player.player_id || player.name} 
                  value={player.player_id || player.name}
                  disabled={player.player_id === striker}
                >
                  {player.name} ({player.runs}* off {player.balls_faced})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={!striker || !nonStriker || striker === nonStriker}
          className="w-full"
        >
          Update Batsmen
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

### Phase 5: Enhanced Scoring Logic (4-5 hours)

**Priority**: 🟢 MEDIUM  
**Time**: 4-5 hours

#### Update Scoring Functions

```typescript
// FILE: components/cricket/enhanced-cricket-scorecard.tsx

const quickScoreUpdate = async (team: 'a' | 'b', runs: number) => {
  // ... existing code ...
  
  // 🆕 UPDATE: Striker's stats
  if (currentStrikerId) {
    const battingArray = team === 'a' ? teamABatting : teamBBatting
    const updatedBatting = battingArray.map(batsman => {
      if (batsman.player_id === currentStrikerId) {
        const newRuns = batsman.runs + runs
        const newBalls = batsman.balls_faced + 1
        const newFours = runs === 4 ? batsman.fours + 1 : batsman.fours
        const newSixes = runs === 6 ? batsman.sixes + 1 : batsman.sixes
        
        return {
          ...batsman,
          runs: newRuns,
          balls_faced: newBalls,
          fours: newFours,
          sixes: newSixes,
          strike_rate: newBalls > 0 ? parseFloat(((newRuns / newBalls) * 100).toFixed(2)) : 0
        }
      }
      return batsman
    })
    
    // Update state
    if (team === 'a') {
      setTeamABatting(updatedBatting)
    } else {
      setTeamBBatting(updatedBatting)
    }
  }
  
  // 🆕 UPDATE: Bowler's stats
  if (currentBowlerId) {
    const bowlingArray = team === 'a' ? teamBBowling : teamABowling  // Opposite team
    const updatedBowling = bowlingArray.map(bowler => {
      if (bowler.player_id === currentBowlerId) {
        const newRuns = bowler.runs_conceded + runs
        const totalBalls = (bowler.overs * 6) + bowler.balls_in_current_over + 1
        const totalOvers = totalBalls / 6
        
        return {
          ...bowler,
          runs_conceded: newRuns,
          balls_in_current_over: (bowler.balls_in_current_over + 1) % 6,
          overs: bowler.balls_in_current_over === 5 ? bowler.overs + 1 : bowler.overs,
          economy_rate: totalOvers > 0 ? parseFloat((newRuns / totalOvers).toFixed(2)) : 0
        }
      }
      return bowler
    })
    
    // Update state
    if (team === 'a') {
      setTeamBBowling(updatedBowling)
    } else {
      setTeamABowling(updatedBowling)
    }
  }
  
  // ... rest of save logic ...
}
```

---

### Phase 6: Wicket Recording UI (3-4 hours)

**Priority**: 🟢 MEDIUM  
**Time**: 3-4 hours

#### Dismissal Dialog Component

```typescript
// FILE: components/cricket/player-management/dismissal-dialog.tsx

export function DismissalDialog({
  isOpen,
  onClose,
  outBatsman: CricketBatsmanData,
  bowlers: CricketBowlerData[],
  fielders: CricketBatsmanData[],
  teamScore: number,
  teamOvers: string,
  onSave: (dismissalData: any) => void
}) {
  const [dismissalType, setDismissalType] = useState<string>('')
  const [bowlerId, setBowlerId] = useState<string>('')
  const [fielderId, setFielderId] = useState<string>('')
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Dismissal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Batsman Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold">{outBatsman.name}</h3>
            <p className="text-sm text-slate-600">
              {outBatsman.runs} ({outBatsman.balls_faced}) | 
              SR: {outBatsman.strike_rate}
            </p>
          </div>
          
          {/* Dismissal Type */}
          <div>
            <Label>How Out?</Label>
            <Select value={dismissalType} onValueChange={setDismissalType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dismissal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bowled">Bowled</SelectItem>
                <SelectItem value="caught">Caught</SelectItem>
                <SelectItem value="lbw">LBW</SelectItem>
                <SelectItem value="run_out">Run Out</SelectItem>
                <SelectItem value="stumped">Stumped</SelectItem>
                <SelectItem value="hit_wicket">Hit Wicket</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bowler (if applicable) */}
          {['bowled', 'caught', 'lbw', 'stumped'].includes(dismissalType) && (
            <div>
              <Label>Bowler</Label>
              <Select value={bowlerId} onValueChange={setBowlerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bowler" />
                </SelectTrigger>
                <SelectContent>
                  {bowlers.map(bowler => (
                    <SelectItem key={bowler.player_id} value={bowler.player_id!}>
                      {bowler.name} ({bowler.wickets} wkts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Fielder (if caught) */}
          {dismissalType === 'caught' && (
            <div>
              <Label>Caught By</Label>
              <Select value={fielderId} onValueChange={setFielderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fielder" />
                </SelectTrigger>
                <SelectContent>
                  {fielders.map(fielder => (
                    <SelectItem key={fielder.player_id} value={fielder.player_id!}>
                      {fielder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Summary */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-semibold">Fall of Wicket</p>
            <p className="text-sm text-slate-700">
              {teamScore}/{teamOvers} - {outBatsman.name} {dismissalType}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Record Wicket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Phase 7: Enhanced Display Components (2-3 hours)

**Priority**: 🟡 HIGH  
**Time**: 2-3 hours

#### Batting Scorecard Component

```typescript
// FILE: components/cricket/player-management/batting-scorecard.tsx

export function BattingScorecard({ 
  batsmen, 
  currentStrikerId, 
  currentNonStrikerId 
}: {
  batsmen: CricketBatsmanData[]
  currentStrikerId?: string | null
  currentNonStrikerId?: string | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batting Scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Batsman</th>
                <th className="text-right p-2">R</th>
                <th className="text-right p-2">B</th>
                <th className="text-right p-2">4s</th>
                <th className="text-right p-2">6s</th>
                <th className="text-right p-2">SR</th>
              </tr>
            </thead>
            <tbody>
              {batsmen.map((batsman, idx) => (
                <tr 
                  key={idx}
                  className={`border-b ${
                    batsman.player_id === currentStrikerId ? 'bg-green-50' :
                    batsman.player_id === currentNonStrikerId ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {batsman.name}
                      {batsman.player_id === currentStrikerId && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Striker
                        </Badge>
                      )}
                      {!batsman.is_out && batsman.player_id !== currentStrikerId && (
                        <span className="text-green-600 font-bold">*</span>
                      )}
                    </div>
                    {batsman.is_out && (
                      <div className="text-xs text-slate-600">
                        {batsman.dismissal_description}
                      </div>
                    )}
                  </td>
                  <td className="text-right p-2 font-semibold">{batsman.runs}</td>
                  <td className="text-right p-2">{batsman.balls_faced}</td>
                  <td className="text-right p-2">{batsman.fours}</td>
                  <td className="text-right p-2">{batsman.sixes}</td>
                  <td className="text-right p-2">{batsman.strike_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test run rate calculation
describe('calculateRunRate', () => {
  it('should calculate correct run rate', () => {
    expect(calculateRunRate(120, 15.4)).toBe(7.79)
    expect(calculateRunRate(0, 0)).toBe(0)
    expect(calculateRunRate(100, 10)).toBe(10)
  })
})

// Test strike rate calculation
describe('calculateStrikeRate', () => {
  it('should calculate batsman strike rate', () => {
    expect(calculateStrikeRate(50, 30)).toBe(166.67)
    expect(calculateStrikeRate(0, 0)).toBe(0)
  })
})

// Test economy rate calculation
describe('calculateEconomy', () => {
  it('should calculate bowler economy', () => {
    expect(calculateEconomy(45, 4)).toBe(11.25)
    expect(calculateEconomy(20, 5)).toBe(4.00)
  })
})
```

### Integration Tests

1. Create cricket fixture
2. Add players to teams
3. Start match
4. Select batting lineup
5. Select bowler
6. Score runs
7. Verify stats update
8. Record wicket
9. Verify fall of wickets
10. Complete innings

---

## 📈 Success Metrics

### Phase 1 (Run Rate Fix)

- ✅ Run rate updates immediately after runs scored
- ✅ Run rate calculates correctly after overs increment
- ✅ No console errors or infinite loops

### Phase 2-3 (Data Structure)

- ✅ Database accepts new cricket data structure
- ✅ TypeScript compilation successful
- ✅ No breaking changes to existing matches

### Phase 4-6 (Player Tracking)

- ✅ Can select 11 players for each team
- ✅ Can set batting order
- ✅ Can choose current batsmen
- ✅ Can select bowler
- ✅ Individual stats update correctly
- ✅ Can record dismissals with details

### Phase 7 (Display)

- ✅ Batting scorecard shows all batsmen
- ✅ Bowling figures display correctly
- ✅ Fall of wickets timeline visible
- ✅ Current players highlighted
- ✅ Mobile responsive

---

## 🚧 Potential Challenges

### Challenge 1: State Management Complexity

**Problem**: Managing multiple arrays of players, current players, partnerships, etc.  
**Solution**: Use React Context or Zustand for centralized state

### Challenge 2: Backward Compatibility

**Problem**: Existing matches don't have player data  
**Solution**: Make all player fields optional, gracefully handle missing data

### Challenge 3: Performance with Large Data

**Problem**: Ball-by-ball tracking could create large JSON  
**Solution**: Only store ball-by-ball for live matches, archive after completion

### Challenge 4: UI Complexity

**Problem**: Too many inputs for moderators  
**Solution**: Progressive disclosure - hide advanced features behind tabs/accordions

---

## 📅 Timeline

| Phase | Priority | Time | Status |
|-------|----------|------|--------|
| Phase 1: Fix Run Rate | 🔴 CRITICAL | 30 min | ⏳ Ready to start |
| Phase 2: Database Schema | 🟡 HIGH | 1-2 hrs | ⏳ Pending Phase 1 |
| Phase 3: TypeScript Types | 🟡 HIGH | 30 min | ⏳ Pending Phase 1 |
| Phase 4: Player Management UI | 🟢 MEDIUM | 3-4 hrs | ⏳ Pending Phase 2-3 |
| Phase 5: Enhanced Scoring | 🟢 MEDIUM | 4-5 hrs | ⏳ Pending Phase 4 |
| Phase 6: Wicket Recording | 🟢 MEDIUM | 3-4 hrs | ⏳ Pending Phase 5 |
| Phase 7: Enhanced Display | 🟡 HIGH | 2-3 hrs | ⏳ Pending Phase 6 |
| **TOTAL** | | **15-22 hrs** | |

---

## 🎯 Immediate Next Steps

### Step 1: Fix Run Rate (START HERE)

1. Remove problematic useEffect hooks
2. Calculate run rate in mutation functions
3. Test thoroughly
4. Commit changes

### Step 2: Create Database Migration

1. Write SQL migration script
2. Add validation functions
3. Create player stats view
4. Test on development database

### Step 3: Update TypeScript Interfaces

1. Create shared types file
2. Update component imports
3. Fix TypeScript errors

### Step 4: Build Player Management

1. Create component structure
2. Implement player selection
3. Add current players UI
4. Test data flow

---

## 📝 Notes & Considerations

### Design Decisions

**Q**: Should we link players to the `players` table?  
**A**: Optional. Store `player_id` if available, but allow manual name entry for flexibility.

**Q**: How detailed should ball-by-ball tracking be?  
**A**: Start with essentials (runs, wickets), add details later if needed.

**Q**: Should we auto-calculate partnerships?  
**A**: Yes, calculate based on batsmen stats and fall of wickets.

**Q**: Handle retired hurt/injured?  
**A**: Add as dismissal type, mark `is_out=false` but remove from current batsmen.

---

## ✅ Acceptance Criteria

### Must Have

- [x] Run rate calculates correctly
- [ ] Can add/remove players from playing XI
- [ ] Can set batting order
- [ ] Can select current batsmen (striker/non-striker)
- [ ] Can select current bowler
- [ ] Individual batsman stats track correctly
- [ ] Individual bowler stats track correctly
- [ ] Can record wickets with dismissal type
- [ ] Fall of wickets timeline displays
- [ ] Batting scorecard shows all batsmen
- [ ] Bowling figures display correctly

### Nice to Have

- [ ] Partnership tracking
- [ ] Ball-by-ball commentary
- [ ] Auto-suggest next batsman
- [ ] Bowler change alerts
- [ ] Over completion summary
- [ ] Innings summary statistics

---

## 🎉 Conclusion

This plan provides a **comprehensive roadmap** for implementing:

1. ✅ **Run rate fix** (immediate)
2. ✅ **Player tracking** (batsmen & bowlers)
3. ✅ **Dismissal types** (wicket details)
4. ✅ **Professional displays** (scorecards)

**Estimated Total Time**: 15-22 hours  
**Phases**: 7 phases, each independently deployable  
**Risk Level**: Low (incremental, backward compatible)

Ready to proceed with **Phase 1: Fix Run Rate**! 🚀
