import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Clock, CheckCircle } from "lucide-react"
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
}

interface TournamentBracketProps {
  tournament: Tournament
  className?: string
}

function MatchCard({ match, roundNumber }: { match: Match; roundNumber: number }) {
  const getTeamInitial = (team?: Team) => team?.name?.charAt(0) || "?"
  
  const getMatchStatus = () => {
    if (match.status === 'live') {
      return <Badge variant="destructive" className="animate-pulse text-xs">LIVE</Badge>
    }
    if (match.status === 'completed') {
      return <CheckCircle className="h-3 w-3 text-green-500" />
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
    <Card className={`w-48 transition-all hover:shadow-md ${
      match.status === 'live' ? 'border-red-500 border-2' : ''
    } ${match.status === 'completed' ? 'bg-slate-50' : ''}`}>
      <CardContent className="p-3">
        {/* Match Status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Match {match.bracket_position}</span>
          {getMatchStatus()}
        </div>

        {/* Team A */}
        <div className={`flex items-center justify-between mb-2 p-2 rounded ${
          winner?.id === match.team_a?.id ? 'bg-green-100 border border-green-300' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: match.team_a?.color || "#6b7280" }}
            >
              {getTeamInitial(match.team_a)}
            </div>
            <span className="font-medium text-sm truncate">
              {match.team_a?.name || "TBD"}
            </span>
          </div>
          {(match.status === 'live' || match.status === 'completed') && match.team_a_score !== undefined && (
            <span className="font-bold text-lg ml-2">{match.team_a_score}</span>
          )}
        </div>

        {/* VS or Score Divider */}
        <div className="text-center text-xs text-slate-400 mb-2">VS</div>

        {/* Team B */}
        <div className={`flex items-center justify-between p-2 rounded ${
          winner?.id === match.team_b?.id ? 'bg-green-100 border border-green-300' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: match.team_b?.color || "#6b7280" }}
            >
              {getTeamInitial(match.team_b)}
            </div>
            <span className="font-medium text-sm truncate">
              {match.team_b?.name || "TBD"}
            </span>
          </div>
          {(match.status === 'live' || match.status === 'completed') && match.team_b_score !== undefined && (
            <span className="font-bold text-lg ml-2">{match.team_b_score}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RoundColumn({ round, className }: { round: Round; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Round Header */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-slate-900">{round.round_name}</h3>
        <Badge variant={round.status === 'completed' ? 'default' : round.status === 'active' ? 'secondary' : 'outline'}>
          {round.status}
        </Badge>
      </div>

      {/* Round Matches */}
      <div className="flex flex-col gap-6">
        {round.matches.map((match) => (
          <MatchCard key={match.id} match={match} roundNumber={round.round_number} />
        ))}
      </div>
    </div>
  )
}

export function TournamentBracket({ tournament, className = "" }: TournamentBracketProps) {
  const sortedRounds = tournament.rounds.sort((a, b) => a.round_number - b.round_number)
  
  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Tournament Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              {tournament.name}
            </h2>
            {tournament.description && (
              <p className="text-slate-600 mt-1">{tournament.description}</p>
            )}
          </div>
          <Badge 
            variant={
              tournament.status === 'completed' ? 'default' : 
              tournament.status === 'active' ? 'secondary' : 
              'outline'
            }
            className="text-sm"
          >
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Tournament Bracket */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {sortedRounds.map((round, index) => (
              <React.Fragment key={round.id}>
                <RoundColumn round={round} />
                {/* Connection Lines (visual indicator) */}
                {index < sortedRounds.length - 1 && (
                  <div className="flex items-center justify-center w-8">
                    <div className="h-px bg-slate-300 w-full"></div>
                    <div className="absolute w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Winner */}
      {tournament.status === 'completed' && tournament.winner_id && (
        <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-slate-900">Tournament Champion!</h3>
            {/* Winner details would be loaded separately */}
          </div>
        </div>
      )}
    </div>
  )
}