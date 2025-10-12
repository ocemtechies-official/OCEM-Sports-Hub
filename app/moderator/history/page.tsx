import { requireModerator } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Clock, 
  User, 
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react"
import { UpdateHistoryTable } from "@/components/moderator/update-history-table"
import { HistoryFilters } from "@/components/moderator/history-filters"

export default async function ModeratorHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; type?: string }>
}) {
  const { user, profile, isModerator } = await requireModerator()
  
  if (!user || !isModerator) {
    return null
  }

  const params = await searchParams
  const supabase = await getSupabaseServerClient()
  const days = parseInt(params.days || "7")
  const changeType = params.type || null

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
      <HistoryFilters 
        currentDays={days}
        currentType={changeType}
        changeTypeCounts={changeTypeCounts}
      />

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
