# Cricket Innings & Overs Tracking Enhancement 🏏

**Date:** October 19, 2025  
**Status:** PLANNED  
**Priority:** HIGH

---

## 🎯 Problem Statement

Currently, the cricket scorecard tracks:

- ✅ Runs, wickets, overs, balls_faced
- ✅ Boundaries (4s, 6s)
- ✅ Extras breakdown

But it's MISSING:

- ❌ **Innings tracking** (1st innings vs 2nd innings)
- ❌ **Total overs** for the match (e.g., 20 overs, 50 overs)
- ❌ **Overs remaining** display
- ❌ **Current over** ball-by-ball display (e.g., "Current: 15.4")
- ❌ **Auto-increment overs** when 6 balls are bowled
- ❌ **Innings status** (batting/bowling)

---

## 📊 Proposed Data Structure

### Enhanced CricketData Interface

```typescript
interface CricketMatchData {
  // Match configuration
  total_overs: number           // e.g., 20 (T20), 50 (ODI)
  current_innings: 1 | 2        // Which innings is active
  
  // Team A data
  team_a: {
    runs: number
    wickets: number
    overs: number               // Completed overs (e.g., 15)
    balls_in_current_over: number  // Balls in current over (0-5)
    extras: number
    balls_faced: number
    fours: number
    sixes: number
    wides: number
    no_balls: number
    byes: number
    leg_byes: number
    run_rate: number
    innings: 1 | 2              // Which innings this team batted
    is_batting: boolean         // Currently batting?
  }
  
  team_b: {
    // ... same structure
  }
  
  // Additional metadata
  match_type: 'T20' | 'ODI' | 'Test' | 'T10'
  toss_winner: 'team_a' | 'team_b'
  elected_to: 'bat' | 'bowl'
}
```

---

## 🎨 UI Enhancements

### 1. Match Configuration Section (Top)

```
┌─────────────────────────────────────────────┐
│  Match Type: T20 (20 Overs)                 │
│  Current Innings: 2nd Innings               │
│  ────────────────────────────────────────   │
│  Toss: Forest Rangers (Elected to Bat)     │
└─────────────────────────────────────────────┘
```

### 2. Enhanced Score Display

**Team A (1st Innings - Completed):**

```
┌─────────────────────────────────────────────┐
│  Forest Rangers        1st Innings          │
│  ──────────────────────────────────────────│
│                                             │
│     175/6                                   │
│  (20.0 Overs)                              │
│                                             │
│  Run Rate: 8.75                             │
│  Extras: 12 (wd 8, nb 3, b 1)              │
│  Boundaries: 4s(15) 6s(8)                   │
└─────────────────────────────────────────────┘
```

**Team B (2nd Innings - In Progress):**

```
┌─────────────────────────────────────────────┐
│  Desert Scorpions      2nd Innings 🟢       │
│  ──────────────────────────────────────────│
│                                             │
│     128/4                                   │
│  (15.4/20.0 Overs)    ← Current over!       │
│                                             │
│  Overs Remaining: 4.2                       │
│  Run Rate: 8.15                             │
│  Required Run Rate: 11.40                   │
│                                             │
│  Current Over: 1 4 1 2 . .                  │
│  ──────────────────────────────────────────│
│  Extras: 8 (wd 5, nb 2, b 1)               │
│  Boundaries: 4s(10) 6s(5)                   │
└─────────────────────────────────────────────┘

Need 48 runs in 26 balls
```

### 3. Over Progress Bar

```
┌─────────────────────────────────────────────┐
│  Over Progress                               │
│  ████████████████░░░░ 15.4 / 20.0           │
│  78% Complete                                │
└─────────────────────────────────────────────┘
```

### 4. Ball-by-Ball Current Over Display

```
Current Over: 15.4
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 4 │ 1 │ 2 │ . │ . │  ← 4 balls bowled, 2 remaining
└───┴───┴───┴───┴───┴───┘
Legend: . = not bowled | W = wicket | wd = wide
```

---

## 🔧 Key Functions to Add

### 1. Calculate Current Over String

```typescript
function getCurrentOverString(overs: number, balls: number): string {
  // overs = 15, balls = 4 → "15.4"
  return `${overs}.${balls}`
}
```

### 2. Calculate Overs Remaining

```typescript
function getOversRemaining(
  currentOvers: number, 
  currentBalls: number, 
  totalOvers: number
): string {
  const ballsRemaining = (totalOvers * 6) - (currentOvers * 6 + currentBalls)
  const oversRem = Math.floor(ballsRemaining / 6)
  const ballsRem = ballsRemaining % 6
  return `${oversRem}.${ballsRem}`
}
```

### 3. Auto-Increment Overs

```typescript
function incrementBall(currentData: CricketTeamData) {
  let balls = currentData.balls_in_current_over + 1
  let overs = currentData.overs
  
  if (balls === 6) {
    // Over complete!
    overs += 1
    balls = 0
  }
  
  return {
    ...currentData,
    overs,
    balls_in_current_over: balls,
    balls_faced: currentData.balls_faced + 1
  }
}
```

### 4. Calculate Required Run Rate (2nd Innings)

```typescript
function getRequiredRunRate(
  target: number,
  currentRuns: number,
  oversRemaining: number
): number {
  if (oversRemaining === 0) return 0
  const runsNeeded = target - currentRuns
  return Number((runsNeeded / oversRemaining).toFixed(2))
}
```

### 5. Track Current Over Balls

```typescript
interface OverBall {
  type: 'runs' | 'wicket' | 'wide' | 'no_ball' | 'dot'
  runs: number
  ball_number: number
}

// Store current over balls in state
const [currentOverBalls, setCurrentOverBalls] = useState<OverBall[]>([])
```

---

## 📋 Implementation Steps

