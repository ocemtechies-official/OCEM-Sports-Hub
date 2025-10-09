import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"

interface TournamentCardProps {
  tournament: any
}

function TournamentCard({ tournament }: TournamentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary'
      case 'completed':
        return 'default'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getProgressText = () => {
    const totalRounds = tournament.tournament_rounds?.length || 0
    const completedRounds = tournament.tournament_rounds?.filter((r: any) => r.status === 'completed').length || 0
    
    if (tournament.status === 'completed') {
      return 'Tournament Complete'
    }
    
    if (tournament.status === 'active') {
      return `Round ${completedRounds + 1} of ${totalRounds}`
    }
    
    return 'Not Started'
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {tournament.name}
              </h3>
              <p className="text-sm text-slate-600">
                {tournament.sport?.name} Tournament
              </p>
            </div>
          </div>
          
          <Badge variant={getStatusColor(tournament.status)}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Badge>
        </div>

        {/* Description */}
        {tournament.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {tournament.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{tournament.tournament_teams?.length || 0} Teams</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {tournament.start_date 
                ? new Date(tournament.start_date).toLocaleDateString()
                : 'TBD'
              }
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-900">{getProgressText()}</span>
          </div>
          
          {tournament.status === 'active' && (
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((tournament.tournament_rounds?.filter((r: any) => r.status === 'completed').length || 0) / (tournament.tournament_rounds?.length || 1)) * 100}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Champion */}
        {tournament.status === 'completed' && tournament.winner && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Champion:</span>
              <span className="font-bold text-yellow-900">{tournament.winner.name}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full">
          <Link href={`/tournaments/${tournament.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Bracket
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default async function TournamentsPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch tournaments with related data
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select(`
      *,
      sport:sports(*),
      winner:teams!tournaments_winner_id_fkey(*),
      tournament_teams(count),
      tournament_rounds(
        id,
        round_number,
        round_name,
        status
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-yellow-600 text-white px-3 py-1 rounded-full mb-3">
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Tournaments</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Tournament Brackets</h1>
          <p className="text-slate-600 mt-1">Follow the action in ongoing and completed tournaments</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button variant="secondary" asChild>
            <Link href="/fixtures">Regular Fixtures</Link>
          </Button>
          <Button variant="default">
            <Trophy className="mr-2 h-4 w-4" />
            Tournaments
          </Button>
        </div>

        {/* Tournaments Grid */}
        {tournaments && tournaments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tournaments Yet</h3>
            <p className="text-slate-600 mb-6">Check back later for upcoming tournament brackets!</p>
            <Button asChild>
              <Link href="/fixtures">
                View Regular Fixtures
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}