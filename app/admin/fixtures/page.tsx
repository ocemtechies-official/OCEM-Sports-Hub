import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"
import { FixtureManagementTable } from "@/components/admin/fixture-management-table"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Fixtures Management</h1>
            <p className="text-lg text-slate-600">Create and manage sports fixtures</p>
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
            <FixtureManagementTable fixtures={fixtures || []} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
