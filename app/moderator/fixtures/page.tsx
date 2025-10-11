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
  Search,
  Trophy
} from "lucide-react"
import { QuickUpdateCard } from "@/components/moderator/quick-update-card"
import { FixturesFilter } from "@/components/moderator/fixtures-filter"

export default async function ModeratorFixturesPage({
  searchParams,
}: {
  searchParams: { status?: string; sport?: string; search?: string }
}) {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Get fixtures with filters
  const { data: fixtures } = await supabase
    .rpc('get_moderator_fixtures', {
      p_user_id: user.id,
      p_status: searchParams.status || null,
      p_sport_name: searchParams.sport || null,
      p_limit: 50,
      p_offset: 0
    })

  // Get available sports for filter
  const { data: sports } = await supabase
    .from('sports')
    .select('name')
    .order('name')

  // Get assignments to show what sports this moderator can manage
  const { data: assignments } = await supabase
    .rpc('get_moderator_assignments', {
      p_user_id: user.id
    })

  const assignedSports = assignments?.assigned_sports || []
  const canManageAllSports = assignedSports.length === 0

  // Filter fixtures by search term if provided
  const filteredFixtures = searchParams.search
    ? fixtures?.filter((fixture: any) =>
        fixture.team_a_name.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
        fixture.team_b_name.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
        fixture.sport_name.toLowerCase().includes(searchParams.search!.toLowerCase())
      )
    : fixtures

  // Group fixtures by status
  const fixturesByStatus = {
    live: filteredFixtures?.filter((f: any) => f.status === 'live') || [],
    scheduled: filteredFixtures?.filter((f: any) => f.status === 'scheduled') || [],
    completed: filteredFixtures?.filter((f: any) => f.status === 'completed') || [],
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
            currentStatus={searchParams.status}
            currentSport={searchParams.sport}
            currentSearch={searchParams.search}
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
                key={fixture.fixture_id} 
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
                key={fixture.fixture_id} 
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
                key={fixture.fixture_id} 
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
                key={fixture.fixture_id} 
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
            <h3 className="text-lg font-medium text-slate-900 mb-2">No fixtures found</h3>
            <p className="text-slate-500">
              {searchParams.status || searchParams.sport || searchParams.search
                ? "Try adjusting your filters to see more matches."
                : "No fixtures are available for you to moderate at the moment."}
            </p>
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
