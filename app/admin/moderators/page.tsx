import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Shield, 
  TrendingUp,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { ModeratorManagementTable } from "@/components/admin/moderator-management-table"
import AdminPageWrapper from "../admin-page-wrapper"

export default async function AdminModeratorsPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !isAdmin) {
    return null
  }


  const supabase = await getSupabaseServerClient()

  // Get all moderators
  const { data: moderators, error: moderatorsError } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['moderator', 'admin'])
    .order('created_at', { ascending: false })

  // Get moderator stats (last 7 days) using actual columns from match_updates
  const { data: moderatorStats } = await supabase
    .from('match_updates')
    .select('created_by, created_at')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate stats
  const totalModerators = moderators?.length || 0
  const activeModerators = (moderatorStats || [])
    .map((u: any) => u.created_by)
    .filter(Boolean)
    .reduce((acc: string[], uid: string) => (acc.includes(uid) ? acc : [...acc, uid]), []).length
  const totalUpdates = moderatorStats?.length || 0

  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Moderator Management
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Manage moderators and their sport/venue assignments
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/moderators/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Moderator
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Moderators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalModerators}</div>
              <p className="text-xs text-muted-foreground">
                {moderators?.filter(m => m.role === 'admin').length || 0} admins, {moderators?.filter(m => m.role === 'moderator').length || 0} moderators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeModerators}</div>
              <p className="text-xs text-muted-foreground">
                {totalModerators > 0 ? Math.round((activeModerators / totalModerators) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Updates This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUpdates}</div>
              <p className="text-xs text-muted-foreground">
                By moderators and admins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Updates/Day</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalUpdates / 7)}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Moderators Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Moderators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModeratorManagementTable moderators={moderators || []} />
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}