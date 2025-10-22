import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, Target, TrendingUp } from "lucide-react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamsSearchFilter } from "@/components/teams/teams-search-filter"

// Loading skeleton for team cards
function TeamCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-4 w-4 text-slate-400" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="w-full h-8 rounded-md" />
      </CardContent>
    </Card>
  )
}

// Loading skeleton for stats
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

interface Team {
  id: string
  name: string
  color: string | null
  logo_url: string | null
  gender: string | null
  team_members?: { count: number }[]
  sport?: {
    id: string
    name: string
    icon: string | null
  } | null
}

interface Sport {
  id: string
  name: string
  icon: string | null
}

async function TeamsPageContent() {
  const supabase = await getSupabaseServerClient()

  // Fetch teams with player count, gender, and sport information
  const { data: supabaseTeams, error } = await supabase
    .from("teams")
    .select(`
      id, 
      name, 
      color, 
      logo_url, 
      gender, 
      team_members(count),
      sport:sport_id (
        id,
        name,
        icon
      )
    `)
    .order("name")

  // Convert Supabase teams to our Team interface
  const teams: Team[] = (supabaseTeams || []).map(team => {
    // Handle the case where sport might be an array (Supabase relation)
    let sportObj = null
    if (Array.isArray(team.sport) && team.sport.length > 0) {
      sportObj = team.sport[0]
    } else if (team.sport && !Array.isArray(team.sport)) {
      sportObj = team.sport
    }
    
    return {
      ...team,
      sport: sportObj
    }
  })

  // Fetch all sports for filtering
  const { data: sports } = await supabase
    .from("sports")
    .select("id, name, icon")
    .order("name")

  // Fetch stats for overview
  const { data: teamStats } = await supabase
    .from("leaderboards")
    .select("points, wins, matches_played")
    .limit(10)

  // Group teams by sport
  const teamsBySport: Record<string, Team[]> = {}
  teams.forEach(team => {
    const sportName = team.sport?.name || "Unknown Sport"
    if (!teamsBySport[sportName]) {
      teamsBySport[sportName] = []
    }
    teamsBySport[sportName].push(team)
  })

  // Calculate overview stats
  const totalTeams = teams.length
  const totalPlayers = teams.reduce((sum, team) => sum + (team.team_members?.[0]?.count || 0), 0)
  const avgPoints = teamStats 
    ? teamStats.reduce((sum, stat) => sum + (stat.points || 0), 0) / teamStats.length 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Teams</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Meet Our Teams
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the talented teams competing in OCEM Sports Hub. Each team brings unique skills and strategies to the field.
          </p>
        </div>

        {/* Stats Overview */}
        <Suspense fallback={<StatsSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total Teams</p>
                  <p className="text-2xl font-bold text-blue-900">{totalTeams}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">Total Players</p>
                  <p className="text-2xl font-bold text-green-900">{totalPlayers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">Avg. Points</p>
                  <p className="text-2xl font-bold text-purple-900">{avgPoints.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>

        {/* Search and Filter Section */}
        <TeamsSearchFilter 
          teams={teams} 
          sports={sports || []} 
          teamsBySport={teamsBySport} 
        />
      </div>
    </div>
  )
}

export default async function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-10">
            <Skeleton className="h-8 w-32 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <StatsSkeleton />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <TeamsPageContent />
    </Suspense>
  )
}