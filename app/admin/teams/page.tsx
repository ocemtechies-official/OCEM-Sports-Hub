import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { TeamManagement } from "@/components/admin/team-management"
import AdminPageWrapper from "../admin-page-wrapper"

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
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <TeamManagement initialTeams={teams || []} />
      </div>
    </AdminPageWrapper>
  )
}