### **Phase 1: Data Structure** ✅

1. Add `total_overs`, `current_innings`, `match_type` to cricket data
2. Add `balls_in_current_over`, `innings`, `is_batting` to team data
3. Update TypeScript interfaces
4. Add match configuration input fields

### **Phase 2: Overs Logic** ✅

1. Implement auto-increment overs when balls_in_current_over = 6
2. Calculate overs remaining
3. Display current over (e.g., "15.4")
4. Add overs progress bar

### **Phase 3: Innings Management** ✅

1. Add innings selector (1st/2nd)
2. Track which team is batting
3. Show innings status badges
4. Calculate required run rate for 2nd innings

### **Phase 4: Current Over Tracking** 🔄

1. Track ball-by-ball for current over
2. Display current over balls (1, 4, W, wd, etc.)
3. Reset on over completion
4. Store in match history

### **Phase 5: UI Enhancements** 🔄

1. Enhanced score display with innings info
2. Overs remaining display
3. Required run rate for chasing team
4. Visual indicators (🟢 for batting team)
5. Completion status for completed innings

---

## 🎯 User Experience Flow

### Scenario: T20 Match Setup

**Step 1: Initialize Match**

```
Moderator creates cricket match:
- Match Type: T20 (20 overs)
- Toss: Forest Rangers
- Elected to: Bat
```

**Step 2: 1st Innings (Forest Rangers Batting)**

```
Display shows:
- Current Innings: 1st
- Batting: Forest Rangers
- Overs: 0.0 / 20.0
- Score: 0/0

Moderator updates:
- Click "+4" → Score: 4/0, Overs: 0.1
- Click "+6" → Score: 10/0, Overs: 0.2
- ... (continue until 6 balls)
- After 6 balls → Overs: 1.0 (auto-increment!)
```

**Step 3: Complete 1st Innings**

```
After 20 overs or 10 wickets:
- Forest Rangers: 175/6 (20.0 overs)
- Innings Status: Completed ✅
- Switch to 2nd Innings button appears
```

**Step 4: 2nd Innings (Desert Scorpions Batting)**

```
Display shows:
- Current Innings: 2nd
- Batting: Desert Scorpions
- Target: 176 (to win)
- Overs: 0.0 / 20.0
- Required RR: 8.80

As match progresses:
- Score: 128/4 (15.4/20.0)
- Need: 48 runs in 26 balls
- Required RR: 11.40
- Current Over: 1 4 1 2 . .
```

**Step 5: Match Completion**

```
When match ends:
- Show winner
- Show margin (by runs or wickets)
- Show man of the match option
```

---

## 🔄 Automatic Calculations

### Every Ball Update Should

1. ✅ Increment `balls_in_current_over`
2. ✅ If `balls_in_current_over` = 6, increment `overs` and reset to 0
3. ✅ Update `balls_faced` total
4. ✅ Recalculate `run_rate`
5. ✅ If 2nd innings, recalculate `required_run_rate`
6. ✅ Update `overs_remaining`
7. ✅ Check for innings completion (20 overs or 10 wickets)

---

## 🎨 Visual Indicators

### Innings Status Badges

- **1st Innings** 🔵 (Blue)
- **2nd Innings** 🟢 (Green if batting, gray if completed)
- **Completed** ✅ (Gray with checkmark)

### Overs Display

- **Current:** `15.4/20.0` (bold, large)
- **Remaining:** `4.2 overs left` (smaller, colored)
- **Progress Bar:** Visual representation

### Required Run Rate (2nd Innings)

- **Green** if achievable (< 12 per over)
- **Amber** if challenging (12-15 per over)
- **Red** if very difficult (> 15 per over)

---

## 📊 Sample Data After Implementation

```json
{
  "cricket": {
    "total_overs": 20,
    "current_innings": 2,
    "match_type": "T20",
    "toss_winner": "team_a",
    "elected_to": "bat",
    
    "team_a": {
      "runs": 175,
      "wickets": 6,
      "overs": 20,
      "balls_in_current_over": 0,
      "extras": 12,
      "balls_faced": 120,
      "fours": 15,
      "sixes": 8,
      "run_rate": 8.75,
      "innings": 1,
      "is_batting": false
    },
    
    "team_b": {
      "runs": 128,
      "wickets": 4,
      "overs": 15,
      "balls_in_current_over": 4,
      "extras": 8,
      "balls_faced": 94,
      "fours": 10,
      "sixes": 5,
      "run_rate": 8.15,
      "innings": 2,
      "is_batting": true
    }
  }
}
```

---

## ⚠️ Edge Cases to Handle

1. **Wides & No Balls:** Don't increment ball count (extras don't count as balls)
2. **Innings Switch:** Clear ball-by-ball history, reset overs
3. **Match Types:** Different total overs (T10=10, T20=20, ODI=50)
4. **All Out:** If 10 wickets, innings ends even if overs remaining
5. **Rain/DLS:** May need to adjust target and overs (future enhancement)

---

## 🚀 Implementation Priority

### Must Have (MVP)

1. ✅ Total overs configuration
2. ✅ Current innings tracking
3. ✅ Auto-increment overs logic
4. ✅ Overs remaining display
5. ✅ Current over display (e.g., "15.4")

### Should Have (V2)

1. ⏳ Ball-by-ball current over display
2. ⏳ Required run rate for 2nd innings
3. ⏳ Innings completion detection
4. ⏳ Visual progress bars

### Nice to Have (V3)

1. ⏳ Full ball-by-ball history
2. ⏳ Wagon wheel visualization
3. ⏳ Manhattan chart (overs vs runs)
4. ⏳ Partnerships tracking

---

**Next Step:** Implement Phase 1 & 2 (Data Structure + Overs Logic) ✅
