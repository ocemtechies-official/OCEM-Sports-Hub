import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Plus, ArrowLeft, Calendar, Users, Settings } from "lucide-react"
import Link from "next/link"
import AdminPageWrapper from "../admin-page-wrapper"
import { TournamentDeleteButton } from "@/components/admin/tournaments/TournamentDeleteButton"

export default async function AdminTournamentsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

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
    .is('deleted_at', null) // Filter out deleted tournaments
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
      case 'draft':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md'
    }
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Tournament Management
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Create and manage tournament brackets</p>
          </div>
          <Button asChild>
            <Link href="/admin/tournaments/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Link>
          </Button>
        </div>

        {/* Tournaments List */}
        <div className="grid gap-6">
          {tournaments && tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <Card key={tournament.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{tournament.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-600">
                            {tournament.sport?.name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full text-xs font-bold border-0 shadow-sm">
                            {tournament.tournament_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        {tournament.description && (
                          <p className="text-sm text-slate-500 mt-1">{tournament.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(tournament.status)} px-3 py-1.5 rounded-full text-xs font-bold border-0 shadow-sm`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </Badge>
                      <TournamentDeleteButton 
                        tournamentId={tournament.id} 
                        tournamentName={tournament.name} 
                      />
                    </div>

                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
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
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>
                        {tournament.tournament_rounds?.length || 0} Rounds
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  {tournament.status === 'active' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-900">
                          Round {(tournament.tournament_rounds?.filter((r: any) => r.status === 'completed').length || 0) + 1} of {tournament.tournament_rounds?.length || 0}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${((tournament.tournament_rounds?.filter((r: any) => r.status === 'completed').length || 0) / (tournament.tournament_rounds?.length || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/tournaments/${tournament.id}`}>
                        <Trophy className="mr-2 h-4 w-4" />
                        View Bracket
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tournaments Yet</h3>
                <p className="text-slate-600 mb-6">Create your first tournament to get started with bracket management.</p>
                <Button asChild>
                  <Link href="/admin/tournaments/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tournament
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  )
}
