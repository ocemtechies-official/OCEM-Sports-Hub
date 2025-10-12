import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TournamentBracket } from "@/components/fixtures/enhanced-tournament-bracket"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users, ArrowLeft, Clock, Zap, Target, Award } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface TournamentPageProps {
  params: {
    id: string
  }
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const supabase = await getSupabaseServerClient()
  const { id } = await params

  // Fetch tournament with all related data
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      sport:sports(*),
      winner:teams!tournaments_winner_id_fkey(*)
    `)
    .eq("id", id)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Fetch tournament rounds with matches
  const { data: rounds } = await supabase
    .from("tournament_rounds")
    .select(`
      *,
      matches:fixtures!fixtures_tournament_round_id_fkey(
        *,
        team_a:teams!fixtures_team_a_id_fkey(*),
        team_b:teams!fixtures_team_b_id_fkey(*),
        winner:teams!fixtures_winner_id_fkey(*)
      )
    `)
    .eq("tournament_id", id)
    .order("round_number", { ascending: true })

  // Fetch tournament teams
  const { data: tournamentTeams } = await supabase
    .from("tournament_teams")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("tournament_id", id)
    .order("seed", { ascending: true })

  // Transform data for the bracket component
  const tournamentData = {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    status: tournament.status,
    tournament_type: tournament.tournament_type,
    winner_id: tournament.winner_id,
    teams: tournamentTeams?.map(tt => ({
      ...tt.team,
      seed: tt.seed,
      bracket_position: tt.bracket_position
    })).filter(Boolean) || [],
    rounds: rounds?.map(round => ({
      id: round.id,
      round_number: round.round_number,
      round_name: round.round_name,
      status: round.status,
      matches: round.matches?.map((match: any) => ({
        id: match.id,
        team_a: match.team_a,
        team_b: match.team_b,
        team_a_score: match.team_a_score,
        team_b_score: match.team_b_score,
        status: match.status,
        scheduled_at: match.scheduled_at,
        winner_id: match.winner_id,
        bracket_position: match.bracket_position || 1
      })) || []
    })) || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="group hover:bg-white/80 transition-all duration-300">
            <Link href="/tournaments">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Tournaments
            </Link>
          </Button>
        </div>

        {/* Tournament Header Card */}
        <div className="bg-white rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-8">
          {/* Header with gradient background */}
          <div className="relative p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-b border-orange-100">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-bold">Tournament</span>
                  </div>
                  <Badge className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200">
                    {tournament.sport?.icon} {tournament.sport?.name}
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                  {tournament.name}
                </h1>
                {tournament.description && (
                  <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">{tournament.description}</p>
                )}
              </div>

              <div className="text-right">
                <Badge 
                  className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${
                    tournament.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                    tournament.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {tournament.status === 'active' && <Zap className="h-3 w-3" />}
                  {tournament.status === 'completed' && <Trophy className="h-3 w-3" />}
                  {tournament.status === 'draft' && <Clock className="h-3 w-3" />}
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
                
                {tournament.winner && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-yellow-800">Champion</span>
                        <p className="font-bold text-yellow-900 text-lg">{tournament.winner.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Teams</p>
                  <p className="text-2xl font-bold text-blue-900">{tournamentTeams?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Start Date</p>
                  <p className="text-lg font-semibold text-green-900">
                    {tournament.start_date 
                      ? new Date(tournament.start_date).toLocaleDateString()
                      : 'TBD'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Format</p>
                  <p className="text-lg font-semibold text-purple-900 capitalize">
                    {tournament.tournament_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Bracket */}
        <div className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Tournament Bracket
            </h2>
          </div>
          <div className="p-6">
            <TournamentBracket tournament={tournamentData} />
          </div>
        </div>

        {/* Tournament Teams */}
        {tournamentTeams && tournamentTeams.length > 0 && (
          <div className="bg-white rounded-2xl border-0 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                Participating Teams
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tournamentTeams.map((tournamentTeam: any, index: number) => (
                  <div
                    key={tournamentTeam.id}
                    className="group flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: tournamentTeam.team?.color || "#6b7280" }}
                    >
                      {tournamentTeam.team?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {tournamentTeam.team?.name || "Unknown Team"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                          Seed #{tournamentTeam.seed}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Position #{tournamentTeam.bracket_position}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}