import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TournamentBracket } from "@/components/fixtures/tournament-bracket"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface TournamentPageProps {
  params: {
    id: string
  }
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const supabase = await getSupabaseServerClient()

  // Fetch tournament with all related data
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      sport:sports(*),
      winner:teams!tournaments_winner_id_fkey(*)
    `)
    .eq("id", params.id)
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
    .eq("tournament_id", params.id)
    .order("round_number", { ascending: true })

  // Fetch tournament teams
  const { data: tournamentTeams } = await supabase
    .from("tournament_teams")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("tournament_id", params.id)
    .order("seed", { ascending: true })

  // Transform data for the bracket component
  const tournamentData = {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    status: tournament.status,
    tournament_type: tournament.tournament_type,
    winner_id: tournament.winner_id,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/fixtures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fixtures
          </Link>
        </Button>

        {/* Tournament Header Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Tournament</span>
                </div>
                <Badge variant="secondary">
                  {tournament.sport?.icon} {tournament.sport?.name}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{tournament.name}</h1>
              {tournament.description && (
                <p className="text-slate-600 mb-4">{tournament.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{tournamentTeams?.length || 0} Teams</span>
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
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span className="capitalize">{tournament.tournament_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <Badge 
                variant={
                  tournament.status === 'completed' ? 'default' : 
                  tournament.status === 'active' ? 'secondary' : 
                  'outline'
                }
                className="text-lg px-4 py-2"
              >
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </Badge>
              
              {tournament.winner && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Trophy className="h-4 w-4" />
                    <span className="font-semibold">Champion</span>
                  </div>
                  <p className="font-bold text-yellow-900 mt-1">{tournament.winner.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tournament Bracket */}
        <TournamentBracket tournament={tournamentData} />

        {/* Tournament Teams */}
        {tournamentTeams && tournamentTeams.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Participating Teams</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {tournamentTeams.map((tournamentTeam: any) => (
                <div
                  key={tournamentTeam.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: tournamentTeam.team?.color || "#6b7280" }}
                  >
                    {tournamentTeam.team?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {tournamentTeam.team?.name || "Unknown Team"}
                    </p>
                    <p className="text-xs text-slate-500">Seed #{tournamentTeam.seed}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}