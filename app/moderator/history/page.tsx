import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  History, 
  Clock, 
  User, 
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react"
import { UpdateHistoryTable } from "@/components/moderator/update-history-table"

export default async function ModeratorHistoryPage({
  searchParams,
}: {
  searchParams: { days?: string; type?: string }
}) {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const supabase = await getSupabaseServerClient()
  const days = parseInt(searchParams.days || "7")
  const changeType = searchParams.type || null

  // Get update history
  const { data: updates } = await supabase
    .from('match_updates')
    .select(`
      *,
      fixture:fixtures(
        id,
        team_a:teams!fixtures_team_a_id_fkey(name),
        team_b:teams!fixtures_team_b_id_fkey(name),
        sport:sports(name)
      ),
      changed_by_profile:profiles!match_updates_changed_by_fkey(full_name, role)
    `)
    .eq('changed_by', user.id)
    .gte('change_time', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('change_time', { ascending: false })
    .limit(100)

  // Get stats
  const { data: stats } = await supabase
    .rpc('get_moderator_stats', {
      p_user_id: user.id,
      p_days: days
    })

  // Filter by change type if specified
  const filteredUpdates = changeType 
    ? updates?.filter(update => update.change_type === changeType)
    : updates

  const changeTypeCounts = updates?.reduce((acc, update) => {
    acc[update.change_type] = (acc[update.change_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Update History</h1>
          <p className="text-slate-600 mt-1">
            Track your recent fixture updates and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Last {days} days
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Updates</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_updates || 0}</div>
            <p className="text-xs text-muted-foreground">
              In the last {days} days
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
              Unique matches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeTypeCounts.score_update || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Changes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changeTypeCounts.status_change || 0}</div>
            <p className="text-xs text-muted-foreground">
              Status updates
            </p>
          </CardContent>
        </Card>
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
          <div className="flex flex-wrap gap-4">
            {/* Time Period */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Period:</span>
              <div className="flex gap-1">
                {[1, 7, 30].map((period) => (
                  <Button
                    key={period}
                    variant={days === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      if (period === 7) {
                        params.delete('days')
                      } else {
                        params.set('days', period.toString())
                      }
                      window.location.href = `/moderator/history?${params.toString()}`
                    }}
                  >
                    {period === 1 ? 'Today' : `${period} days`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Change Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <div className="flex gap-1">
                <Button
                  variant={!changeType ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams)
                    params.delete('type')
                    window.location.href = `/moderator/history?${params.toString()}`
                  }}
                >
                  All
                </Button>
                {Object.keys(changeTypeCounts).map((type) => (
                  <Button
                    key={type}
                    variant={changeType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.set('type', type)
                      window.location.href = `/moderator/history?${params.toString()}`
                    }}
                  >
                    {type.replace('_', ' ')} ({changeTypeCounts[type]})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Updates ({filteredUpdates?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUpdates && filteredUpdates.length > 0 ? (
            <UpdateHistoryTable updates={filteredUpdates} />
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No updates found</h3>
              <p className="text-slate-500">
                {changeType 
                  ? `No ${changeType.replace('_', ' ')} updates in the last ${days} days.`
                  : `No updates in the last ${days} days.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
