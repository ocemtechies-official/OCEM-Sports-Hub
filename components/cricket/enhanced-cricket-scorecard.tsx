"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Clock,
  Info,
  Plus,
  Minus,
  CheckCircle
} from "lucide-react"
import { calculateRunRate, type CricketTeamData } from "@/lib/cricket/run-rate"

interface CricketTeamDataExtended extends CricketTeamData {
  // Add any additional fields that might be used in this component but not in the base interface
}

interface CricketMatchConfig {
  total_overs?: number            // Total overs per innings (20 for T20, 50 for ODI)
  current_innings?: 1 | 2         // Current innings being played
  match_type?: 'T20' | 'T10' | 'ODI' | 'Test' | 'Custom'
  toss_winner?: 'team_a' | 'team_b'
  elected_to?: 'bat' | 'bowl'
  batting_first?: 'team_a' | 'team_b'  // Which team is batting first
}

interface EnhancedCricketScorecardProps {
  fixtureId: string
  teamAName: string
  teamBName: string
  teamAScore: number
  teamBScore: number
  status: string
  onUpdate?: (data: any) => Promise<void>
  initialData?: {
    cricket?: {
      team_a?: CricketTeamData
      team_b?: CricketTeamData
      config?: CricketMatchConfig  // Add match configuration
    }
  }
}

