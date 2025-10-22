import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Users, Trophy } from "lucide-react"
import { LiveMonitorDashboard } from "@/components/admin/live-monitor-dashboard"

export default async function LiveMonitorPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch live fixtures that are not deleted
  const { data: liveFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq("status", "live")
    .is("deleted_at", null) // Filter out deleted fixtures
    .order("scheduled_at", { ascending: true })

  // Fetch scheduled fixtures (upcoming) that are not deleted
  const { data: upcomingFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq("status", "scheduled")
    .is("deleted_at", null) // Filter out deleted fixtures
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5)

  // Fetch recent completed fixtures that are not deleted
  const { data: recentCompleted } = await supabase
    .from("fixtures")
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq("status", "completed")
    .is("deleted_at", null) // Filter out deleted fixtures
    .order("scheduled_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-8 w-8 text-red-500" />
                Live Monitor
              </h1>
              <p className="text-slate-600 mt-1">
                Real-time monitoring of live fixtures and match updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Activity className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {liveFixtures?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Live Now</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {upcomingFixtures?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {recentCompleted?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Recent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(liveFixtures?.length || 0) + (upcomingFixtures?.length || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Monitor Dashboard */}
          <LiveMonitorDashboard 
            liveFixtures={liveFixtures || []}
            upcomingFixtures={upcomingFixtures || []}
            recentCompleted={recentCompleted || []}
          />
        </div>
      </main>
    </div>
  )
}
