'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  name: string
  logo_url?: string
}

interface Match {
  id: string
  team_a?: Team
  team_b?: Team
  team_a_score: number
  team_b_score: number
  winner_id?: string
  status: 'scheduled' | 'live' | 'completed'
  bracket_position: number
}

interface Round {
  id: string
  round_number: number
  round_name: string
  total_matches: number
  completed_matches: number
  status: 'pending' | 'active' | 'completed'
  fixtures: Match[]
}

interface TournamentBracketProps {
  rounds: Round[]
  onUpdateWinner?: (matchId: string, winnerId: string) => Promise<void>
  isEditable?: boolean
}

export function TournamentBracket({ rounds, onUpdateWinner, isEditable = false }: TournamentBracketProps) {
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null)

  const handleWinnerUpdate = async (matchId: string, winnerId: string) => {
    if (!onUpdateWinner) return
    
    setUpdatingMatchId(matchId)
    try {
      await onUpdateWinner(matchId, winnerId)
    } finally {
      setUpdatingMatchId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-[800px] p-4">
        {rounds.sort((a, b) => a.round_number - b.round_number).map((round) => (
          <div key={round.id} className="flex-1">
            <div className="text-center mb-4">
              <h3 className="font-bold text-slate-900">{round.round_name}</h3>
              <p className="text-sm text-slate-600">
                {round.completed_matches} / {round.total_matches} completed
              </p>
            </div>
            
            <div className="space-y-4">
              {round.fixtures
                .sort((a, b) => a.bracket_position - b.bracket_position)
                .map((match) => (
                <div 
                  key={match.id} 
                  className={`bg-white rounded-lg border ${
                    match.status === 'live' ? 'border-red-300 shadow-red-100' :
                    match.status === 'completed' ? 'border-green-300 shadow-green-100' :
                    'border-slate-200'
                  } p-4 shadow-md transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex flex-col gap-2">
                    {/* Team A */}
                    <div 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all duration-200 ${
                        match.winner_id === match.team_a?.id ? 'bg-green-50 border border-green-200' :
                        isEditable && match.status !== 'completed' ? 'hover:bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (isEditable && match.status !== 'completed' && match.team_a) {
                          handleWinnerUpdate(match.id, match.team_a.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {match.team_a?.logo_url && (
                          <img 
                            src={match.team_a.logo_url} 
                            alt={match.team_a.name} 
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">
                          {match.team_a?.name || 'TBD'}
                        </span>
                      </div>
                      <span className="font-bold">{match.team_a_score || 0}</span>
                    </div>
                    
                    {/* Team B */}
                    <div 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all duration-200 ${
                        match.winner_id === match.team_b?.id ? 'bg-green-50 border border-green-200' :
                        isEditable && match.status !== 'completed' ? 'hover:bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (isEditable && match.status !== 'completed' && match.team_b) {
                          handleWinnerUpdate(match.id, match.team_b.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {match.team_b?.logo_url && (
                          <img 
                            src={match.team_b.logo_url} 
                            alt={match.team_b.name} 
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">
                          {match.team_b?.name || 'TBD'}
                        </span>
                      </div>
                      <span className="font-bold">{match.team_b_score || 0}</span>
                    </div>

                    {/* Match Actions */}
                    <div className="mt-2 flex justify-end">
                      {match.status === 'live' ? (
                        <Button asChild size="sm" variant="destructive">
                          <Link href={`/moderator/fixtures/${match.id}`}>
                            Manage Live Match
                          </Link>
                        </Button>
                      ) : match.status === 'scheduled' ? (
                        <Button asChild size="sm">
                          <Link href={`/moderator/fixtures/${match.id}`}>
                            {isEditable ? 'Manage Match' : 'View Details'}
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/moderator/fixtures/${match.id}`}>
                            View Match
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}