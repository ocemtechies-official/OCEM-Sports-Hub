import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, CheckCircle, Zap, Target, Award, Users } from "lucide-react"
import { format } from "date-fns"

interface Team {
  id: string
  name: string
  logo_url?: string
  color?: string
}

interface Match {
  id: string
  team_a?: Team
  team_b?: Team
  team_a_score?: number
  team_b_score?: number
  status: 'scheduled' | 'live' | 'completed'
  scheduled_at?: string
  winner_id?: string
  bracket_position: number
}

interface Round {
  id: string
  round_number: number
  round_name: string
  matches: Match[]
  status: 'pending' | 'active' | 'completed'
}

interface Tournament {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  tournament_type: string
  rounds: Round[]
  winner_id?: string
  teams?: Team[]
}

interface TournamentBracketProps {
  tournament: Tournament
  className?: string
}

function MatchCard({ match, roundNumber, isPlaceholder = false }: { match: Match; roundNumber: number; isPlaceholder?: boolean }) {
  const getTeamInitial = (team?: Team) => team?.name?.charAt(0) || "?"
  
  const getMatchStatus = () => {
    if (isPlaceholder) {
      return <Badge variant="outline" className="text-xs">TBD</Badge>
    }
    
    if (match.status === 'live') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse text-xs font-semibold">LIVE</Badge>
    }
    if (match.status === 'completed') {
      return <div className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> <span className="text-xs font-medium">Done</span></div>
    }
    if (match.scheduled_at) {
      return (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock className="h-3 w-3" />
          {format(new Date(match.scheduled_at), 'MMM dd, HH:mm')}
        </div>
      )
    }
    return <Badge variant="outline" className="text-xs">TBD</Badge>
  }

  const getWinner = () => {
    if (match.winner_id) {
      return match.winner_id === match.team_a?.id ? match.team_a : match.team_b
    }
    return null
  }

  const winner = getWinner()

  return (
    <Card className={`w-56 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      isPlaceholder 
        ? 'border-dashed border-2 border-slate-300 bg-slate-50' 
        : match.status === 'live' 
          ? 'border-red-500 border-2 shadow-red-100' 
          : match.status === 'completed' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
            : 'bg-white'
    }`}>
      <CardContent className="p-4">
        {/* Match Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaceholder ? 'bg-slate-400' : 'bg-blue-500'}`}></div>
            <span className="text-xs font-medium text-slate-600">Match {match.bracket_position}</span>
          </div>
          {getMatchStatus()}
        </div>

        {/* Team A */}
        <div className={`flex items-center justify-between mb-3 p-3 rounded-xl transition-all duration-300 ${
          isPlaceholder
            ? 'bg-slate-100 border border-slate-200'
            : winner?.id === match.team_a?.id 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-md' 
              : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-purple-50'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                isPlaceholder ? 'bg-slate-400' : ''
              }`}
              style={{ backgroundColor: isPlaceholder ? '#9ca3af' : (match.team_a?.color || "#6b7280") }}
            >
              {isPlaceholder ? '?' : getTeamInitial(match.team_a)}
            </div>
            <span className={`font-semibold text-sm truncate ${isPlaceholder ? 'text-slate-500' : ''}`}>
              {isPlaceholder ? 'TBD' : (match.team_a?.name || "TBD")}
            </span>
          </div>
          {!isPlaceholder && (match.status === 'live' || match.status === 'completed') && match.team_a_score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{match.team_a_score}</span>
              {winner?.id === match.team_a?.id && <Award className="h-4 w-4 text-green-600" />}
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <div className="px-3 py-1 bg-slate-100 rounded-full">
            <span className="text-xs font-semibold text-slate-600">VS</span>
          </div>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Team B */}
        <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
          isPlaceholder
            ? 'bg-slate-100 border border-slate-200'
            : winner?.id === match.team_b?.id 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 shadow-md' 
              : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-blue-50 hover:to-purple-50'
        }`}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                isPlaceholder ? 'bg-slate-400' : ''
              }`}
              style={{ backgroundColor: isPlaceholder ? '#9ca3af' : (match.team_b?.color || "#6b7280") }}
            >
              {isPlaceholder ? '?' : getTeamInitial(match.team_b)}
            </div>
            <span className={`font-semibold text-sm truncate ${isPlaceholder ? 'text-slate-500' : ''}`}>
              {isPlaceholder ? 'TBD' : (match.team_b?.name || "TBD")}
            </span>
          </div>
          {!isPlaceholder && (match.status === 'live' || match.status === 'completed') && match.team_b_score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{match.team_b_score}</span>
              {winner?.id === match.team_b?.id && <Award className="h-4 w-4 text-green-600" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RoundColumn({ round, className }: { round: Round; className?: string }) {
  const getRoundStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoundStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-3 w-3" />
      case 'completed':
        return <CheckCircle className="h-3 w-3" />
      case 'pending':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Round Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200 mb-3">
          <Target className="h-4 w-4 text-blue-600" />
          <h3 className="font-bold text-lg text-slate-900">{round.round_name}</h3>
        </div>
        <Badge className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoundStatusColor(round.status)} flex items-center gap-1.5 mx-auto`}>
          {getRoundStatusIcon(round.status)}
          {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
        </Badge>
      </div>

      {/* Round Matches */}
      <div className="flex flex-col gap-6">
        {round.matches.map((match, index) => (
          <div key={match.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <MatchCard match={match} roundNumber={round.round_number} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to generate tournament bracket structure
function generateTournamentBracket(teams: Team[], tournamentType: string = 'single_elimination') {
  const numTeams = teams.length
  const rounds = []
  
  // Calculate number of rounds needed
  let numRounds = Math.ceil(Math.log2(numTeams))
  let currentTeams = numTeams
  
  // Generate rounds
  for (let roundNum = 1; roundNum <= numRounds; roundNum++) {
    const matchesPerRound = Math.ceil(currentTeams / 2)
    const matches = []
    
    for (let matchNum = 1; matchNum <= matchesPerRound; matchNum++) {
      matches.push({
        id: `round-${roundNum}-match-${matchNum}`,
        team_a: null,
        team_b: null,
        team_a_score: undefined,
        team_b_score: undefined,
        status: 'scheduled' as const,
        winner_id: undefined,
        bracket_position: matchNum
      })
    }
    
    rounds.push({
      id: `round-${roundNum}`,
      round_number: roundNum,
      round_name: getRoundName(roundNum, numRounds),
      matches,
      status: roundNum === 1 ? 'active' : 'pending' as const
    })
    
    currentTeams = matchesPerRound
  }
  
  return rounds
}

function getRoundName(roundNum: number, totalRounds: number) {
  if (roundNum === totalRounds) return 'Final'
  if (roundNum === totalRounds - 1) return 'Semi-finals'
  if (roundNum === totalRounds - 2) return 'Quarter-finals'
  return `Round ${roundNum}`
}

// Helper function to populate first round with actual teams
function populateFirstRound(teams: Team[], matches: Match[]) {
  const sortedTeams = teams.sort((a, b) => (a as any).seed - (b as any).seed) // Sort by seed if available
  
  return matches.map((match, index) => {
    const teamAIndex = index * 2
    const teamBIndex = teamAIndex + 1
    
    return {
      ...match,
      team_a: sortedTeams[teamAIndex] || null,
      team_b: sortedTeams[teamBIndex] || null,
    }
  })
}

export function TournamentBracket({ tournament, className = "" }: TournamentBracketProps) {
  // Generate complete bracket structure
  const teams = tournament.teams || []
  const generatedRounds = generateTournamentBracket(teams, tournament.tournament_type)
  
  // Merge with existing rounds data and populate first round with teams
  const mergedRounds = generatedRounds.map((generatedRound, roundIndex) => {
    const existingRound = tournament.rounds.find(r => r.round_number === generatedRound.round_number)
    
    if (existingRound) {
      return {
        ...generatedRound,
        ...existingRound,
        matches: existingRound.matches.length > 0 ? existingRound.matches : generatedRound.matches
      }
    }
    
    // For first round, populate with actual teams
    if (roundIndex === 0 && teams.length > 0) {
      return {
        ...generatedRound,
        matches: populateFirstRound(teams, generatedRound.matches)
      }
    }
    
    return generatedRound
  })
  
  return (
    <div className={`bg-white rounded-2xl border-0 shadow-lg overflow-hidden ${className}`}>
      {/* Tournament Bracket */}
      <div className="p-8">
        <div className="overflow-x-auto">
          <div className="flex gap-12 min-w-max">
            {mergedRounds.map((round, index) => (
              <React.Fragment key={round.id}>
                <RoundColumn round={round} />
                {/* Enhanced Connection Lines */}
                {index < mergedRounds.length - 1 && (
                  <div className="flex items-center justify-center w-12 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-px bg-gradient-to-r from-blue-300 to-purple-300 w-full"></div>
                    </div>
                    <div className="relative z-10 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Winner */}
      {tournament.status === 'completed' && tournament.winner_id && (
        <div className="p-8 border-t border-slate-100 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Tournament Champion!</h3>
            <p className="text-slate-600">Congratulations to the winner!</p>
          </div>
        </div>
      )}
    </div>
  )
}
