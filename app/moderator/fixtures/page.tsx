import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Clock, 
  Filter,
  Link,
  Search,
  Trophy
} from "lucide-react"
import { QuickUpdateCard } from "@/components/moderator/quick-update-card"
import { FixturesFilter } from "@/components/moderator/fixtures-filter"

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
  let fixtures = []
  let assignedSports = []
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
      // Null means global access; empty array means none assigned
      canManageAllSports = profile.role === 'admin' || profileData.assigned_sports === null
    }

    // assignments loaded

    // For moderators (non-admins), check if they have assignments
    if (profile.role !== 'admin') {
      if (profileData?.assigned_sports === null) {
        // Global access: see all fixtures
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

        if (params.status && params.status !== 'all') {
          query = query.eq('status', params.status)
        }
        if (params.sport && params.sport !== 'all') {
          query = query.eq('sport_id', params.sport)
        }

        const { data: fixturesData } = await query
        fixtures = fixturesData || []
      } else if (assignedSports.length === 0) {
        // If moderator has no assigned sports, return empty result
        fixtures = []
      } else {
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
    } else {
      // Admin can see all fixtures
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

  } catch (error) {
    // Swallow errors and show empty state
    fixtures = []
  }

  // Get available sports for filter
  const { data: sports } = await supabase
    .from('sports')
    .select('name')
    .order('name')

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Fixtures</h1>
          <p className="text-slate-600 mt-1">
            Update scores and manage match status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {canManageAllSports ? 'All Sports' : `${assignedSports.length} Sports`}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Clock className="h-5 w-5" />
              Live Matches ({fixturesByStatus.live.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixturesByStatus.live.map((fixture: any) => (
              <QuickUpdateCard 
                key={fixture.id || fixture.fixture_id}
                fixture={fixture}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scheduled Matches */}
      {fixturesByStatus.scheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Calendar className="h-5 w-5" />
              Scheduled Matches ({fixturesByStatus.scheduled.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixturesByStatus.scheduled.map((fixture: any) => (
              <QuickUpdateCard 
                key={fixture.id || fixture.fixture_id}
                fixture={fixture}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Matches */}
      {fixturesByStatus.completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Trophy className="h-5 w-5" />
              Completed Matches ({fixturesByStatus.completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixturesByStatus.completed.map((fixture: any) => (
              <QuickUpdateCard 
                key={fixture.id || fixture.fixture_id}
                fixture={fixture}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cancelled Matches */}
      {fixturesByStatus.cancelled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              Cancelled Matches ({fixturesByStatus.cancelled.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fixturesByStatus.cancelled.map((fixture: any) => (
              <QuickUpdateCard 
                key={fixture.id || fixture.fixture_id}
                fixture={fixture}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredFixtures?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {profile.role !== 'admin' && assignedSports.length === 0
                ? "No Sports Assigned"
                : "No fixtures found"}
            </h3>
            <p className="text-slate-500">
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
      {!canManageAllSports && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Sports Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {assignedSports.map((sport: string) => (
                <Badge key={sport} variant="outline">
                  {sport}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              You can only moderate fixtures for the sports listed above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
