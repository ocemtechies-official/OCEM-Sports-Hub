import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Trophy } from "lucide-react"
import TournamentsClient from "@/components/moderator/tournaments/TournamentsClient"

export default async function ModeratorTournamentsPage() {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Get tournaments with sport info and team counts
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select(`
      *,
      sport:sports(id, name, icon),
      tournament_teams(count),
      tournament_rounds(
        id,
        round_name,
        total_matches,
        completed_matches
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    
  // Get available sports for tournament creation
  const { data: availableSports } = await supabase
    .from('sports')
    .select('id, name, icon')
    .is('deleted_at', null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">Tournament Management</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Manage Tournaments
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create and manage tournaments across your assigned sports.
          </p>
        </div>

        <TournamentsClient
          tournaments={tournaments || []}
          availableSports={availableSports || []}
        />
      </div>
    </div>
  )
}