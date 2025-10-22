import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Trophy,
  ArrowRight,
  Zap,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { QuickUpdateCard } from "@/components/moderator/quick-update-card"

export default async function ModeratorDashboard() {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Get moderator assignments and build proper queries
  let assignedSports = []
  let assignedVenues = []
  let canManageAllSports = false

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('assigned_sports, assigned_venues, role')
      .eq('id', user.id)
      .single()

    if (profileData) {
      assignedSports = profileData.assigned_sports || []
      assignedVenues = profileData.assigned_venues || []
      canManageAllSports = profile.role === 'admin' || assignedSports.length === 0
    }
  } catch (error) {
    console.error('Error fetching moderator assignments:', error)
  }

  // Get today's fixtures with proper filtering
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let todayQuery = supabase
    .from('fixtures')
    .select(`
      *,
      sport:sports(id, name, icon),
      team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
      team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
      updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
    `)
    .is('deleted_at', null) // Filter out deleted fixtures
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)

  // Apply moderator filtering
  let todayFixtures = []
  let liveFixtures = []

  if (profile.role === 'admin' || assignedSports.length > 0) {
    // Apply moderator filtering
    if (profile.role !== 'admin' && assignedSports.length > 0) {
      todayQuery = todayQuery.in('sport_id', assignedSports)
    }

    const { data: todayData } = await todayQuery
    todayFixtures = todayData || []

    // Get live fixtures with proper filtering
    let liveQuery = supabase
      .from('fixtures')
      .select(`
        *,
        sport:sports(id, name, icon),
        team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
        team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
        updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
      `)
      .is('deleted_at', null) // Filter out deleted fixtures
      .eq('status', 'live')
      .order('scheduled_at', { ascending: true })
      .limit(5)

    // Apply moderator filtering
    if (profile.role !== 'admin' && assignedSports.length > 0) {
      liveQuery = liveQuery.in('sport_id', assignedSports)
    }

    const { data: liveData } = await liveQuery
    liveFixtures = liveData || []
  }
  // If moderator has no assigned sports, both arrays remain empty

  // Get basic stats (fallback since RPC might not exist)
  let stats = {
    updates_today: 0,
    total_updates: 0,
    fixtures_updated: 0
  }

  try {
    // Try to get stats from match_updates table if it exists
    const { data: matchUpdates, error: matchUpdatesError } = await supabase
      .from('match_updates')
      .select('*', { count: 'exact' })
      .eq('changed_by', user.id)
      .gte('change_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (!matchUpdatesError && matchUpdates) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      stats = {
        updates_today: matchUpdates.filter(update => 
          new Date(update.change_time) >= today
        ).length,
        total_updates: matchUpdates.length,
        fixtures_updated: new Set(matchUpdates.map(update => update.fixture_id)).size
      }
    }
  } catch (error) {
    console.error('Error fetching moderator stats:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Updated container with proper padding */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-bold">Moderator Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Moderator Control Center
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome back, {profile?.full_name || user.email}. Manage fixtures, track updates, and monitor your assigned sports.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Updates Today</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{stats?.updates_today || 0}</p>
                <p className="text-xs text-red-500 mt-1">+{stats?.total_updates || 0} this week</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Live Matches</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{liveFixtures?.length || 0}</p>
                <p className="text-xs text-blue-500 mt-1">Currently active</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Fixtures Updated</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats?.fixtures_updated || 0}</p>
                <p className="text-xs text-green-500 mt-1">This week</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Assigned Sports</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{assignedSports.length}</p>
                <p className="text-xs text-purple-500 mt-1">
                  {profile.role === 'admin' 
                    ? 'All sports' 
                    : assignedSports.length === 0 
                    ? 'No sports assigned' 
                    : 'Sports assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Activity className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator/fixtures">
              <Calendar className="mr-2 h-5 w-5" />
              Manage Fixtures
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator/history">
              <Clock className="mr-2 h-5 w-5" />
              Update History
            </Link>
          </Button>
        </div>

        {/* Live Matches Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-red-800">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Live Matches</h2>
                    <p className="text-sm font-normal text-red-600">Currently active fixtures requiring attention</p>
                  </div>
                </CardTitle>
                <Button variant="outline" size="sm" asChild className="border-red-300 text-red-700 hover:bg-red-50">
                  <Link href="/moderator/fixtures?status=live">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.role !== 'admin' && assignedSports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-lg">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Sports Assigned</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    You haven't been assigned to any sports yet. Contact an administrator to get sports assignments.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/admin">Contact Admin</Link>
                  </Button>
                </div>
              ) : liveFixtures && liveFixtures.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
                  {liveFixtures.map((fixture: any, index: number) => (
                    <div key={fixture.fixture_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <QuickUpdateCard 
                        fixture={fixture}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6 shadow-lg">
                    <Zap className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Live Matches</h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    No matches are currently being played. Check back later for live fixtures.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Today's Matches Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-blue-800">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Today's Matches</h2>
                    <p className="text-sm font-normal text-blue-600">Scheduled fixtures for today</p>
                  </div>
                </CardTitle>
                <Button variant="outline" size="sm" asChild className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Link href="/moderator/fixtures">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {profile.role !== 'admin' && assignedSports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-lg">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Sports Assigned</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                    You haven't been assigned to any sports yet. Contact an administrator to get sports assignments.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/admin">Contact Admin</Link>
                  </Button>
                </div>
              ) : todayFixtures && todayFixtures.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-3">
                  {todayFixtures.slice(0, 3).map((fixture: any, index: number) => (
                    <div key={fixture.fixture_id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow">
                                <Trophy className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-900">{fixture.sport?.name}</h3>
                              </div>
                            </div>
                            <Badge className="px-2 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {fixture.status === 'live' ? 'LIVE' : 'SCHEDULED'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow"
                                  style={{ backgroundColor: fixture.team_a?.color || "#3b82f6" }}
                                >
                                  {fixture.team_a?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 truncate text-sm">{fixture.team_a?.name}</h4>
                                </div>
                              </div>
                              <div className="text-xl font-bold text-slate-900">
                                {fixture.team_a_score !== null ? fixture.team_a_score : '-'}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center my-1">
                              <div className="flex-1 h-px bg-slate-200"></div>
                              <div className="px-2 py-1 bg-slate-100 rounded-full mx-1">
                                <span className="text-xs font-bold text-slate-600">VS</span>
                              </div>
                              <div className="flex-1 h-px bg-slate-200"></div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow"
                                  style={{ backgroundColor: fixture.team_b?.color || "#ef4444" }}
                                >
                                  {fixture.team_b?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 truncate text-sm">{fixture.team_b?.name}</h4>
                                </div>
                              </div>
                              <div className="text-xl font-bold text-slate-900">
                                {fixture.team_b_score !== null ? fixture.team_b_score : '-'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="text-sm text-slate-600">
                                  {new Date(fixture.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <Button size="sm" variant="outline" asChild className="text-xs">
                                <Link href={`/moderator/fixtures/${fixture.id}`}>
                                  Manage
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-6 shadow-lg">
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Scheduled</h3>
                  <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                    No matches are scheduled for today. Check back later for upcoming fixtures.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignments Info */}
        {assignedSports.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-6">
              <CardTitle className="flex items-center gap-3 text-purple-800">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Your Assignments</h2>
                  <p className="text-sm font-normal text-purple-600">Sports and venues you're authorized to manage</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-4">Assigned Sports</h4>
                  <div className="flex flex-wrap gap-3">
                    {assignedSports.map((sport: string) => (
                      <Badge key={sport} className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
                {assignedVenues.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 mb-4">Assigned Venues</h4>
                    <div className="flex flex-wrap gap-3">
                      {assignedVenues.map((venue: string) => (
                        <Badge key={venue} className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                          {venue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}