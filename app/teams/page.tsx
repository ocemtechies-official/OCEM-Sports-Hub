import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TeamCard } from "@/components/teams/team-card"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, Target, TrendingUp, Search, Filter, VenetianMask, User, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

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

async function TeamsPageContent() {
  const supabase = await getSupabaseServerClient()

  // Fetch teams with player count and gender
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, color, logo_url, gender, team_members(count)")
    .order("name")

  // Fetch stats for overview
  const { data: teamStats } = await supabase
    .from("leaderboards")
    .select("points, wins, matches_played")
    .limit(10)

  // Group teams by gender
  const maleTeams = teams?.filter(team => team.gender === 'male') || []
  const femaleTeams = teams?.filter(team => team.gender === 'female') || []
  const mixedTeams = teams?.filter(team => team.gender === 'mixed' || !team.gender) || []

  // Calculate overview stats
  const totalTeams = teams?.length || 0
  const totalPlayers = teams?.reduce((sum, team) => sum + (team.team_members?.[0]?.count || 0), 0) || 0
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

        {/* Gender-based Team Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <Button 
              variant="outline" 
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
            >
              <VenetianMask className="h-4 w-4 text-blue-600" />
              All Teams ({totalTeams})
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
            >
              <User className="h-4 w-4 text-blue-600" />
              Boys Teams ({maleTeams.length})
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4 text-pink-600" />
              Girls Teams ({femaleTeams.length})
            </Button>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white border-0 shadow-lg rounded-xl p-5 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Filter className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Filter Teams</h3>
                <p className="text-xs text-slate-600">Browse teams by name, sport, or gender</p>
              </div>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
            <Users className="mr-2 h-4 w-4" />
            All Teams
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm">
            <Link href="/fixtures">
              <Target className="mr-2 h-4 w-4" />
              View Fixtures
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm">
            <Link href="/tournaments">
              <Trophy className="mr-2 h-4 w-4" />
              Tournaments
            </Link>
          </Button>
        </div>

        {/* Teams Grid - All Teams */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            All Teams
          </h2>
          {teams && teams.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teams.map((team, index) => (
                <div 
                  key={team.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TeamCard team={team} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="col-span-full text-center py-16 bg-white rounded-xl border-0 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">No Teams Found</h3>
                <p className="text-slate-600 max-w-md">
                  There are currently no teams registered in the system. Check back later for updates!
                </p>
                <Button asChild className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/">
                    Back to Home
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Boys Teams */}
        {maleTeams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Boys Teams
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {maleTeams.map((team, index) => (
                <div 
                  key={team.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TeamCard team={team} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Girls Teams */}
        {femaleTeams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-pink-600" />
              Girls Teams
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {femaleTeams.map((team, index) => (
                <div 
                  key={team.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TeamCard team={team} />
                </div>
              ))}
            </div>
          </div>
        )}
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