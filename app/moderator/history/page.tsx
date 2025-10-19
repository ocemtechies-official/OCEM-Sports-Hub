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
  Filter,
  Activity,
  Trophy,
  Zap,
  CheckCircle
} from "lucide-react"
import { UpdateHistoryTable } from "@/components/moderator/update-history-table"
import { HistoryFilters } from "@/components/moderator/history-filters"
import Link from "next/link"

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
            <History className="h-4 w-4" />
            <span className="text-sm font-bold">Update History</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Update History
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track your recent fixture updates and changes across all managed sports.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Updates</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats?.total_updates || 0}</p>
                <p className="text-xs text-blue-500 mt-1">In the last {days} days</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Fixtures Updated</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats?.fixtures_updated || 0}</p>
                <p className="text-xs text-purple-500 mt-1">Unique matches</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Score Updates</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{changeTypeCounts.score_update || 0}</p>
                <p className="text-xs text-red-500 mt-1">Score changes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Status Changes</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{changeTypeCounts.status_change || 0}</p>
                <p className="text-xs text-green-500 mt-1">Status updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator">
              <Trophy className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300">
            <Link href="/moderator/fixtures">
              <Calendar className="mr-2 h-5 w-5" />
              Manage Fixtures
            </Link>
          </Button>
          <Button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <Clock className="mr-2 h-5 w-5" />
            Update History
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
                <h2 className="text-xl font-bold">History Filters</h2>
                <p className="text-sm font-normal text-slate-600">Filter your update history by time period or change type</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <HistoryFilters 
              currentDays={days}
              currentType={changeType}
              changeTypeCounts={changeTypeCounts}
            />
          </CardContent>
        </Card>

        {/* Update History Table */}
        <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-200 p-5">
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recent Updates ({filteredUpdates?.length || 0})</h2>
                <p className="text-sm font-normal text-indigo-600">Your fixture management activity log</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredUpdates && filteredUpdates.length > 0 ? (
              <div className="overflow-x-auto">
                <UpdateHistoryTable updates={filteredUpdates} />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6 shadow-lg">
                  <History className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No updates found</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                  {changeType 
                    ? `No ${changeType.replace('_', ' ')} updates in the last ${days} days.`
                    : `No updates in the last ${days} days.`}
                </p>
                <Button variant="outline" asChild>
                  <Link href="/moderator/fixtures">
                    Manage Fixtures
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}