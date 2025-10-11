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
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { QuickUpdateCard } from "@/components/moderator/quick-update-card"

export default async function ModeratorDashboard() {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Get today's fixtures
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: todayFixtures } = await supabase
    .rpc('get_moderator_fixtures', {
      p_user_id: user.id,
      p_limit: 10,
      p_offset: 0
    })

  // Get live fixtures
  const { data: liveFixtures } = await supabase
    .rpc('get_moderator_fixtures', {
      p_user_id: user.id,
      p_status: 'live',
      p_limit: 5,
      p_offset: 0
    })

  // Get moderator stats
  const { data: stats } = await supabase
    .rpc('get_moderator_stats', {
      p_user_id: user.id,
      p_days: 7
    })

  // Get assignments
  const { data: assignments } = await supabase
    .rpc('get_moderator_assignments', {
      p_user_id: user.id
    })

  const assignedSports = assignments?.assigned_sports || []
  const assignedVenues = assignments?.assigned_venues || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Moderator Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {profile?.role === 'admin' ? 'Admin' : 'Moderator'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updates Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.updates_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.total_updates || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveFixtures?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixtures Updated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.fixtures_updated || 0}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Sports</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedSports.length}</div>
            <p className="text-xs text-muted-foreground">
              {assignedSports.length === 0 ? 'All sports' : assignedSports.join(', ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Live Matches
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/moderator/fixtures?status=live">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {liveFixtures && liveFixtures.length > 0 ? (
              liveFixtures.map((fixture: any) => (
                <QuickUpdateCard 
                  key={fixture.fixture_id} 
                  fixture={fixture}
                  compact={true}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No live matches at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Matches
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/moderator/fixtures">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayFixtures && todayFixtures.length > 0 ? (
              todayFixtures.slice(0, 3).map((fixture: any) => (
                <div key={fixture.fixture_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {fixture.team_a_name} vs {fixture.team_b_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {fixture.sport_name} • {new Date(fixture.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Badge variant={fixture.status === 'live' ? 'default' : 'secondary'}>
                    {fixture.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matches scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignments Info */}
      {assignedSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Assigned Sports</h4>
                <div className="flex flex-wrap gap-2">
                  {assignedSports.map((sport: string) => (
                    <Badge key={sport} variant="outline">
                      {sport}
                    </Badge>
                  ))}
                </div>
              </div>
              {assignedVenues.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Assigned Venues</h4>
                  <div className="flex flex-wrap gap-2">
                    {assignedVenues.map((venue: string) => (
                      <Badge key={venue} variant="outline">
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
  )
}
