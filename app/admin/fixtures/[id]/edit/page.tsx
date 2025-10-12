import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditFixtureForm } from "@/components/admin/edit-fixture-form"

interface EditFixturePageProps {
  params: { id: string }
}

export default async function EditFixturePage({ params }: EditFixturePageProps) {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the fixture data
  const { data: fixture, error: fixtureError } = await supabase
    .from("fixtures")
    .select(`
      *,
      sport:sports(*),
      team_a:teams!fixtures_team_a_id_fkey(*),
      team_b:teams!fixtures_team_b_id_fkey(*)
    `)
    .eq("id", params.id)
    .eq("deleted_at", null)
    .single()

  if (fixtureError || !fixture) {
    notFound()
  }

  // Fetch sports and teams for the form
  const [{ data: sports }, { data: teams }] = await Promise.all([
    supabase.from("sports").select("*").order("name"),
    supabase.from("teams").select("*").order("name"),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/fixtures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fixtures
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Fixture</CardTitle>
              <p className="text-sm text-slate-600">
                {fixture.team_a?.name} vs {fixture.team_b?.name} - {fixture.sport?.name}
              </p>
            </CardHeader>
            <CardContent>
              <EditFixtureForm 
                fixture={fixture}
                sports={sports || []} 
                teams={teams || []} 
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