export function EnhancedCricketScorecard({
  fixtureId,
  teamAName,
  teamBName,
  teamAScore,
  teamBScore,
  status,
  onUpdate,
  initialData
}: EnhancedCricketScorecardProps) {
  const [teamAData, setTeamAData] = useState<CricketTeamData>({
    runs: 0,
    wickets: 0,
    overs: 0,
    extras: 0,
    balls_faced: 0,
    fours: 0,
    sixes: 0,
    wides: 0,
    no_balls: 0,
    byes: 0,
    leg_byes: 0,
    run_rate: 0,
    balls_in_current_over: 0,  // Start at 0
    innings: 1,                 // Default to 1st innings
    is_batting: true           // Default to batting
  })

  const [teamBData, setTeamBData] = useState<CricketTeamData>({
    runs: 0,
    wickets: 0,
    overs: 0,
    extras: 0,
    balls_faced: 0,
    fours: 0,
    sixes: 0,
    wides: 0,
    no_balls: 0,
    byes: 0,
    leg_byes: 0,
    run_rate: 0,
    balls_in_current_over: 0,
    innings: 2,
    is_batting: false
  })

  // Match configuration state
  const [matchConfig, setMatchConfig] = useState<CricketMatchConfig>({
    total_overs: 20,           // Default T20
    current_innings: 1,        // Start with 1st innings
    match_type: 'T20',
    toss_winner: 'team_a',
    elected_to: 'bat',
    batting_first: 'team_a'    // Default team A batting first
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [localTeamAScore, setLocalTeamAScore] = useState(teamAScore)
  const [localTeamBScore, setLocalTeamBScore] = useState(teamBScore)
  const { toast } = useToast()

  // Initialize data from props
  useEffect(() => {
    if (initialData?.cricket) {
      if (initialData.cricket?.team_a) {
        setTeamAData(prev => ({ ...prev, ...initialData.cricket!.team_a }))
      }
      if (initialData.cricket?.team_b) {
        setTeamBData(prev => ({ ...prev, ...initialData.cricket!.team_b }))
      }
      // Load match configuration if exists
      if (initialData.cricket?.config) {
        setMatchConfig(prev => ({ ...prev, ...initialData.cricket!.config }))
      }
    }
  }, [initialData])

  // Remove score sync effects since we now use cricket data as source of truth
  useEffect(() => {
    // Initialize cricket data from main scores if needed
    if (!initialData?.cricket?.team_a && teamAScore > 0) {
      setTeamAData(prev => ({ ...prev, runs: teamAScore }))
    }
    if (!initialData?.cricket?.team_b && teamBScore > 0) {
      setTeamBData(prev => ({ ...prev, runs: teamBScore }))
    }
  }, [teamAScore, teamBScore, initialData])

  // const calculateRunRate = (data: CricketTeamData): number => {
  //   // If no overs have been bowled, return 0
  //   if (data.overs === 0 && (!data.balls_in_current_over || data.balls_in_current_over === 0)) {
  //     return 0;
  //   }

  //   // Calculate total balls (overs * 6 + balls in current over)
  //   const totalBalls = (data.overs * 6) + (data.balls_in_current_over || 0);
    
  //   // Convert to decimal overs
  //   const totalOvers = totalBalls / 6;
    
  //   // Calculate and return run rate with 2 decimal places
  //   return Number((data.runs / totalOvers).toFixed(2));
  // }

  // Always calculate run rate from current data rather than using stored value
  const getTeamARunRate = (): number => {
    return calculateRunRate(teamAData);
  }

  const getTeamBRunRate = (): number => {
    return calculateRunRate(teamBData);
  }

  // Helper: Calculate required run rate for chasing team
  const getRequiredRunRate = (target: number, currentRuns: number, oversRemaining: string): number => {
    const [overs, balls] = oversRemaining.split('.').map(Number)
    const totalBalls = (overs * 6) + (balls || 0)
    
    if (totalBalls === 0) return 0
    
    const runsNeeded = target - currentRuns
    const totalOvers = totalBalls / 6
    const rrr = runsNeeded / totalOvers
    
    return Math.max(0, parseFloat(rrr.toFixed(2)))
  }

  // Helper: Format overs display (e.g., 15 overs + 4 balls = "15.4")
  const formatOvers = (overs: number, balls: number = 0): string => {
    if (balls === 0) return `${overs}.0`
    return `${overs}.${balls}`
  }

  // Helper: Calculate overs remaining
  const getOversRemaining = (currentOvers: number, currentBalls: number, totalOvers: number): string => {
    const totalBallsBowled = (currentOvers * 6) + currentBalls
    const totalBallsInInnings = totalOvers * 6
    const ballsRemaining = totalBallsInInnings - totalBallsBowled
    
    if (ballsRemaining <= 0) return '0.0'
    
    const oversRem = Math.floor(ballsRemaining / 6)
    const ballsRem = ballsRemaining % 6
    return formatOvers(oversRem, ballsRem)
  }

  // Helper: Auto-increment overs when 6 balls are bowled
  const incrementBall = (data: CricketTeamData, isExtra: boolean = false): CricketTeamData => {
    // Extras (wides, no balls) don't count as legal deliveries
    if (isExtra) {
      return data
    }

    let balls = (data.balls_in_current_over || 0) + 1
    let overs = data.overs

    // After 6 legal balls, increment over and reset balls
    if (balls === 6) {
      overs += 1
      balls = 0
    }

    return {
      ...data,
      overs,
      balls_in_current_over: balls
    }
  }

  const handleTeamUpdate = async (team: 'a' | 'b', field: keyof CricketTeamData, value: number) => {
    if (team === 'a') {
      setTeamAData(prev => {
        const updatedData = { ...prev, [field]: value };
        // Recalculate run rate if runs, overs, or balls changed
        if (field === 'runs' || field === 'overs' || field === 'balls_in_current_over') {
          updatedData.run_rate = calculateRunRate(updatedData);
        }
        return updatedData;
      });
    } else {
      setTeamBData(prev => {
        const updatedData = { ...prev, [field]: value };
        // Recalculate run rate if runs, overs, or balls changed
        if (field === 'runs' || field === 'overs' || field === 'balls_in_current_over') {
          updatedData.run_rate = calculateRunRate(updatedData);
        }
        return updatedData;
      });
    }

    // Auto-save after a short delay
    setTimeout(async () => {
      await saveCricketData()
    }, 1000)
  }

  const saveCricketData = async (customTeamAData?: CricketTeamData, customTeamBData?: CricketTeamData, customTeamAScore?: number, customTeamBScore?: number) => {
    setIsUpdating(true)
    try {
      // Use custom data if provided (for immediate updates), otherwise use state
      const finalTeamAData = customTeamAData || teamAData
      const finalTeamBData = customTeamBData || teamBData
      
      // CRITICAL: Ensure team scores match cricket data runs
      const scoreA = finalTeamAData.runs
      const scoreB = finalTeamBData.runs

      const dataToSave = {
        team_a: finalTeamAData,
        team_b: finalTeamBData,
        config: matchConfig // Include match configuration
      }

      const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: scoreA,
          team_b_score: scoreB,
          status: status,
          extra: {
            cricket: dataToSave
          }
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.fixture) {
        throw new Error(data.error || 'Failed to update cricket data')
      }

      // CRITICAL FIX: Sync local state from server response (like QuickUpdateCard does)
      const fx = data.fixture
      if (typeof fx.team_a_score === 'number') setLocalTeamAScore(fx.team_a_score)
      if (typeof fx.team_b_score === 'number') setLocalTeamBScore(fx.team_b_score)
      
      // Sync cricket data from server response to avoid stale state
      if (fx.extra?.cricket) {
        if (fx.extra.cricket.team_a) {
          setTeamAData(fx.extra.cricket.team_a)
        }
        if (fx.extra.cricket.team_b) {
          setTeamBData(fx.extra.cricket.team_b)
        }
        // Sync match config from server if available
        if (fx.extra.cricket.config) {
          setMatchConfig(fx.extra.cricket.config)
        }
      }

      // Call the onUpdate callback if provided
      if (onUpdate) {
        try {
          await onUpdate({
            cricket: {
              team_a: fx.extra?.cricket?.team_a || teamAData,
              team_b: fx.extra?.cricket?.team_b || teamBData,
              config: fx.extra?.cricket?.config || matchConfig
            }
          })
        } catch (error) {
          console.error('Error in onUpdate callback:', error)
        }
      }

      // Show success feedback
      toast({
        title: "Score Updated!",
        description: "Cricket data saved successfully",
      })

    } catch (error) {
      console.error('Failed to save cricket data:', error)
      toast({
        title: "Update Failed",
        description: "Failed to save cricket data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const quickScoreUpdate = async (team: 'a' | 'b', runs: number) => {
    setIsUpdating(true)
    try {
      const currentData = team === 'a' ? teamAData : teamBData

      // Calculate new values BEFORE updating state
      let newData = {
        ...currentData,
        runs: currentData.runs + runs,
        balls_faced: currentData.balls_faced + 1,
        fours: runs === 4 ? currentData.fours + 1 : currentData.fours,
        sixes: runs === 6 ? currentData.sixes + 1 : currentData.sixes
      }

      // Auto-increment overs after ball is bowled (normal delivery, not extra)
      newData = incrementBall(newData, false)

      // Calculate run rate with the updated data to ensure consistency
      newData.run_rate = calculateRunRate(newData)

      // Prepare update data
      const updateA = team === 'a' ? newData : teamAData
      const updateB = team === 'b' ? newData : teamBData

      // Save immediately before updating local state to prevent race conditions
      const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: updateA.runs,
          team_b_score: updateB.runs,
          status: status,
          extra: {
            cricket: {
              team_a: updateA,
              team_b: updateB,
              config: matchConfig
            }
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update cricket data')
      }

      // Update local state AFTER successful server update
      if (team === 'a') {
        setTeamAData(newData)
      } else {
        setTeamBData(newData)
      }

      // Show success feedback
      toast({
        title: "Score Updated!",
        description: "Cricket data saved successfully",
      })

    } catch (error) {
      console.error('Failed to update cricket score:', error)
      toast({
        title: "Update Failed",
        description: "Failed to save cricket data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const quickWicketUpdate = async (team: 'a' | 'b') => {
    setIsUpdating(true)
    try {
      const currentData = team === 'a' ? teamAData : teamBData

      // Calculate new values
      let newData = {
        ...currentData,
        wickets: Math.min(10, currentData.wickets + 1),
        balls_faced: currentData.balls_faced + 1
      }

      // Auto-increment overs (wicket counts as a legal ball)
      newData = incrementBall(newData, false)

      // Calculate run rate with the updated data to ensure consistency
      newData.run_rate = calculateRunRate(newData)

      // Prepare update data
      const updateA = team === 'a' ? newData : teamAData
      const updateB = team === 'b' ? newData : teamBData

      // Save immediately before updating local state
      const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: updateA.runs,
          team_b_score: updateB.runs,
          status: status,
          extra: {
            cricket: {
              team_a: updateA,
              team_b: updateB,
              config: matchConfig
            }
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update cricket data')
      }

      // Update local state AFTER successful server update
      if (team === 'a') {
        setTeamAData(newData)
      } else {
        setTeamBData(newData)
      }

      // Show success feedback
      toast({
        title: "Wicket Updated!",
        description: "Cricket data saved successfully",
      })

    } catch (error) {
      console.error('Failed to update wicket:', error)
      toast({
        title: "Update Failed",
        description: "Failed to save cricket data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const quickExtraUpdate = async (team: 'a' | 'b', extraType: 'wides' | 'no_balls' | 'byes' | 'leg_byes', runs: number = 1) => {
    setIsUpdating(true)
    try {
      const currentData = team === 'a' ? teamAData : teamBData

      // Calculate new values
      let newData = {
        ...currentData,
        extras: currentData.extras + runs,
        [extraType]: (currentData[extraType] || 0) + runs,
        runs: currentData.runs + runs // Extras also add to total runs
      }

      // Auto-increment overs based on extra type
      // Wides and no-balls don't count as legal deliveries
      // Byes and leg-byes count as legal deliveries
      const isIllegalDelivery = extraType === 'wides' || extraType === 'no_balls'
      newData = incrementBall(newData, isIllegalDelivery)

      // Calculate run rate with the updated data to ensure consistency
      newData.run_rate = calculateRunRate(newData)

      // Prepare update data
      const updateA = team === 'a' ? newData : teamAData
      const updateB = team === 'b' ? newData : teamBData

      // Save immediately before updating local state
      const response = await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_a_score: updateA.runs,
          team_b_score: updateB.runs,
          status: status,
          extra: {
            cricket: {
              team_a: updateA,
              team_b: updateB,
              config: matchConfig
            }
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update cricket data')
      }

      // Update local state AFTER successful server update
      if (team === 'a') {
        setTeamAData(newData)
      } else {
        setTeamBData(newData)
      }

      // Show success feedback
      toast({
        title: "Extra Updated!",
        description: "Cricket data saved successfully",
      })

    } catch (error) {
      console.error('Failed to update extras:', error)
      toast({
        title: "Update Failed",
        description: "Failed to save cricket data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Match Configuration */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Match Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Match Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Match Type
              </label>
              <select
                value={matchConfig.match_type}
                onChange={(e) => setMatchConfig({
                  ...matchConfig,
                  match_type: e.target.value as CricketMatchConfig['match_type']
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="T20">T20</option>
                <option value="ODI">ODI</option>
                <option value="T10">T10</option>
                <option value="Test">Test</option>
              </select>
            </div>

            {/* Total Overs */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Overs
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={matchConfig.total_overs}
                onChange={(e) => setMatchConfig({
                  ...matchConfig,
                  total_overs: parseInt(e.target.value) || 20
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Current Innings */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Innings
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={matchConfig.current_innings === 1 ? "default" : "outline"}
                  onClick={() => setMatchConfig({ ...matchConfig, current_innings: 1 })}
                  className="flex-1"
                >
                  1st Innings
                </Button>
                <Button
                  size="sm"
                  variant={matchConfig.current_innings === 2 ? "default" : "outline"}
                  onClick={() => setMatchConfig({ ...matchConfig, current_innings: 2 })}
                  className="flex-1"
                >
                  2nd Innings
                </Button>
              </div>
            </div>
          </div>

          {/* Batting Team Indicator */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Currently Batting
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={matchConfig.batting_first === 'team_a' ? "default" : "outline"}
                onClick={() => setMatchConfig({ ...matchConfig, batting_first: 'team_a' })}
                className="flex-1"
              >
                {teamAName}
              </Button>
              <Button
                size="sm"
                variant={matchConfig.batting_first === 'team_b' ? "default" : "outline"}
                onClick={() => setMatchConfig({ ...matchConfig, batting_first: 'team_b' })}
                className="flex-1"
              >
                {teamBName}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Score Display */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Cricket Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">{teamAName}</h3>
                  {matchConfig.batting_first === 'team_a' && matchConfig.current_innings === 1 && (
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      Batting (1st)
                    </Badge>
                  )}
                  {matchConfig.batting_first === 'team_a' && matchConfig.current_innings === 2 && (
                    <Badge variant="outline" className="text-slate-600 text-xs">
                      Batted (1st)
                    </Badge>
                  )}
                  {matchConfig.batting_first === 'team_b' && matchConfig.current_innings === 2 && (
                    <Badge variant="default" className="bg-blue-600 text-white text-xs">
                      Batting (2nd)
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300 text-base font-bold">
                  {teamAData.runs}/{teamAData.wickets}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{teamAData.runs}</div>
                  <div className="text-xs text-slate-600">Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {formatOvers(teamAData.overs, teamAData.balls_in_current_over || 0)}/{matchConfig.total_overs || 20}
                  </div>
                  <div className="text-xs text-slate-600">Overs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{teamAData.wickets}</div>
                  <div className="text-xs text-slate-600">Wickets</div>
                </div>
              </div>

              {/* Overs Remaining */}
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-blue-600">
                  {getOversRemaining(teamAData.overs, teamAData.balls_in_current_over || 0, matchConfig.total_overs || 20)} overs remaining
                </div>
              </div>

              {/* Run Rate and Required Run Rate */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center bg-green-50 rounded p-2">
                  <div className="text-lg font-semibold text-green-600">
                    {getTeamARunRate()}
                  </div>
                  <div className="text-xs text-slate-600">Run Rate</div>
                </div>
                {matchConfig.current_innings === 2 && matchConfig.batting_first === 'team_b' && (
                  <div className="text-center bg-orange-50 rounded p-2">
                    <div className="text-lg font-semibold text-orange-600">
                      {getRequiredRunRate(teamBData.runs + 1, teamAData.runs, getOversRemaining(teamAData.overs, teamAData.balls_in_current_over || 0, matchConfig.total_overs || 20))}
                    </div>
                    <div className="text-xs text-slate-600">Required RR</div>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('a', 1)}
                  disabled={isUpdating}
                  className="text-xs hover:bg-slate-100 transition-all active:scale-95"
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('a', 4)}
                  disabled={isUpdating}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-all active:scale-95"
                >
                  4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('a', 6)}
                  disabled={isUpdating}
                  className="text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all active:scale-95"
                >
                  6
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => quickWicketUpdate('a')}
                  disabled={isUpdating}
                  className="text-xs transition-all active:scale-95"
                >
                  Wicket
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => quickExtraUpdate('a', 'wides')}
                  disabled={isUpdating}
                  className="text-xs transition-all active:scale-95"
                >
                  Wide
                </Button>
              </div>
            </div>

            {/* Team B */}
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">{teamBName}</h3>
                  {matchConfig.batting_first === 'team_b' && matchConfig.current_innings === 1 && (
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      Batting (1st)
                    </Badge>
                  )}
                  {matchConfig.batting_first === 'team_b' && matchConfig.current_innings === 2 && (
                    <Badge variant="outline" className="text-slate-600 text-xs">
                      Batted (1st)
                    </Badge>
                  )}
                  {matchConfig.batting_first === 'team_a' && matchConfig.current_innings === 2 && (
                    <Badge variant="default" className="bg-blue-600 text-white text-xs">
                      Batting (2nd)
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300 text-base font-bold">
                  {teamBData.runs}/{teamBData.wickets}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{teamBData.runs}</div>
                  <div className="text-xs text-slate-600">Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {formatOvers(teamBData.overs, teamBData.balls_in_current_over || 0)}/{matchConfig.total_overs || 20}
                  </div>
                  <div className="text-xs text-slate-600">Overs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{teamBData.wickets}</div>
                  <div className="text-xs text-slate-600">Wickets</div>
                </div>
              </div>

              {/* Overs Remaining */}
              <div className="text-center mb-2">
                <div className="text-sm font-medium text-blue-600">
                  {getOversRemaining(teamBData.overs, teamBData.balls_in_current_over || 0, matchConfig.total_overs || 20)} overs remaining
                </div>
              </div>

              {/* Run Rate and Required Run Rate */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center bg-green-50 rounded p-2">
                  <div className="text-lg font-semibold text-green-600">
                    {getTeamBRunRate()}
                  </div>
                  <div className="text-xs text-slate-600">Run Rate</div>
                </div>
                {matchConfig.current_innings === 2 && matchConfig.batting_first === 'team_a' && (
                  <div className="text-center bg-orange-50 rounded p-2">
                    <div className="text-lg font-semibold text-orange-600">
                      {getRequiredRunRate(teamAData.runs + 1, teamBData.runs, getOversRemaining(teamBData.overs, teamBData.balls_in_current_over || 0, matchConfig.total_overs || 20))}
                    </div>
                    <div className="text-xs text-slate-600">Required RR</div>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('b', 1)}
                  disabled={isUpdating}
                  className="text-xs hover:bg-slate-100 transition-all active:scale-95"
                >
                  +1
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('b', 4)}
                  disabled={isUpdating}
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-all active:scale-95"
                >
                  4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickScoreUpdate('b', 6)}
                  disabled={isUpdating}
                  className="text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all active:scale-95"
                >
                  6
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => quickWicketUpdate('b')}
                  disabled={isUpdating}
                  className="text-xs transition-all active:scale-95"
                >
                  Wicket
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => quickExtraUpdate('b', 'wides')}
                  disabled={isUpdating}
                  className="text-xs transition-all active:scale-95"
                >
                  Wide
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <Tabs defaultValue="team-a" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team-a">{teamAName}</TabsTrigger>
          <TabsTrigger value="team-b">{teamBName}</TabsTrigger>
        </TabsList>

        <TabsContent value="team-a" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                {teamAName} Detailed Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Runs</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.runs}
                    onChange={(e) => handleTeamUpdate('a', 'runs', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Wickets</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={teamAData.wickets}
                    onChange={(e) => handleTeamUpdate('a', 'wickets', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Overs</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    value={teamAData.overs}
                    onChange={(e) => handleTeamUpdate('a', 'overs', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Balls Faced</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.balls_faced}
                    onChange={(e) => handleTeamUpdate('a', 'balls_faced', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">4s</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.fours}
                    onChange={(e) => handleTeamUpdate('a', 'fours', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">6s</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.sixes}
                    onChange={(e) => handleTeamUpdate('a', 'sixes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Wides</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.wides}
                    onChange={(e) => handleTeamUpdate('a', 'wides', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">No Balls</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.no_balls}
                    onChange={(e) => handleTeamUpdate('a', 'no_balls', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Byes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.byes}
                    onChange={(e) => handleTeamUpdate('a', 'byes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Leg Byes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamAData.leg_byes}
                    onChange={(e) => handleTeamUpdate('a', 'leg_byes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-b" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                {teamBName} Detailed Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Runs</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.runs}
                    onChange={(e) => handleTeamUpdate('b', 'runs', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Wickets</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={teamBData.wickets}
                    onChange={(e) => handleTeamUpdate('b', 'wickets', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Overs</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    value={teamBData.overs}
                    onChange={(e) => handleTeamUpdate('b', 'overs', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Balls Faced</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.balls_faced}
                    onChange={(e) => handleTeamUpdate('b', 'balls_faced', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">4s</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.fours}
                    onChange={(e) => handleTeamUpdate('b', 'fours', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">6s</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.sixes}
                    onChange={(e) => handleTeamUpdate('b', 'sixes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Wides</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.wides}
                    onChange={(e) => handleTeamUpdate('b', 'wides', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">No Balls</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.no_balls}
                    onChange={(e) => handleTeamUpdate('b', 'no_balls', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Byes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.byes}
                    onChange={(e) => handleTeamUpdate('b', 'byes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Leg Byes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={teamBData.leg_byes}
                    onChange={(e) => handleTeamUpdate('b', 'leg_byes', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-600" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {teamAData.fours + teamBData.fours}
              </div>
              <div className="text-sm text-slate-600">Total 4s</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {teamAData.sixes + teamBData.sixes}
              </div>
              <div className="text-sm text-slate-600">Total 6s</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {teamAData.wickets + teamBData.wickets}
              </div>
              <div className="text-sm text-slate-600">Total Wickets</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isUpdating && (
        <div className="text-center text-sm text-slate-600 py-2 flex items-center justify-center gap-2 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="h-4 w-4 animate-spin" />
          <span className="font-medium">Saving cricket data...</span>
        </div>
      )}
    </div>
  )
}
