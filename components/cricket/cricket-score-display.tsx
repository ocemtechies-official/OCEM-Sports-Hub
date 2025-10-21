"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  TrendingUp, 
  Zap, 
  Trophy, 
  Clock,
  Info
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
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

interface CricketScoreDisplayProps {
  fixture: any
  teamAData?: CricketTeamData
  teamBData?: CricketTeamData
  isLive?: boolean
}

export function CricketScoreDisplay({ 
  fixture, 
  teamAData, 
  teamBData, 
  isLive = false 
}: CricketScoreDisplayProps) {
  const supabase = getSupabaseBrowserClient()
  const teamAName = fixture.team_a?.name || 'Team A'
  const teamBName = fixture.team_b?.name || 'Team B'
  
  // State for real-time updates
  const [liveTeamAData, setLiveTeamAData] = useState(teamAData)
  const [liveTeamBData, setLiveTeamBData] = useState(teamBData)
  const [matchConfig, setMatchConfig] = useState<CricketMatchConfig>(
    fixture.extra?.cricket?.config || {
      total_overs: 20,
      current_innings: 1,
      match_type: 'T20',
      batting_first: 'team_a'
    }
  )
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Default data if not provided
  const defaultTeamData: CricketTeamData = {
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
    run_rate: 0
  }

  const teamA = liveTeamAData || defaultTeamData
  const teamB = liveTeamBData || defaultTeamData

  // Helper functions for overs display
  const formatOvers = (overs: number, balls: number = 0): string => {
    return `${overs}.${balls}`
  }

  const getOversRemaining = (currentOvers: number, currentBalls: number, totalOvers: number): string => {
    const totalBallsBowled = (currentOvers * 6) + currentBalls
    const totalBallsInInnings = totalOvers * 6
    const ballsRemaining = totalBallsInInnings - totalBallsBowled
    
    if (ballsRemaining <= 0) return '0.0'
    
    const oversRem = Math.floor(ballsRemaining / 6)
    const ballsRem = ballsRemaining % 6
    return formatOvers(oversRem, ballsRem)
  }

  // Calculate run rate in real-time
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

  const getRequiredRunRate = (target: number, currentRuns: number, oversRemaining: string): number => {
    const [overs, balls] = oversRemaining.split('.').map(Number)
    const totalBalls = (overs * 6) + (balls || 0)
    
    if (totalBalls === 0) return 0
    
    const runsNeeded = target - currentRuns
    const totalOvers = totalBalls / 6
    const rrr = runsNeeded / totalOvers
    
    return Math.max(0, parseFloat(rrr.toFixed(2)))
  }

  // Always calculate run rate from current data rather than using stored value
  const getTeamARunRate = (): number => {
    return calculateRunRate(teamA);
  }

  const getTeamBRunRate = (): number => {
    return calculateRunRate(teamB);
  }

  // Real-time subscription for live matches
  useEffect(() => {
    if (!isLive) return

    // Initial fetch
    const fetchLatestData = async () => {
      try {
        const { data: fixtureData } = await supabase
          .from('fixtures')
          .select('extra')
          .eq('id', fixture.id)
          .single()

        if (fixtureData?.extra?.cricket) {
          setLiveTeamAData(fixtureData.extra.cricket.team_a)
          setLiveTeamBData(fixtureData.extra.cricket.team_b)
          if (fixtureData.extra.cricket.config) {
            setMatchConfig(fixtureData.extra.cricket.config)
          }
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error('Error fetching cricket data:', error)
      }
    }

    // Subscribe to changes
    const subscription = supabase
      .channel('fixture-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${fixture.id}`
        },
        (payload: { new: { extra?: { cricket?: { team_a: CricketTeamData; team_b: CricketTeamData; config?: CricketMatchConfig } } } }) => {
          if (payload.new?.extra?.cricket) {
            setLiveTeamAData(payload.new.extra.cricket.team_a)
            setLiveTeamBData(payload.new.extra.cricket.team_b)
            if (payload.new.extra.cricket.config) {
              setMatchConfig(payload.new.extra.cricket.config)
            }
            setLastUpdate(new Date())
          }
        }
      )
      .subscribe()

    // Fetch immediately on mount
    fetchLatestData()

    return () => {
      subscription.unsubscribe()
    }
  }, [isLive, fixture.id, supabase])

  // Update when props change
  useEffect(() => {
    if (teamAData) setLiveTeamAData(teamAData)
    if (teamBData) setLiveTeamBData(teamBData)
  }, [teamAData, teamBData])

  // Check if cricket data is missing
  const isCricketDataMissing = !teamAData || !teamBData

  const initializeCricketData = async () => {
    try {
      const response = await fetch('/api/cricket/initialize-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureId: fixture.id
        }),
      })

      if (response.ok) {
        // Reload the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to initialize cricket data')
      }
    } catch (error) {
      console.error('Error initializing cricket data:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Zap className="h-4 w-4" />
      case 'completed':
        return <Trophy className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Calculate match status details
  const getMatchStatusDetails = () => {
    if (fixture.status !== 'completed') return null
    
    let winningTeam, losingTeam, margin
    if (teamA.runs > teamB.runs) {
      winningTeam = teamAName
      losingTeam = teamBName
      margin = teamA.runs - teamB.runs
    } else if (teamB.runs > teamA.runs) {
      winningTeam = teamBName
      losingTeam = teamAName
      margin = teamB.runs - teamA.runs
    }
    
    return { winningTeam, losingTeam, margin }
  }

  return (
    <div className="space-y-6">
      {/* Match Status Banner (for completed matches) */}
      {fixture.status === 'completed' && (
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative p-6 text-center space-y-2">
            <Trophy className="h-8 w-8 text-amber-300 mx-auto mb-2" />
            <h3 className="text-xl font-bold">Match Completed</h3>
            {getMatchStatusDetails()?.winningTeam && (
              <p className="text-2xl font-extrabold">{getMatchStatusDetails()?.winningTeam} won by {getMatchStatusDetails()?.margin} runs</p>
            )}
            {!getMatchStatusDetails()?.winningTeam && (
              <p className="text-2xl font-extrabold">Match Drawn</p>
            )}
          </div>
        </div>
      )}

      {/* Match Configuration Banner */}
      {matchConfig && (
        <Card className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-purple-200">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-200">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {matchConfig.match_type || 'T20'} Match
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-200">
                  <Target className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {matchConfig.total_overs || 20} Overs
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {matchConfig.current_innings === 1 ? '1st' : '2nd'} Innings
                  </span>
                </div>
              </div>
              {isLive && (
                <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full border border-red-200">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">LIVE</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Score Display */}
      <Card className={isLive ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200 ring-2 ring-green-500 ring-opacity-50" : "bg-gradient-to-r from-green-50 to-blue-50 border-green-200"}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Cricket Scorecard
            </CardTitle>
            <div className="flex items-center gap-2">
              {isCricketDataMissing && (
                <button
                  onClick={initializeCricketData}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full text-sm font-semibold hover:bg-yellow-200 transition-colors"
                >
                  Initialize Data
                </button>
              )}
              <Badge className={"px-3 py-1 rounded-full text-sm font-semibold border " + getStatusColor(fixture.status)}>
                {getStatusIcon(fixture.status)}
                <span className="ml-2 capitalize">{fixture.status}</span>
              </Badge>
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <Clock className="h-3 w-3" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-slate-900">{teamAName}</h3>
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
                <Badge variant="outline" className="text-green-600 border-green-300 text-lg px-3 py-1 font-bold">
                  {teamA.runs}/{teamA.wickets}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{teamA.runs}</div>
                  <div className="text-sm text-slate-600">Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {formatOvers(teamA.overs, teamA.balls_in_current_over || 0)}/{matchConfig.total_overs || 20}
                  </div>
                  <div className="text-sm text-slate-600">Overs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{teamA.wickets}</div>
                  <div className="text-sm text-slate-600">Wickets</div>
                </div>
              </div>

              {/* Overs Remaining */}
              <div className="text-center mb-3 bg-blue-50 rounded-lg py-2">
                <div className="text-sm font-medium text-blue-700">
                  {getOversRemaining(teamA.overs, teamA.balls_in_current_over || 0, matchConfig.total_overs || 20)} overs remaining
                </div>
              </div>

              {/* Run Rates */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{getTeamARunRate()}</div>
                  <div className="text-xs text-slate-600">Run Rate</div>
                </div>
                {matchConfig.current_innings === 2 && matchConfig.batting_first === 'team_b' && (
                  <div className="text-center bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">
                      {getRequiredRunRate(teamB.runs + 1, teamA.runs, getOversRemaining(teamA.overs, teamA.balls_in_current_over || 0, matchConfig.total_overs || 20))}
                    </div>
                    <div className="text-xs text-slate-600">Required RR</div>
                  </div>
                )}
              </div>

              {/* Detailed Stats */}
              <div className="border-t border-slate-200 pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">4s:</span>
                    <span className="font-semibold text-blue-700">{teamA.fours}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">6s:</span>
                    <span className="font-semibold text-purple-700">{teamA.sixes}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Wides:</span>
                    <span className="font-semibold text-orange-700">{teamA.wides}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">No Balls:</span>
                    <span className="font-semibold text-red-700">{teamA.no_balls}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Byes:</span>
                    <span className="font-semibold text-teal-700">{teamA.byes}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Leg Byes:</span>
                    <span className="font-semibold text-indigo-700">{teamA.leg_byes}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team B */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-slate-900">{teamBName}</h3>
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
                <Badge variant="outline" className="text-green-600 border-green-300 text-lg px-3 py-1 font-bold">
                  {teamB.runs}/{teamB.wickets}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{teamB.runs}</div>
                  <div className="text-sm text-slate-600">Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {formatOvers(teamB.overs, teamB.balls_in_current_over || 0)}/{matchConfig.total_overs || 20}
                  </div>
                  <div className="text-sm text-slate-600">Overs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{teamB.wickets}</div>
                  <div className="text-sm text-slate-600">Wickets</div>
                </div>
              </div>

              {/* Overs Remaining */}
              <div className="text-center mb-3 bg-blue-50 rounded-lg py-2">
                <div className="text-sm font-medium text-blue-700">
                  {getOversRemaining(teamB.overs, teamB.balls_in_current_over || 0, matchConfig.total_overs || 20)} overs remaining
                </div>
              </div>

              {/* Run Rates */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{getTeamBRunRate()}</div>
                  <div className="text-xs text-slate-600">Run Rate</div>
                </div>
                {matchConfig.current_innings === 2 && matchConfig.batting_first === 'team_a' && (
                  <div className="text-center bg-orange-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">
                      {getRequiredRunRate(teamA.runs + 1, teamB.runs, getOversRemaining(teamB.overs, teamB.balls_in_current_over || 0, matchConfig.total_overs || 20))}
                    </div>
                    <div className="text-xs text-slate-600">Required RR</div>
                  </div>
                )}
              </div>

              {/* Detailed Stats */}
              <div className="border-t border-slate-200 pt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">4s:</span>
                    <span className="font-semibold text-blue-700">{teamB.fours}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">6s:</span>
                    <span className="font-semibold text-purple-700">{teamB.sixes}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Wides:</span>
                    <span className="font-semibold text-orange-700">{teamB.wides}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">No Balls:</span>
                    <span className="font-semibold text-red-700">{teamB.no_balls}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Byes:</span>
                    <span className="font-semibold text-teal-700">{teamB.byes}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                    <span className="text-slate-600">Leg Byes:</span>
                    <span className="font-semibold text-indigo-700">{teamB.leg_byes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Result Banner (for completed matches) */}
      {fixture.status === 'completed' && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-green-200">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-bold text-green-800">Match Result</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {teamA.runs > teamB.runs ? (
                  <span>{teamAName} won by {teamA.runs - teamB.runs} runs</span>
                ) : teamB.runs > teamA.runs ? (
                  <span>{teamBName} won by {teamB.runs - teamA.runs} runs</span>
                ) : (
                  <span>Match Drawn</span>
                )}
              </div>
              {matchConfig.current_innings === 2 && (
                <div className="text-base text-slate-600">
                  {matchConfig.batting_first === 'team_a' ? (
                    <span>
                      {teamAName} scored {teamA.runs}/{teamA.wickets} in {formatOvers(teamA.overs, teamA.balls_in_current_over || 0)} overs, followed by {teamBName} scoring {teamB.runs}/{teamB.wickets} in {formatOvers(teamB.overs, teamB.balls_in_current_over || 0)} overs
                    </span>
                  ) : (
                    <span>
                      {teamBName} scored {teamB.runs}/{teamB.wickets} in {formatOvers(teamB.overs, teamB.balls_in_current_over || 0)} overs, followed by {teamAName} scoring {teamA.runs}/{teamA.wickets} in {formatOvers(teamA.overs, teamA.balls_in_current_over || 0)} overs
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Summary */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-600" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Key Match Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {teamA.fours + teamB.fours}
                </div>
                <div className="text-sm text-slate-600">Total 4s</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {teamA.sixes + teamB.sixes}
                </div>
                <div className="text-sm text-slate-600">Total 6s</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {teamA.wickets + teamB.wickets}
                </div>
                <div className="text-sm text-slate-600">Total Wickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {teamA.extras + teamB.extras}
                </div>
                <div className="text-sm text-slate-600">Total Extras</div>
              </div>
            </div>

            {/* Innings Summary */}
            {matchConfig.current_innings === 2 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Innings Progression</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Innings */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600">1st Innings</span>
                      <Badge variant="outline" className="text-blue-600">
                        {matchConfig.batting_first === 'team_a' ? teamAName : teamBName}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {matchConfig.batting_first === 'team_a' ? (
                        <span>{teamA.runs}/{teamA.wickets} ({formatOvers(teamA.overs, teamA.balls_in_current_over || 0)})</span>
                      ) : (
                        <span>{teamB.runs}/{teamB.wickets} ({formatOvers(teamB.overs, teamB.balls_in_current_over || 0)})</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Run Rate: {matchConfig.batting_first === 'team_a' ? getTeamARunRate() : getTeamBRunRate()}
                    </div>
                  </div>

                  {/* Second Innings */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600">2nd Innings</span>
                      <Badge variant="outline" className="text-green-600">
                        {matchConfig.batting_first === 'team_a' ? teamBName : teamAName}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {matchConfig.batting_first === 'team_a' ? (
                        <span>{teamB.runs}/{teamB.wickets} ({formatOvers(teamB.overs, teamB.balls_in_current_over || 0)})</span>
                      ) : (
                        <span>{teamA.runs}/{teamA.wickets} ({formatOvers(teamA.overs, teamA.balls_in_current_over || 0)})</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Run Rate: {matchConfig.batting_first === 'team_a' ? getTeamBRunRate() : getTeamARunRate()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Indicator */}
      {isLive && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full border border-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">LIVE</span>
          </div>
        </div>
      )}
    </div>
  )
}
