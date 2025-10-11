import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditTournamentForm } from "@/components/admin/edit-tournament-form"

interface EditTournamentPageProps {
  params: { id: string }
}

export default async function EditTournamentPage({ params }: EditTournamentPageProps) {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the tournament data
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      *,
      sport:sports(*),
      winner:teams!tournaments_winner_id_fkey(*),
      tournament_teams(
        *,
        team:teams(*)
      )
    `)
    .eq("id", params.id)
    .eq("deleted_at", null)
    .single()

  if (tournamentError || !tournament) {
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
          <Link href="/admin/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Tournament</CardTitle>
              <p className="text-sm text-slate-600">
                {tournament.name}
              </p>
            </CardHeader>
            <CardContent>
              <EditTournamentForm 
                tournament={tournament}
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
