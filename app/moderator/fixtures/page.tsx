import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  Filter,
  Search,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Play
} from "lucide-react"
import { FixturesFilter } from "@/components/moderator/fixtures-filter"
import Link from "next/link"

export default async function ModeratorFixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sport?: string; search?: string }>
}) {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const params = await searchParams
  const supabase = await getSupabaseServerClient()

  // Get fixtures using the API route (which has proper fallback logic)
  // Note: API route call removed to avoid auth/header issues in server component; using direct DB fallback below

  // Fallback: Use direct database query with proper filtering
  let fixtures: any[] = []
  let assignedSports: string[] = []
  let canManageAllSports = false

  try {
    // Try to get assignments first
    const { data: profileData } = await supabase
      .from('profiles')
      .select('assigned_sports, assigned_venues, role')
      .eq('id', user.id)
      .single()

    if (profileData) {
      assignedSports = profileData.assigned_sports || []
      // Admins can manage all sports, moderators with null assigned_sports can manage all sports
      // Moderators with empty array or specific sports are limited to those sports
      canManageAllSports = profile.role === 'admin' || profileData.assigned_sports === null
    }

    // For admins or moderators with null assigned_sports, show all fixtures
    if (profile.role === 'admin' || (profileData && profileData.assigned_sports === null)) {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          sport:sports(id, name, icon),
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
          updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
        `)
        .order('scheduled_at', { ascending: true })

      // Apply status filter
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status)
      }

      // Apply sport filter
      if (params.sport && params.sport !== 'all') {
        query = query.eq('sport_id', params.sport)
      }

      const { data: fixturesData } = await query
      fixtures = fixturesData || []
    } 
    // For moderators with no assigned sports (empty array), show no fixtures
    else if (assignedSports.length === 0) {
      fixtures = []
    } 
    // For moderators with specific assigned sports, filter by those sports
    else {
      // Build query based on moderator assignments (by sport name -> map to IDs)
      const { data: sportsMap } = await supabase
        .from('sports')
        .select('id, name')
        .in('name', assignedSports)

      const assignedSportIds = (sportsMap || [])
        .filter((s: any) => assignedSports.includes(s.name))
        .map((s: any) => s.id)

      let query = supabase
        .from('fixtures')
        .select(`
          *,
          sport:sports(id, name, icon),
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
          updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
        `)
        .in('sport_id', assignedSportIds)
        .order('scheduled_at', { ascending: true })

      // Apply status filter
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status)
      }

      // Apply sport filter
      if (params.sport && params.sport !== 'all') {
        query = query.eq('sport_id', params.sport)
      }

      const { data: fixturesData } = await query
      fixtures = fixturesData || []
    }

  } catch (error) {
    console.error('Error fetching fixtures:', error)
    // Swallow errors and show empty state
    fixtures = []
  }

  // Get available sports for filter (only sports assigned to the moderator or all for admin/null)
  let sports: any[] = []
  try {
    let sportsQuery = supabase.from('sports').select('id, name').order('name')
    
    // If moderator has specific assigned sports, only show those in filter
    if (profile.role !== 'admin' && assignedSports.length > 0) {
      sportsQuery = sportsQuery.in('name', assignedSports)
    }
    
    const { data: sportsData } = await sportsQuery
    sports = sportsData || []
  } catch (error) {
    console.error('Error fetching sports:', error)
    sports = []
  }

  // Filter fixtures by search term if provided
  const filteredFixtures = params.search
    ? fixtures?.filter((fixture: any) =>
        fixture.team_a?.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
        fixture.team_b?.name?.toLowerCase().includes(params.search!.toLowerCase()) ||
        fixture.sport?.name?.toLowerCase().includes(params.search!.toLowerCase())
      )
    : fixtures

  // Group fixtures by status
  const fixturesByStatus = {
    live: filteredFixtures?.filter((f: any) => f.status === 'live') || [],
    scheduled: filteredFixtures?.filter((f: any) => f.status === 'scheduled') || [],
    // Treat 'finished' as 'completed' for compatibility
    completed: filteredFixtures?.filter((f: any) => f.status === 'completed' || f.status === 'finished') || [],
    cancelled: filteredFixtures?.filter((f: any) => f.status === 'cancelled') || [],
  }

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Zap className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-blue-200/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-yellow-200/10 to-orange-200/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Updated container to take full width with proper padding */}
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-bold">Fixture Management</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Manage Fixtures
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            View and manage fixtures across your assigned sports.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Live Matches</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{fixturesByStatus.live.length}</p>
                <p className="text-xs text-red-500 mt-1">Currently active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Scheduled</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{fixturesByStatus.scheduled.length}</p>
                <p className="text-xs text-blue-500 mt-1">Upcoming matches</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{fixturesByStatus.completed.length}</p>
                <p className="text-xs text-green-500 mt-1">Recently finished</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl shadow-lg">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{fixturesByStatus.cancelled.length}</p>
                <p className="text-xs text-gray-500 mt-1">Cancelled matches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <Button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Calendar className="mr-2 h-5 w-5" />
            Manage Fixtures
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator">
              <Trophy className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator/history">
              <Clock className="mr-2 h-5 w-5" />
              Update History
            </Link>
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-0 shadow-xl rounded-xl mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-5">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Filters</h2>
                <p className="text-sm font-normal text-slate-600">Refine your fixture view by status, sport, or search term</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <FixturesFilter 
              currentStatus={params.status}
              currentSport={params.sport}
              currentSearch={params.search}
              availableSports={sports?.map(s => s.name) || []}
              assignedSports={assignedSports}
            />
          </CardContent>
        </Card>

        {/* Live Matches */}
        {fixturesByStatus.live.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200 p-5">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg shadow">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Live Matches ({fixturesByStatus.live.length})</h2>
                  <p className="text-sm font-normal text-red-600">Currently active fixtures</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {fixturesByStatus.live.map((fixture: any, index: number) => (
                  <div key={fixture.id || fixture.fixture_id} className="animate-fade-in-up bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900">
                          {fixture.team_a?.name} vs {fixture.team_b?.name}
                        </h3>
                        <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(fixture.status)}`}>
                          {getStatusIcon(fixture.status)}
                          <span className="ml-1 capitalize">{fixture.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{fixture.sport?.name}</span>
                          <span className="text-slate-400">•</span>
                          <span>{new Date(fixture.scheduled_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {fixture.team_a_score} - {fixture.team_b_score}
                        </div>
                        <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Link href={`/moderator/fixtures/${fixture.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Manage Match
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Matches */}
        {fixturesByStatus.scheduled.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 p-5">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Scheduled Matches ({fixturesByStatus.scheduled.length})</h2>
                  <p className="text-sm font-normal text-blue-600">Upcoming fixtures</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {fixturesByStatus.scheduled.map((fixture: any, index: number) => (
                  <div key={fixture.id || fixture.fixture_id} className="animate-fade-in-up bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900">
                          {fixture.team_a?.name} vs {fixture.team_b?.name}
                        </h3>
                        <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(fixture.status)}`}>
                          {getStatusIcon(fixture.status)}
                          <span className="ml-1 capitalize">{fixture.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{fixture.sport?.name}</span>
                          <span className="text-slate-400">•</span>
                          <span>{new Date(fixture.scheduled_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {fixture.team_a_score || 0} - {fixture.team_b_score || 0}
                        </div>
                        <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <Link href={`/moderator/fixtures/${fixture.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Manage Match
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Matches */}
        {fixturesByStatus.completed.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-5">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Completed Matches ({fixturesByStatus.completed.length})</h2>
                  <p className="text-sm font-normal text-green-600">Recently finished fixtures</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {fixturesByStatus.completed.map((fixture: any, index: number) => (
                  <div key={fixture.id || fixture.fixture_id} className="animate-fade-in-up bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900">
                          {fixture.team_a?.name} vs {fixture.team_b?.name}
                        </h3>
                        <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(fixture.status)}`}>
                          {getStatusIcon(fixture.status)}
                          <span className="ml-1 capitalize">{fixture.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{fixture.sport?.name}</span>
                          <span className="text-slate-400">•</span>
                          <span>{new Date(fixture.scheduled_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {fixture.team_a_score} - {fixture.team_b_score}
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/moderator/fixtures/${fixture.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Matches */}
        {fixturesByStatus.cancelled.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 p-5">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg shadow">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Cancelled Matches ({fixturesByStatus.cancelled.length})</h2>
                  <p className="text-sm font-normal text-gray-600">Cancelled fixtures</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {fixturesByStatus.cancelled.map((fixture: any, index: number) => (
                  <div key={fixture.id || fixture.fixture_id} className="animate-fade-in-up bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900">
                          {fixture.team_a?.name} vs {fixture.team_b?.name}
                        </h3>
                        <Badge className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(fixture.status)}`}>
                          {getStatusIcon(fixture.status)}
                          <span className="ml-1 capitalize">{fixture.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{fixture.sport?.name}</span>
                          <span className="text-slate-400">•</span>
                          <span>{new Date(fixture.scheduled_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-slate-900">
                          {fixture.team_a_score || 0} - {fixture.team_b_score || 0}
                        </div>
                        <Button asChild variant="outline" size="sm" disabled>
                          <span>Cancelled</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredFixtures?.length === 0 && (
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-lg">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                {profile.role !== 'admin' && assignedSports.length === 0
                  ? "No Sports Assigned"
                  : "No fixtures found"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                {profile.role !== 'admin' && assignedSports.length === 0
                  ? "You haven't been assigned to any sports yet. Contact an administrator to get sports assignments."
                  : params.status || params.sport || params.search
                  ? "Try adjusting your filters to see more matches."
                  : "No fixtures are available for you to moderate at the moment."}
              </p>
              {profile.role !== 'admin' && assignedSports.length === 0 && (
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/admin">Contact Admin</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assignment Info */}
        {!canManageAllSports && assignedSports.length > 0 && (
          <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 p-5">
              <CardTitle className="text-lg font-bold text-purple-800">Your Sports Assignments</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-3">
                {assignedSports.map((sport: string) => (
                  <Badge key={sport} className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                    {sport}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-4">
                You can only moderate fixtures for the sports listed above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}