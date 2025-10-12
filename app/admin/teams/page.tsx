import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { TeamManagement } from "@/components/admin/team-management"

export default async function AdminTeamsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch all teams with unified data
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      sports:sport_id (
        id,
        name,
        icon
      ),
      approved_by_profile:approved_by (
        id,
        full_name
      ),
      team_members (*)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-600 mt-1">Manage all teams - official and student registrations</p>
        </div>
        <Button asChild>
          <Link href="/admin/teams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Official Team
          </Link>
        </Button>
      </div>

      <TeamManagement initialTeams={teams || []} />
    </div>
  )
}
