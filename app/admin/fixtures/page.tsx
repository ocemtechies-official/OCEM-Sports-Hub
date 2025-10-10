import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EnhancedFixtureTable } from "@/components/admin/fixtures/enhanced-fixture-table"

export default async function AdminFixturesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

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
    .order("scheduled_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fixtures Management</h1>
          <p className="text-slate-600 mt-1">Create and manage sports fixtures with advanced filtering</p>
        </div>
        <Button asChild>
          <Link href="/admin/fixtures/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Fixture
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fixtures</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedFixtureTable fixtures={fixtures || []} />
        </CardContent>
      </Card>
    </div>
  )
}
