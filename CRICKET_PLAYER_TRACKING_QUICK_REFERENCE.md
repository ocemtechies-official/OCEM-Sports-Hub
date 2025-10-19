# Cricket Player Tracking - Quick Reference

## 🚀 Quick Start Guide

### Step 1: Deploy Database Migration
```bash
# In Supabase SQL Editor
\i scripts/database/migrations/46-cricket-player-tracking.sql
```

### Step 2: Pass Team IDs to Component
```tsx
<EnhancedCricketScorecard
  fixtureId={fixture.id}
  teamAId={fixture.team_a_id}  // ← ADD THIS
  teamBId={fixture.team_b_id}  // ← ADD THIS
  teamAName={fixture.team_a_name}
  teamBName={fixture.team_b_name}
  // ... other props
/>
```

### Step 3: Use the System!

---

## 🎮 Moderator Workflow

### Match Setup (One-time)
1. Open moderator panel → Select match
2. **Match Configuration** tab:
   - Set match type (T20/ODI)
   - Set total overs (20/50)
   - Select which team bats first

### Playing XI Selection (One-time per match)
1. **"Team A Players"** tab:
   - Search and select 11 players
   - Arrange batting order (↑↓ buttons)
   - Mark captain (🛡️ button)
   - Mark substitutes (Sub button)
2. **"Team B Players"** tab:
   - Repeat for Team B

### Current Players (Changes during match)
1. **"Current Players"** tab:
   - Select **Striker** (batsman on strike)
   - Select **Non-Striker** (other batsman)
   - Select **Bowler** (current bowler)
   - ✅ Green validation message appears

### Scoring (Ball-by-ball)
| Action | Effect |
|--------|--------|
| Click **+1** | Striker gets 1 run, batsmen stay same |
| Click **+4** | Striker gets 4 runs + 1 four |
| Click **+6** | Striker gets 6 runs + 1 six |
| Click **+1, +3, +5** | Striker scores, **batsmen auto-swap** ↔️ |
| Click **Wicket** | Opens dismissal dialog 👇 |

### Recording Wickets
1. Click **Wicket** button
2. Select **Dismissal Type**:
   - Bowled, Caught, LBW, Run Out, Stumped, etc.
3. Select **Bowler** (if applicable) - Current bowler pre-selected
4. Select **Fielder** (if applicable)
5. Add **Notes** (optional)
6. Click **"Record Wicket"**
7. Select next batsman in "Current Players" tab

---

## 📊 What Gets Tracked

### Automatically Updated:
✅ Striker runs, balls, 4s, 6s, strike rate
✅ Bowler overs, runs conceded, wickets, economy
✅ Partnerships (runs, balls)
✅ Fall of wickets timeline
✅ Team scores and run rates
✅ Overs bowled (auto-increments every 6 balls)

### Manually Managed:
🔧 Playing XI selection
🔧 Current players (striker/non-striker/bowler)
🔧 Wicket details (type, bowler, fielder)

---

## ⚡ Smart Features

### Auto-Swap Batsmen
```
Striker scores 1, 3, or 5 runs → Batsmen automatically swap
Striker scores 0, 2, 4, or 6 runs → Batsmen stay same
```

### Auto-Partnership Tracking
```
First ball of innings → Partnership starts
Wicket falls → Partnership ends
Next batsman selected → New partnership starts
```

### Auto-Bowler Wicket Credit
```
Bowled, Caught, LBW, Stumped → Bowler gets wicket
Run Out, Retired Hurt → No bowler credit
```

---

## 🐛 Troubleshooting

### "Select Players First" Error
**Problem**: Trying to score without selecting striker/non-striker/bowler
**Solution**: Go to "Current Players" tab and select all three

### Player Not in List
**Problem**: Team member not showing in dropdown
**Solution**: 
1. Check team_members table has correct team_id
2. Check sport_name = 'Cricket'
3. Refresh page

### Stats Not Saving
**Problem**: Scores updating but player stats not persisting
**Solution**:
1. Check browser console for errors
2. Verify API endpoint working
3. Check database permissions

### Old Match Not Showing Stats
**Expected**: Old matches (before player tracking) won't have player stats
**Solution**: This is normal - system is backward compatible

---

## 📱 Components Reference

### For Moderators
| Component | Purpose | Location |
|-----------|---------|----------|
| `TeamMembersSelector` | Select playing XI | Player tabs |
| `CurrentPlayersSelector` | Select striker/non-striker/bowler | Current Players tab |
| `DismissalDialog` | Record wickets | Opens on "Wicket" click |

### For Viewers
| Component | Purpose | Location |
|-----------|---------|----------|
| `BattingScorecard` | Show all batsmen | Match page |
| `BowlingFigures` | Show all bowlers | Match page |
| `CurrentPlayersCard` | Show current players | Match page sidebar |
| `FallOfWicketsTimeline` | Show wickets timeline | Match page sidebar |
| `PartnershipsDisplay` | Show partnerships | Match page sidebar |

---

## 🗄️ Database Structure

```javascript
fixtures.extra.cricket = {
  team_a: { runs, wickets, overs, ... },
  team_b: { runs, wickets, overs, ... },
  config: { total_overs, match_type, ... },
  
  // NEW: Player Tracking
  team_a_members: [...],      // Playing XI
  team_b_members: [...],      // Playing XI
  current_players: {...},     // Striker, non-striker, bowler
  team_a_batting: [...],      // All batsmen stats
  team_b_batting: [...],      // All batsmen stats
  team_a_bowling: [...],      // All bowlers stats
  team_b_bowling: [...],      // All bowlers stats
  partnerships: [...],        // All partnerships
  fall_of_wickets: [...]      // Wickets timeline
}
```

---

## 🎯 Pro Tips

1. **Select Playing XI First** - Before match starts
2. **Set Current Players** - Before first ball
3. **Use Swap Button** - Instead of manual selection after odd runs
4. **Current Bowler Pre-selected** - In wicket dialog
5. **Check Validation** - Green message = ready to score
6. **Mobile Friendly** - Works on tablets/phones
7. **No Undo** - Be careful when recording wickets
8. **Save Happens Auto** - After every action (1 sec delay)

---

## 📞 Need Help?

1. Read `CRICKET_PLAYER_TRACKING_COMPLETE.md` for full docs
2. Check `lib/types/cricket.ts` for data structures
3. Test in development first
4. Check browser console for errors
5. Verify database migration deployed

---

## ✅ Phase 9 Testing

### Before Going Live:
- [ ] Deploy database migration
- [ ] Test player selection
- [ ] Test scoring (10 balls minimum)
- [ ] Test wicket recording
- [ ] Test partnerships
- [ ] Test on mobile
- [ ] Test public match page
- [ ] Test with old matches (backward compatibility)

---

**Built with ❤️ - Ready to track every ball! 🏏**
