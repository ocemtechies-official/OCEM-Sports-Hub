'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Loader2, Calendar, MapPin, Users, Award } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import Link from "next/link"
import { TournamentBracket } from './TournamentBracket'
import { TournamentTeamManagement } from './TournamentTeamManagement'
import { useToast } from '@/hooks/use-toast'

interface Team {
  id: string
  name: string
  logo_url?: string
}

interface Tournament {
  id: string
  name: string
  description?: string
  sport_id: string
  status: 'draft' | 'registration' | 'active' | 'completed'
  tournament_type: string
  max_teams: number
  start_date?: string
  end_date?: string
  venue?: string
  winner_id?: string
  tournament_teams: {
    team: Team
  }[]
  tournament_rounds: any[]
}

interface TournamentDetailClientProps {
  tournament: Tournament
  sportName: string
  availableTeams: Team[]
}

export function TournamentDetailClient({
  tournament,
  sportName,
  availableTeams = [] // Provide default empty array
}: TournamentDetailClientProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { toast } = useToast()
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null)

  // Show warning toast if no teams are available
  useEffect(() => {
    if (availableTeams.length === 0 && (tournament.status === 'draft' || tournament.status === 'registration')) {
      toast({
        title: "No teams available",
        description: `There are no teams available for ${sportName}. Please create teams first.`,
        variant: "warning",
      })
    }
  }, [availableTeams.length, tournament.status, sportName, toast])

  // Fetch winner team details if tournament has a winner
  useEffect(() => {
    const fetchWinnerTeam = async () => {
      if (tournament.winner_id) {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name, logo_url')
          .eq('id', tournament.winner_id)
          .single()
        
        if (!error && data) {
          setWinnerTeam(data)
        }
      }
    }
    
    fetchWinnerTeam()
  }, [tournament.winner_id, supabase])

  const currentTeams = tournament.tournament_teams.map(tt => tt.team)

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === tournament.status) return
    
    setIsUpdating(true)
    try {
      const result = await supabase
        .from('tournaments')
        .update({ status: newStatus })
        .eq('id', tournament.id)

      if (result.error) throw result.error

      toast({
        title: "Tournament status updated",
        description: `Successfully updated status to ${newStatus}`,
      })
      
      router.refresh()
    } catch (error: any) {
      console.error('Error updating tournament status:', error)
      toast({
        title: "Error updating tournament status",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateWinner = async (matchId: string, winnerId: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/moderator/tournaments/${tournament.id}/matches/${matchId}/winner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner_id: winnerId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update match winner')
      }

      router.refresh()
    } catch (error: any) {
      console.error('Error updating match winner:', error)
      // Add toast notification for error
      toast({
        title: "Error updating match winner",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Draft</span>
      case 'registration':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Registration</span>
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Completed</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">{status}</span>
    }
  }

  const getTournamentTypeBadge = (type: string) => {
    const formattedType = type.replace('_', ' ')
    switch (type) {
      case 'single_elimination':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">{formattedType}</span>
      case 'double_elimination':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">{formattedType}</span>
      case 'round_robin':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{formattedType}</span>
      case 'swiss':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">{formattedType}</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium capitalize">{formattedType}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
          <p className="text-slate-600 mt-1">
            {sportName} Tournament
          </p>
          {tournament.description && (
            <p className="mt-4 text-slate-600">{tournament.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {tournament.status === 'draft' && (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus('registration')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Start Registration'
              )}
            </Button>
          )}
          {tournament.status === 'registration' && currentTeams.length >= 2 && (
            <Button 
              variant="outline" 
              onClick={() => handleUpdateStatus('active')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Start Tournament'
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/moderator/tournaments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-blue-100 rounded-full">
              <Trophy className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold">Status</h3>
          </div>
          <div className="mt-1">
            {getStatusBadge(tournament.status)}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-green-100 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="font-semibold">Teams</h3>
          </div>
          <p className="font-medium">
            {currentTeams.length} / {tournament.max_teams}
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-purple-100 rounded-full">
              <Trophy className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="font-semibold">Tournament Type</h3>
          </div>
          <div className="mt-1">
            {getTournamentTypeBadge(tournament.tournament_type)}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-orange-100 rounded-full">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <h3 className="font-semibold">Date</h3>
          </div>
          <p className="text-sm">
            {tournament.start_date ? formatDate(tournament.start_date) : 'Not set'}
          </p>
        </Card>
      </div>

      {(tournament.venue || tournament.end_date || (tournament.status === 'completed' && winnerTeam)) && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournament.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-sm">
                  <span className="font-medium">Venue:</span> {tournament.venue}
                </span>
              </div>
            )}
            {tournament.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-sm">
                  <span className="font-medium">End Date:</span> {formatDate(tournament.end_date)}
                </span>
              </div>
            )}
            {tournament.status === 'completed' && winnerTeam && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">
                  <span className="font-medium">Winner:</span> {winnerTeam.name}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Tabs defaultValue="bracket">
        <TabsList>
          <TabsTrigger value="bracket">Tournament Bracket</TabsTrigger>
          <TabsTrigger value="teams">Teams ({currentTeams.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="bracket" className="mt-6">
          {tournament.tournament_rounds?.length > 0 ? (
            <TournamentBracket 
              rounds={tournament.tournament_rounds}
              onUpdateWinner={tournament.status === 'active' ? handleUpdateWinner : undefined}
              isEditable={tournament.status === 'active'}
            />
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bracket Available</h3>
              <p className="text-slate-600 mb-4">
                The tournament bracket will be generated once the tournament starts.
              </p>
              {tournament.status === 'registration' && currentTeams.length >= 2 && (
                <Button onClick={() => handleUpdateStatus('active')}>
                  Start Tournament
                </Button>
              )}
            </Card>
          )}
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Tournament Teams</h3>
                <p className="text-sm text-slate-600">
                  {currentTeams.length} of {tournament.max_teams} teams registered
                </p>
              </div>
              {(tournament.status === 'draft' || tournament.status === 'registration') && (
                <Button onClick={() => setIsTeamManagementOpen(true)}>
                  Manage Teams
                </Button>
              )}
            </div>

            {currentTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTeams.map((team, index) => (
                  <div 
                    key={team.id}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {team.logo_url && (
                        <img 
                          src={team.logo_url} 
                          alt={team.name} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{team.name}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Trophy className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Teams Added</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {tournament.status === 'draft' || tournament.status === 'registration' 
                    ? 'Add teams to the tournament to get started.' 
                    : 'This tournament has no registered teams.'}
                </p>
                {(tournament.status === 'draft' || tournament.status === 'registration') && (
                  <Button onClick={() => setIsTeamManagementOpen(true)}>
                    Add Teams
                  </Button>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <TournamentTeamManagement 
        tournamentId={tournament.id}
        currentTeams={currentTeams}
        availableTeams={availableTeams}
        maxTeams={tournament.max_teams}
        isOpen={isTeamManagementOpen}
        onClose={() => setIsTeamManagementOpen(false)}
      />
    </div>
  )
}