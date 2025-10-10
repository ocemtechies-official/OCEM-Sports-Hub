import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EnhancedTeamTable } from "@/components/admin/teams/enhanced-team-table"

export default async function AdminTeamsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  const { data: teams } = await supabase.from("teams").select("*, players(count)").order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Teams Management</h1>
          <p className="text-slate-600 mt-1">Manage teams and players with advanced search</p>
        </div>
        <Button asChild>
          <Link href="/admin/teams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedTeamTable teams={teams || []} />
        </CardContent>
      </Card>
    </div>
  )
}
