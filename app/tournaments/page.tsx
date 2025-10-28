import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Eye, ArrowRight, Clock, Zap } from "lucide-react"
import Link from "next/link"

interface TournamentCardProps {
  tournament: any
}

function TournamentCard({ tournament }: TournamentCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="h-3 w-3" />
      case 'completed':
        return <Trophy className="h-3 w-3" />
      case 'draft':
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
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

  const getProgressPercentage = () => {
    if (tournament.status === 'completed') return 100
    if (tournament.status === 'draft') return 0
    
    const totalRounds = tournament.tournament_rounds?.length || 1
    const completedRounds = tournament.tournament_rounds?.filter((r: any) => r.status === 'completed').length || 0
    return (completedRounds / totalRounds) * 100
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md hover:shadow-2xl">
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="relative p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-b border-orange-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-900 group-hover:text-orange-600 transition-colors duration-300 mb-1">
                  {tournament.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-600 font-medium">
                    {tournament.sport?.name} Tournament
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-500 capitalize">
                    {tournament.tournament_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <Badge className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 shadow-sm flex items-center gap-1.5 ${getStatusColor(tournament.status)}`}>
              {getStatusIcon(tournament.status)}
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </Badge>
          </div>

          {/* Description */}
          {tournament.description && (
            <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Teams</p>
                <p className="text-lg font-bold text-blue-900">{tournament.tournament_teams?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Start Date</p>
                <p className="text-sm font-semibold text-green-900">
                  {tournament.start_date 
                    ? new Date(tournament.start_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : 'TBD'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-600 font-medium">Tournament Progress</span>
              <span className="font-semibold text-slate-900">{getProgressText()}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              {tournament.status === 'active' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full opacity-20 animate-pulse" />
              )}
            </div>
          </div>

          {/* Champion Section */}
          {tournament.status === 'completed' && tournament.winner && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-yellow-800">Champion</span>
                  <p className="font-bold text-yellow-900 text-lg">{tournament.winner.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group/btn">
            <Link href={`/tournaments/${tournament.id}`}>
              <Eye className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
              View Tournament
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
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
    .is('deleted_at', null) // Filter out deleted tournaments
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-bold">Tournaments</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Tournament Brackets
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Follow the action in ongoing and completed tournaments. Experience the thrill of competitive sports.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <Button variant="secondary" asChild className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
            <Link href="/fixtures">Regular Fixtures</Link>
          </Button>
          <Button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Trophy className="mr-2 h-5 w-5" />
            Tournaments
          </Button>
        </div>

        {/* Tournaments Grid */}
        {tournaments && tournaments.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament, index) => (
              <div 
                key={tournament.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TournamentCard tournament={tournament} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-8 shadow-lg">
              <Trophy className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No Tournaments Yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              Check back later for upcoming tournament brackets! We're preparing exciting competitions for you.
            </p>
            <Button asChild className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
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