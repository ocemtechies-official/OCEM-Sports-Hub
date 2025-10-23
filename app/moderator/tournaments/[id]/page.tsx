import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TournamentDetailClient } from "@/components/moderator/tournaments/TournamentDetailClient"

export default async function ModeratorTournamentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Fetch tournament details with all related data
  // Fetch tournament details with error handling
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select(`
      *,
      sport:sports(id, name, icon),
      tournament_teams(
        id,
        seed,
        bracket_position,
        team:teams(id, name, logo_url)
      ),
      tournament_rounds(
        id,
        round_number,
        round_name,
        total_matches,
        completed_matches,
        status,
        fixtures:fixtures(
          id,
          team_a_id,
          team_b_id,
          team_a_score,
          team_b_score,
          status,
          winner_id,
          bracket_position,
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url)
        )
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (tournamentError || !tournament) {
    console.error('Tournament fetch error:', tournamentError)
    return notFound()
  }

  if (!tournament.sport) {
    console.error('Tournament sport data missing')
    return notFound()
  }

  // Get all available teams for the sport
  let availableTeams: any[] = []
  try {
    // Validate sport ID before querying
    if (!tournament.sport?.id) {
      console.error('Invalid sport ID for tournament:', tournament.id)
      throw new Error('Invalid sport ID')
    }

    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, logo_url')
      .eq('sport_id', tournament.sport.id)
      .is('deleted_at', null)

    if (teamsError) {
      console.error('Teams fetch error:', {
        error: teamsError,
        sportId: tournament.sport.id,
        tournamentId: tournament.id
      })
      throw teamsError
    }

    // If no teams found, use empty array but don't treat it as an error
    availableTeams = teamsData || []
  } catch (error: any) {
    console.error('Failed to fetch teams:', {
      error: error.message,
      tournamentId: tournament.id,
      sportId: tournament.sport?.id
    })
    // Don't return notFound() here, just continue with empty teams array
    availableTeams = []
  }

  // Sort rounds by number
  const sortedRounds = tournament.tournament_rounds?.sort((a: any, b: any) => a.round_number - b.round_number)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <TournamentDetailClient 
          tournament={tournament}
          sportName={tournament.sport.name}
          availableTeams={availableTeams}
        />
      </div>
    </div>
  )
}