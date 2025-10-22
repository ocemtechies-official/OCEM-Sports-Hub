import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import AdminPageWrapper from "../admin-page-wrapper"

export default async function EnhancedAdminFixturesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch all fixtures that are not soft deleted
  // The is('deleted_at', null) filter ensures we only get active fixtures
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      `
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `,
    )
    .is('deleted_at', null) // Filter out soft deleted fixtures
    .order("scheduled_at", { ascending: false })

  const EnhancedAdminFixturesClient = (await import("@/components/admin/fixtures/EnhancedAdminFixturesClient")).default

  return (
    <AdminPageWrapper>
      <EnhancedAdminFixturesClient initialFixtures={fixtures || []} />
    </AdminPageWrapper>
  )
}